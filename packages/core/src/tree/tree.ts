import { css, html } from 'lit';
import { BixElement } from '../bix-element.ts';
import type { BxTreeItem } from '../tree-item/tree-item.ts';

type Selection = 'single' | 'multiple' | 'leaf';

const LARGE_TREE_WARNING_THRESHOLD = 500;

/**
 * `<bx-tree>` — hierarchical tree owning a default-slotted, arbitrarily nested set of
 * `bx-tree-item` (docs/features/core/tree.md).
 *
 * Supplies everything `bx-tree-item`'s own doc comment defers: `role="tree"` on the shadow
 * wrapper (slot-flattening already makes light-DOM, and nested-shadow-root, `bx-tree-item`s
 * register as its accessible descendants — the same mechanism `bx-tab-group`'s `role="tablist"`
 * relies on), `role="treeitem"`/`aria-level`/`aria-setsize`/`aria-posinset`/`aria-expanded`/
 * `aria-selected` on each item's host, and roving tabindex + full keyboard navigation
 * (FR-TREE-02: arrow keys, Home/End, typeahead, `*` to expand siblings).
 *
 * Roving tabindex needs `bx-tree-item`'s `roving` property: standalone, its expand-button and
 * checkbox are each their own tab stop (that component's own doc comment); once wrapped here,
 * APG's tree pattern wants exactly one tab stop per visible row, on the row itself, not its
 * controls — `roving` (set on every item below) tells `bx-tree-item` to stop making those two
 * controls independently focusable, and this element puts the host's own `tabIndex` on whichever
 * item is current instead. Expanding/collapsing still routes through `bx-tree-item`'s own private
 * lazy-load state machine (`bx-lazy-load`/`bx-lazy-change`) rather than reimplementing it — this
 * element simulates a click on that item's own expand button (`shadowRoot.querySelector`) instead
 * of touching `expanded` directly, the one place this component reaches into a child's shadow
 * root rather than using a property it exposes.
 *
 * The checkbox-tree tri-state pattern (FR-TREE-01) here is a deliberate deviation from APG's own
 * "checkbox tree" pattern, which expects `aria-checked` on the treeitem itself with *no* separate
 * focusable checkbox control — `bx-tree-item` already ships a real nested `role="checkbox"`
 * (accepted at the Tier 1 level for standalone usability, docs/features/IMPLEMENTATION.md), so
 * this element cascades selection through it rather than replacing it. Flagged here per
 * docs/features/_conventions.md's "say so inline" rule rather than silently assumed compliant.
 *
 * FR-TREE-03's node-count warning fires once per instance the same way `bx-format-date`/
 * `bx-relative-time` warn on bad input: a plain `console.warn`, no dev/prod build-mode gate (this
 * package has no such infra yet).
 *
 * @fires bx-selection-change - `selected`'s set changed. `detail: { selection: BxTreeItem[] }`.
 *
 * @slot (default) - `bx-tree-item` elements.
 *
 * @csspart base - The `role="tree"` wrapper.
 */
