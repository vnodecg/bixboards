import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { observeResize } from '../internal/shared-observers.ts';
import { PrefixSums } from './prefix-sum.ts';

export interface VirtualItem {
  /** Position in the data set, not in the DOM. */
  index: number;
  /** Stable identity (`getItemKey(index)`, or the index itself). Use as the `repeat()` key. */
  key: string | number;
  /** Offset of the item's leading edge from the start of the list content, in px. */
  start: number;
  size: number;
  end: number;
  /** True for indexes listed in `stickyIndexes`. */
  sticky: boolean;
  /**
   * Where to place the item inside the scroll spacer, in px. Equal to `start` unless the list is
   * taller than `maxScrollSize`, in which case the spacer is compressed and positions are relative
   * to the scrolled window. Always place items with this, not with `start`.
   */
  position: number;
}

export interface VirtualizerOptions {
  /** Total number of items in the data set. */
  count: number;
  /** The scrolling element. Resolved lazily (it usually lives in the host's shadow root). */
  getScrollElement: () => Element | null;
  /**
   * Fixed item size in px, or a per-index estimate. A plain number without `dynamic` is the fast
   * path: offsets are pure arithmetic and no index is built. Omitted with `dynamic`, the estimate
   * adapts to the average of what has been measured so far.
   */
  itemSize?: number | ((index: number) => number);
  /**
   * Items are measured after render through `measureElement()` and the prefix-sum index is
   * corrected as sizes come in. Rendered elements must carry a `data-index` attribute.
   */
  dynamic?: boolean;
  /** Extra items rendered beyond each edge of the viewport. Default 4. */
  overscan?: number;
  /** Scroll along the inline axis instead of the block axis. */
  horizontal?: boolean;
  /** Stable key for an index; keeps measured sizes attached to the data across reorders. */
  getItemKey?: (index: number) => string | number;
  /** Ascending indexes (group headers, pinned rows) that stay rendered while scrolled past. */
  stickyIndexes?: readonly number[];
  /** Indexes that must stay in the DOM even when outside the window (focused/active items). */
  pinnedIndexes?: readonly number[];
  /** Space before the first / after the last item inside the scroll element, in px. */
  paddingStart?: number;
  paddingEnd?: number;
  /**
   * When false every item is returned and nothing is windowed — the simple-render fallback for
   * small lists (conventions §4, paired with `content-visibility` by the consumer).
   */
  enabled?: boolean;
  /** Added to `aria-rowindex` so header rows outside the list are accounted for. */
  ariaIndexOffset?: number;
  /**
   * Browsers cap the height of an element (Firefox near 17.9M px, Chromium near 33.5M), and a
   * taller scroll spacer silently stops scrolling or collapses. Content taller than this is
   * compressed: the spacer stays at this size and scroll position maps to the content offset by
   * the ratio. Default 16,000,000. Lists below it behave exactly as before.
   */
  maxScrollSize?: number;
}

export interface ScrollToOptions {
  /** `auto` scrolls the minimum distance, and only if the item is not already fully visible. */
  align?: 'start' | 'center' | 'end' | 'auto';
  behavior?: ScrollBehavior;
}

const DEFAULT_SIZE = 32;
const DEFAULT_OVERSCAN = 4;
/** An adaptive estimate is only re-applied when it has drifted this far, to bound O(n) rebuilds. */
const ESTIMATE_DRIFT = 1;
const SCROLL_RETRIES = 4;
/** Below every engine's element-height cap (Firefox is the lowest, near 17.9M px). */
const DEFAULT_MAX_SCROLL_SIZE = 16_000_000;

