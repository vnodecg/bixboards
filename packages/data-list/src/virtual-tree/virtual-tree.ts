import {
  css,
  html,
  nothing,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { BixElement, VirtualizerController } from '@bixant/core';

type Key = string | number;
type Selection = 'none' | 'single' | 'multiple' | 'leaf';

/** A tree node. Nested (`children`) or flat (`parentId` pointing at another node's key). */
export interface TreeNode<T = unknown> {
  id?: Key;
  label: string;
  children?: TreeNode<T>[];
  /** Flat mode: the key of the parent node. */
  parentId?: Key;
  /** Lazy mode: the node has children that `data-source.getChildren` loads on first expand. */
  hasChildren?: boolean;
  disabled?: boolean;
  data?: T;
  [field: string]: unknown;
}

export interface TreeDataSource<T = unknown> {
  getChildren(key: Key, signal: AbortSignal): Promise<TreeNode<T>[]>;
}

/** What `renderNode` receives, for custom templates. */
export interface TreeNodeContext {
  key: Key;
  depth: number;
  expanded: boolean;
  selected: boolean | 'mixed';
  hasChildren: boolean;
}

const TYPEAHEAD_RESET_MS = 700;
/** Levels deeper than this are indented at a quarter of the step (§4: compress after depth 8). */
const FULL_INDENT_DEPTH = 8;

let nextId = 0;

/**
 * `<bx-virtual-tree>` — virtualized tree for 100k+ nodes with lazy children, filtering and
 * multi-selection (docs/features/data-list/virtual-tree.md). The data-driven counterpart to
 * `bx-tree`: nodes are plain objects and only the visible rows exist in the DOM.
 *
 * **Model (FR-VIRTUAL-TREE-01/03).** The tree is indexed once into pre-order arrays (parent,
 * depth, subtree end, leaf and selected-leaf counts). Because a subtree is a contiguous range,
 * the visible rows are produced by *skipping* collapsed subtrees (cost: visible rows, not total
 * nodes) and a branch's tri-state is two integers — toggling a branch updates its range and
 * walks the ancestors, never touching DOM or unrendered components. The visible-row array feeds
 * core's `VirtualizerController`; the row that has focus is pinned in the window.
 *
 * **Lazy loading (FR-VIRTUAL-TREE-04).** A node with `hasChildren: true` and no `children` loads on
 * first expand through `data-source.getChildren(key, signal)`, with a per-node loading/error
 * state: a failed node shows an error row and Enter/click retries. Without a data source the
 * element emits `bx-lazy-load` and the app answers with `setChildren(key, nodes)` /
 * `setLoadError(key)`.
 *
 * **Filtering (FR-VIRTUAL-TREE-02).** `filter` (a substring, case-insensitive, or a predicate)
 * keeps matches and their ancestors, and ancestors auto-expand. It runs on the main thread in one
 * linear pass over the pre-order arrays (no Worker); that is a few ms at 200k nodes.
 *
 * **Selection.** `single` (any node), `multiple` (a branch selects every leaf below it and shows a
 * mixed state while partly selected) and `leaf` (only leaves are selectable; clicking a branch
 * toggles it open). `selectedKeys` always lists leaf keys (or the one key in `single`).
 *
 * **Accessibility.** ARIA tree: `role="tree"`/`treeitem`, `aria-level`/`setsize`/`posinset`
 * computed from data, `aria-expanded`, `aria-selected`/`aria-checked`. Focus stays on the tree and
 * the active node is exposed with `aria-activedescendant`. Arrows/Home/End/`*`/typeahead per the
 * APG tree pattern; Space toggles selection, Enter activates.
 *
 * Gaps, per docs/features/_conventions.md's "say so inline" rule: tree-*table* mode (secondary
 * columns with priority hiding) is not implemented; the spec's `node` slot is the `renderNode`
 * property (a slotted template cannot be instantiated per node); `expand-icon`/`collapse-icon` slots
 * are not provided (the chevron is a CSS-rotated glyph).
 *
 * @fires bx-expand-change - `detail: { key, expanded }`.
 * @fires bx-selection-change - `detail: { selectedKeys }`.
 * @fires bx-node-click - A node was activated. `detail: { key, node }`.
 * @fires bx-lazy-load - A lazy node was expanded. `detail: { key, signal }`.
 * @fires bx-range-change - The rendered row range changed. `detail: { start, end }`.
 *
 * @slot empty - Shown when no node is visible.
 *
 * @csspart base - The outer container.
 * @csspart node - A row.
 * @csspart indent - The indentation (and guide) area of a row.
 * @csspart toggle - The expand/collapse chevron.
 * @csspart label - The node label.
 * @csspart guide - The vertical guide lines (via the indent area's background).
 *
 * @cssprop --bx-tree-indent - Indent per level.
 * @cssprop --bx-tree-row-height - Row height.
 */
export class BxVirtualTree<T = unknown> extends BixElement {
  static override tagName = 'bx-virtual-tree';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        font-family: var(--bx-font-family-sans);
        color: var(--bx-text-primary);
        min-block-size: 6rem;
      }

      :host([hidden]) {
        display: none;
      }

      .base {
        block-size: 100%;
        min-block-size: inherit;
        display: flex;
        flex-direction: column;
      }

      .tree {
        flex: 1;
        min-block-size: 0;
        overflow: auto;
        outline: none;
        position: relative;
        overscroll-behavior: contain;
      }

      .tree:focus-visible {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: calc(var(--bx-focus-ring-offset) * -1);
      }

      .spacer {
        position: relative;
        min-inline-size: 100%;
      }

      .node {
        position: absolute;
        inset-inline: 0;
        inset-block-start: 0;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: var(--bx-space-xs);
        min-block-size: var(--bx-tree-row-height, var(--bx-target-min, 2rem));
        padding-inline-end: var(--bx-space-s);
        cursor: pointer;
        white-space: nowrap;
      }

      .node:hover {
        background: var(--bx-surface-subtle);
      }

      .node[data-active] {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: calc(var(--bx-focus-ring-offset) * -1);
      }

      .node[aria-selected='true'] {
        background: color-mix(in srgb, var(--bx-role-accent) 14%, transparent);
      }

      .node[aria-disabled='true'] {
        color: var(--bx-text-disabled);
        cursor: not-allowed;
      }

      .indent {
        flex-shrink: 0;
        align-self: stretch;
        inline-size: calc(
          var(--level, 0) * var(--bx-tree-indent, var(--bx-space-m))
        );
      }

      :host([show-guides]) .indent {
        background-image: repeating-linear-gradient(
          to right,
          transparent 0,
          transparent
            calc(
              var(--bx-tree-indent, var(--bx-space-m)) - var(--bx-border-width)
            ),
          var(--bx-border-subtle)
            calc(
              var(--bx-tree-indent, var(--bx-space-m)) - var(--bx-border-width)
            ),
          var(--bx-border-subtle) var(--bx-tree-indent, var(--bx-space-m))
        );
      }

      .toggle {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 1.25em;
        block-size: 1.25em;
        color: var(--bx-text-secondary);
        transition: rotate var(--bx-motion-duration-fast)
          var(--bx-motion-easing-standard);
      }

      .toggle svg {
        inline-size: 0.75em;
        block-size: 0.75em;
        fill: currentColor;
      }

      .node[aria-expanded='true'] .toggle {
        rotate: 90deg;
      }

      :host(:dir(rtl)) .toggle svg {
        transform: scaleX(-1);
      }

      .check {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 1.1em;
        block-size: 1.1em;
        border: var(--bx-border-width-strong) solid var(--bx-border-strong);
        border-radius: var(--bx-radius-s, 3px);
        font-size: 0.8em;
        line-height: 1;
        background: var(--bx-surface-base);
      }

      .check[data-state='true'],
      .check[data-state='mixed'] {
        background: var(--bx-role-accent);
        border-color: var(--bx-role-accent);
        color: var(--bx-role-accent-contrast, #fff);
      }

      .label {
        flex: 1;
        min-inline-size: 0;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .status {
        color: var(--bx-text-secondary);
        font-size: var(--bx-font-s);
      }

      .status[data-error] {
        color: var(--bx-role-danger-fg);
      }

      .empty {
        padding: var(--bx-space-m);
        color: var(--bx-text-secondary);
      }

      .sr {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        overflow: hidden;
        clip-path: inset(50%);
      }

      @media (prefers-reduced-motion: reduce) {
        .toggle {
          transition: none;
        }
      }

      @media (forced-colors: active) {
        .node[aria-selected='true'] {
          forced-color-adjust: none;
          background: Highlight;
          color: HighlightText;
        }
      }
    `,
  ];

  static override properties = {
    nodes: { attribute: false },
    dataSource: { attribute: false },
    nodeKey: { attribute: 'node-key' },
    expandedKeys: { attribute: false },
    selectedKeys: { attribute: false },
    selection: { type: String, reflect: true },
    filter: { attribute: false },
    rowHeight: { type: Number, attribute: 'row-height' },
    indent: { type: String },
    showGuides: { type: Boolean, reflect: true, attribute: 'show-guides' },
    renderNode: { attribute: false },
    ariaLabel: { type: String, attribute: 'aria-label' },
    _active: { state: true },
    _version: { state: true },
  };

  declare nodes: readonly TreeNode<T>[];
  declare dataSource?: TreeDataSource<T>;
  declare nodeKey: string;
  declare expandedKeys: Key[];
  declare selectedKeys: Key[];
  declare selection: Selection;
  declare filter?: string | ((node: TreeNode<T>) => boolean);
  declare rowHeight?: number;
  declare indent?: string;
  declare showGuides: boolean;
  declare renderNode?: (
    node: TreeNode<T>,
    context: TreeNodeContext,
  ) => TemplateResult | string;
  declare ariaLabel: string | null;
  /** @internal */
  declare _active: number;
  /** @internal */
  declare _version: number;

  #uid = `bx-virtual-tree-${nextId++}`;
  // Pre-order index.
  #nodes: TreeNode<T>[] = [];
  #keys: Key[] = [];
  #parent: number[] = [];
  #depth: number[] = [];
  #end: number[] = [];
  #leaves: number[] = [];
  #selCount: number[] = [];
  #isLeaf: boolean[] = [];
  #sibIndex: number[] = [];
  #sibCount: number[] = [];
  #lazy: boolean[] = [];
  #indexOf = new Map<Key, number>();
  #hit: Uint8Array = new Uint8Array(0);
  #descHit: Uint8Array = new Uint8Array(0);
  #filtering = false;
  // View state.
  #expanded = new Set<Key>();
  #selectedLeaves = new Set<Key>();
  #single: Key | null = null;
  #rows: number[] = [];
  #indexDirty = true;
  #rowsDirty = true;
  #loaded = new Map<Key, TreeNode<T>[]>();
  #loading = new Map<Key, AbortController>();
  #failed = new Set<Key>();
  #typeahead = '';
  #typeaheadTimer?: ReturnType<typeof setTimeout>;
  #lastRange = '';
  #activeKey: Key | null = null;
  #announce = '';

  #virtualizer = new VirtualizerController(this, {
    count: 0,
    getScrollElement: () => this.shadowRoot?.querySelector('.tree') ?? null,
    dynamic: true,
  });

  constructor() {
    super();
    this.nodes = [];
    this.nodeKey = 'id';
    this.expandedKeys = [];
    this.selectedKeys = [];
    this.selection = 'none';
    this.showGuides = true;
    this.ariaLabel = null;
    this._active = -1;
    this._version = 0;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    for (const controller of this.#loading.values()) controller.abort();
    this.#loading.clear();
    clearTimeout(this.#typeaheadTimer);
  }

  // --- Indexing --------------------------------------------------------------------------------

  #childrenOf(node: TreeNode<T>, key: Key): TreeNode<T>[] | undefined {
    return node.children ?? this.#loaded.get(key);
  }

  #keyOfNode(node: TreeNode<T>, fallback: Key): Key {
    const k = (node as Record<string, unknown>)[this.nodeKey] as
      Key | undefined;
    return k ?? fallback;
  }

  #reindex(): void {
    this.#indexDirty = false;
    const nodes: TreeNode<T>[] = [];
    const keys: Key[] = [];
    const parent: number[] = [];
    const depth: number[] = [];
    const sibIndex: number[] = [];
    const sibCount: number[] = [];
    const lazy: boolean[] = [];
    const isLeaf: boolean[] = [];

    // Flat (parentId) input is grouped by parent first.
    const flat = this.nodes.some((n) => n.parentId !== undefined);
    const byParent = new Map<Key | undefined, TreeNode<T>[]>();
    if (flat) {
      for (const n of this.nodes) {
        const list = byParent.get(n.parentId) ?? [];
        list.push(n);
        byParent.set(n.parentId, list);
      }
    }
    const roots = flat ? (byParent.get(undefined) ?? []) : this.nodes;
    let counter = 0;
    const stack: {
      node: TreeNode<T>;
      parent: number;
      depth: number;
      sib: number;
      count: number;
    }[] = [];
    for (let i = roots.length - 1; i >= 0; i--)
      stack.push({
        node: roots[i]!,
        parent: -1,
        depth: 0,
        sib: i,
        count: roots.length,
      });
    while (stack.length) {
      const { node, parent: p, depth: d, sib, count } = stack.pop()!;
      const key = this.#keyOfNode(node, `#${counter++}`);
      const index = nodes.length;
      const kids = flat ? byParent.get(key) : this.#childrenOf(node, key);
      const isLazy =
        !kids?.length && !!node.hasChildren && !this.#loaded.has(key);
      nodes.push(node);
      keys.push(key);
      parent.push(p);
      depth.push(d);
      sibIndex.push(sib);
      sibCount.push(count);
      lazy.push(isLazy);
      isLeaf.push(!kids?.length);
      if (kids?.length)
        for (let i = kids.length - 1; i >= 0; i--)
          stack.push({
            node: kids[i]!,
            parent: index,
            depth: d + 1,
            sib: i,
            count: kids.length,
          });
    }

    const n = nodes.length;
    const end = new Array<number>(n);
    const leaves = new Array<number>(n).fill(0);
    const selCount = new Array<number>(n).fill(0);
    const indexOf = new Map<Key, number>();
    for (let i = 0; i < n; i++) {
      end[i] = i + 1;
      indexOf.set(keys[i]!, i);
    }
    for (let i = n - 1; i >= 0; i--) {
      if (isLeaf[i]) {
        leaves[i] = 1;
        selCount[i] = this.#selectedLeaves.has(keys[i]!) ? 1 : 0;
      }
      const p = parent[i]!;
      if (p >= 0) {
        leaves[p]! += leaves[i]!;
        selCount[p]! += selCount[i]!;
        end[p] = Math.max(end[p]!, end[i]!);
      }
    }
    this.#nodes = nodes;
    this.#keys = keys;
    this.#parent = parent;
    this.#depth = depth;
    this.#end = end;
    this.#leaves = leaves;
    this.#selCount = selCount;
    this.#isLeaf = isLeaf;
    this.#sibIndex = sibIndex;
    this.#sibCount = sibCount;
    this.#lazy = lazy;
    this.#indexOf = indexOf;
    this.#computeFilter();
    this.#rowsDirty = true;
    this.#virtualizer.invalidate();
  }

  #computeFilter(): void {
    const f = this.filter;
    const n = this.#nodes.length;
    this.#filtering = !!f && (typeof f === 'function' || f.trim() !== '');
    if (!this.#filtering) return;
    const needle = typeof f === 'string' ? f.trim().toLowerCase() : '';
    const hit = new Uint8Array(n);
    const desc = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      const node = this.#nodes[i]!;
      if (
        typeof f === 'function'
          ? f(node)
          : node.label.toLowerCase().includes(needle)
      )
        hit[i] = 1;
    }
    // Parents precede children in pre-order, so one reverse pass propagates to every ancestor.
    for (let i = n - 1; i >= 0; i--) {
      const p = this.#parent[i]!;
      if (p >= 0 && (hit[i] || desc[i])) {
        hit[p] = 1;
        desc[p] = 1;
      }
    }
    this.#hit = hit;
    this.#descHit = desc;
  }

  #buildRows(): void {
    this.#rowsDirty = false;
    const rows: number[] = [];
    const n = this.#nodes.length;
    let i = 0;
    while (i < n) {
      if (this.#filtering && !this.#hit[i]) {
        i = this.#end[i]!;
        continue;
      }
      rows.push(i);
      const open =
        this.#expanded.has(this.#keys[i]!) ||
        (this.#filtering && !!this.#descHit[i]);
      i = open && (!this.#isLeaf[i] || this.#lazy[i]) ? i + 1 : this.#end[i]!;
    }
    this.#rows = rows;
    this.#virtualizer.invalidate();
    if (this.#activeKey !== null) {
      const at = this.#indexOf.get(this.#activeKey);
      this._active = at === undefined ? -1 : rows.indexOf(at);
    }
  }

  // --- Update ----------------------------------------------------------------------------------

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('expandedKeys')) {
      this.#expanded = new Set(this.expandedKeys);
      this.#rowsDirty = true;
    }
    if (changed.has('selectedKeys')) {
      this.#selectedLeaves = new Set(this.selectedKeys);
      if (this.selection === 'single')
        this.#single = this.selectedKeys[0] ?? null;
      this.#indexDirty = true;
    }
    if (
      changed.has('nodes') ||
      changed.has('nodeKey') ||
      changed.has('dataSource')
    ) {
      this.#loaded.clear();
      this.#failed.clear();
      this.#indexDirty = true;
    }
    if (changed.has('filter')) this.#indexDirty = true;
    if (changed.has('selection')) this.#indexDirty = true;
    if (this.#indexDirty) this.#reindex();
    if (this.#rowsDirty) this.#buildRows();

    this.#virtualizer.setOptions({
      count: this.#rows.length,
      getScrollElement: this.#getTree,
      dynamic: this.rowHeight === undefined,
      itemSize: this.rowHeight,
      overscan: 8,
      getItemKey: this.#getRowKey,
      pinnedIndexes: this._active >= 0 ? [this._active] : [],
    });
  }

  #getTree = (): Element | null =>
    this.shadowRoot?.querySelector('.tree') ?? null;
  #getRowKey = (row: number): Key => this.#keys[this.#rows[row]!] ?? row;

  protected override updated(): void {
    if (this.rowHeight === undefined)
      for (const el of this.shadowRoot!.querySelectorAll('.node[data-index]'))
        this.#virtualizer.measureElement(el);
    const tree = this.#getTree();
    if (tree) {
      const active =
        this._active >= 0 ? this.#keys[this.#rows[this._active]!] : undefined;
      if (active !== undefined)
        tree.setAttribute('aria-activedescendant', this.#id(this._active));
      else tree.removeAttribute('aria-activedescendant');
    }
    const { start, end } = this.#virtualizer.visibleRange;
    const signature = `${start}:${end}`;
    if (signature !== this.#lastRange && this.#rows.length > 0) {
      this.#lastRange = signature;
      this.dispatchEvent(
        new CustomEvent('bx-range-change', {
          bubbles: true,
          composed: true,
          detail: { start, end },
        }),
      );
    }
  }

  #id(row: number): string {
    return `${this.#uid}-r${row}`;
  }

  #refresh(): void {
    this._version++;
  }

  // --- Public API ------------------------------------------------------------------------------

  /** Number of nodes currently visible (after collapse/filter). */
  get visibleCount(): number {
    if (this.#indexDirty) this.#reindex();
    if (this.#rowsDirty) this.#buildRows();
    return this.#rows.length;
  }

  expand(key: Key): void {
    this.#setExpanded(key, true);
  }

  collapse(key: Key): void {
    this.#setExpanded(key, false);
  }

  /** Expands every branch down to `depth` levels (0 = roots only). Default: all. */
  expandAll(depth = Infinity): void {
    if (this.#indexDirty) this.#reindex();
    const next = new Set(this.#expanded);
    for (let i = 0; i < this.#nodes.length; i++)
      if (!this.#isLeaf[i] && this.#depth[i]! <= depth)
        next.add(this.#keys[i]!);
    this.#expanded = next;
    this.expandedKeys = [...next];
    this.#rowsDirty = true;
    this.#refresh();
  }

  collapseAll(): void {
    this.#expanded = new Set();
    this.expandedKeys = [];
    this.#rowsDirty = true;
    this.#refresh();
  }

  scrollToKey(
    key: Key,
    align: 'start' | 'center' | 'end' | 'auto' = 'auto',
  ): void {
    if (this.#indexDirty) this.#reindex();
    const index = this.#indexOf.get(key);
    if (index === undefined) return;
    // Reveal: expand every ancestor.
    let p = this.#parent[index]!;
    const toOpen: Key[] = [];
    while (p >= 0) {
      if (!this.#expanded.has(this.#keys[p]!)) toOpen.push(this.#keys[p]!);
      p = this.#parent[p]!;
    }
    if (toOpen.length) {
      for (const k of toOpen) this.#expanded.add(k);
      this.expandedKeys = [...this.#expanded];
      this.#rowsDirty = true;
    }
    if (this.#rowsDirty) this.#buildRows();
    const row = this.#rows.indexOf(index);
    if (row >= 0) {
      void this.updateComplete.then(() =>
        this.#virtualizer.scrollToIndex(row, { align }),
      );
      this.#refresh();
    }
  }

  /** Discards lazily-loaded children and errors, and rebuilds the tree from `nodes`. */
  refresh(): void {
    this.#loaded.clear();
    this.#failed.clear();
    this.#indexDirty = true;
    this.#refresh();
  }

  /** Supplies children for a lazy node (when not using `data-source`). */
  setChildren(key: Key, children: TreeNode<T>[]): void {
    this.#loaded.set(key, children);
    this.#failed.delete(key);
    this.#loading.delete(key);
    this.#indexDirty = true;
    this.#refresh();
  }

  /** Marks a lazy node's load as failed; its row offers a retry. */
  setLoadError(key: Key): void {
    this.#failed.add(key);
    this.#loading.delete(key);
    this.#refresh();
  }

  // --- Expansion / lazy ------------------------------------------------------------------------

  #setExpanded(key: Key, expanded: boolean): void {
    if (this.#indexDirty) this.#reindex();
    const index = this.#indexOf.get(key);
    if (index === undefined || this.#expanded.has(key) === expanded) return;
    if (this.#isLeaf[index] && !this.#lazy[index]) return;
    if (expanded) this.#expanded.add(key);
    else this.#expanded.delete(key);
    this.expandedKeys = [...this.#expanded];
    this.#rowsDirty = true;
    this.dispatchEvent(
      new CustomEvent('bx-expand-change', {
        bubbles: true,
        composed: true,
        detail: { key, expanded },
      }),
    );
    if (expanded && this.#lazy[index]) void this.#loadChildren(key);
    this.#refresh();
  }

  async #loadChildren(key: Key): Promise<void> {
    if (this.#loading.has(key)) return;
    const controller = new AbortController();
    this.#loading.set(key, controller);
    this.#failed.delete(key);
    this.dispatchEvent(
      new CustomEvent('bx-lazy-load', {
        bubbles: true,
        composed: true,
        detail: { key, signal: controller.signal },
      }),
    );
    const source = this.dataSource;
    if (!source) {
      this.#refresh();
      return; // The app answers with setChildren()/setLoadError().
    }
    this.#refresh();
    try {
      const children = await source.getChildren(key, controller.signal);
      if (controller.signal.aborted) return;
      this.setChildren(key, children);
      this.#announce = `Loaded ${children.length} items`;
    } catch {
      if (!controller.signal.aborted) this.setLoadError(key);
    }
  }

  // --- Selection -------------------------------------------------------------------------------

  #stateOf(index: number): boolean | 'mixed' {
    if (this.selection === 'single') return this.#single === this.#keys[index];
    const sel = this.#selCount[index]!;
    const total = this.#leaves[index]!;
    return sel === 0 ? false : sel >= total ? true : 'mixed';
  }

  #selectable(index: number): boolean {
    if (this.#nodes[index]!.disabled) return false;
    if (this.selection === 'none') return false;
    if (this.selection === 'leaf')
      return this.#isLeaf[index]! && !this.#lazy[index]!;
    return true;
  }

  #toggleSelection(index: number): void {
    if (!this.#selectable(index)) return;
    if (this.selection === 'single') {
      const key = this.#keys[index]!;
      this.#single = this.#single === key ? null : key;
      this.selectedKeys = this.#single === null ? [] : [this.#single];
    } else {
      const select = this.#selCount[index]! < this.#leaves[index]!;
      const end = this.#end[index]!;
      const delta =
        (select ? this.#leaves[index]! : 0) - this.#selCount[index]!;
      for (let j = index; j < end; j++) {
        if (this.#isLeaf[j]) {
          if (select) this.#selectedLeaves.add(this.#keys[j]!);
          else this.#selectedLeaves.delete(this.#keys[j]!);
        }
        this.#selCount[j] = select ? this.#leaves[j]! : 0;
      }
      // Aggregate counts: only the ancestor path is touched, never the rest of the tree.
      for (let p = this.#parent[index]!; p >= 0; p = this.#parent[p]!)
        this.#selCount[p]! += delta;
      this.selectedKeys = [...this.#selectedLeaves];
    }
    this.dispatchEvent(
      new CustomEvent('bx-selection-change', {
        bubbles: true,
        composed: true,
        detail: { selectedKeys: this.selectedKeys },
      }),
    );
    this.#refresh();
  }

  // --- Interaction -----------------------------------------------------------------------------

  #rowFromEvent(event: Event): number {
    for (const node of event.composedPath())
      if (node instanceof HTMLElement && node.dataset['row'] !== undefined)
        return Number(node.dataset['row']);
    return -1;
  }

  #setActive(row: number, scroll = true): void {
    if (row < 0 || row >= this.#rows.length) return;
    this._active = row;
    this.#activeKey = this.#keys[this.#rows[row]!]!;
    if (scroll) this.#virtualizer.scrollToIndex(row, { align: 'auto' });
  }

  #activate(row: number, fromKeyboard = false): void {
    const index = this.#rows[row];
    if (index === undefined) return;
    this.#setActive(row, false);
    const key = this.#keys[index]!;
    if (this.#failed.has(key)) {
      this.#failed.delete(key);
      this.#loading.delete(key);
      void this.#loadChildren(key);
      return;
    }
    this.dispatchEvent(
      new CustomEvent('bx-node-click', {
        bubbles: true,
        composed: true,
        detail: { key, node: this.#nodes[index] },
      }),
    );
    if (this.#selectable(index)) {
      this.#toggleSelection(index);
    } else if (!this.#isLeaf[index] || this.#lazy[index]) {
      this.#setExpanded(key, !this.#expanded.has(key));
    }
    void fromKeyboard;
  }

  #handleClick = (event: MouseEvent): void => {
    const row = this.#rowFromEvent(event);
    if (row < 0) return;
    const index = this.#rows[row]!;
    const onToggle = event
      .composedPath()
      .some((n) => n instanceof HTMLElement && n.classList.contains('toggle'));
    if (onToggle) {
      this.#setActive(row, false);
      this.#setExpanded(
        this.#keys[index]!,
        !this.#expanded.has(this.#keys[index]!),
      );
      return;
    }
    this.#activate(row);
  };

  #handleKeydown = (event: KeyboardEvent): void => {
    const rows = this.#rows;
    if (rows.length === 0) return;
    const current = this._active < 0 ? 0 : this._active;
    const index = rows[current]!;
    const key = this.#keys[index]!;
    const expanded = this.#expanded.has(key);
    const branch = !this.#isLeaf[index] || this.#lazy[index];
    const pageSize = Math.max(
      1,
      Math.floor((this.#getTree()?.clientHeight ?? 320) / 32),
    );

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.#setActive(
          this._active < 0 ? 0 : Math.min(rows.length - 1, current + 1),
        );
        return;
      case 'ArrowUp':
        event.preventDefault();
        this.#setActive(Math.max(0, current - 1));
        return;
      case 'ArrowRight':
      case 'ArrowLeft': {
        const rtl = getComputedStyle(this).direction === 'rtl';
        const open = (event.key === 'ArrowRight') !== rtl;
        event.preventDefault();
        if (open) {
          if (branch && !expanded) this.#setExpanded(key, true);
          else if (branch && expanded)
            this.#setActive(Math.min(rows.length - 1, current + 1));
        } else if (branch && expanded) {
          this.#setExpanded(key, false);
        } else {
          const p = this.#parent[index]!;
          if (p >= 0) this.#setActive(rows.indexOf(p));
        }
        return;
      }
      case 'Home':
        event.preventDefault();
        this.#setActive(0);
        return;
      case 'End':
        event.preventDefault();
        this.#setActive(rows.length - 1);
        return;
      case 'PageDown':
        event.preventDefault();
        this.#setActive(Math.min(rows.length - 1, current + pageSize));
        return;
      case 'PageUp':
        event.preventDefault();
        this.#setActive(Math.max(0, current - pageSize));
        return;
      case 'Enter':
        event.preventDefault();
        this.#activate(current, true);
        return;
      case ' ':
        if (this.#typeahead) break;
        event.preventDefault();
        if (this._active < 0) this.#setActive(0);
        this.#toggleSelection(rows[this._active < 0 ? 0 : this._active]!);
        return;
      case '*': {
        event.preventDefault();
        const p = this.#parent[index]!;
        for (let i = 0; i < this.#nodes.length; i++)
          if (this.#parent[i] === p && (!this.#isLeaf[i] || this.#lazy[i]))
            this.#setExpanded(this.#keys[i]!, true);
        return;
      }
      case 'a':
      case 'A':
        if ((event.ctrlKey || event.metaKey) && this.selection === 'multiple') {
          event.preventDefault();
          for (let i = 0; i < this.#nodes.length; i++)
            if (this.#parent[i] === -1 && this.#selCount[i]! < this.#leaves[i]!)
              this.#toggleSelection(i);
          return;
        }
        break;
    }
    if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      event.preventDefault();
      this.#typeaheadJump(event.key);
    }
  };

  #typeaheadJump(character: string): void {
    clearTimeout(this.#typeaheadTimer);
    this.#typeahead += character.toLowerCase();
    this.#typeaheadTimer = setTimeout(
      () => (this.#typeahead = ''),
      TYPEAHEAD_RESET_MS,
    );
    const n = this.#rows.length;
    const start = this._active + (this.#typeahead.length === 1 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const row = (Math.max(start, 0) + i) % n;
      if (
        this.#nodes
          [this.#rows[row]!]!.label.toLowerCase()
          .startsWith(this.#typeahead)
      ) {
        this.#setActive(row);
        return;
      }
    }
  }

  // --- Render ----------------------------------------------------------------------------------

  #renderRow(rowIndex: number, start: number) {
    const index = this.#rows[rowIndex]!;
    const node = this.#nodes[index]!;
    const key = this.#keys[index]!;
    const depth = this.#depth[index]!;
    const branch = !this.#isLeaf[index] || this.#lazy[index]!;
    const expanded =
      this.#expanded.has(key) || (this.#filtering && !!this.#descHit[index]);
    const state = this.selection === 'none' ? undefined : this.#stateOf(index);
    const checkable =
      this.selection === 'multiple' ||
      (this.selection === 'leaf' && this.#selectable(index));
    const loading = this.#loading.has(key) && !this.#failed.has(key);
    const failed = this.#failed.has(key);
    const level =
      depth < FULL_INDENT_DEPTH
        ? depth
        : FULL_INDENT_DEPTH + (depth - FULL_INDENT_DEPTH) * 0.25;
    const height =
      this.rowHeight === undefined ? '' : `block-size: ${this.rowHeight}px;`;
    const ctx: TreeNodeContext = {
      key,
      depth,
      expanded,
      selected: state ?? false,
      hasChildren: branch,
    };
    return html`<div
      class="node"
      part="node"
      id=${this.#id(rowIndex)}
      role="treeitem"
      data-row=${rowIndex}
      data-index=${rowIndex}
      aria-level=${depth + 1}
      aria-setsize=${this.#sibCount[index]!}
      aria-posinset=${this.#sibIndex[index]! + 1}
      aria-expanded=${branch ? String(expanded) : nothing}
      aria-selected=${this.selection === 'single' ? String(state === true) : nothing}
      aria-checked=${
        state !== undefined && this.selection !== 'single' && checkable
          ? String(state)
          : nothing
      }
      aria-disabled=${node.disabled ? 'true' : nothing}
      ?data-active=${rowIndex === this._active}
      style="${height}transform: translateY(${start}px)"
    >
      <span class="indent" part="indent" style="--level: ${level}"></span>
      <span class="toggle" part="toggle" aria-hidden="true"
        >${
          branch
            ? html`<svg viewBox="0 0 256 256">
                <path
                  d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"
                ></path>
              </svg>`
            : nothing
        }</span
      >
      ${
        checkable
          ? html`<span
              class="check"
              aria-hidden="true"
              data-state=${String(state)}
              >${state === true ? '✓' : state === 'mixed' ? '–' : ''}</span
            >`
          : nothing
      }
      <span class="label" part="label"
        >${this.renderNode ? this.renderNode(node, ctx) : node.label}</span
      >
      ${loading ? html`<span class="status">Loading…</span>` : nothing}
      ${
        failed
          ? html`<span class="status" data-error
              >Failed to load. Press Enter to retry.</span
            >`
          : nothing
      }
    </div>`;
  }

  protected override render() {
    const rows = this.#rows;
    const items = this.#virtualizer.items;
    const empty = rows.length === 0;
    return html`
      <div class="base" part="base">
        <div
          class="tree"
          role="tree"
          tabindex="0"
          aria-label=${this.ariaLabel ?? nothing}
          aria-multiselectable=${
            this.selection === 'multiple' || this.selection === 'leaf'
              ? 'true'
              : nothing
          }
          @click=${this.#handleClick}
          @keydown=${this.#handleKeydown}
        >
          <div
            class="spacer"
            role="presentation"
            style="block-size: ${this.#virtualizer.totalSize}px"
          >
            ${repeat(
              items,
              (item) => item.key,
              (item) =>
                rows[item.index] === undefined
                  ? nothing
                  : this.#renderRow(item.index, item.start),
            )}
          </div>
          ${empty ? html`<div class="empty"><slot name="empty">No items</slot></div>` : nothing}
        </div>
        <div class="sr" role="status" aria-live="polite">${this.#announce}</div>
      </div>
    `;
  }
}