export class BxTree extends BixElement {
  static override tagName = 'bx-tree';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        font-family: var(--bx-font-family-sans);
      }

      .base {
        display: flex;
        flex-direction: column;
      }
    `,
  ];

  static override properties = {
    selection: { type: String },
    expandSelector: { type: String, attribute: 'expand-selector' },
  };

  declare selection: Selection;
  declare expandSelector: string;

  #activeItem: BxTreeItem | null = null;
  #typeaheadBuffer = '';
  #typeaheadTimer?: ReturnType<typeof setTimeout>;
  #hasWarnedLargeTree = false;

  constructor() {
    super();
    this.selection = 'single';
    this.expandSelector = '';

    this.addEventListener('click', this.#handleClick);
    this.addEventListener('change', this.#handleChange);
    this.addEventListener('keydown', this.#handleKeydown);
  }

  #items(): BxTreeItem[] {
    return [...this.querySelectorAll('bx-tree-item')] as unknown as BxTreeItem[];
  }

  #isTreeItem(node: Element | null): node is BxTreeItem {
    return node?.tagName === 'BX-TREE-ITEM';
  }

  #directChildren(parent: BxTreeItem | this): BxTreeItem[] {
    return [...parent.children].filter((child): child is BxTreeItem => this.#isTreeItem(child));
  }

  #parentItem(item: BxTreeItem): BxTreeItem | null {
    return this.#isTreeItem(item.parentElement) ? item.parentElement : null;
  }

  #isLeaf(item: BxTreeItem): boolean {
    return this.#directChildren(item).length === 0;
  }

  #isVisible(item: BxTreeItem): boolean {
    let ancestor = this.#parentItem(item);
    while (ancestor) {
      if (!ancestor.expanded) return false;
      ancestor = this.#parentItem(ancestor);
    }
    return true;
  }

  #visibleItems(): BxTreeItem[] {
    return this.#items().filter((item) => this.#isVisible(item));
  }

  #depth(item: BxTreeItem): number {
    let depth = 0;
    let ancestor = this.#parentItem(item);
    while (ancestor) {
      depth++;
      ancestor = this.#parentItem(ancestor);
    }
    return depth;
  }

  #handleSlotChange = (): void => this.#sync();

  protected override firstUpdated(): void {
    this.#sync();
  }

  #sync(): void {
    const items = this.#items();

    if (!this.#hasWarnedLargeTree && items.length > LARGE_TREE_WARNING_THRESHOLD) {
      this.#hasWarnedLargeTree = true;
      console.warn(
        `<bx-tree>: rendering ${items.length} nodes; consider <bx-virtual-tree> for trees this large.`,
      );
    }

    for (const item of items) {
      item.roving = true;
      item.setAttribute('role', 'treeitem');
      item.setAttribute('aria-level', String(this.#depth(item) + 1));

      const siblings = this.#parentItem(item)
        ? this.#directChildren(this.#parentItem(item)!)
        : this.#directChildren(this);
      item.setAttribute('aria-setsize', String(siblings.length));
      item.setAttribute('aria-posinset', String(siblings.indexOf(item) + 1));

      if (this.#isLeaf(item)) item.removeAttribute('aria-expanded');
      else item.setAttribute('aria-expanded', String(item.expanded));

      if (this.selection === 'leaf' && !this.#isLeaf(item))
        item.removeAttribute('aria-selected');
      else item.setAttribute('aria-selected', String(item.selected));
    }

    const visible = this.#visibleItems();
    if (!this.#activeItem || !visible.includes(this.#activeItem))
      this.#activeItem = visible[0] ?? null;
    for (const item of items) item.tabIndex = item === this.#activeItem ? 0 : -1;
  }

  #setActive(item: BxTreeItem, focus = true): void {
    this.#activeItem = item;
    for (const candidate of this.#items()) candidate.tabIndex = candidate === item ? 0 : -1;
    if (focus) item.focus();
  }

  #selectExclusive(item: BxTreeItem): void {
    for (const other of this.#items()) other.selected = other === item;
    this.#sync();
    this.#dispatchSelectionChange();
  }

  // FR-TREE-01: toggling a node in multiple mode cascades its (new) value to every descendant,
  // then recomputes each ancestor's tri-state from its own direct children (all selected →
  // selected; none selected/indeterminate → unselected; anything else → indeterminate).
  #toggleCascade(item: BxTreeItem): void {
    item.selected = !item.selected;
    this.#cascadeFrom(item);
  }

  // Same as `#toggleCascade`, but for callers where `item.selected` is already the new value
  // (the checkbox's own `change` handler — `bx-tree-item` already flipped it before dispatching).
  #cascadeFrom(item: BxTreeItem): void {
    const next = item.selected;
    item.indeterminate = false;
    const setDescendants = (node: BxTreeItem): void => {
      for (const child of this.#directChildren(node)) {
        child.selected = next;
        child.indeterminate = false;
        setDescendants(child);
      }
    };
    setDescendants(item);

    let ancestor = this.#parentItem(item);
    while (ancestor) {
      const children = this.#directChildren(ancestor);
      const allSelected = children.every((child) => child.selected && !child.indeterminate);
      const noneSelected = children.every((child) => !child.selected && !child.indeterminate);
      ancestor.selected = allSelected;
      ancestor.indeterminate = !allSelected && !noneSelected;
      ancestor = this.#parentItem(ancestor);
    }

    this.#sync();
    this.#dispatchSelectionChange();
  }

  #dispatchSelectionChange(): void {
    const selection = this.#items().filter((item) => item.selected);
    this.dispatchEvent(
      new CustomEvent('bx-selection-change', {
        bubbles: true,
        composed: true,
        detail: { selection },
      }),
    );
  }

  #clickExpandButton(item: BxTreeItem): void {
    item.shadowRoot?.querySelector<HTMLButtonElement>('.expand-button')?.click();
  }

  #handleClick = (event: MouseEvent): void => {
    const item = (event.target as Element)?.closest?.('bx-tree-item') as BxTreeItem | null;
    if (!item || !this.#items().includes(item) || item.disabled) return;
    this.#setActive(item, false);

    if (this.expandSelector && (event.target as Element).matches?.(this.expandSelector)) {
      this.#clickExpandButton(item);
      return;
    }

    if (this.selection === 'leaf') {
      if (!this.#isLeaf(item)) this.#clickExpandButton(item);
      else this.#selectExclusive(item);
      return;
    }
    if (this.selection === 'single') {
      this.#selectExclusive(item);
      return;
    }
    this.#toggleCascade(item);
  };

  // The checkbox stops its own `click` from bubbling (see `bx-tree-item`'s doc comment) and
  // dispatches `change` instead — already toggled by the time this runs, so this only needs to
  // cascade/resync, the same tail end `#toggleCascade`/`#selectExclusive` reach.
  #handleChange = (event: Event): void => {
    const item = (event.target as Element)?.closest?.('bx-tree-item') as BxTreeItem | null;
    if (!item || !this.#items().includes(item)) return;
    if (this.selection === 'multiple') this.#cascadeFrom(item);
    else this.#selectExclusive(item);
  };

  #moveTo(item: BxTreeItem | undefined): void {
    if (item) this.#setActive(item);
  }

  #handleKeydown = (event: KeyboardEvent): void => {
    const item = (event.target as Element)?.closest?.('bx-tree-item') as BxTreeItem | null;
    if (!item || !this.#items().includes(item)) return;

    const visible = this.#visibleItems();
    const index = visible.indexOf(item);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.#moveTo(visible[index + 1]);
        return;
      case 'ArrowUp':
        event.preventDefault();
        this.#moveTo(visible[index - 1]);
        return;
      case 'Home':
        event.preventDefault();
        this.#moveTo(visible[0]);
        return;
      case 'End':
        event.preventDefault();
        this.#moveTo(visible[visible.length - 1]);
        return;
      case 'ArrowRight':
        event.preventDefault();
        if (!this.#isLeaf(item) || item.lazy) {
          if (!item.expanded) this.#clickExpandButton(item);
          else this.#moveTo(this.#directChildren(item)[0]);
        }
        return;
      case 'ArrowLeft':
        event.preventDefault();
        if (item.expanded) this.#clickExpandButton(item);
        else this.#moveTo(this.#parentItem(item) ?? undefined);
        return;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.selection === 'leaf' && !this.#isLeaf(item)) this.#clickExpandButton(item);
        else if (this.selection === 'multiple') this.#toggleCascade(item);
        else this.#selectExclusive(item);
        return;
      case '*': {
        event.preventDefault();
        const siblings = this.#parentItem(item)
          ? this.#directChildren(this.#parentItem(item)!)
          : this.#directChildren(this);
        for (const sibling of siblings)
          if (!sibling.expanded && (!this.#isLeaf(sibling) || sibling.lazy))
            this.#clickExpandButton(sibling);
        return;
      }
      default:
        this.#handleTypeahead(event, visible, index);
    }
  };

  #handleTypeahead(event: KeyboardEvent, visible: BxTreeItem[], index: number): void {
    if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
    clearTimeout(this.#typeaheadTimer);
    this.#typeaheadBuffer += event.key.toLowerCase();
    this.#typeaheadTimer = setTimeout(() => (this.#typeaheadBuffer = ''), 500);

    const ordered = [...visible.slice(index + 1), ...visible.slice(0, index + 1)];
    const match = ordered.find((candidate) =>
      candidate.textContent?.trim().toLowerCase().startsWith(this.#typeaheadBuffer),
    );
    if (match) {
      event.preventDefault();
      this.#setActive(match);
    }
  }

  protected override render() {
    return html`
      <div class="base" part="base" role="tree">
        <slot @slotchange=${this.#handleSlotChange}></slot>
      </div>
    `;
  }
}