/**
 * Windowed rendering shared by `select`, `dropdown`, `virtual-tree`, `data-list` and
 * `data-table` (docs/features/_conventions.md §4).
 *
 * The controller owns *geometry*, not DOM: it computes which indexes are inside the viewport plus
 * overscan, where each one starts, and how tall the whole list is. The host renders `items`
 * itself — typically a relatively positioned spacer of `spacerSize` px with each item placed at
 * `translateY(item.start)` — using `repeat(items, (i) => i.key, ...)` so Lit recycles the DOM
 * nodes by key as the window moves.
 *
 * - **Sizes**: fixed (arithmetic, no index) or variable (a Fenwick-tree prefix-sum index, so a
 *   measured-size correction is O(log n)). Variable items are measured through `measureElement()`
 *   on the shared `ResizeObserver` pool; measured sizes are stored by key.
 * - **Scroll anchoring**: when an item above the viewport changes size the scroll position is
 *   adjusted by the same amount, so what the user is looking at never moves.
 * - **Accessibility**: `getAria()` derives `aria-setsize`/`aria-posinset`/`aria-rowindex` from data
 *   indexes, which stay correct however few nodes are in the DOM.
 * - **Cost**: scroll handling is passive and rAF-coalesced; the host only re-renders when the
 *   rendered window (not the scroll position) actually changes. Every listener, observer and
 *   timer is released in `hostDisconnected`.
 *
 * Call `setOptions()` from the host's `willUpdate`/`render` (it never schedules an update itself)
 * and pass stable function references — a changed `itemSize`/`getItemKey` identity is treated as
 * "the data changed" and rebuilds the index. Call `invalidate()` after replacing data under an
 * unchanged `count`.
 */
export class VirtualizerController implements ReactiveController {
  readonly #host: ReactiveControllerHost;
  #options: VirtualizerOptions;

  #sums: PrefixSums | null = null;
  #dirty = true;
  #measured = new Map<string | number, number>();
  #measuredSum = 0;
  #builtEstimate = DEFAULT_SIZE;
  #rebuildScheduled = false;

  #scrollEl: Element | null = null;
  #unobserveScrollEl?: () => void;
  #offset = 0;
  #viewport = 0;
  #scrollRaf = 0;
  #renderRaf = 0;

  #items: VirtualItem[] = [];
  #signature = '';
  #activeSticky = -1;

  #observed = new Map<Element, () => void>();
  #pendingAnchor = 0;
  #anchorScheduled = false;
  #pendingScroll = 0;
  #disposed = false;
  #wasDisconnected = false;

  constructor(host: ReactiveControllerHost, options: VirtualizerOptions) {
    this.#host = host;
    this.#options = options;
    host.addController(this);
  }

  // --- Configuration -------------------------------------------------------------------------

  setOptions(options: VirtualizerOptions): void {
    const previous = this.#options;
    if (
      options.count !== previous.count ||
      options.itemSize !== previous.itemSize ||
      options.getItemKey !== previous.getItemKey ||
      !!options.dynamic !== !!previous.dynamic ||
      options.enabled !== previous.enabled
    )
      this.#dirty = true;
    this.#options = options;
    this.#signature = ''; // Force the next compute to re-evaluate the window.
  }

  /** Discards the layout index (and measured sizes) after the data changed under the same `count`. */
  invalidate(clearMeasured = false): void {
    if (clearMeasured) {
      this.#measured.clear();
      this.#measuredSum = 0;
    }
    this.#dirty = true;
    this.#signature = '';
  }

  // --- Reads ---------------------------------------------------------------------------------

  /** Items to render: the visible window plus overscan, pinned items, and the active sticky one. */
  get items(): readonly VirtualItem[] {
    this.#compute();
    return this.#items;
  }

  /** Full extent of the list content, including padding: the real height, however tall. */
  get totalSize(): number {
    this.#ensureIndex();
    return this.#paddingStart + this.#contentSize() + this.#paddingEnd;
  }

