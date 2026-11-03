import {
  css,
  html,
  nothing,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { BixElement, VirtualizerController, observeResize } from '@bixboards/core';
import { textStyle, textFamily } from '@bixboards/core';

type Key = string | number;
type Layout = 'list' | 'grid' | 'masonry';
type Selection = 'none' | 'single' | 'multiple';
type Direction = 'normal' | 'reverse';

/** Async paging source. Called with the number of items already loaded. */
export interface DataSource<T> {
  getItems(request: {
    start: number;
    count: number;
    signal: AbortSignal;
  }): Promise<{ items: T[]; hasMore?: boolean }>;
}

type Row =
  | { kind: 'group'; key: string; label: string }
  | { kind: 'items'; key: string; from: number; to: number };

const PAGE_SIZE = 50;
const PREFETCH_ROWS = 6;
const DRAG_THRESHOLD = 4;
const EDGE_SCROLL_ZONE = 32;
const EDGE_SCROLL_SPEED = 14;
const TYPEAHEAD_RESET_MS = 700;

let nextId = 0;

/**
 * `<bx-data-list>` — virtualized list / grid for feeds, inboxes and galleries
 * (docs/features/data-list/data-list.md), built on core's `VirtualizerController`.
 *
 * Items are plain data (`items`, or pages pulled through `data-source`); the list renders only
 * the rows near the viewport, with `renderItem(item, index)` supplying each item's template.
 * Rows are measured (`item-height="auto"`, the default) with scroll anchoring, or fixed
 * (`item-height` in px, which includes any gap). Grid layout derives its column count from the
 * *container's* inline size (`floor((width + gap) / (min-item-width + gap))`, via the shared
 * `ResizeObserver`), so list → grid → list happens without breakpoints. `group-by` inserts group
 * header rows; the header covering the viewport top is rendered `position: sticky`.
 *
 * **Accessibility.** `role="list"`/`listitem`, or `listbox`/`option` once the list is selectable or
 * reorderable, with `aria-setsize`/`aria-posinset` from data indexes. Focus stays on the viewport
 * and the active item is announced with `aria-activedescendant` (the item node is pinned in the
 * window so it survives scrolling). Arrows/Home/End/PageUp/PageDown move, Space or Enter select
 * (Shift extends a range, Ctrl+A selects all in `multiple`), typing jumps by `item-label`. A polite
 * live region announces each loaded batch.
 *
 * **Reorder (FR-DATA-LIST-05).** With `reorderable`: Space picks up the active item, arrows move
 * it, Space drops, Escape cancels (so Enter is the select key then). Pointer drag starts after a
 * 4 px threshold, auto-scrolls near the viewport edges and drops on release. Both emit
 * `bx-reorder` and move the item in the list's own copy; assign `items` again to resync.
 *
 * **Reverse (FR-DATA-LIST-03).** `direction="reverse"` starts at the bottom, keeps the viewport
 * pinned to the bottom as items arrive unless the user scrolled up, and loads older items when
 * scrolled near the top while keeping what the user is reading in place.
 *
 * Gaps, per docs/features/_conventions.md's "say so inline" rule: `layout="masonry"` is rendered
 * as `grid` (true column-packing needs per-column virtualization, which the shared virtualizer
 * does not do); the spec's `item` *slot* is replaced by the `renderItem` property (a slotted
 * template cannot be instantiated per item); `item-height` fixes the row height in px.
 *
 * @fires bx-item-click - An item was activated. `detail: { item, index, key }`.
 * @fires bx-selection-change - `detail: { selectedKeys }`.
 * @fires bx-reorder - An item moved. `detail: { item, key, from, to }`.
 * @fires bx-range-change - The rendered item range changed. `detail: { start, end }`.
 * @fires bx-load-more - Scrolled near the end (the start in `reverse`). With `data-source` the
 *   next page is also requested automatically.
 * @fires bx-data-error - A `data-source` request failed. `detail: { error }`; call `refresh()`
 *   or scroll to retry.
 *
 * @slot group-header - Not used per group; see `renderGroupHeader`.
 * @slot empty - Shown when there are no items.
 * @slot loading - Shown while loading.
 * @slot header - Above the list.
 * @slot footer - Below the list.
 *
 * @csspart base - The outer container.
 * @csspart viewport - The scrolling element.
 * @csspart item - An item.
 * @csspart group-header - A group header row.
 * @csspart empty - The empty state.
 * @csspart loading - The loading state.
 *
 * @cssprop --bx-data-list-gap - Gap between items.
 * @cssprop --bx-data-list-fg - Text/icon color of the root surface. Default `var(--bx-text-primary)`.
 * @cssprop --bx-data-list-min-height - Minimum height of the root surface. Default `calc(var(--bx-unit) * 8)`.
 * @cssprop --bx-data-list-viewport-focus-ring-width - Focus ring width of the `viewport` part (focus state). Default `var(--bx-border-width-strong)`.
 * @cssprop --bx-data-list-viewport-focus-ring-color - Focus ring color of the `viewport` part (focus state). Default `var(--bx-focus-ring)`.
 * @cssprop --bx-data-list-viewport-focus-ring-offset - Focus ring offset of the `viewport` part (focus state). Default `calc(var(--bx-focus-ring-offset) * -1)`.
 * @cssprop --bx-data-list-item-radius - Corner radius of the `item` part. Default `var(--bx-radius-m)`.
 * @cssprop --bx-data-list-item-selected-bg - Background of the `item` part (selected state). Default `color-mix(in srgb, var(--bx-role-accent) 14%, transparent)`.
 * @cssprop --bx-data-list-item-selected-shadow - Box shadow of the `item` part (selected state). Default `inset 0 0 0 var(--bx-border-width-strong) var(--bx-role-accent)`.
 * @cssprop --bx-data-list-item-dragging-ring-width - Focus ring width of the `item` part (dragging state). Default `var(--bx-border-width-strong)`.
 * @cssprop --bx-data-list-item-dragging-ring-color - Focus ring color of the `item` part (dragging state). Default `var(--bx-focus-ring)`.
 * @cssprop --bx-data-list-item-dragging-outline-offset - Outline offset of the `item` part (dragging state). Default `calc(var(--bx-focus-ring-offset) * -1)`.
 * @cssprop --bx-data-list-item-dragging-opacity - Opacity of the `item` part (dragging state). Default `0.7`.
 * @cssprop --bx-data-list-item-dragging-shadow - Box shadow of the `item` part (dragging state). Default `var(--bx-shadow-m)`.
 * @cssprop --bx-data-list-item-drop-indicator-height - Height of the drop indicator on the `item` part. Default `var(--bx-border-width-strong)`.
 * @cssprop --bx-data-list-item-drop-indicator-bg - Background of the drop indicator on the `item` part. Default `var(--bx-role-accent)`.
 * @cssprop --bx-data-list-group-header-padding - Padding of the `group-header` part. Default `var(--bx-space-xs) var(--bx-space-m)`.
 * @cssprop --bx-data-list-group-header-bg - Background of the `group-header` part. Default `var(--bx-surface-subtle)`.
 * @cssprop --bx-data-list-group-header-fg - Text/icon color of the `group-header` part. Default `var(--bx-text-secondary)`.
 * @cssprop --bx-data-list-group-header-block-end-border-width - Block end border width of the `group-header` part. Default `var(--bx-border-width)`.
 * @cssprop --bx-data-list-group-header-block-end-border-color - Block end border color of the `group-header` part. Default `var(--bx-border-subtle)`.
 * @cssprop --bx-data-list-loading-padding - Padding of the `loading` part. Default `var(--bx-space-l)`.
 * @cssprop --bx-data-list-loading-fg - Text/icon color of the `loading` part. Default `var(--bx-text-secondary)`.
 * @cssprop --bx-data-list-font-family - Font family of the root surface. Default `var(--bx-type-body-family)`.
 * @cssprop --bx-data-list-group-header-font-family - Font family of the `group-header` part (text style `label-s`). Default `var(--bx-type-label-family)`.
 * @cssprop --bx-data-list-group-header-font-size - Font size of the `group-header` part (text style `label-s`). Default `var(--bx-type-label-s-size)`.
 * @cssprop --bx-data-list-group-header-font-weight - Font weight of the `group-header` part (text style `label-s`). Default `var(--bx-type-label-s-weight)`.
 * @cssprop --bx-data-list-group-header-line-height - Line height of the `group-header` part (text style `label-s`). Default `var(--bx-type-label-s-leading)`.
 * @cssprop --bx-data-list-group-header-letter-spacing - Letter spacing of the `group-header` part (text style `label-s`). Default `var(--bx-type-label-s-tracking)`.
 */
export class BxDataList<T = unknown> extends BixElement {
  static override tagName = 'bx-data-list';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        ${textFamily('--bx-data-list', 'body')}
        color: var(--bx-data-list-fg, var(--bx-text-primary));
        min-block-size: var(
          --bx-data-list-min-height,
          calc(var(--bx-unit) * 8)
        );
      }

      :host([hidden]) {
        display: none;
      }

      .base {
        display: flex;
        flex-direction: column;
        block-size: 100%;
        min-block-size: inherit;
      }

      .viewport {
        flex: 1;
        min-block-size: 0;
        overflow-y: auto;
        overscroll-behavior: contain;
        outline: none;
        position: relative;
        isolation: isolate;
      }

      .viewport:focus-visible {
        outline: var(
            --bx-data-list-viewport-focus-ring-width,
            var(--bx-border-width-strong)
          )
          solid
          var(--bx-data-list-viewport-focus-ring-color, var(--bx-focus-ring));
        outline-offset: var(
          --bx-data-list-viewport-focus-ring-offset,
          calc(var(--bx-focus-ring-offset) * -1)
        );
      }

      .spacer {
        position: relative;
      }

      .row {
        position: absolute;
        inset-inline: 0;
        inset-block-start: 0;
        box-sizing: border-box;
      }

      .row[data-sticky] {
        position: sticky;
        z-index: 2;
      }

      .row[data-static] {
        position: relative;
      }

      .cells {
        display: grid;
        grid-template-columns: repeat(var(--cols, 1), minmax(0, 1fr));
        gap: var(--bx-data-list-gap, var(--bx-space-s));
        padding-block-end: var(--bx-data-list-gap, var(--bx-space-s));
        block-size: 100%;
        box-sizing: border-box;
      }

      .item {
        box-sizing: border-box;
        min-inline-size: 0;
        position: relative;
        border-radius: var(--bx-data-list-item-radius, var(--bx-radius-m));
        outline: none;
        overflow: hidden;
      }

      :host([selection='single']) .item,
      :host([selection='multiple']) .item,
      :host([reorderable]) .item {
        cursor: pointer;
      }

      .item[aria-selected='true'] {
        background: var(
          --bx-data-list-item-selected-bg,
          color-mix(in srgb, var(--bx-role-accent) 14%, transparent)
        );
        box-shadow: var(
          --bx-data-list-item-selected-shadow,
          inset 0 0 0 var(--bx-border-width-strong) var(--bx-role-accent)
        );
      }

      .item[data-active]:not([data-dragging]) {
        outline: var(
            --bx-data-list-item-dragging-ring-width,
            var(--bx-border-width-strong)
          )
          solid
          var(--bx-data-list-item-dragging-ring-color, var(--bx-focus-ring));
        outline-offset: var(
          --bx-data-list-item-dragging-outline-offset,
          calc(var(--bx-focus-ring-offset) * -1)
        );
      }

      .item[data-grabbed],
      .item[data-dragging] {
        opacity: var(--bx-data-list-item-dragging-opacity, 0.7);
        box-shadow: var(
          --bx-data-list-item-dragging-shadow,
          var(--bx-shadow-m)
        );
        z-index: 3;
      }

      .item[data-drop-before]::before {
        content: '';
        position: absolute;
        inset-inline: 0;
        inset-block-start: 0;
        block-size: var(
          --bx-data-list-item-drop-indicator-height,
          var(--bx-border-width-strong)
        );
        background: var(
          --bx-data-list-item-drop-indicator-bg,
          var(--bx-role-accent)
        );
      }

      .group-header {
        box-sizing: border-box;
        padding: var(
          --bx-data-list-group-header-padding,
          var(--bx-space-xs) var(--bx-space-m)
        );
        background: var(
          --bx-data-list-group-header-bg,
          var(--bx-surface-subtle)
        );
        color: var(--bx-data-list-group-header-fg, var(--bx-text-secondary));

        ${textStyle('--bx-data-list-group-header', 'label-s')}

        border-block-end: var(
            --bx-data-list-group-header-block-end-border-width,
            var(--bx-border-width)
          )
          solid
          var(
            --bx-data-list-group-header-block-end-border-color,
            var(--bx-border-subtle)
          );
      }

      .state {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--bx-data-list-loading-padding, var(--bx-space-l));
        color: var(--bx-data-list-loading-fg, var(--bx-text-secondary));
      }

      .sr {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }

      @media (forced-colors: active) {
        .item[aria-selected='true'] {
          forced-color-adjust: none;
          background: Highlight;
          color: HighlightText;
        }
      }
    `,
  ];

  static override properties = {
    items: { attribute: false },
    itemKey: { attribute: 'item-key' },
    layout: { type: String, reflect: true },
    minItemWidth: { type: String, attribute: 'min-item-width' },
    itemHeight: {
      attribute: 'item-height',
      converter: {
        fromAttribute: (v: string | null) =>
          v === null || v === 'auto' ? 'auto' : Number(v),
      },
    },
    overscan: { type: Number },
    groupBy: { attribute: 'group-by' },
    selection: { type: String, reflect: true },
    reorderable: { type: Boolean, reflect: true },
    dataSource: { attribute: false },
    direction: { type: String, reflect: true },
    loading: { type: Boolean, reflect: true },
    emptyLabel: { type: String, attribute: 'empty-label' },
    itemLabel: { attribute: 'item-label' },
    selectedKeys: { attribute: false },
    renderItem: { attribute: false },
    renderGroupHeader: { attribute: false },
    ariaLabel: { type: String, attribute: 'aria-label' },
    _cols: { state: true },
    _activeIndex: { state: true },
    _announce: { state: true },
    _grabbed: { state: true },
  };

  /** Data items (ignored while `data-source` is set; pages accumulate internally then). */
  declare items: readonly T[];
  declare itemKey: string | ((item: T, index: number) => Key);
  declare layout: Layout;
  declare minItemWidth: string;
  declare itemHeight: number | 'auto';
  declare overscan: number;
  declare groupBy?: string | ((item: T) => string);
  declare selection: Selection;
  declare reorderable: boolean;
  declare dataSource?: DataSource<T>;
  declare direction: Direction;
  declare loading: boolean;
  declare emptyLabel: string;
  /** Field name or function giving an item's text for typeahead. */
  declare itemLabel?: string | ((item: T) => string);
  declare selectedKeys: Key[];
  declare renderItem?: (item: T, index: number) => TemplateResult | string;
  declare renderGroupHeader?: (group: string) => TemplateResult | string;
  declare ariaLabel: string | null;
  /** @internal */
  declare _cols: number;
  /** @internal */
  declare _activeIndex: number;
  /** @internal */
  declare _announce: string;
  /** @internal */
  declare _grabbed: boolean;

  #uid = `bx-data-list-${nextId++}`;
  #loaded: T[] = [];
  #hasMore = true;
  #requesting?: AbortController;
  #requested = -1;
  #rows: Row[] = [];
  #rowOfItem: number[] = [];
  #stickyRows: number[] = [];
  #rowsDirty = true;
  #selected = new Set<Key>();
  #anchor = -1;
  #typeahead = '';
  #typeaheadTimer?: ReturnType<typeof setTimeout>;
  #gapPx = 8;
  #minPx = 220;
  #lastRange = '';
  #stickToBottom = true;
  #firstVisible?: { key: Key; offset: number };
  #didInitialScroll = false;
  #unobserve?: () => void;
  #drag?: {
    pointerId: number;
    from: number;
    startY: number;
    started: boolean;
    target: number;
    clientY: number;
    raf: number;
  };
  #grabbedFrom = -1;
  #dropIndex = -1;

  #virtualizer = new VirtualizerController(this, {
    count: 0,
    getScrollElement: () => this.#viewportEl,
    dynamic: true,
  });

  get #viewportEl(): HTMLElement | null {
    return this.shadowRoot?.querySelector('.viewport') ?? null;
  }

  constructor() {
    super();
    this.items = [];
    this.itemKey = 'id';
    this.layout = 'list';
    this.minItemWidth = '16rem';
    this.itemHeight = 'auto';
    this.overscan = 4;
    this.selection = 'none';
    this.reorderable = false;
    this.direction = 'normal';
    this.loading = false;
    this.emptyLabel = 'No items';
    this.selectedKeys = [];
    this.ariaLabel = null;
    this._cols = 1;
    this._activeIndex = -1;
    this._announce = '';
    this._grabbed = false;
  }

  // --- Data ------------------------------------------------------------------------------------

  get #data(): readonly T[] {
    return this.dataSource ? this.#loaded : this.items;
  }

  /** Number of items currently held (loaded pages with a data source). */
  get count(): number {
    return this.#data.length;
  }

  #keyOf(item: T, index: number): Key {
    const k = this.itemKey;
    if (typeof k === 'function') return k(item, index);
    const value = (item as Record<string, unknown> | null)?.[k];
    return (value as Key | undefined) ?? index;
  }

  #groupOf(item: T): string {
    const g = this.groupBy;
    if (!g) return '';
    if (typeof g === 'function') return g(item);
    return String((item as Record<string, unknown>)[g] ?? '');
  }

  #labelOf(item: T): string {
    const l = this.itemLabel;
    if (typeof l === 'function') return l(item);
    if (typeof l === 'string')
      return String((item as Record<string, unknown>)[l] ?? '');
    const r = item as Record<string, unknown> | string | null;
    if (typeof r === 'string') return r;
    return String(r?.['label'] ?? r?.['name'] ?? r?.['title'] ?? '');
  }

  // --- Lifecycle -------------------------------------------------------------------------------

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.dataSource && this.#loaded.length === 0) void this.#loadMore();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#requesting?.abort();
    this.#requesting = undefined;
    this.#unobserve?.();
    this.#unobserve = undefined;
    clearTimeout(this.#typeaheadTimer);
    this.#endDrag();
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('selectedKeys'))
      this.#selected = new Set(this.selectedKeys);
    if (changed.has('dataSource')) {
      this.#requesting?.abort();
      this.#loaded = [];
      this.#hasMore = true;
      this.#requested = -1;
      this.#rowsDirty = true;
      if (this.dataSource && this.isConnected) void this.#loadMore();
    }
    if (
      changed.has('items') ||
      changed.has('layout') ||
      changed.has('groupBy') ||
      changed.has('itemKey') ||
      changed.has('_cols')
    ) {
      if (changed.has('items') && this.direction === 'reverse')
        this.#captureReverseAnchor();
      this.#rowsDirty = true;
    }
    if (changed.has('layout') || changed.has('minItemWidth'))
      this.#measureCss();
    if (this.#rowsDirty) this.#buildRows();

    const fixed = this.itemHeight === 'auto' ? undefined : this.itemHeight;
    this.#virtualizer.setOptions({
      count: this.#rows.length,
      getScrollElement: this.#getViewport,
      dynamic: fixed === undefined,
      itemSize: fixed,
      overscan: this.overscan,
      getItemKey: this.#getRowKey,
      stickyIndexes: this.#stickyRows,
      pinnedIndexes: this.#pinned(),
    });
  }

  protected override firstUpdated(): void {
    const viewport = this.#viewportEl;
    if (!viewport) return;
    // Shared ResizeObserver pool: the grid recomputes its column count from the container width.
    this.#unobserve = observeResize(viewport, () => {
      cancelAnimationFrame(this.#widthRaf);
      this.#widthRaf = requestAnimationFrame(() => this.#updateColumns());
    });
    this.#measureCss();
  }

  #widthRaf = 0;

  #getViewport = (): Element | null => this.#viewportEl;
  #getRowKey = (index: number): Key => this.#rows[index]?.key ?? index;

  /** Resolves CSS lengths (`min-item-width`, `--bx-data-list-gap`) to px with a probe. */
  #measureCss(): void {
    const viewport = this.#viewportEl;
    if (!viewport) return;
    const probe = document.createElement('div');
    probe.style.cssText = `position:absolute;visibility:hidden;inline-size:${this.minItemWidth};padding-inline-start:var(--bx-data-list-gap, var(--bx-space-s))`;
    viewport.appendChild(probe);
    const box = probe.getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(probe).paddingInlineStart) || 8;
    probe.remove();
    this.#gapPx = gap;
    this.#minPx = Math.max(1, box - gap);
    this.#updateColumns();
  }

  #updateColumns(): void {
    const viewport = this.#viewportEl;
    if (!viewport) return;
    const cols =
      this.layout === 'list'
        ? 1
        : Math.max(
            1,
            Math.floor(
              (viewport.clientWidth + this.#gapPx) /
                (this.#minPx + this.#gapPx),
            ),
          );
    if (cols !== this._cols) this._cols = cols;
  }

  // --- Rows ------------------------------------------------------------------------------------

  #buildRows(): void {
    this.#rowsDirty = false;
    const data = this.#data;
    const cols = this.layout === 'list' ? 1 : this._cols;
    const rows: Row[] = [];
    const rowOfItem = new Array<number>(data.length);
    const sticky: number[] = [];
    let i = 0;
    while (i < data.length) {
      let end = data.length;
      if (this.groupBy) {
        const g = this.#groupOf(data[i]!);
        end = i + 1;
        while (end < data.length && this.#groupOf(data[end]!) === g) end++;
        sticky.push(rows.length);
        rows.push({ kind: 'group', key: `\u0001g:${g}:${i}`, label: g });
      }
      for (let from = i; from < end; from += cols) {
        const to = Math.min(end, from + cols);
        for (let k = from; k < to; k++) rowOfItem[k] = rows.length;
        rows.push({
          kind: 'items',
          key: String(this.#keyOf(data[from]!, from)),
          from,
          to,
        });
      }
      i = end;
    }
    this.#rows = rows;
    this.#rowOfItem = rowOfItem;
    this.#stickyRows = sticky;
    this.#virtualizer.invalidate();
  }

  #pinned(): number[] {
    const out: number[] = [];
    if (this._activeIndex >= 0) {
      const row = this.#rowOfItem[this._activeIndex];
      if (row !== undefined) out.push(row);
    }
    return out;
  }

  // --- Data source -----------------------------------------------------------------------------

  async #loadMore(): Promise<void> {
    const source = this.dataSource;
    if (!source || !this.#hasMore || this.#requesting) return;
    const start = this.#loaded.length;
    if (this.#requested === start) return;
    this.#requested = start;
    const controller = new AbortController();
    this.#requesting = controller;
    this.loading = true;
    try {
      const page = await source.getItems({
        start,
        count: PAGE_SIZE,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      this.#loaded =
        this.direction === 'reverse'
          ? [...page.items, ...this.#loaded]
          : [...this.#loaded, ...page.items];
      this.#hasMore = page.hasMore ?? page.items.length >= PAGE_SIZE;
      if (this.direction === 'reverse') this.#captureReverseAnchor();
      this._announce = `Loaded ${page.items.length} items, ${this.#loaded.length} total`;
      this.#rowsDirty = true;
    } catch (error) {
      if (!controller.signal.aborted) {
        this.#requested = -1;
        this.dispatchEvent(
          new CustomEvent('bx-data-error', {
            bubbles: true,
            composed: true,
            detail: { error },
          }),
        );
      }
    } finally {
      if (this.#requesting === controller) {
        this.#requesting = undefined;
        this.loading = false;
      }
      this.requestUpdate();
    }
  }

  /** Discards loaded pages (when a data source is set) and reloads from the start. */
  refresh(): void {
    this.#requesting?.abort();
    this.#requesting = undefined;
    this.#loaded = [];
    this.#hasMore = true;
    this.#requested = -1;
    this.#rowsDirty = true;
    this.#virtualizer.invalidate(true);
    this.requestUpdate();
    if (this.dataSource) void this.#loadMore();
  }

  /** Re-measures one item (its content changed height). */
  invalidateItem(key: Key): void {
    const index = this.#data.findIndex(
      (item, i) => this.#keyOf(item, i) === key,
    );
    const row = this.#rowOfItem[index];
    if (row === undefined) return;
    const rowKey = this.#rows[row]?.key;
    if (rowKey !== undefined) this.#virtualizer.forget(rowKey);
  }

  scrollToIndex(
    index: number,
    align: 'start' | 'center' | 'end' | 'auto' = 'auto',
  ): void {
    const row = this.#rowOfItem[index];
    if (row !== undefined) this.#virtualizer.scrollToIndex(row, { align });
  }

  scrollToKey(
    key: Key,
    align: 'start' | 'center' | 'end' | 'auto' = 'auto',
  ): void {
    const index = this.#data.findIndex(
      (item, i) => this.#keyOf(item, i) === key,
    );
    if (index >= 0) this.scrollToIndex(index, align);
  }

  // --- Reverse (chat) --------------------------------------------------------------------------

  #captureReverseAnchor(): void {
    const viewport = this.#viewportEl;
    if (!viewport) return;
    const atBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 4;
    this.#stickToBottom = atBottom;
    const first = this.#virtualizer.visibleRange.start;
    const row = this.#rows[first];
    this.#firstVisible =
      row && row.kind === 'items'
        ? {
            key: this.#keyOf(this.#data[row.from]!, row.from),
            offset: this.#virtualizer.offsetOf(first) - viewport.scrollTop,
          }
        : undefined;
  }

  #restoreReverse(): void {
    const viewport = this.#viewportEl;
    if (!viewport || this.direction !== 'reverse') return;
    if (!this.#didInitialScroll && this.#rows.length > 0) {
      this.#didInitialScroll = true;
      viewport.scrollTop = viewport.scrollHeight;
      this.#virtualizer.scrollToIndex(this.#rows.length - 1, { align: 'end' });
      return;
    }
    if (this.#stickToBottom) {
      viewport.scrollTop = this.#virtualizer.totalSize;
      this.#virtualizer.scrollToIndex(this.#rows.length - 1, { align: 'end' });
    } else if (this.#firstVisible) {
      const index = this.#data.findIndex(
        (item, i) => this.#keyOf(item, i) === this.#firstVisible!.key,
      );
      const row = this.#rowOfItem[index];
      if (row !== undefined)
        viewport.scrollTop =
          this.#virtualizer.offsetOf(row) - this.#firstVisible.offset;
    }
    this.#firstVisible = undefined;
  }

  // --- Update hooks ----------------------------------------------------------------------------

  protected override updated(changed: PropertyValues<this>): void {
    if (this.#renderedRowsNeedMeasure())
      for (const el of this.shadowRoot!.querySelectorAll('.row[data-index]'))
        this.#virtualizer.measureElement(el);

    if (
      changed.has('items') ||
      changed.has('_cols') ||
      changed.has('_announce')
    )
      this.#restoreReverse();

    this.#emitRange();
    this.#maybeLoadMore();
    this.#syncActiveDescendant();
  }

  #renderedRowsNeedMeasure(): boolean {
    return this.itemHeight === 'auto';
  }

  #emitRange(): void {
    const { start, end } = this.#virtualizer.visibleRange;
    const first = this.#rows[start];
    const last = this.#rows[end];
    if (!first || !last) return;
    const a =
      first.kind === 'items'
        ? first.from
        : ((this.#rows[start + 1] as { from?: number } | undefined)?.from ?? 0);
    const b = last.kind === 'items' ? last.to - 1 : a;
    const signature = `${a}:${b}`;
    if (signature === this.#lastRange) return;
    this.#lastRange = signature;
    this.dispatchEvent(
      new CustomEvent('bx-range-change', {
        bubbles: true,
        composed: true,
        detail: { start: a, end: b },
      }),
    );
  }

  #maybeLoadMore(): void {
    if (this.#rows.length === 0 || this.loading) return;
    const { start, end } = this.#virtualizer.visibleRange;
    const reverse = this.direction === 'reverse';
    const near = reverse
      ? start <= PREFETCH_ROWS
      : end >= this.#rows.length - 1 - PREFETCH_ROWS;
    if (!near) return;
    if (this.dataSource) {
      void this.#loadMore();
    } else {
      const marker = this.#data.length;
      if (this.#requested === marker) return;
      this.#requested = marker;
      this.dispatchEvent(
        new CustomEvent('bx-load-more', { bubbles: true, composed: true }),
      );
    }
  }

  // --- Selection / interaction -----------------------------------------------------------------

  get #interactive(): boolean {
    return this.selection !== 'none' || this.reorderable;
  }

  #setSelected(next: Set<Key>): void {
    this.#selected = next;
    this.selectedKeys = [...next];
    this.dispatchEvent(
      new CustomEvent('bx-selection-change', {
        bubbles: true,
        composed: true,
        detail: { selectedKeys: this.selectedKeys },
      }),
    );
  }

  #select(index: number, range = false, toggle = true): void {
    if (this.selection === 'none') return;
    const item = this.#data[index];
    if (item === undefined) return;
    const key = this.#keyOf(item, index);
    if (this.selection === 'single') {
      this.#setSelected(
        toggle && this.#selected.has(key) ? new Set() : new Set([key]),
      );
      this.#anchor = index;
      return;
    }
    if (range && this.#anchor >= 0) {
      const next = new Set(this.#selected);
      const [lo, hi] = [
        Math.min(this.#anchor, index),
        Math.max(this.#anchor, index),
      ];
      for (let i = lo; i <= hi; i++) next.add(this.#keyOf(this.#data[i]!, i));
      this.#setSelected(next);
      return;
    }
    const next = new Set(this.#selected);
    if (next.has(key) && toggle) next.delete(key);
    else next.add(key);
    this.#setSelected(next);
    this.#anchor = index;
  }

  #activate(
    index: number,
    event: { shiftKey: boolean; ctrlKey: boolean; metaKey: boolean },
  ): void {
    const item = this.#data[index];
    if (item === undefined) return;
    this._activeIndex = index;
    this.#select(index, event.shiftKey);
    this.dispatchEvent(
      new CustomEvent('bx-item-click', {
        bubbles: true,
        composed: true,
        detail: { item, index, key: this.#keyOf(item, index) },
      }),
    );
  }

  #indexFromEvent(event: Event): number {
    for (const node of event.composedPath()) {
      if (node instanceof HTMLElement && node.dataset['item'] !== undefined)
        return Number(node.dataset['item']);
    }
    return -1;
  }

  #handleClick = (event: MouseEvent): void => {
    if (this.#drag?.started) return;
    const index = this.#indexFromEvent(event);
    if (index >= 0) this.#activate(index, event);
  };

  #moveActive(index: number, extend: boolean): void {
    const clamped = Math.max(0, Math.min(this.#data.length - 1, index));
    if (clamped === this._activeIndex) return;
    this._activeIndex = clamped;
    if (this._grabbed) {
      this.#dropIndex = clamped;
    } else if (extend && this.selection === 'multiple') {
      if (this.#anchor < 0) this.#anchor = this._activeIndex;
      this.#select(clamped, true);
    }
    this.scrollToIndex(clamped, 'auto');
  }

  #handleKeydown = (event: KeyboardEvent): void => {
    if (!this.#interactive || this.#data.length === 0) return;
    const { key } = event;
    const cols = this.layout === 'list' ? 1 : this._cols;
    const current = this._activeIndex < 0 ? 0 : this._activeIndex;
    const page = Math.max(
      1,
      Math.floor((this.#viewportEl?.clientHeight ?? 400) / 48) * cols,
    );

    if (this._grabbed) {
      this.#handleGrabKey(event, cols);
      return;
    }
    let target = -1;
    switch (key) {
      case 'ArrowDown':
        target = this._activeIndex < 0 ? 0 : current + cols;
        break;
      case 'ArrowUp':
        target = current - cols;
        break;
      case 'ArrowRight':
        if (cols > 1) target = current + 1;
        break;
      case 'ArrowLeft':
        if (cols > 1) target = current - 1;
        break;
      case 'Home':
        target = 0;
        break;
      case 'End':
        target = this.#data.length - 1;
        break;
      case 'PageDown':
        target = current + page;
        break;
      case 'PageUp':
        target = current - page;
        break;
      case ' ':
        if (this.#typeahead) {
          event.preventDefault();
          this.#typeaheadJump(key);
          return;
        }
        if (this.reorderable && this._activeIndex >= 0) {
          event.preventDefault();
          this._grabbed = true;
          this.#grabbedFrom = this._activeIndex;
          this.#dropIndex = this._activeIndex;
          this._announce =
            'Grabbed. Use arrow keys to move, Space to drop, Escape to cancel.';
          return;
        }
        if (this.selection !== 'none' && this._activeIndex >= 0) {
          event.preventDefault();
          this.#activate(this._activeIndex, event);
        }
        return;
      case 'Enter':
        if (this._activeIndex >= 0) {
          event.preventDefault();
          this.#activate(this._activeIndex, event);
        }
        return;
      case 'a':
      case 'A':
        if ((event.ctrlKey || event.metaKey) && this.selection === 'multiple') {
          event.preventDefault();
          this.#setSelected(
            new Set(this.#data.map((item, i) => this.#keyOf(item, i))),
          );
        }
        return;
      default:
        if (
          key.length === 1 &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey
        ) {
          this.#typeaheadJump(key);
        }
        return;
    }
    if (
      target < 0 &&
      key !== 'ArrowUp' &&
      key !== 'ArrowLeft' &&
      key !== 'PageUp'
    )
      return;
    event.preventDefault();
    this.#moveActive(target, event.shiftKey);
  };

  #handleGrabKey(event: KeyboardEvent, cols: number): void {
    const { key } = event;
    const delta =
      key === 'ArrowDown'
        ? cols
        : key === 'ArrowUp'
          ? -cols
          : key === 'ArrowRight' && cols > 1
            ? 1
            : key === 'ArrowLeft' && cols > 1
              ? -1
              : 0;
    if (delta) {
      event.preventDefault();
      const next = Math.max(
        0,
        Math.min(this.#data.length - 1, this._activeIndex + delta),
      );
      this.#applyReorder(this._activeIndex, next);
      this._activeIndex = next;
      this.scrollToIndex(next, 'auto');
      this._announce = `Moved to position ${next + 1} of ${this.#data.length}`;
    } else if (key === ' ' || key === 'Enter') {
      event.preventDefault();
      this._grabbed = false;
      this._announce = `Dropped at position ${this._activeIndex + 1}`;
      this.#grabbedFrom = -1;
    } else if (key === 'Escape') {
      event.preventDefault();
      this.#applyReorder(this._activeIndex, this.#grabbedFrom);
      this._activeIndex = this.#grabbedFrom;
      this._grabbed = false;
      this._announce = 'Reorder cancelled';
      this.#grabbedFrom = -1;
    }
  }

  #typeaheadJump(character: string): void {
    clearTimeout(this.#typeaheadTimer);
    this.#typeahead += character.toLowerCase();
    this.#typeaheadTimer = setTimeout(
      () => (this.#typeahead = ''),
      TYPEAHEAD_RESET_MS,
    );
    const n = this.#data.length;
    const start = this._activeIndex + (this.#typeahead.length === 1 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const index = (Math.max(start, 0) + i) % n;
      if (
        this.#labelOf(this.#data[index]!)
          .toLowerCase()
          .startsWith(this.#typeahead)
      ) {
        this.#moveActive(index, false);
        return;
      }
    }
  }

  // --- Reorder ---------------------------------------------------------------------------------

  #applyReorder(from: number, to: number): void {
    if (from === to || from < 0 || to < 0) return;
    const next = [...this.#data];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved as T);
    if (this.dataSource) this.#loaded = next;
    else this.items = next;
    this.#rowsDirty = true;
    this.dispatchEvent(
      new CustomEvent('bx-reorder', {
        bubbles: true,
        composed: true,
        detail: { item: moved, key: this.#keyOf(moved as T, to), from, to },
      }),
    );
    this.requestUpdate();
  }

  #handlePointerDown = (event: PointerEvent): void => {
    if (!this.reorderable || event.button !== 0 || this._grabbed) return;
    const index = this.#indexFromEvent(event);
    if (index < 0) return;
    this.#drag = {
      pointerId: event.pointerId,
      from: index,
      startY: event.clientY,
      started: false,
      target: index,
      clientY: event.clientY,
      raf: 0,
    };
    document.addEventListener('pointermove', this.#handlePointerMove);
    document.addEventListener('pointerup', this.#handlePointerUp);
    document.addEventListener('pointercancel', this.#handlePointerCancel);
  };

  #handlePointerMove = (event: PointerEvent): void => {
    const drag = this.#drag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    drag.clientY = event.clientY;
    if (!drag.started) {
      if (Math.abs(event.clientY - drag.startY) < DRAG_THRESHOLD) return;
      drag.started = true;
      this._activeIndex = drag.from;
      this.requestUpdate();
      const tick = (): void => {
        if (!this.#drag) return;
        this.#autoScroll(this.#drag.clientY);
        this.#updateDropTarget(this.#drag.clientY, event.clientX);
        this.#drag.raf = requestAnimationFrame(tick);
      };
      drag.raf = requestAnimationFrame(tick);
    }
  };

  #autoScroll(clientY: number): void {
    const viewport = this.#viewportEl;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    if (clientY < rect.top + EDGE_SCROLL_ZONE)
      viewport.scrollTop -= EDGE_SCROLL_SPEED;
    else if (clientY > rect.bottom - EDGE_SCROLL_ZONE)
      viewport.scrollTop += EDGE_SCROLL_SPEED;
  }

  #updateDropTarget(clientY: number, clientX: number): void {
    const viewport = this.#viewportEl;
    const drag = this.#drag;
    if (!viewport || !drag) return;
    const rect = viewport.getBoundingClientRect();
    const offset = clientY - rect.top + viewport.scrollTop;
    const row = this.#rows[this.#virtualizer.indexAtOffset(offset)];
    if (!row || row.kind !== 'items') return;
    const cols = this.layout === 'list' ? 1 : this._cols;
    const cell = Math.min(
      row.to - row.from - 1,
      Math.max(
        0,
        Math.floor(((clientX - rect.left) / Math.max(1, rect.width)) * cols),
      ),
    );
    const target = row.from + cell;
    if (target !== this.#dropIndex) {
      this.#dropIndex = target;
      drag.target = target;
      this.requestUpdate();
    }
  }

  #handlePointerUp = (event: PointerEvent): void => {
    const drag = this.#drag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    const moved = drag.started;
    const { from, target } = drag;
    this.#endDrag();
    if (moved) {
      this.#applyReorder(from, target);
      this._activeIndex = target;
      // The click that follows the release must not also select.
      this.#suppressClick = true;
      setTimeout(() => (this.#suppressClick = false), 0);
    }
  };

  #suppressClick = false;

  #handlePointerCancel = (): void => this.#endDrag();

  #endDrag(): void {
    if (this.#drag) cancelAnimationFrame(this.#drag.raf);
    this.#drag = undefined;
    this.#dropIndex = -1;
    document.removeEventListener('pointermove', this.#handlePointerMove);
    document.removeEventListener('pointerup', this.#handlePointerUp);
    document.removeEventListener('pointercancel', this.#handlePointerCancel);
    this.requestUpdate();
  }

  #handleClickGuard = (event: MouseEvent): void => {
    if (this.#suppressClick) {
      event.stopPropagation();
      return;
    }
    this.#handleClick(event);
  };

  // --- Render ----------------------------------------------------------------------------------

  #syncActiveDescendant(): void {
    const viewport = this.#viewportEl;
    if (!viewport) return;
    if (this._activeIndex >= 0 && this.#interactive)
      viewport.setAttribute(
        'aria-activedescendant',
        `${this.#uid}-i${this._activeIndex}`,
      );
    else viewport.removeAttribute('aria-activedescendant');
  }

  #renderItem(item: T, index: number) {
    const key = this.#keyOf(item, index);
    const selected = this.#selected.has(key);
    const interactive = this.#interactive;
    const dragging = this.#drag?.started && this.#drag.from === index;
    const dropBefore =
      (this.#drag?.started || this._grabbed) &&
      this.#dropIndex === index &&
      !dragging;
    const total = this.#data.length;
    return html`<div
      class="item"
      part="item"
      id="${this.#uid}-i${index}"
      role=${interactive ? 'option' : 'listitem'}
      data-item=${index}
      aria-setsize=${total}
      aria-posinset=${index + 1}
      aria-selected=${this.selection !== 'none' ? String(selected) : nothing}
      ?data-active=${index === this._activeIndex && interactive}
      ?data-grabbed=${this._grabbed && index === this._activeIndex}
      ?data-dragging=${dragging}
      ?data-drop-before=${dropBefore}
    >
      ${
        this.renderItem
          ? this.renderItem(item, index)
          : this.#labelOf(item) || String(item)
      }
    </div>`;
  }

  #renderRow(row: Row, rowIndex: number, start: number, sticky: boolean) {
    const fixed = this.itemHeight === 'auto' ? undefined : this.itemHeight;
    const size = fixed !== undefined ? `block-size: ${fixed}px;` : '';
    const pos = sticky
      ? 'inset-block-start: 0;'
      : `transform: translateY(${start}px);`;
    if (row.kind === 'group')
      return html`<div
        class="row group-header"
        part="group-header"
        role="presentation"
        data-index=${rowIndex}
        ?data-sticky=${sticky}
        style="${size}${pos}"
      >
        ${this.renderGroupHeader ? this.renderGroupHeader(row.label) : row.label}
      </div>`;
    const cols = this.layout === 'list' ? 1 : this._cols;
    const items: unknown[] = [];
    for (let i = row.from; i < row.to; i++)
      items.push(this.#renderItem(this.#data[i]!, i));
    return html`<div
      class="row"
      role="presentation"
      data-index=${rowIndex}
      style="${size}${pos}--cols: ${cols}"
    >
      <div class="cells" role="presentation">${items}</div>
    </div>`;
  }

  protected override render() {
    const data = this.#data;
    const interactive = this.#interactive;
    // An empty list/listbox would violate the required-children rule; it is just a region then.
    const role =
      data.length === 0 ? undefined : interactive ? 'listbox' : 'list';
    const items = this.#virtualizer.items;
    const activeSticky = this.#virtualizer.activeStickyIndex;
    const empty = data.length === 0 && !this.loading;

    return html`
      <div class="base" part="base">
        <slot name="header"></slot>
        <div
          class="viewport"
          part="viewport"
          role=${role ?? nothing}
          tabindex="0"
          aria-label=${this.ariaLabel ?? nothing}
          aria-multiselectable=${this.selection === 'multiple' ? 'true' : nothing}
          aria-busy=${this.loading ? 'true' : nothing}
          @keydown=${this.#handleKeydown}
          @click=${this.#handleClickGuard}
          @pointerdown=${this.#handlePointerDown}
        >
          <div
            class="spacer"
            role="presentation"
            style="block-size: ${this.#virtualizer.totalSize}px"
          >
            ${repeat(
              items,
              (item) => item.key,
              (item) => {
                const row = this.#rows[item.index];
                if (!row) return nothing;
                const stuck =
                  item.index === activeSticky && row.kind === 'group';
                return this.#renderRow(row, item.index, item.start, stuck);
              },
            )}
          </div>
          ${
            empty
              ? html`<div class="state" part="empty">
                  <slot name="empty">${this.emptyLabel}</slot>
                </div>`
              : nothing
          }
          ${
            this.loading
              ? html`<div class="state" part="loading">
                  <slot name="loading">Loading…</slot>
                </div>`
              : nothing
          }
        </div>
        <slot name="footer"></slot>
        <div class="sr" role="status" aria-live="polite">${this._announce}</div>
      </div>
    `;
  }
}
