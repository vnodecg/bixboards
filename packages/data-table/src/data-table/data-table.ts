import {
  css,
  html,
  nothing,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { BixElement, VirtualizerController, observeResize } from '@bixant/core';
import {
  BlockCache,
  columnId,
  filterRows,
  groupRows,
  sortRows,
  toCsvChunks,
  toTsv,
  toXlsx,
  valueOf,
  type ColumnDef,
  type FilterModel,
  type FilterValue,
  type GroupInfo,
  type Key,
  type SortModel,
  type TableDataSource,
} from './table-model.ts';

export type {
  ColumnDef,
  FilterModel,
  SortModel,
  TableDataSource,
} from './table-model.ts';

type Selection = 'none' | 'single' | 'multiple';
type Density = 'compact' | 'comfortable' | 'spacious';
type Responsive = 'scroll' | 'priority' | 'cards';

const SELECT_ID = '__select';
const DETAIL_ID = '__detail';
const DEFAULT_WIDTH = 140;
const DEFAULT_MIN = 64;
const SELECT_WIDTH = 44;
const BLOCK_SIZE = 100;
const COLUMN_OVERSCAN = 2;
const RESIZE_STEP = 16;
const CARDS_BREAKPOINT = 560;

interface EffColumn {
  def: ColumnDef;
  id: string;
  width: number;
  left: number;
  pinned?: 'start' | 'end';
  internal?: boolean;
}

interface CellPos {
  row: number; // view row index; -1 is the header row
  col: number;
}

/**
 * `<bx-data-table>` — virtualized enterprise data table (docs/features/data-table/data-table.md),
 * built on core's `VirtualizerController`. Only the visible rows *and* columns (past 50 columns)
 * exist in the DOM; cell renderers are plain functions returning templates or primitives, so there
 * is no custom element per cell.
 *
 * **Data pipeline.** `data` (client) flows through filter → sort → group on *index arrays* — rows
 * are never copied. Sort keys are extracted once per column into typed arrays, and the sort is
 * stable. Grouping adds expandable group rows with per-column aggregates. With `data-source` the
 * table is server-side: a block cache (100 rows/block) fetches only the blocks near the viewport,
 * de-duplicates in-flight requests, aborts blocks that scrolled away, and a failed block shows a
 * retry row (`bx-data-error`).
 *
 * **Grid semantics.** `role="grid"` with `aria-rowcount/rowindex/colcount/colindex/sort/selected`
 * derived from data indexes, so rows scrolled out of the DOM keep their numbers. One cell holds
 * the roving `tabindex`; arrows, Home/End, Ctrl+Home/End and PageUp/PageDown move it; the header
 * row is part of the grid (Enter/Space sorts, Alt+Arrow resizes, Alt+Shift+Arrow reorders). Space
 * selects the row, Shift+Arrow extends a cell range, Ctrl/Cmd+C copies the range as TSV. A polite
 * live region announces sort, selection and edit results.
 *
 * **Editing.** With `editable` and a column `editor` (`text`, `number`, `checkbox`, `select` or a
 * function), Enter/F2/double-click edits, Enter commits, Escape cancels, Tab commits and moves.
 * `bx-cell-edit-commit` is cancelable and supports async validation: call
 * `event.detail.waitUntil(promise)`; a rejected promise (or `false`) keeps the editor open with an
 * error. An accepted edit assigns `row[field]` (data is held as provided, not cloned).
 *
 * **Layout.** Columns come from `columns` or declarative `<bx-column>` children. Pinned columns are
 * `position: sticky`. `responsive="priority"` hides the least important columns (`priority`) as
 * the table's own width shrinks; `"cards"` re-lays each row as a labelled card below
 * `cards-breakpoint` px; `"scroll"` scrolls horizontally. The width is observed through the shared
 * `ResizeObserver` pool, so the table is its own container, not a viewport.
 *
 * Gaps, per docs/features/_conventions.md's "say so inline" rule: sorting/filtering/grouping run on
 * the main thread (no Worker; the pipeline is index-based and typed-array backed to keep it cheap
 * — see the performance note in the spec's acceptance list); tree-data mode, the column show/hide
 * *menu UI* (use `setColumnVisible()`), drag-to-pin UI (use `setColumnPinned()`), the toolbar
 * overflow menu and the `columns` serialization of renderers are not implemented; `row-detail` is
 * the `renderDetail` property; the built-in editors are native `<input>`/`<select>` (use a function
 * `editor` to render `bx-input`/`bx-select`); server-side mode does not group (`group` is passed to the source).
 * `exportXlsx()` writes a single-sheet, uncompressed (stored) workbook.
 *
 * @fires bx-sort-change - `detail: { sort }`.
 * @fires bx-filter-change - `detail: { filters }`.
 * @fires bx-selection-change - `detail: { selectedKeys, allMatching }`.
 * @fires bx-row-click - `detail: { row, key, index }`.
 * @fires bx-row-dblclick - `detail: { row, key, index }`.
 * @fires bx-cell-edit-start - `detail: { row, key, columnId }`.
 * @fires bx-cell-edit-commit - Cancelable; `detail: { row, key, columnId, oldValue, newValue,
 *   waitUntil(promise) }`.
 * @fires bx-column-resize - `detail: { columnId, width }`.
 * @fires bx-column-reorder - `detail: { order }`.
 * @fires bx-column-pin - `detail: { columnId, pinned }`.
 * @fires bx-range-change - Visible row range. `detail: { start, end }`.
 * @fires bx-data-request - A server block was requested. `detail: { start, end }`.
 * @fires bx-data-error - A server block failed. `detail: { error, block }`.
 * @fires bx-row-expand - A group or detail row was toggled. `detail: { key, expanded }`.
 *
 * @slot toolbar - Above the grid.
 * @slot empty - Shown when there are no rows.
 * @slot loading - Shown while loading.
 * @slot footer - Below the grid.
 * @slot - Declarative `bx-column` children.
 *
 * @csspart base - The outer container.
 * @csspart toolbar - The toolbar region.
 * @csspart header - The header row.
 * @csspart header-cell - A header cell.
 * @csspart body - The body spacer.
 * @csspart row - A data row.
 * @csspart cell - A cell.
 * @csspart cell-selected - A cell in the selected range.
 * @csspart group-row - A group row.
 * @csspart detail - A row's detail panel.
 * @csspart footer - The footer region.
 * @csspart resize-handle - A header cell's resize handle.
 * @csspart loading-overlay - The loading indicator.
 * @csspart empty - The empty state.
 *
 * @cssprop --bx-table-row-height - Row height (density default).
 * @cssprop --bx-table-header-height - Header height.
 * @cssprop --bx-table-stripe - Background of odd rows.
 * @cssprop --bx-table-border - Border color.
 * @cssprop --bx-table-cell-padding-inline - Cell inline padding.
 */
export class BxDataTable<T = unknown> extends BixElement {
  static override tagName = 'bx-data-table';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        font-family: var(--bx-font-family-sans);
        color: var(--bx-text-primary);
        min-block-size: 10rem;
        --_row: var(--bx-table-row-height, calc(var(--bx-unit, 1rem) * 2.25));
      }

      :host([density='compact']) {
        --_row: var(--bx-table-row-height, calc(var(--bx-unit, 1rem) * 1.75));
      }

      :host([density='spacious']) {
        --_row: var(--bx-table-row-height, calc(var(--bx-unit, 1rem) * 3));
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

      .scroller {
        flex: 1;
        min-block-size: 0;
        overflow: auto;
        position: relative;
        outline: none;
        border: var(--bx-border-width) solid
          var(--bx-table-border, var(--bx-border-subtle));
        border-radius: var(--bx-radius-m);
        background: var(--bx-surface-base);
      }

      .header {
        position: sticky;
        inset-block-start: 0;
        z-index: 4;
        display: grid;
        min-inline-size: 100%;
        inline-size: var(--_total, 100%);
        grid-template-columns: var(--_tracks);
        background: var(--bx-surface-subtle);
        border-block-end: var(--bx-border-width) solid
          var(--bx-table-border, var(--bx-border-subtle));
        min-block-size: var(--bx-table-header-height, var(--_row));
      }

      :host(:not([sticky-header])) .header {
        position: relative;
      }

      .hcell,
      .cell {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        min-inline-size: 0;
        padding-inline: var(--bx-table-cell-padding-inline, var(--bx-space-s));
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        outline: none;
        background: inherit;
      }

      .hcell {
        position: relative;
        font-weight: var(--bx-font-weight-medium);
        font-size: var(--bx-font-s);
        gap: var(--bx-space-xs);
        user-select: none;
      }

      .hcell[data-sortable] {
        cursor: pointer;
      }

      .hcell .sort {
        color: var(--bx-text-secondary);
        font-size: 0.8em;
      }

      .hcell .title {
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .resize-handle {
        position: absolute;
        inset-block: 0;
        inset-inline-end: 0;
        inline-size: 6px;
        cursor: col-resize;
        touch-action: none;
      }

      .resize-handle:hover,
      .resize-handle[data-active] {
        background: var(--bx-role-accent);
      }

      .hcell[data-pinned],
      .cell[data-pinned] {
        position: sticky;
        z-index: 3;
        background: var(--bx-surface-base);
      }

      .hcell[data-pinned] {
        background: var(--bx-surface-subtle);
        z-index: 5;
      }

      .hcell[data-pinned='start'],
      .cell[data-pinned='start'] {
        box-shadow: inset calc(var(--bx-border-width) * -1) 0 0
          var(--bx-border-subtle);
      }

      .hcell[data-pinned='end'],
      .cell[data-pinned='end'] {
        box-shadow: inset var(--bx-border-width) 0 0 var(--bx-border-subtle);
      }

      .hcell:focus-visible,
      .cell:focus-visible {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: calc(var(--bx-focus-ring-offset) * -1);
        z-index: 6;
      }

      .spacer {
        position: relative;
        min-inline-size: 100%;
        inline-size: var(--_total, 100%);
      }

      .row {
        position: absolute;
        inset-inline-start: 0;
        inset-block-start: 0;
        inline-size: 100%;
        box-sizing: border-box;
        display: grid;
        grid-template-columns: var(--_tracks);
        min-block-size: var(--_row);
        border-block-end: var(--bx-border-width) solid
          var(--bx-table-border, var(--bx-border-subtle));
        background: var(--bx-surface-base);
        grid-auto-rows: min-content;
      }

      .row:nth-child(odd) {
        background: var(--bx-table-stripe, var(--bx-surface-base));
      }

      .row:hover {
        background: var(--bx-surface-subtle);
      }

      .row[aria-selected='true'] {
        background: color-mix(
          in srgb,
          var(--bx-role-accent) 14%,
          var(--bx-surface-base)
        );
      }

      .group-row {
        font-weight: var(--bx-font-weight-medium);
        background: var(--bx-surface-subtle);
      }

      .cell[data-range] {
        background: color-mix(
          in srgb,
          var(--bx-role-accent) 20%,
          var(--bx-surface-base)
        );
      }

      .cell[data-align='end'] {
        justify-content: flex-end;
      }

      .cell[data-align='center'] {
        justify-content: center;
      }

      .skeleton {
        inline-size: 70%;
        block-size: 0.8em;
        border-radius: var(--bx-radius-s, 3px);
        background: var(--bx-surface-muted, var(--bx-surface-subtle));
      }

      .editor {
        inline-size: 100%;
        min-inline-size: 0;
      }

      .editor input {
        inline-size: 100%;
        box-sizing: border-box;
        font: inherit;
        padding: 0.15em 0.3em;
        border: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        border-radius: var(--bx-radius-s, 3px);
        background: var(--bx-surface-base);
        color: inherit;
      }

      .error {
        color: var(--bx-role-danger-fg);
        font-size: var(--bx-font-s);
      }

      .toggle {
        all: unset;
        cursor: pointer;
        inline-size: 1.25em;
        block-size: 1.25em;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--bx-text-secondary);
        flex-shrink: 0;
      }

      .toggle[aria-expanded='true'] {
        rotate: 90deg;
      }

      .check {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 1.1em;
        block-size: 1.1em;
        border: var(--bx-border-width-strong) solid var(--bx-border-strong);
        border-radius: var(--bx-radius-s, 3px);
        font-size: 0.8em;
        background: var(--bx-surface-base);
      }

      .check[data-state='true'],
      .check[data-state='mixed'] {
        background: var(--bx-role-accent);
        border-color: var(--bx-role-accent);
        color: var(--bx-role-accent-contrast, #fff);
      }

      .detail {
        grid-column: 1 / -1;
        padding: var(--bx-space-s) var(--bx-space-m);
        background: var(--bx-surface-subtle);
        white-space: normal;
        min-inline-size: 0;
        position: sticky;
        inset-inline-start: 0;
      }

      .state {
        padding: var(--bx-space-l, 1.5rem);
        text-align: center;
        color: var(--bx-text-secondary);
      }

      .overlay {
        position: absolute;
        inset-block-start: 3rem;
        inset-inline: 0;
        text-align: center;
        pointer-events: none;
        color: var(--bx-text-secondary);
      }

      .sr {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        overflow: hidden;
        clip-path: inset(50%);
      }

      /* responsive="cards": each row becomes a labelled card. */
      :host([data-cards]) .header {
        display: none;
      }

      :host([data-cards]) .row {
        display: block;
        padding-block: var(--bx-space-xs);
      }

      :host([data-cards]) .cell {
        display: flex;
        position: static;
        justify-content: space-between;
        white-space: normal;
        box-shadow: none;
      }

      :host([data-cards]) .cell::before {
        content: attr(data-label);
        font-weight: var(--bx-font-weight-medium);
        color: var(--bx-text-secondary);
        margin-inline-end: var(--bx-space-s);
      }

      @media (forced-colors: active) {
        .row[aria-selected='true'],
        .cell[data-range] {
          forced-color-adjust: none;
          background: Highlight;
          color: HighlightText;
        }
      }
    `,
  ];

  static override properties = {
    columns: { attribute: false },
    data: { attribute: false },
    dataSource: { attribute: false },
    rowKey: { attribute: 'row-key' },
    rowHeight: {
      attribute: 'row-height',
      converter: {
        fromAttribute: (v: string | null) =>
          v === null || v === 'auto' ? 'auto' : Number(v),
      },
    },
    overscan: { type: Number },
    selection: { type: String, reflect: true },
    selectedKeys: { attribute: false },
    sort: { attribute: false },
    filters: { attribute: false },
    groupBy: { attribute: false },
    expandedKeys: { attribute: false },
    density: { type: String, reflect: true },
    stickyHeader: { type: Boolean, reflect: true, attribute: 'sticky-header' },
    loading: { type: Boolean, reflect: true },
    emptyLabel: { type: String, attribute: 'empty-label' },
    editable: { type: Boolean, reflect: true },
    resizable: { type: Boolean },
    reorderable: { type: Boolean },
    virtualizeColumns: {
      attribute: 'virtualize-columns',
      converter: {
        fromAttribute: (v: string | null) =>
          v === null || v === 'auto' ? 'auto' : v !== 'false',
      },
    },
    responsive: { type: String, reflect: true },
    cardsBreakpoint: { type: Number, attribute: 'cards-breakpoint' },
    renderDetail: { attribute: false },
    ariaLabel: { type: String, attribute: 'aria-label' },
    _version: { state: true },
    _width: { state: true },
    _colWindow: { state: true },
  };

  declare columns: ColumnDef<T>[];
  declare data: readonly T[];
  declare dataSource?: TableDataSource<T>;
  declare rowKey: string | ((row: T, index: number) => Key);
  declare rowHeight: number | 'auto';
  declare overscan: number;
  declare selection: Selection;
  declare selectedKeys: Key[];
  declare sort: SortModel[];
  declare filters: FilterModel;
  declare groupBy: string[];
  declare expandedKeys: Key[];
  declare density: Density;
  declare stickyHeader: boolean;
  declare loading: boolean;
  declare emptyLabel: string;
  declare editable: boolean;
  declare resizable: boolean;
  declare reorderable: boolean;
  declare virtualizeColumns: boolean | 'auto';
  declare responsive: Responsive;
  declare cardsBreakpoint: number;
  declare renderDetail?: (row: T) => TemplateResult | string;
  declare ariaLabel: string | null;
  /** @internal */
  declare _version: number;
  /** @internal */
  declare _width: number;
  /** @internal */
  declare _colWindow: string;

  // View.
  #refs: ArrayLike<number> = [];
  #groups: GroupInfo[] = [];
  #rowCount = 0;
  #viewDirty = true;
  #cache?: BlockCache<T>;
  #selected = new Set<Key>();
  #allMatching = false;
  #excluded = new Set<Key>();
  #expandedGroups = new Set<string>();
  #detailOpen = new Set<Key>();
  #anchorRow = -1;
  // Columns.
  #eff: EffColumn[] = [];
  #order: string[] = [];
  #widthOverride = new Map<string, number>();
  #pinOverride = new Map<string, 'start' | 'end' | undefined>();
  #hiddenOverride = new Map<string, boolean>();
  #declared: ColumnDef<T>[] = [];
  #totalWidth = 0;
  #lefts: number[] = [];
  // Focus / editing.
  #active: CellPos = { row: -1, col: 0 };
  #range: { r1: number; c1: number; r2: number; c2: number } | null = null;
  #editing: {
    row: number;
    col: number;
    error?: string;
    busy?: boolean;
  } | null = null;
  #focusAfterRender = false;
  #announce = '';
  #resize?: {
    id: string;
    startX: number;
    startWidth: number;
    pointerId: number;
  };
  #resizing: string | null = null;
  #dragCol?: { id: string; startX: number; started: boolean };
  #unobserve?: () => void;
  #hRaf = 0;
  #lastRange = '';
  #typeaheadTimer?: ReturnType<typeof setTimeout>;

  #virtualizer = new VirtualizerController(this, {
    count: 0,
    getScrollElement: () => this.#scrollerEl,
    dynamic: true,
  });

  get #scrollerEl(): HTMLElement | null {
    return this.shadowRoot?.querySelector('.scroller') ?? null;
  }

  constructor() {
    super();
    this.columns = [];
    this.data = [];
    this.rowKey = 'id';
    this.rowHeight = 'auto';
    this.overscan = 6;
    this.selection = 'none';
    this.selectedKeys = [];
    this.sort = [];
    this.filters = {};
    this.groupBy = [];
    this.expandedKeys = [];
    this.density = 'comfortable';
    this.stickyHeader = true;
    this.loading = false;
    this.emptyLabel = 'No rows';
    this.editable = false;
    this.resizable = true;
    this.reorderable = true;
    this.virtualizeColumns = 'auto';
    this.responsive = 'priority';
    this.cardsBreakpoint = CARDS_BREAKPOINT;
    this.ariaLabel = null;
    this._version = 0;
    this._width = 0;
    this._colWindow = '0:0';
  }

  // --- Lifecycle -------------------------------------------------------------------------------

  override connectedCallback(): void {
    super.connectedCallback();
    // Declarative columns can arrive before or after first render.
    this.#readDeclared();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#unobserve?.();
    this.#unobserve = undefined;
    this.#cache?.clear();
    cancelAnimationFrame(this.#hRaf);
    clearTimeout(this.#typeaheadTimer);
    this.#endResize();
  }

  protected override firstUpdated(): void {
    const scroller = this.#scrollerEl;
    if (!scroller) return;
    this.#unobserve = observeResize(scroller, () => {
      cancelAnimationFrame(this.#hRaf);
      this.#hRaf = requestAnimationFrame(() => {
        this._width = scroller.clientWidth;
        this.#updateColumnWindow();
      });
    });
    scroller.addEventListener('scroll', this.#handleScroll, { passive: true });
    this._width = scroller.clientWidth;
  }

  #handleScroll = (): void => {
    if (this.#hRaf) return;
    this.#hRaf = requestAnimationFrame(() => {
      this.#hRaf = 0;
      this.#updateColumnWindow();
    });
  };

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('selectedKeys'))
      this.#selected = new Set(this.selectedKeys);
    if (changed.has('expandedKeys')) {
      this.#expandedGroups = new Set(this.expandedKeys.map(String));
      this.#viewDirty = true;
    }
    if (
      changed.has('data') ||
      changed.has('columns') ||
      changed.has('sort') ||
      changed.has('filters') ||
      changed.has('groupBy') ||
      changed.has('dataSource') ||
      changed.has('rowKey')
    ) {
      this.#viewDirty = true;
      if (
        changed.has('dataSource') ||
        changed.has('sort') ||
        changed.has('filters') ||
        changed.has('groupBy')
      )
        this.#resetServer();
    }
    this.#layoutColumns();
    if (this.#viewDirty) this.#computeView();
    if (this.responsive === 'cards')
      this.toggleAttribute(
        'data-cards',
        this._width > 0 && this._width < this.cardsBreakpoint,
      );
    else this.removeAttribute('data-cards');

    const fixed = this.rowHeight === 'auto' ? undefined : this.rowHeight;
    const dynamic =
      fixed === undefined ||
      !!this.renderDetail ||
      this.hasAttribute('data-cards');
    this.#virtualizer.setOptions({
      count: this.#rowCount,
      getScrollElement: this.#getScroller,
      dynamic,
      itemSize: dynamic ? undefined : fixed,
      overscan: this.overscan,
      getItemKey: this.#getKey,
      pinnedIndexes:
        this.#active.row >= 0 && this.#active.row < this.#rowCount
          ? [this.#active.row]
          : [],
    });
  }

  #getScroller = (): Element | null => this.#scrollerEl;

  protected override updated(changed: PropertyValues<this>): void {
    if (
      this.#virtualizer &&
      (this.rowHeight === 'auto' ||
        this.renderDetail ||
        this.hasAttribute('data-cards'))
    )
      for (const el of this.shadowRoot!.querySelectorAll('.row[data-row]'))
        this.#virtualizer.measureElement(el);

    this.#ensureServerBlocks();
    this.#emitRange();
    if (this.#focusAfterRender) {
      this.#focusAfterRender = false;
      this.#focusActive();
    }
  }

  #getKey = (index: number): Key => {
    const ref = this.#refAt(index);
    if (ref === undefined) return `s${index}`;
    if (ref < 0) return `g:${this.#groups[-ref - 1]!.key}`;
    const row = this.#rowAt(index);
    return row === undefined ? `s${index}` : this.#keyOf(row, ref);
  };

  // --- Columns ---------------------------------------------------------------------------------

  #readDeclared(): void {
    const kids = Array.from(this.children).filter(
      (c) => c.localName === 'bx-column',
    );
    this.#declared = kids.map((el) => {
      const num = (n: string) =>
        el.hasAttribute(n) ? Number(el.getAttribute(n)) : undefined;
      return {
        id: el.getAttribute('id') ?? undefined,
        field: el.getAttribute('field') ?? undefined,
        header:
          el.getAttribute('header') ?? el.textContent?.trim() ?? undefined,
        width: num('width'),
        minWidth: num('min-width'),
        flex: num('flex'),
        priority: num('priority'),
        pinned:
          (el.getAttribute('pinned') as 'start' | 'end' | null) ?? undefined,
        sortable: el.hasAttribute('sortable'),
        hidden: el.hasAttribute('hidden'),
        align:
          (el.getAttribute('align') as 'start' | 'center' | 'end' | null) ??
          undefined,
      } as ColumnDef<T>;
    });
    this.#viewDirty = true;
    this.requestUpdate();
  }

  #handleSlotChange = (): void => this.#readDeclared();

  get #definitions(): ColumnDef<T>[] {
    return this.columns.length > 0 ? this.columns : this.#declared;
  }

  #layoutColumns(): void {
    const defs = this.#definitions;
    const ids = defs.map((c) => columnId(c));
    // Keep a user-chosen order for columns that still exist, appending new ones.
    const order = [
      ...this.#order.filter((id) => ids.includes(id)),
      ...ids.filter((id) => !this.#order.includes(id)),
    ];
    this.#order = order;
    const byId = new Map(defs.map((c) => [columnId(c), c]));

    let list: EffColumn[] = [];
    if (this.selection === 'multiple')
      list.push({
        def: { id: SELECT_ID, header: '', width: SELECT_WIDTH } as ColumnDef,
        id: SELECT_ID,
        width: SELECT_WIDTH,
        left: 0,
        pinned: 'start',
        internal: true,
      });
    if (this.renderDetail)
      list.push({
        def: { id: DETAIL_ID, header: '', width: SELECT_WIDTH } as ColumnDef,
        id: DETAIL_ID,
        width: SELECT_WIDTH,
        left: 0,
        pinned: 'start',
        internal: true,
      });
    for (const id of order) {
      const def = byId.get(id)!;
      const hidden = this.#hiddenOverride.get(id) ?? def.hidden;
      if (hidden) continue;
      const pinned = this.#pinOverride.has(id)
        ? this.#pinOverride.get(id)
        : def.pinned;
      list.push({
        def,
        id,
        width: this.#widthOverride.get(id) ?? def.width ?? DEFAULT_WIDTH,
        left: 0,
        pinned,
      });
    }

    // Responsive priority: drop the least important columns until the rest fit.
    const width = this._width;
    if (
      this.responsive === 'priority' &&
      width > 0 &&
      !this.hasAttribute('data-cards')
    ) {
      // Flex columns can shrink to their minimum; fixed-width ones cannot.
      const needed = (cols: EffColumn[]) =>
        cols.reduce(
          (n, c) =>
            n + (c.def.flex ? (c.def.minWidth ?? DEFAULT_MIN) : c.width),
          0,
        );
      const droppable = list
        .filter(
          (c) =>
            !c.internal && c.def.priority !== undefined && c.def.priority > 0,
        )
        .sort((a, b) => b.def.priority! - a.def.priority!);
      for (const candidate of droppable) {
        if (needed(list) <= width) break;
        list = list.filter((c) => c !== candidate);
      }
    }

    // Pinned-start first, pinned-end last, preserving relative order.
    list = [
      ...list.filter((c) => c.pinned === 'start'),
      ...list.filter((c) => !c.pinned),
      ...list.filter((c) => c.pinned === 'end'),
    ];

    // Flex: distribute leftover width.
    const fixed = list.reduce(
      (n, c) =>
        n +
        (c.def.flex && !this.#widthOverride.has(c.id)
          ? Math.max(c.def.minWidth ?? DEFAULT_MIN, 0)
          : c.width),
      0,
    );
    const flexTotal = list.reduce(
      (n, c) =>
        n + (c.def.flex && !this.#widthOverride.has(c.id) ? c.def.flex : 0),
      0,
    );
    const leftover = Math.max(0, width - fixed);
    for (const c of list) {
      if (c.def.flex && !this.#widthOverride.has(c.id))
        c.width = Math.max(
          c.def.minWidth ?? DEFAULT_MIN,
          (c.def.minWidth ?? DEFAULT_MIN) + (leftover * c.def.flex) / flexTotal,
        );
      c.width = Math.max(c.def.minWidth ?? DEFAULT_MIN, c.width);
    }
    let x = 0;
    const lefts: number[] = [];
    for (const c of list) {
      c.left = x;
      lefts.push(x);
      x += c.width;
    }
    this.#eff = list;
    this.#lefts = lefts;
    this.#totalWidth = x;
    this.style.setProperty('--_total', `${x}px`);
    this.style.setProperty(
      '--_tracks',
      list.map((c) => `${c.width}px`).join(' '),
    );
  }

  #columnWindow(): { from: number; to: number } {
    const n = this.#eff.length;
    const virtualize =
      this.virtualizeColumns === true ||
      (this.virtualizeColumns === 'auto' && n > 50);
    if (!virtualize) return { from: 0, to: n };
    const scroller = this.#scrollerEl;
    const left = Math.abs(scroller?.scrollLeft ?? 0);
    const right = left + (scroller?.clientWidth ?? 1200);
    let from = 0;
    while (from < n - 1 && this.#lefts[from]! + this.#eff[from]!.width < left)
      from++;
    let to = from;
    while (to < n && this.#lefts[to]! < right) to++;
    return {
      from: Math.max(0, from - COLUMN_OVERSCAN),
      to: Math.min(n, to + COLUMN_OVERSCAN),
    };
  }

  #updateColumnWindow(): void {
    const w = this.#columnWindow();
    const sig = `${w.from}:${w.to}`;
    if (sig !== this._colWindow) this._colWindow = sig;
  }

  // --- View ------------------------------------------------------------------------------------

  #keyOf(row: T, index: number): Key {
    const k = this.rowKey;
    if (typeof k === 'function') return k(row, index);
    const v = (row as Record<string, unknown> | null)?.[k] as Key | undefined;
    return v ?? index;
  }

  get #serverMode(): boolean {
    return !!this.dataSource;
  }

  /** Data index of a view row (>= 0), a group (< 0), or undefined past the end. */
  #refAt(viewIndex: number): number | undefined {
    if (this.#serverMode)
      return viewIndex < this.#rowCount ? viewIndex : undefined;
    return this.#refs[viewIndex];
  }

  #rowAt(viewIndex: number): T | undefined {
    if (this.#serverMode) return this.#cache?.get(viewIndex);
    const ref = this.#refAt(viewIndex);
    return ref === undefined || ref < 0 ? undefined : this.data[ref];
  }

  #computeView(): void {
    this.#viewDirty = false;
    if (this.#serverMode) {
      const total = this.#cache?.total ?? -1;
      this.#rowCount = total < 0 ? 0 : total;
      this.#groups = [];
      this.#refs = [];
      this.#virtualizer.invalidate();
      return;
    }
    const cols = this.#definitions;
    let order = filterRows(this.data, cols, this.filters);
    const sortModel: SortModel[] = [
      ...this.groupBy.map((field) => ({ field, direction: 'asc' as const })),
      ...this.sort.filter((s) => !this.groupBy.includes(s.field)),
    ];
    order = sortRows(order, this.data, cols, sortModel);
    if (this.groupBy.length > 0) {
      const grouped = groupRows(
        order,
        this.data,
        cols,
        this.groupBy,
        this.#expandedGroups,
      );
      this.#refs = grouped.refs;
      this.#groups = grouped.groups;
    } else {
      this.#refs = order;
      this.#groups = [];
    }
    this.#rowCount = this.#refs.length;
    this.#virtualizer.invalidate();
    if (this.#active.row >= this.#rowCount)
      this.#active = { row: this.#rowCount - 1, col: this.#active.col };
  }

  /** Data row indexes in the current filter/sort order (client mode), ignoring grouping. */
  #exportOrder(): Uint32Array {
    const cols = this.#definitions;
    const order = filterRows(this.data, cols, this.filters);
    return sortRows(order, this.data, cols, [
      ...this.groupBy.map((field) => ({ field, direction: 'asc' as const })),
      ...this.sort.filter((s) => !this.groupBy.includes(s.field)),
    ]);
  }

  // --- Server-side rows ------------------------------------------------------------------------

  #resetServer(): void {
    this.#cache?.clear();
    this.#cache = undefined;
    const source = this.dataSource;
    if (!source) return;
    this.#cache = new BlockCache<T>(
      BLOCK_SIZE,
      (start, end, signal) =>
        source.getRows({
          start,
          end,
          sort: this.sort,
          filter: this.filters,
          group: this.groupBy,
          signal,
        }),
      () => {
        this.#viewDirty = true;
        this.requestUpdate();
      },
      (error, block) =>
        this.dispatchEvent(
          new CustomEvent('bx-data-error', {
            bubbles: true,
            composed: true,
            detail: { error, block },
          }),
        ),
      (start, end) =>
        this.dispatchEvent(
          new CustomEvent('bx-data-request', {
            bubbles: true,
            composed: true,
            detail: { start, end },
          }),
        ),
    );
  }

  #ensureServerBlocks(): void {
    if (!this.#cache) return;
    const { start, end } = this.#virtualizer.visibleRange;
    this.#cache.ensure(
      Math.max(0, start),
      Math.max(end, Math.min(BLOCK_SIZE - 1, 20)),
    );
  }

  /** Retries blocks that failed to load. */
  retry(): void {
    this.#cache?.retry();
    this.requestUpdate();
  }

  // --- Public API ------------------------------------------------------------------------------

  /** Reloads server data or recomputes the client view. */
  refresh(): void {
    if (this.#serverMode) this.#resetServer();
    this.#viewDirty = true;
    this.#virtualizer.invalidate(true);
    this.requestUpdate();
  }

  /** The data changed in place for this row: recompute its view and size. */
  invalidateRow(key: Key): void {
    if (this.#serverMode) {
      this.refresh();
      return;
    }
    this.#viewDirty = true;
    this.#virtualizer.forget(key);
    this.requestUpdate();
  }

  scrollToIndex(
    index: number,
    align: 'start' | 'center' | 'end' | 'auto' = 'auto',
  ): void {
    this.#virtualizer.scrollToIndex(index, { align });
  }

  scrollToKey(
    key: Key,
    align: 'start' | 'center' | 'end' | 'auto' = 'auto',
  ): void {
    for (let i = 0; i < this.#rowCount; i++) {
      const ref = this.#refAt(i)!;
      if (ref >= 0 && this.#keyOf(this.data[ref]!, ref) === key) {
        this.scrollToIndex(i, align);
        return;
      }
    }
  }

  getVisibleRange(): { start: number; end: number } {
    return this.#virtualizer.visibleRange;
  }

  setSort(sort: SortModel[]): void {
    this.sort = sort;
    this.#fireSort();
  }

  setFilter(id: string, value: FilterValue | undefined): void {
    const next = { ...this.filters };
    if (value === undefined || value === '') delete next[id];
    else next[id] = value;
    this.filters = next;
    this.dispatchEvent(
      new CustomEvent('bx-filter-change', {
        bubbles: true,
        composed: true,
        detail: { filters: next },
      }),
    );
  }

  clearFilters(): void {
    this.filters = {};
    this.dispatchEvent(
      new CustomEvent('bx-filter-change', {
        bubbles: true,
        composed: true,
        detail: { filters: {} },
      }),
    );
  }

  /** Selects every row matching the current filter (server mode: "select all matching"). */
  selectAll(): void {
    if (this.selection !== 'multiple') return;
    if (this.#serverMode) {
      this.#allMatching = true;
      this.#excluded.clear();
      this.#selected.clear();
    } else {
      const next = new Set<Key>();
      const order = this.#exportOrder();
      for (let i = 0; i < order.length; i++)
        next.add(this.#keyOf(this.data[order[i]!]!, order[i]!));
      this.#selected = next;
    }
    this.#fireSelection();
  }

  clearSelection(): void {
    this.#selected.clear();
    this.#allMatching = false;
    this.#excluded.clear();
    this.#fireSelection();
  }

  /** CSV of the rows in the current sort/filter. Resolves to a Blob; pass a name to download it. */
  async exportCsv(filename?: string): Promise<Blob> {
    const blob = new Blob(
      toCsvChunks(this.#exportOrder(), this.data, this.#visibleDefs()),
      {
        type: 'text/csv;charset=utf-8',
      },
    );
    if (filename) this.#download(blob, filename);
    return blob;
  }

  /** Single-sheet `.xlsx` of the rows in the current sort/filter. */
  async exportXlsx(filename?: string): Promise<Blob> {
    const bytes = toXlsx(this.#exportOrder(), this.data, this.#visibleDefs());
    const blob = new Blob([bytes as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    if (filename) this.#download(blob, filename);
    return blob;
  }

  #visibleDefs(): ColumnDef<T>[] {
    return this.#eff
      .filter((c) => !c.internal)
      .map((c) => c.def as ColumnDef<T>);
  }

  #download(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /** Widths each column to its widest rendered text among the rows near the viewport. */
  autosizeColumns(): void {
    const canvas = document.createElement('canvas').getContext('2d');
    if (!canvas) return;
    const scroller = this.#scrollerEl;
    const font = scroller ? getComputedStyle(scroller).font : '14px sans-serif';
    canvas.font = font;
    const { start, end } = this.#virtualizer.visibleRange;
    for (const c of this.#eff) {
      if (c.internal) continue;
      let max = canvas.measureText(String(c.def.header ?? c.id)).width + 36;
      for (
        let i = Math.max(0, start - 20);
        i <= Math.min(this.#rowCount - 1, end + 20);
        i++
      ) {
        const row = this.#rowAt(i);
        if (row === undefined) continue;
        max = Math.max(
          max,
          canvas.measureText(String(valueOf(c.def, row) ?? '')).width + 24,
        );
      }
      this.#widthOverride.set(
        c.id,
        Math.ceil(Math.max(max, c.def.minWidth ?? DEFAULT_MIN)),
      );
    }
    this.requestUpdate();
  }

  setColumnVisible(id: string, visible: boolean): void {
    this.#hiddenOverride.set(id, !visible);
    this.requestUpdate();
  }

  setColumnPinned(id: string, pinned: 'start' | 'end' | undefined): void {
    this.#pinOverride.set(id, pinned);
    this.dispatchEvent(
      new CustomEvent('bx-column-pin', {
        bubbles: true,
        composed: true,
        detail: { columnId: id, pinned },
      }),
    );
    this.requestUpdate();
  }

  /** Serializable layout/sort/filter state for saved views (renderers are not included). */
  getState(): TableState {
    return {
      order: [...this.#order],
      widths: Object.fromEntries(this.#widthOverride),
      pinned: Object.fromEntries(
        [...this.#pinOverride].filter(([, v]) => v) as [
          string,
          'start' | 'end',
        ][],
      ),
      hidden: Object.fromEntries(
        [...this.#hiddenOverride].filter(([, v]) => v).map(([k]) => [k, true]),
      ),
      sort: this.sort,
      filters: Object.fromEntries(
        Object.entries(this.filters).filter(([, v]) => typeof v !== 'function'),
      ) as FilterModel,
      groupBy: this.groupBy,
    };
  }

  setState(state: Partial<TableState>): void {
    if (state.order) this.#order = [...state.order];
    if (state.widths)
      this.#widthOverride = new Map(Object.entries(state.widths));
    if (state.pinned) this.#pinOverride = new Map(Object.entries(state.pinned));
    if (state.hidden)
      this.#hiddenOverride = new Map(
        Object.entries(state.hidden).map(([k, v]) => [k, !!v]),
      );
    if (state.sort) this.sort = state.sort;
    if (state.filters) this.filters = state.filters;
    if (state.groupBy) this.groupBy = state.groupBy;
    this.requestUpdate();
  }

  // --- Events ----------------------------------------------------------------------------------

  #fireSort(): void {
    this.dispatchEvent(
      new CustomEvent('bx-sort-change', {
        bubbles: true,
        composed: true,
        detail: { sort: this.sort },
      }),
    );
    const first = this.sort[0];
    this.#announce = first
      ? `Sorted by ${first.field}, ${first.direction === 'asc' ? 'ascending' : 'descending'}`
      : 'Sorting cleared';
  }

  #fireSelection(): void {
    this.selectedKeys = [...this.#selected];
    const count = this.#allMatching
      ? 'all matching'
      : String(this.#selected.size);
    this.#announce = `${count} rows selected`;
    this.dispatchEvent(
      new CustomEvent('bx-selection-change', {
        bubbles: true,
        composed: true,
        detail: {
          selectedKeys: this.selectedKeys,
          allMatching: this.#allMatching,
        },
      }),
    );
  }

  #emitRange(): void {
    if (this.#rowCount === 0) return;
    const { start, end } = this.#virtualizer.visibleRange;
    const sig = `${start}:${end}`;
    if (sig === this.#lastRange) return;
    this.#lastRange = sig;
    this.dispatchEvent(
      new CustomEvent('bx-range-change', {
        bubbles: true,
        composed: true,
        detail: { start, end },
      }),
    );
  }

  // --- Selection -------------------------------------------------------------------------------

  #isSelected(key: Key): boolean {
    return this.#allMatching
      ? !this.#excluded.has(key)
      : this.#selected.has(key);
  }

  #toggleRow(viewIndex: number, mode: 'replace' | 'toggle' | 'range'): void {
    if (this.selection === 'none') return;
    const row = this.#rowAt(viewIndex);
    const ref = this.#refAt(viewIndex)!;
    if (row === undefined || ref < 0) return;
    const key = this.#keyOf(row, this.#serverMode ? viewIndex : ref);
    if (this.selection === 'single') {
      this.#selected = this.#selected.has(key) ? new Set() : new Set([key]);
    } else if (mode === 'range' && this.#anchorRow >= 0) {
      const [lo, hi] = [
        Math.min(this.#anchorRow, viewIndex),
        Math.max(this.#anchorRow, viewIndex),
      ];
      const next = new Set(mode === 'range' ? this.#selected : []);
      for (let i = lo; i <= hi; i++) {
        const r = this.#rowAt(i);
        const f = this.#refAt(i)!;
        if (r !== undefined && f >= 0)
          next.add(this.#keyOf(r, this.#serverMode ? i : f));
      }
      this.#selected = next;
    } else if (mode === 'toggle') {
      if (this.#allMatching) {
        if (this.#excluded.has(key)) this.#excluded.delete(key);
        else this.#excluded.add(key);
      } else {
        const next = new Set(this.#selected);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        this.#selected = next;
      }
      this.#anchorRow = viewIndex;
    } else {
      this.#allMatching = false;
      this.#selected =
        this.#selected.size === 1 && this.#selected.has(key)
          ? new Set()
          : new Set([key]);
      this.#anchorRow = viewIndex;
    }
    this.#fireSelection();
  }

  #selectionState(): boolean | 'mixed' {
    if (this.#allMatching) return this.#excluded.size === 0 ? true : 'mixed';
    const n = this.#selected.size;
    if (n === 0) return false;
    const total = this.#serverMode ? this.#rowCount : this.#exportCount();
    return n >= total ? true : 'mixed';
  }

  #exportCount(): number {
    return filterRows(this.data, this.#definitions, this.filters).length;
  }

  // --- Interaction: pointer --------------------------------------------------------------------

  #cellFromEvent(event: Event): CellPos | null {
    for (const node of event.composedPath()) {
      if (
        node instanceof HTMLElement &&
        node.dataset['col'] !== undefined &&
        node.dataset['row'] !== undefined
      )
        return {
          row: Number(node.dataset['row']),
          col: Number(node.dataset['col']),
        };
      if (node instanceof HTMLElement && node.dataset['hcol'] !== undefined)
        return { row: -1, col: Number(node.dataset['hcol']) };
    }
    return null;
  }

  #handleClick = (event: MouseEvent): void => {
    const path = event.composedPath();
    if (
      path.some(
        (n) =>
          n instanceof HTMLElement &&
          (n.classList.contains('resize-handle') ||
            n.classList.contains('editor')),
      )
    )
      return;
    const pos = this.#cellFromEvent(event);
    if (!pos) return;
    this.#setActive(pos, false);
    const col = this.#eff[pos.col];
    if (pos.row === -1) {
      if (col?.id === SELECT_ID) {
        this.#headerSelect();
      } else if (col && col.def.sortable) {
        this.#toggleSort(col.id, event.shiftKey);
      }
      return;
    }
    const ref = this.#refAt(pos.row)!;
    if (ref < 0) {
      this.#toggleGroup(this.#groups[-ref - 1]!);
      return;
    }
    if (col?.id === DETAIL_ID) {
      this.#toggleDetail(pos.row);
      return;
    }
    const row = this.#rowAt(pos.row);
    if (row === undefined) return;
    if (col?.id === SELECT_ID) {
      this.#toggleRow(pos.row, 'toggle');
      return;
    }
    this.dispatchEvent(
      new CustomEvent('bx-row-click', {
        bubbles: true,
        composed: true,
        detail: {
          row,
          key: this.#keyOf(row, this.#serverMode ? pos.row : ref),
          index: pos.row,
        },
      }),
    );
    if (this.selection !== 'none')
      this.#toggleRow(
        pos.row,
        event.shiftKey
          ? 'range'
          : event.ctrlKey || event.metaKey
            ? 'toggle'
            : 'replace',
      );
  };

  #handleDblClick = (event: MouseEvent): void => {
    const pos = this.#cellFromEvent(event);
    if (!pos || pos.row < 0) return;
    const row = this.#rowAt(pos.row);
    const ref = this.#refAt(pos.row)!;
    if (row === undefined || ref < 0) return;
    this.dispatchEvent(
      new CustomEvent('bx-row-dblclick', {
        bubbles: true,
        composed: true,
        detail: {
          row,
          key: this.#keyOf(row, this.#serverMode ? pos.row : ref),
          index: pos.row,
        },
      }),
    );
    this.#startEdit(pos);
  };

  #headerSelect(): void {
    if (this.#selectionState() === true) this.clearSelection();
    else this.selectAll();
  }

  #toggleSort(id: string, additive: boolean): void {
    const current = this.sort.find((s) => s.field === id);
    const next: SortModel | undefined = !current
      ? { field: id, direction: 'asc' }
      : current.direction === 'asc'
        ? { field: id, direction: 'desc' }
        : undefined;
    const others = additive ? this.sort.filter((s) => s.field !== id) : [];
    this.sort = next ? [...others, next] : others;
    this.#fireSort();
  }

  #toggleGroup(group: GroupInfo): void {
    const open = !this.#expandedGroups.has(group.key);
    if (open) this.#expandedGroups.add(group.key);
    else this.#expandedGroups.delete(group.key);
    this.expandedKeys = [...this.#expandedGroups];
    this.#viewDirty = true;
    this.dispatchEvent(
      new CustomEvent('bx-row-expand', {
        bubbles: true,
        composed: true,
        detail: { key: group.key, expanded: open },
      }),
    );
    this.requestUpdate();
  }

  #toggleDetail(viewIndex: number): void {
    const row = this.#rowAt(viewIndex);
    const ref = this.#refAt(viewIndex)!;
    if (row === undefined) return;
    const key = this.#keyOf(row, this.#serverMode ? viewIndex : ref);
    const open = !this.#detailOpen.has(key);
    if (open) this.#detailOpen.add(key);
    else this.#detailOpen.delete(key);
    this.#virtualizer.forget(key);
    this.dispatchEvent(
      new CustomEvent('bx-row-expand', {
        bubbles: true,
        composed: true,
        detail: { key, expanded: open },
      }),
    );
    this.requestUpdate();
  }

  // --- Interaction: resize / reorder -----------------------------------------------------------

  #handleResizeStart = (event: PointerEvent, col: EffColumn): void => {
    if (!this.resizable || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    this.#resize = {
      id: col.id,
      startX: event.clientX,
      startWidth: col.width,
      pointerId: event.pointerId,
    };
    this.#resizing = col.id;
    document.addEventListener('pointermove', this.#handleResizeMove);
    document.addEventListener('pointerup', this.#handleResizeEnd);
    document.addEventListener('pointercancel', this.#handleResizeEnd);
    this.requestUpdate();
  };

  #handleResizeMove = (event: PointerEvent): void => {
    const r = this.#resize;
    if (!r) return;
    const rtl = getComputedStyle(this).direction === 'rtl';
    const delta = (event.clientX - r.startX) * (rtl ? -1 : 1);
    this.#setWidth(r.id, r.startWidth + delta, false);
  };

  #handleResizeEnd = (): void => {
    const r = this.#resize;
    if (r) this.#fireResize(r.id);
    this.#endResize();
  };

  #endResize(): void {
    this.#resize = undefined;
    this.#resizing = null;
    document.removeEventListener('pointermove', this.#handleResizeMove);
    document.removeEventListener('pointerup', this.#handleResizeEnd);
    document.removeEventListener('pointercancel', this.#handleResizeEnd);
  }

  #setWidth(id: string, width: number, fire: boolean): void {
    const col = this.#eff.find((c) => c.id === id);
    const min = col?.def.minWidth ?? DEFAULT_MIN;
    this.#widthOverride.set(id, Math.max(min, Math.round(width)));
    if (fire) this.#fireResize(id);
    this.requestUpdate();
  }

  #fireResize(id: string): void {
    this.dispatchEvent(
      new CustomEvent('bx-column-resize', {
        bubbles: true,
        composed: true,
        detail: { columnId: id, width: this.#widthOverride.get(id) },
      }),
    );
  }

  #moveColumn(id: string, delta: number): void {
    const visible = this.#order.filter((o) =>
      this.#eff.some((c) => c.id === o),
    );
    const at = visible.indexOf(id);
    const to = at + delta;
    if (at < 0 || to < 0 || to >= visible.length) return;
    const target = visible[to]!;
    const order = [...this.#order];
    order.splice(order.indexOf(id), 1);
    order.splice(order.indexOf(target) + (delta > 0 ? 1 : 0), 0, id);
    this.#order = order;
    this.dispatchEvent(
      new CustomEvent('bx-column-reorder', {
        bubbles: true,
        composed: true,
        detail: { order },
      }),
    );
    this.#active = { row: -1, col: this.#active.col + delta };
    this.#focusAfterRender = true;
    this.requestUpdate();
  }

  #handleHeaderPointerDown = (event: PointerEvent, col: EffColumn): void => {
    if (!this.reorderable || col.internal || event.button !== 0) return;
    if ((event.target as HTMLElement).classList.contains('resize-handle'))
      return;
    this.#dragCol = { id: col.id, startX: event.clientX, started: false };
    document.addEventListener('pointermove', this.#handleDragMove);
    document.addEventListener('pointerup', this.#handleDragEnd);
  };

  #handleDragMove = (event: PointerEvent): void => {
    const d = this.#dragCol;
    if (!d) return;
    if (!d.started && Math.abs(event.clientX - d.startX) > 8) d.started = true;
  };

  #handleDragEnd = (event: PointerEvent): void => {
    const d = this.#dragCol;
    document.removeEventListener('pointermove', this.#handleDragMove);
    document.removeEventListener('pointerup', this.#handleDragEnd);
    this.#dragCol = undefined;
    if (!d?.started) return;
    const scroller = this.#scrollerEl;
    if (!scroller) return;
    const x =
      event.clientX -
      scroller.getBoundingClientRect().left +
      scroller.scrollLeft;
    const target = this.#eff.findIndex(
      (c) => !c.internal && x >= c.left && x < c.left + c.width,
    );
    const from = this.#eff.findIndex((c) => c.id === d.id);
    if (target < 0 || target === from) return;
    this.#moveColumn(d.id, target - from);
    this.#suppressClick = true;
    setTimeout(() => (this.#suppressClick = false), 0);
  };

  #suppressClick = false;

  // --- Interaction: keyboard / focus -----------------------------------------------------------

  #setActive(pos: CellPos, focus = true): void {
    const col = Math.max(0, Math.min(this.#eff.length - 1, pos.col));
    const row = Math.max(-1, Math.min(this.#rowCount - 1, pos.row));
    this.#active = { row, col };
    if (focus) {
      this.#focusAfterRender = true;
      if (row >= 0) this.#virtualizer.scrollToIndex(row, { align: 'auto' });
      this.#revealColumn(col);
    }
    this.requestUpdate();
  }

  #revealColumn(col: number): void {
    const scroller = this.#scrollerEl;
    const c = this.#eff[col];
    if (!scroller || !c || c.pinned) return;
    const left = Math.abs(scroller.scrollLeft);
    const pinnedStart = this.#eff
      .filter((x) => x.pinned === 'start')
      .reduce((n, x) => n + x.width, 0);
    const pinnedEnd = this.#eff
      .filter((x) => x.pinned === 'end')
      .reduce((n, x) => n + x.width, 0);
    if (c.left < left + pinnedStart) scroller.scrollLeft = c.left - pinnedStart;
    else if (c.left + c.width > left + scroller.clientWidth - pinnedEnd)
      scroller.scrollLeft = c.left + c.width - scroller.clientWidth + pinnedEnd;
    this.#updateColumnWindow();
  }

  #focusActive(attempt = 0): void {
    const { row, col } = this.#active;
    const sel =
      row === -1
        ? `[data-hcol="${col}"]`
        : `[data-row="${row}"][data-col="${col}"]`;
    const el = this.shadowRoot?.querySelector<HTMLElement>(sel);
    if (el) {
      el.focus({ preventScroll: true });
      return;
    }
    if (attempt < 4)
      requestAnimationFrame(() => this.#focusActive(attempt + 1));
  }

  #pageSize(): number {
    const h = this.#scrollerEl?.clientHeight ?? 400;
    return Math.max(1, Math.floor(h / 40));
  }

  /** DOM focus is the source of truth for the active cell (clicks, Tab, programmatic focus). */
  #handleFocusIn = (event: FocusEvent): void => {
    if (this.#editing) return;
    const pos = this.#cellFromEvent(event);
    if (pos && (pos.row !== this.#active.row || pos.col !== this.#active.col))
      this.#setActive(pos, false);
  };

  #handleKeydown = (event: KeyboardEvent): void => {
    if (this.#editing) return;
    if ((event.target as HTMLElement).closest?.('.editor')) return;
    const { key } = event;
    const { row, col } = this.#active;
    const lastRow = this.#rowCount - 1;
    const lastCol = this.#eff.length - 1;
    const colDef = this.#eff[col];
    const extend = event.shiftKey && !event.altKey;

    // Header-only keys.
    if (row === -1 && colDef) {
      if (event.altKey && (key === 'ArrowLeft' || key === 'ArrowRight')) {
        event.preventDefault();
        const rtl = getComputedStyle(this).direction === 'rtl';
        const dir = (key === 'ArrowRight') !== rtl ? 1 : -1;
        if (event.shiftKey) this.#moveColumn(colDef.id, dir);
        else if (this.resizable && !colDef.internal)
          this.#setWidth(colDef.id, colDef.width + dir * RESIZE_STEP, true);
        return;
      }
      if (key === 'Enter' || key === ' ') {
        event.preventDefault();
        if (colDef.id === SELECT_ID) this.#headerSelect();
        else if (colDef.def.sortable)
          this.#toggleSort(colDef.id, event.shiftKey);
        return;
      }
    }

    let next: CellPos | null = null;
    switch (key) {
      case 'ArrowDown':
        next = { row: Math.min(lastRow, row + 1), col };
        break;
      case 'ArrowUp':
        next = { row: Math.max(-1, row - 1), col };
        break;
      case 'ArrowRight':
        next = { row, col: Math.min(lastCol, col + 1) };
        break;
      case 'ArrowLeft':
        next = { row, col: Math.max(0, col - 1) };
        break;
      case 'Home':
        next = event.ctrlKey ? { row: 0, col: 0 } : { row, col: 0 };
        break;
      case 'End':
        next = event.ctrlKey
          ? { row: lastRow, col: lastCol }
          : { row, col: lastCol };
        break;
      case 'PageDown':
        next = {
          row: Math.min(lastRow, Math.max(0, row) + this.#pageSize()),
          col,
        };
        break;
      case 'PageUp':
        next = { row: Math.max(0, Math.max(0, row) - this.#pageSize()), col };
        break;
      case ' ':
        if (row >= 0 && this.selection !== 'none') {
          event.preventDefault();
          this.#toggleRow(row, event.shiftKey ? 'range' : 'toggle');
        }
        return;
      case 'Enter':
      case 'F2':
        if (row >= 0) {
          event.preventDefault();
          const ref = this.#refAt(row)!;
          if (ref < 0) this.#toggleGroup(this.#groups[-ref - 1]!);
          else if (colDef?.id === DETAIL_ID) this.#toggleDetail(row);
          else if (!this.#startEdit({ row, col }) && key === 'Enter')
            this.#toggleRow(row, 'replace');
        }
        return;
      case 'c':
      case 'C':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          void this.#copyRange();
          return;
        }
        if (row >= 0 && !event.altKey) this.#typeaheadRow(key);
        return;
      case 'a':
      case 'A':
        if ((event.ctrlKey || event.metaKey) && this.selection === 'multiple') {
          event.preventDefault();
          this.selectAll();
          return;
        }
        if (row >= 0 && !event.altKey) this.#typeaheadRow(key);
        return;
      case 'Escape':
        if (this.#range) {
          this.#range = null;
          this.requestUpdate();
        }
        return;
      default:
        if (
          key.length === 1 &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey &&
          row >= 0
        )
          this.#typeaheadRow(key);
        return;
    }
    if (!next) return;
    event.preventDefault();
    if (extend && next.row >= 0 && row >= 0) {
      const r = this.#range ?? { r1: row, c1: col, r2: row, c2: col };
      this.#range = { ...r, r2: next.row, c2: next.col };
    } else {
      this.#range = null;
    }
    this.#setActive(next);
  };

  #typeaheadBuffer = '';

  #typeaheadRow(character: string): void {
    clearTimeout(this.#typeaheadTimer);
    this.#typeaheadBuffer += character.toLowerCase();
    this.#typeaheadTimer = setTimeout(() => (this.#typeaheadBuffer = ''), 700);
    const first = this.#eff.findIndex((c) => !c.internal);
    const col = this.#eff[first];
    if (!col) return;
    const start =
      this.#active.row + (this.#typeaheadBuffer.length === 1 ? 1 : 0);
    for (let i = 0; i < this.#rowCount; i++) {
      const index = (Math.max(start, 0) + i) % this.#rowCount;
      const row = this.#rowAt(index);
      if (
        row !== undefined &&
        String(valueOf(col.def, row) ?? '')
          .toLowerCase()
          .startsWith(this.#typeaheadBuffer)
      ) {
        this.#setActive({ row: index, col: this.#active.col });
        return;
      }
    }
  }

  async #copyRange(): Promise<void> {
    const { row, col } = this.#active;
    const r = this.#range ?? { r1: row, c1: col, r2: row, c2: col };
    const [r1, r2] = [Math.min(r.r1, r.r2), Math.max(r.r1, r.r2)];
    const [c1, c2] = [Math.min(r.c1, r.c2), Math.max(r.c1, r.c2)];
    const rows: unknown[][] = [];
    for (let i = Math.max(0, r1); i <= r2; i++) {
      const data = this.#rowAt(i);
      if (data === undefined) continue;
      const line: unknown[] = [];
      for (let j = c1; j <= c2; j++) {
        const c = this.#eff[j];
        if (c && !c.internal) line.push(valueOf(c.def, data));
      }
      rows.push(line);
    }
    const text = toTsv(rows);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* Clipboard may be unavailable (insecure context); the TSV is still announced. */
    }
    this.#lastCopied = text;
    this.#announce = `Copied ${rows.length} rows`;
    this.requestUpdate();
  }

  #lastCopied = '';

  /** The TSV text of the most recent copy (also what was sent to the clipboard). */
  get lastCopied(): string {
    return this.#lastCopied;
  }

  // --- Editing ---------------------------------------------------------------------------------

  #startEdit(pos: CellPos): boolean {
    const col = this.#eff[pos.col];
    if (
      !this.editable ||
      !col ||
      col.internal ||
      !col.def.editor ||
      pos.row < 0
    )
      return false;
    const row = this.#rowAt(pos.row);
    const ref = this.#refAt(pos.row);
    if (row === undefined || ref === undefined || ref < 0) return false;
    this.#editing = { row: pos.row, col: pos.col };
    this.dispatchEvent(
      new CustomEvent('bx-cell-edit-start', {
        bubbles: true,
        composed: true,
        detail: {
          row,
          key: this.#keyOf(row, this.#serverMode ? pos.row : ref),
          columnId: col.id,
        },
      }),
    );
    this.requestUpdate();
    void this.updateComplete.then(() => {
      const input = this.shadowRoot?.querySelector<HTMLElement>(
        '.editor input, .editor bx-input, .editor bx-select, .editor select',
      );
      (input as HTMLElement | null)?.focus();
    });
    return true;
  }

  #cancelEdit(refocus = true): void {
    if (!this.#editing) return;
    const pos = { row: this.#editing.row, col: this.#editing.col };
    this.#editing = null;
    this.requestUpdate();
    if (refocus) this.#setActive(pos);
  }

  async #commitEdit(
    raw: unknown,
    move: 'none' | 'next' | 'prev' = 'none',
  ): Promise<void> {
    const edit = this.#editing;
    if (!edit || edit.busy) return;
    const col = this.#eff[edit.col];
    const row = this.#rowAt(edit.row);
    const ref = this.#refAt(edit.row);
    if (!col || row === undefined || ref === undefined) return;
    const oldValue = valueOf(col.def, row);
    const newValue =
      col.def.editor === 'number'
        ? raw === ''
          ? null
          : Number(raw)
        : col.def.editor === 'checkbox'
          ? !!raw
          : raw;
    const waits: Promise<unknown>[] = [];
    const event = new CustomEvent('bx-cell-edit-commit', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        row,
        key: this.#keyOf(row, this.#serverMode ? edit.row : ref),
        columnId: col.id,
        oldValue,
        newValue,
        waitUntil: (promise: Promise<unknown>) => waits.push(promise),
      },
    });
    const proceed = this.dispatchEvent(event);
    if (!proceed) {
      this.#cancelEdit();
      return;
    }
    edit.busy = true;
    this.requestUpdate();
    try {
      const results = await Promise.all(waits);
      if (results.some((r) => r === false)) throw new Error('Rejected');
    } catch (error) {
      edit.busy = false;
      edit.error =
        error instanceof Error && error.message !== 'Rejected'
          ? error.message
          : 'Invalid value';
      this.#announce = `Edit rejected: ${edit.error}`;
      this.requestUpdate();
      return;
    }
    if (col.def.field !== undefined)
      (row as Record<string, unknown>)[col.def.field] = newValue;
    this.#editing = null;
    this.#viewDirty = true;
    this.#announce = 'Value updated';
    const pos = { row: edit.row, col: edit.col };
    this.requestUpdate();
    if (move === 'none') this.#setActive(pos);
    else {
      const dir = move === 'next' ? 1 : -1;
      let c = pos.col + dir;
      while (c >= 0 && c < this.#eff.length && !this.#eff[c]!.def.editor)
        c += dir;
      this.#setActive({
        row: pos.row,
        col: c >= 0 && c < this.#eff.length ? c : pos.col,
      });
    }
  }

  #renderEditor(col: EffColumn, row: T, rowIndex: number) {
    const def = col.def as ColumnDef<T>;
    const value = valueOf(def, row);
    const edit = this.#editing!;
    const onKey = (event: KeyboardEvent): void => {
      event.stopPropagation();
      if (event.key === 'Escape') {
        event.preventDefault();
        this.#cancelEdit();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        void this.#commitEdit(
          readValue(event.currentTarget as HTMLElement),
          'none',
        );
      } else if (event.key === 'Tab') {
        event.preventDefault();
        void this.#commitEdit(
          readValue(event.currentTarget as HTMLElement),
          event.shiftKey ? 'prev' : 'next',
        );
      }
    };
    const readValue = (el: HTMLElement): unknown => {
      const input = el.querySelector(
        'input,select,bx-input,bx-select',
      ) as HTMLInputElement | null;
      if (!input) return value;
      return input.type === 'checkbox' ? input.checked : input.value;
    };
    let control: unknown;
    if (typeof def.editor === 'function') {
      control = def.editor({
        value,
        row,
        rowIndex,
        column: def,
        commit: (v) => void this.#commitEdit(v),
        cancel: () => this.#cancelEdit(),
      });
    } else if (def.editor === 'select') {
      control = html`<select
        aria-label=${def.header ?? col.id}
        .value=${String(value ?? '')}
      >
        ${(def.editorOptions ?? []).map(
          (o) =>
            html`<option
              value=${o.value}
              ?selected=${o.value === String(value)}
            >
              ${o.label}
            </option>`,
        )}
      </select>`;
    } else if (def.editor === 'checkbox') {
      control = html`<input
        type="checkbox"
        aria-label=${def.header ?? col.id}
        .checked=${!!value}
      />`;
    } else {
      control = html`<input
        type=${def.editor === 'number' ? 'number' : 'text'}
        aria-label=${def.header ?? col.id}
        .value=${String(value ?? '')}
      />`;
    }
    return html`<span
      class="editor"
      @keydown=${onKey}
      @focusout=${(e: FocusEvent) => this.#editorFocusOut(e)}
      >${control}${edit.error ? html`<span class="error" role="alert">${edit.error}</span>` : nothing}</span
    >`;
  }

  #editorFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    const holder = event.currentTarget as HTMLElement;
    if (next && holder.contains(next)) return;
    // Leaving the editor commits (the usual spreadsheet behavior), unless an error is showing.
    if (this.#editing && !this.#editing.error && !this.#editing.busy) {
      const input = holder.querySelector(
        'input,select',
      ) as HTMLInputElement | null;
      if (input)
        void this.#commitEdit(
          input.type === 'checkbox' ? input.checked : input.value,
        );
    }
  }

  // --- Render ----------------------------------------------------------------------------------

  #renderCellContent(col: EffColumn, row: T, rowIndex: number, ref: number) {
    const def = col.def as ColumnDef<T>;
    const value = valueOf(def, row);
    try {
      const out = def.render
        ? def.render(row, { value, row, rowIndex, column: def })
        : value;
      if (out === null || out === undefined) return '';
      return out instanceof Date
        ? out.toLocaleString()
        : (out as TemplateResult | string);
    } catch {
      // Renderer failures are isolated to the cell (FR-DATA-TABLE-13).
      void ref;
      return html`<span class="error" title="Render error">⚠</span>`;
    }
  }

  #cellAttrs(col: EffColumn, colIndex: number, rowIndex: number) {
    const stick =
      col.pinned === 'start'
        ? `inset-inline-start: ${col.left}px;`
        : col.pinned === 'end'
          ? `inset-inline-end: ${this.#totalWidth - col.left - col.width}px;`
          : '';
    const active =
      this.#active.row === rowIndex && this.#active.col === colIndex;
    return { stick, active };
  }

  #inRange(row: number, col: number): boolean {
    const r = this.#range;
    if (!r) return false;
    return (
      row >= Math.min(r.r1, r.r2) &&
      row <= Math.max(r.r1, r.r2) &&
      col >= Math.min(r.c1, r.c2) &&
      col <= Math.max(r.c1, r.c2)
    );
  }

  #visibleColumnIndexes(): number[] {
    const { from, to } = this.#columnWindow();
    const out: number[] = [];
    for (let i = 0; i < this.#eff.length; i++) {
      const c = this.#eff[i]!;
      if (c.pinned || (i >= from && i < to)) out.push(i);
    }
    return out;
  }

  #renderHeader() {
    const cols = this.#visibleColumnIndexes();
    return html`<div class="header" part="header" role="row" aria-rowindex="1">
      ${cols.map((ci) => {
        const col = this.#eff[ci]!;
        const sort = this.sort.find((s) => s.field === col.id);
        const { stick, active } = this.#cellAttrs(col, ci, -1);
        const sortable = !!col.def.sortable && !col.internal;
        const state = col.id === SELECT_ID ? this.#selectionState() : undefined;
        return html`<div
          class="hcell"
          part="header-cell"
          role="columnheader"
          data-hcol=${ci}
          aria-colindex=${ci + 1}
          aria-sort=${sortable ? (sort ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none') : nothing}
          tabindex=${active ? 0 : -1}
          ?data-sortable=${sortable}
          data-pinned=${col.pinned ?? nothing}
          style="grid-column: ${ci + 1}; ${stick}"
          @pointerdown=${(e: PointerEvent) => this.#handleHeaderPointerDown(e, col)}
        >
          ${
            col.id === SELECT_ID
              ? html`<span
                  role="checkbox"
                  class="check"
                  aria-label="Select all rows"
                  aria-checked=${String(state)}
                  data-state=${String(state)}
                  >${state === true ? '✓' : state === 'mixed' ? '–' : ''}</span
                >`
              : col.id === DETAIL_ID
                ? html`<span class="sr">Details</span>`
                : html`<span class="title">${col.def.header ?? col.id}</span>${
                      sort
                        ? html`<span class="sort" aria-hidden="true"
                            >${sort.direction === 'asc' ? '▲' : '▼'}</span
                          >`
                        : nothing
                    }`
          }
          ${
            this.resizable && !col.internal
              ? html`<span
                  class="resize-handle"
                  part="resize-handle"
                  ?data-active=${this.#resizing === col.id}
                  @pointerdown=${(e: PointerEvent) => this.#handleResizeStart(e, col)}
                ></span>`
              : nothing
          }
        </div>`;
      })}
    </div>`;
  }

  #renderDataRow(viewIndex: number, ref: number, start: number) {
    const row = this.#rowAt(viewIndex);
    const cols = this.#visibleColumnIndexes();
    const absolute = `transform: translateY(${start}px)`;
    const fixed =
      this.rowHeight === 'auto' ? '' : `block-size: ${this.rowHeight}px;`;

    if (row === undefined) {
      const failed = this.#cache?.hasError(viewIndex);
      return html`<div
        class="row"
        part="row"
        role="row"
        data-row=${viewIndex}
        aria-rowindex=${viewIndex + 2}
        aria-busy=${failed ? nothing : 'true'}
        style="${fixed}${absolute}"
      >
        ${cols.map((ci) => {
          const col = this.#eff[ci]!;
          const { stick, active } = this.#cellAttrs(col, ci, viewIndex);
          return html`<div
            class="cell"
            part="cell"
            role="gridcell"
            data-row=${viewIndex}
            data-col=${ci}
            aria-colindex=${ci + 1}
            tabindex=${active ? 0 : -1}
            data-pinned=${col.pinned ?? nothing}
            style="grid-column: ${ci + 1}; ${stick}"
          >
            ${
              failed
                ? ci === cols[0]
                  ? html`<button
                      class="toggle"
                      style="inline-size:auto"
                      @click=${() => this.retry()}
                    >
                      Failed to load — retry
                    </button>`
                  : nothing
                : col.internal
                  ? nothing
                  : html`<span class="skeleton"></span>`
            }
          </div>`;
        })}
      </div>`;
    }

    const key = this.#keyOf(row, this.#serverMode ? viewIndex : ref);
    const selected =
      this.selection !== 'none' ? this.#isSelected(key) : undefined;
    const detailOpen = !!this.renderDetail && this.#detailOpen.has(key);
    return html`<div
      class="row"
      part="row"
      role="row"
      data-row=${viewIndex}
      aria-rowindex=${viewIndex + 2}
      aria-selected=${selected === undefined ? nothing : String(selected)}
      aria-expanded=${this.renderDetail ? String(detailOpen) : nothing}
      style="${fixed}${absolute}"
    >
      ${cols.map((ci) => {
        const col = this.#eff[ci]!;
        const { stick, active } = this.#cellAttrs(col, ci, viewIndex);
        const editing =
          this.#editing &&
          this.#editing.row === viewIndex &&
          this.#editing.col === ci;
        const inRange = this.#inRange(viewIndex, ci);
        let content: unknown;
        if (col.id === SELECT_ID)
          content = html`<span
            class="check"
            aria-hidden="true"
            data-state=${String(!!selected)}
            >${selected ? '✓' : ''}</span
          >`;
        else if (col.id === DETAIL_ID)
          content = html`<button
            class="toggle"
            aria-expanded=${String(detailOpen)}
            aria-label="Toggle details"
            tabindex="-1"
          >
            ›
          </button>`;
        else if (editing) content = this.#renderEditor(col, row, viewIndex);
        else content = this.#renderCellContent(col, row, viewIndex, ref);
        return html`<div
          class="cell"
          part="${inRange ? 'cell cell-selected' : 'cell'}"
          role="gridcell"
          data-row=${viewIndex}
          data-col=${ci}
          data-label=${col.def.header ?? col.id}
          data-align=${col.def.align ?? nothing}
          aria-colindex=${ci + 1}
          aria-readonly=${this.editable && col.def.editor ? nothing : this.editable ? 'true' : nothing}
          tabindex=${active ? 0 : -1}
          ?data-range=${inRange}
          data-pinned=${col.pinned ?? nothing}
          style="grid-column: ${ci + 1}; ${stick}"
        >
          ${content}
        </div>`;
      })}
      ${
        detailOpen
          ? html`<div
              class="detail"
              part="detail"
              role="gridcell"
              aria-colspan=${this.#eff.length}
            >
              ${this.renderDetail!(row)}
            </div>`
          : nothing
      }
    </div>`;
  }

  #renderGroupRow(viewIndex: number, group: GroupInfo, start: number) {
    const cols = this.#visibleColumnIndexes();
    const open = this.#expandedGroups.has(group.key);
    const fixed =
      this.rowHeight === 'auto' ? '' : `block-size: ${this.rowHeight}px;`;
    return html`<div
      class="row group-row"
      part="group-row"
      role="row"
      data-row=${viewIndex}
      aria-rowindex=${viewIndex + 2}
      aria-level=${group.level + 1}
      aria-expanded=${String(open)}
      style="${fixed}transform: translateY(${start}px)"
    >
      ${cols.map((ci, k) => {
        const col = this.#eff[ci]!;
        const { stick, active } = this.#cellAttrs(col, ci, viewIndex);
        const agg = group.aggregates[col.id];
        return html`<div
          class="cell"
          part="cell"
          role="gridcell"
          data-row=${viewIndex}
          data-col=${ci}
          aria-colindex=${ci + 1}
          tabindex=${active ? 0 : -1}
          data-pinned=${col.pinned ?? nothing}
          style="grid-column: ${ci + 1}; padding-inline-start: calc(var(--bx-space-s) + ${group.level} * 1.25em); ${stick}"
        >
          ${
            k === 0
              ? html`<span
                    class="toggle"
                    aria-hidden="true"
                    style="rotate: ${open ? 90 : 0}deg"
                    >›</span
                  >${String(group.value ?? '—')} <span class="sr">,</span>
                  <span style="color: var(--bx-text-secondary)"
                    >&nbsp;(${group.count})</span
                  >`
              : agg !== undefined
                ? String(agg)
                : ''
          }
        </div>`;
      })}
    </div>`;
  }

  protected override render() {
    const items = this.#virtualizer.items;
    const empty =
      this.#rowCount === 0 &&
      !this.loading &&
      !(this.#serverMode && (this.#cache?.total ?? -1) < 0);
    const colCount = this.#eff.length;
    const serverPending = this.#serverMode && (this.#cache?.total ?? -1) < 0;
    return html`
      <div class="base" part="base">
        <div class="toolbar" part="toolbar"><slot name="toolbar"></slot></div>
        <div
          class="scroller"
          role=${this.groupBy.length > 0 || this.renderDetail ? 'treegrid' : 'grid'}
          tabindex=${this.#editing ? -1 : nothing}
          aria-label=${this.ariaLabel ?? nothing}
          aria-rowcount=${this.#rowCount + 1}
          aria-colcount=${colCount}
          aria-multiselectable=${this.selection === 'multiple' ? 'true' : nothing}
          aria-busy=${this.loading || serverPending ? 'true' : nothing}
          @click=${(e: MouseEvent) => (this.#suppressClick ? undefined : this.#handleClick(e))}
          @dblclick=${this.#handleDblClick}
          @keydown=${this.#handleKeydown}
          @focusin=${this.#handleFocusIn}
        >
          ${this.#renderHeader()}
          <div
            class="spacer"
            part="body"
            role="presentation"
            style="block-size: ${this.#virtualizer.totalSize}px"
          >
            ${repeat(
              items,
              (item) => item.key,
              (item) => {
                const ref = this.#refAt(item.index);
                if (ref === undefined) return nothing;
                return ref < 0
                  ? this.#renderGroupRow(
                      item.index,
                      this.#groups[-ref - 1]!,
                      item.start,
                    )
                  : this.#renderDataRow(item.index, ref, item.start);
              },
            )}
          </div>
          ${empty ? html`<div class="state" part="empty"><slot name="empty">${this.emptyLabel}</slot></div>` : nothing}
          ${
            serverPending && this.#cache?.hasError(0)
              ? html`<div class="state" role="alert">
                  Failed to load rows.
                  <button type="button" @click=${() => this.retry()}>
                    Retry
                  </button>
                </div>`
              : nothing
          }
          ${
            (this.loading || serverPending) && !this.#cache?.hasError(0)
              ? html`<div class="overlay" part="loading-overlay">
                  <slot name="loading">Loading…</slot>
                </div>`
              : nothing
          }
        </div>
        <div class="footer" part="footer"><slot name="footer"></slot></div>
        <slot @slotchange=${this.#handleSlotChange} hidden></slot>
        <div class="sr" role="status" aria-live="polite">${this.#announce}</div>
      </div>
    `;
  }
}

/** Layout and view state for saved views (`getState()`/`setState()`). */
export interface TableState {
  order: string[];
  widths: Record<string, number>;
  pinned: Record<string, 'start' | 'end'>;
  hidden: Record<string, boolean>;
  sort: SortModel[];
  filters: FilterModel;
  groupBy: string[];
}

/** Data-only element for declaring a column in markup: `<bx-column field="name" header="Name">`. */
export class BxColumn extends HTMLElement {
  static tagName = 'bx-column';
  static define(tagName: string = this.tagName): void {
    if (typeof customElements !== 'undefined' && !customElements.get(tagName))
      customElements.define(tagName, this);
  }
  connectedCallback(): void {
    this.style.display = 'none';
  }
}