  /**
   * Height to give the scroll spacer: `totalSize`, capped at `maxScrollSize` (see that option).
   * Use this, not `totalSize`, for the spacer's size.
   */
  get spacerSize(): number {
    return Math.min(this.totalSize, this.#cap);
  }

  /** Scroll position in content coordinates (not the element's raw `scrollTop` when compressed). */
  get scrollOffset(): number {
    return this.#offset;
  }

  get viewportSize(): number {
    return this.#viewport;
  }

  /** Index of the sticky item currently pinned to the top, or -1. */
  get activeStickyIndex(): number {
    this.#compute();
    return this.#activeSticky;
  }

  /** First and last index whose box intersects the viewport (without overscan). */
  get visibleRange(): { start: number; end: number } {
    const count = this.#options.count;
    if (count === 0) return { start: 0, end: -1 };
    const from = Math.max(0, this.#offset - this.#paddingStart);
    return {
      start: this.#indexAt(from),
      end: this.#indexAt(from + Math.max(this.#viewport, 1)),
    };
  }

  get isWindowed(): boolean {
    return this.#options.enabled !== false;
  }

  /**
   * `aria-setsize`/`aria-posinset` (or `aria-rowindex`) from the data index — correct whatever
   * subset of items is in the DOM. Spread the result onto the rendered element.
   */
  getAria(index: number, kind: 'set' | 'row' = 'set'): Record<string, number> {
    if (kind === 'row')
      return {
        'aria-rowindex': index + 1 + (this.#options.ariaIndexOffset ?? 0),
      };
    return { 'aria-setsize': this.#options.count, 'aria-posinset': index + 1 };
  }

  indexOfKey(key: string | number): number {
    const { count, getItemKey } = this.#options;
    for (let i = 0; i < count; i++)
      if ((getItemKey?.(i) ?? i) === key) return i;
    return -1;
  }

  /** Index of the item at `offset` px from the start of the scroll content (padding included). */
  indexAtOffset(offset: number): number {
    return this.#indexAt(Math.max(0, offset - this.#paddingStart));
  }

  /** Drops a measured size so the next render re-measures that key (dynamic mode). */
  forget(key: string | number): void {
    const known = this.#measured.get(key);
    if (known === undefined) return;
    this.#measuredSum -= known;
    this.#measured.delete(key);
    this.#dirty = true;
    this.#signature = '';
    this.#requestRender();
  }

  /** Start offset of an item from the start of the list content, in px. */
  offsetOf(index: number): number {
    this.#ensureIndex();
    return this.#offsetOf(index);
  }

  sizeOf(index: number): number {
    this.#ensureIndex();
    return this.#sizeOf(index);
  }

  // --- Actions -------------------------------------------------------------------------------

  scrollToIndex(index: number, options: ScrollToOptions = {}): void {
    const el = this.#scrollEl ?? this.#options.getScrollElement();
    const count = this.#options.count;
    if (!el || count === 0) return;
    const clamped = Math.min(Math.max(index, 0), count - 1);
    const { align = 'auto', behavior = 'auto' } = options;
    this.#scrollTo(el, clamped, align, behavior);

    // Variable sizes shift as the target region is measured; settle on the real position.
    if (this.#options.dynamic && behavior !== 'smooth') {
      let attempts = SCROLL_RETRIES;
      cancelAnimationFrame(this.#pendingScroll);
      const settle = (): void => {
        if (this.#disposed || attempts-- <= 0) return;
        this.#pendingScroll = requestAnimationFrame(() => {
          const target = this.#targetOffset(clamped, align);
          if (Math.abs(target - this.#readOffset(el)) > 1)
            this.#scrollTo(el, clamped, align, 'auto');
          settle();
        });
      };
      settle();
    }
  }

  scrollToKey(key: string | number, options?: ScrollToOptions): void {
    const index = this.indexOfKey(key);
    if (index >= 0) this.scrollToIndex(index, options);
  }

  /**
   * Re-reads scroll offset and viewport size synchronously. Call when the scroll element has just
   * become visible (a popup opening) so the first frame already shows a full window.
   */
  sync(): void {
    const el = this.#options.getScrollElement();
    if (el !== this.#scrollEl) this.#attach(el);
    if (!el) return;
    this.#viewport = this.#readViewport(el); // the scale depends on it, so read it first
    this.#offset = this.#readOffset(el);
    this.#recompute(true);
  }

  /**
   * Registers a rendered item for measurement (dynamic mode). Idempotent and cheap: call it for
   * every rendered element each render. The element must have a `data-index` attribute.
   */
  measureElement(element: Element | null | undefined): void {
    if (!element || !this.#options.dynamic || this.#observed.has(element))
      return;
    this.#observed.set(
      element,
      observeResize(element, (entry) => this.#handleItemResize(element, entry)),
    );
  }

  // --- ReactiveController --------------------------------------------------------------------

  hostConnected(): void {
    this.#disposed = false;
    const el = this.#options.getScrollElement();
    if (el) this.#attach(el);
    // Item observers are dropped on disconnect and re-registered by the next render.
    if (this.#wasDisconnected) queueMicrotask(() => this.#host.requestUpdate());
    this.#wasDisconnected = false;
  }

  hostUpdated(): void {
    const el = this.#options.getScrollElement();
    if (el !== this.#scrollEl) {
      this.#attach(el);
      // Reading geometry just after render may change the window; re-render outside this update.
      if (el) queueMicrotask(() => this.#recompute(true));
    }
    this.#pruneObserved();
  }

  hostDisconnected(): void {
    this.#disposed = true;
    this.#wasDisconnected = true;
    this.#detach();
    for (const unobserve of this.#observed.values()) unobserve();
    this.#observed.clear();
    cancelAnimationFrame(this.#pendingScroll);
    if (this.#renderRaf) cancelAnimationFrame(this.#renderRaf);
    this.#renderRaf = 0;
  }

  // --- Layout --------------------------------------------------------------------------------

  get #paddingStart(): number {
    return this.#options.paddingStart ?? 0;
  }

  get #paddingEnd(): number {
    return this.#options.paddingEnd ?? 0;
  }

  get #fixedSize(): number | null {
    const { itemSize, dynamic } = this.#options;
    return typeof itemSize === 'number' && !dynamic ? itemSize : null;
  }

  get #cap(): number {
    return this.#options.maxScrollSize ?? DEFAULT_MAX_SCROLL_SIZE;
  }

  /**
   * Content px per scroll-element px: 1 unless the content is taller than the spacer cap. Maps
   * the scrollable range [0, spacer - viewport] onto [0, total - viewport].
   */
  get #scale(): number {
    this.#ensureIndex();
    const total = this.#paddingStart + this.#contentSize() + this.#paddingEnd;
    if (total <= this.#cap) return 1;
    const viewport = Math.min(this.#viewport, this.#cap - 1);
    return (total - viewport) / (this.#cap - viewport);
  }

  #key(index: number): string | number {
    return this.#options.getItemKey?.(index) ?? index;
  }

  #adaptiveEstimate(): number {
    return this.#measured.size > 0
      ? this.#measuredSum / this.#measured.size
      : DEFAULT_SIZE;
  }

  /** Builds the prefix-sum index when needed (variable-size mode only). */
  #ensureIndex(): void {
    if (this.#fixedSize !== null) {
      this.#sums = null;
      this.#dirty = false;
      return;
    }
    if (!this.#dirty && this.#sums) return;
    this.#sums ??= new PrefixSums();
    const average = this.#adaptiveEstimate();
    this.#builtEstimate = average;
    const { itemSize, count } = this.#options;
    // Pick the cheapest size function once instead of branching per index: this runs over every
    // item of a possibly 100k-item list.
    let estimate: (index: number) => number;
    if (typeof itemSize === 'function') {
      estimate = itemSize;
    } else {
      const constant = itemSize ?? average;
      estimate = () => constant;
    }
    const sizeAt =
      this.#measured.size === 0
        ? estimate
        : (index: number): number =>
            this.#measured.get(this.#key(index)) ?? estimate(index);
    this.#sums.rebuild(count, sizeAt);
    this.#dirty = false;
  }

  #contentSize(): number {
    const fixed = this.#fixedSize;
    return fixed !== null ? fixed * this.#options.count : this.#sums!.total;
  }

  #offsetOf(index: number): number {
    const fixed = this.#fixedSize;
    return fixed !== null ? fixed * index : this.#sums!.offsetOf(index);
  }

  #sizeOf(index: number): number {
    return this.#fixedSize ?? this.#sums!.size(index);
  }

  /** Index containing `offset` (content coordinates), clamped to the data set. */
  #indexAt(offset: number): number {
    const count = this.#options.count;
    if (count === 0) return -1;
    this.#ensureIndex();
    const fixed = this.#fixedSize;
    if (fixed !== null)
      return fixed <= 0
        ? 0
        : Math.min(count - 1, Math.max(0, Math.floor(offset / fixed)));
    return this.#sums!.indexAt(offset);
  }

  // --- Window --------------------------------------------------------------------------------

  #compute(): void {
    this.#ensureIndex();
    const { count, enabled, overscan = DEFAULT_OVERSCAN } = this.#options;
    const stickyIndexes = this.#options.stickyIndexes ?? [];
    const pinned = this.#options.pinnedIndexes ?? [];

    let start = 0;
    let end = count; // exclusive
    let firstVisible = 0;
    if (enabled !== false && count > 0) {
      const from = Math.max(0, this.#offset - this.#paddingStart);
      firstVisible = this.#indexAt(from);
      const lastVisible = this.#indexAt(from + this.#viewport);
      start = Math.max(0, firstVisible - overscan);
      end = Math.min(count, lastVisible + 1 + overscan);
    }

    let activeSticky = -1;
    for (const sticky of stickyIndexes) {
      if (sticky > firstVisible) break;
      activeSticky = sticky;
    }

    // When compressed, placement depends on the exact scroll offset, so it joins the signature.
    const scale = this.#scale;
    const signature = `${start}:${end}:${activeSticky}:${pinned.join(',')}:${this.#sums ? this.#sums.total : count}:${scale === 1 ? '' : Math.round(this.#offset)}`;
    if (signature === this.#signature) return;
    this.#signature = signature;
    this.#activeSticky = activeSticky;

    const indexes = new Set<number>();
    for (let i = start; i < end; i++) indexes.add(i);
    if (activeSticky >= 0) indexes.add(activeSticky);
    for (const p of pinned) if (p >= 0 && p < count) indexes.add(p);
    const stickySet = new Set(stickyIndexes);

    this.#items = [...indexes]
      .sort((a, b) => a - b)
      .map((index) => {
        const size = this.#sizeOf(index);
        const itemStart = this.#paddingStart + this.#offsetOf(index);
        return {
          index,
          key: this.#key(index),
          start: itemStart,
          size,
          end: itemStart + size,
          sticky: stickySet.has(index),
          // Compressed: place relative to the scrolled window so the item at the content offset
          // lands exactly at the element's raw scroll position.
          position:
            scale === 1
              ? itemStart
              : itemStart - this.#offset + this.#offset / scale,
        };
      });
  }

  /**
   * Observer callbacks must not render synchronously: a re-render observes freshly inserted items
   * at the same depth as the ones just delivered, which the browser reports as "ResizeObserver
   * loop completed with undelivered notifications". Scroll position fixes stay synchronous (they
   * change no sizes); only the host update is pushed to the next animation frame.
   */
  #requestRender(): void {
    if (this.#renderRaf || this.#disposed) return;
    this.#renderRaf = requestAnimationFrame(() => {
      this.#renderRaf = 0;
      this.#recompute(true);
    });
  }

  /** Recomputes the window and, if it changed, asks the host to render. */
  #recompute(notify: boolean): void {
    if (this.#disposed) return;
    const before = this.#signature;
    this.#signature = '';
    this.#compute();
    if (notify && this.#signature !== before) this.#host.requestUpdate();
  }

  // --- Scroll element ------------------------------------------------------------------------

  get #horizontal(): boolean {
    return !!this.#options.horizontal;
  }

  #readOffset(el: Element): number {
    // `scrollLeft` is negative in RTL; the distance from the start edge is what matters.
    const raw = Math.abs(this.#horizontal ? el.scrollLeft : el.scrollTop);
    return raw * this.#scale;
  }

  #readViewport(el: Element): number {
    return this.#horizontal ? el.clientWidth : el.clientHeight;
  }

  #attach(el: Element | null): void {
    this.#detach();
    this.#scrollEl = el;
    if (!el) return;
    el.addEventListener('scroll', this.#handleScroll, { passive: true });
    this.#unobserveScrollEl = observeResize(el, () => {
      this.#viewport = this.#readViewport(el);
      this.#requestRender();
    });
    this.#viewport = this.#readViewport(el);
    this.#offset = this.#readOffset(el);
  }

  #detach(): void {
    this.#scrollEl?.removeEventListener('scroll', this.#handleScroll);
    this.#unobserveScrollEl?.();
    this.#unobserveScrollEl = undefined;
    if (this.#scrollRaf) cancelAnimationFrame(this.#scrollRaf);
    this.#scrollRaf = 0;
    this.#scrollEl = null;
  }

  #handleScroll = (): void => {
    if (this.#scrollRaf) return;
    this.#scrollRaf = requestAnimationFrame(() => {
      this.#scrollRaf = 0;
      const el = this.#scrollEl;
      if (!el) return;
      this.#offset = this.#readOffset(el);
      this.#recompute(true);
    });
  };

  // --- Scrolling -----------------------------------------------------------------------------

  #targetOffset(
    index: number,
    align: NonNullable<ScrollToOptions['align']>,
  ): number {
    this.#ensureIndex();
    const start = this.#paddingStart + this.#offsetOf(index);
    const size = this.#sizeOf(index);
    const viewport = this.#viewport;
    const current = this.#offset;
    switch (align) {
      case 'start':
        return start;
      case 'end':
        return start + size - viewport;
      case 'center':
        return start + size / 2 - viewport / 2;
      default:
        if (start < current) return start;
        if (start + size > current + viewport) return start + size - viewport;
        return current;
    }
  }

  #scrollTo(
    el: Element,
    index: number,
    align: NonNullable<ScrollToOptions['align']>,
    behavior: ScrollBehavior,
  ): void {
    const max = Math.max(0, this.totalSize - this.#viewport);
    const content = Math.min(
      Math.max(this.#targetOffset(index, align), 0),
      max,
    );
    const target = content / this.#scale;
    if (this.#horizontal) {
      const rtl = getComputedStyle(el).direction === 'rtl';
      el.scrollTo({ left: rtl ? -target : target, behavior });
    } else {
      el.scrollTo({ top: target, behavior });
    }
  }

  // --- Measurement ---------------------------------------------------------------------------

  #handleItemResize(element: Element, entry: ResizeObserverEntry): void {
    const index = Number(element.getAttribute('data-index'));
    if (!Number.isInteger(index) || index < 0 || index >= this.#options.count)
      return;
    const box = entry.borderBoxSize?.[0];
    const size = box
      ? this.#horizontal
        ? box.inlineSize
        : box.blockSize
      : this.#horizontal
        ? entry.contentRect.width
        : entry.contentRect.height;
    this.#setMeasured(index, size);
  }

  #setMeasured(index: number, size: number): void {
    this.#ensureIndex();
    const key = this.#key(index);
    const known = this.#measured.get(key);
    if (known !== undefined && Math.abs(known - size) < 0.01) return;

    this.#measuredSum += size - (known ?? 0);
    this.#measured.set(key, size);

    if (this.#sums) {
      const start = this.#offsetOf(index);
      const delta = this.#sums.set(index, size);
      // An item that starts above the viewport changed height: shift the scroll position by the
      // same amount so the content the user is looking at does not move.
      if (delta !== 0 && this.#paddingStart + start < this.#offset)
        this.#queueAnchor(delta);
    }

    if (
      this.#options.itemSize === undefined &&
      Math.abs(this.#adaptiveEstimate() - this.#builtEstimate) >= ESTIMATE_DRIFT
    )
      this.#scheduleRebuild();

    this.#requestRender();
  }

  #queueAnchor(delta: number): void {
    this.#pendingAnchor += delta;
    if (this.#anchorScheduled) return;
    this.#anchorScheduled = true;
    queueMicrotask(() => {
      this.#anchorScheduled = false;
      const delta = this.#pendingAnchor;
      this.#pendingAnchor = 0;
      const el = this.#scrollEl;
      if (!el || this.#disposed || delta === 0) return;
      const raw = delta / this.#scale; // content px -> scroll-element px
      if (this.#horizontal) {
        const rtl = getComputedStyle(el).direction === 'rtl';
        el.scrollLeft += rtl ? -raw : raw;
      } else {
        el.scrollTop += raw;
      }
      this.#offset = this.#readOffset(el);
      this.#requestRender();
    });
  }

  /** The adaptive estimate drifted: re-estimate every unmeasured item, keeping the viewport anchored. */
  #scheduleRebuild(): void {
    if (this.#rebuildScheduled) return;
    this.#rebuildScheduled = true;
    queueMicrotask(() => {
      this.#rebuildScheduled = false;
      if (this.#disposed || !this.#sums || this.#options.count === 0) return;
      const anchor = this.#indexAt(
        Math.max(0, this.#offset - this.#paddingStart),
      );
      const before = this.#offsetOf(anchor);
      this.#dirty = true;
      this.#ensureIndex();
      const shift = this.#offsetOf(anchor) - before;
      if (shift !== 0) this.#queueAnchor(shift);
      this.#requestRender();
    });
  }

  /** Stops observing elements that left the DOM (recycled out of the window). */
  #pruneObserved(): void {
    for (const [element, unobserve] of this.#observed) {
      if (element.isConnected) continue;
      unobserve();
      this.#observed.delete(element);
    }
  }
}
