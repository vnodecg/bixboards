import { css, html, nothing, type PropertyValues } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { repeat } from 'lit/directives/repeat.js';
import { BixElement } from '../bix-element.ts';
import { BxDropdownItem } from '../dropdown-item/dropdown-item.ts';
import type { BxPopup, Placement } from '../popup/popup.ts';
import { VirtualizerController } from '../virtualizer/virtualizer-controller.ts';

type Size = 'small' | 'medium' | 'large';
type HideSource =
  'trigger' | 'light-dismiss' | 'keyboard' | 'select' | 'focus-out' | 'method';

/**
 * Data-driven menu entry. Only needed for large menus: unlike slotted `bx-dropdown-item`s it
 * creates no element until it is inside the rendered window.
 */
export interface DropdownItemData {
  label?: string;
  value?: string;
  type?: 'normal' | 'checkbox' | 'radio';
  /** Radio items sharing a `name` are mutually exclusive. */
  name?: string;
  checked?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'error';
  /** Trailing hint, e.g. a shortcut. */
  details?: string;
  /** Renders a separator instead of an item. */
  divider?: boolean;
  /** Renders a non-interactive heading instead of an item. */
  heading?: string;
}

const TYPEAHEAD_RESET_MS = 700;
const OVERSCAN = 6;
const FOCUS_RETRIES = 4;

const isItemRow = (row: DropdownItemData): boolean =>
  !row.divider && row.heading === undefined;

let nextId = 0;

/**
 * `<bx-dropdown>` — anchors a menu of `bx-dropdown-item`s to a trigger, positioned by an internal
 * `bx-popup` (flip, shift, available-height sizing). Keyboard navigable (arrows with wrap,
 * Home/End, typeahead, Escape returns focus to the trigger), with checkbox, radio and nested
 * submenu items (docs/features/core/dropdown.md).
 *
 * **Focus model.** Real DOM focus moves onto the items (roving, programmatic) as the menu pattern
 * in the ARIA APG describes; the trigger gets `aria-haspopup="menu"`/`aria-expanded` and the
 * menu is `aria-labelledby` the trigger. Tab closes the menu and lets focus continue from the
 * trigger; outside clicks and focus leaving close it.
 *
 * **Two ways to supply items.** Slotted `bx-dropdown-item`/`bx-divider` children (the default), or
 * the `items` data array. Only the data path can be virtualized (FR-DROPDOWN-05): with `virtual`
 * set and more than `virtual-threshold` entries, just the rows in the visible window exist in the
 * DOM, the row holding focus is pinned so scrolling never drops it, and typeahead, Home/End and
 * `aria-setsize`/`aria-posinset` all run over the full array. Slotted children cannot be
 * windowed — they are the consumer's elements — so `virtual` has no effect on them. Data items
 * are flat (no submenus), and their `checked` state is held by the dropdown so it survives node
 * recycling; assign a new `items` array to reset it.
 *
 * **Deviations / gaps, per docs/features/_conventions.md's "say so inline" rule:**
 * - The `items` property, `focusable-disabled` (FR-DROPDOWN-ITEM-02, read by the items through
 *   `closest()`), `type="radio"` items and the `reserve checkmark` handling for data rows are
 *   additions to the spec's tables.
 * - §5's narrow-container bottom sheet (`sheet-narrow`) is not implemented; the menu is always a
 *   popup that flips and shifts to stay in the viewport.
 * - The trigger is expected to be a button-like control (`bx-button`, `<button>`): Enter/Space
 *   activate it through its own click, so they are not re-handled here.
 *
 * @fires bx-show - The menu is opening. Cancelable.
 * @fires bx-after-show - The menu opened and focus moved into it.
 * @fires bx-hide - The menu is closing via `hide()` (outside click, Escape, selection, ...).
 *   Cancelable. `detail.source` names the cause.
 * @fires bx-after-hide - The menu closed.
 * @fires bx-select - An item was activated. `detail.item` is the chosen element (for data rows
 *   it can be recycled later, so also use `detail.data`/`detail.index`/`detail.value`).
 *
 * @slot trigger - The element that opens the menu.
 * @slot - `bx-dropdown-item`, `bx-divider` and heading elements.
 *
 * @csspart base - The popup wrapping the menu.
 * @csspart menu - The scrollable `role="menu"` element.
 *
 * @cssprop --bx-dropdown-width - Menu width. Default `calc(var(--bx-unit) * 16)`.
 */
export class BxDropdown extends BixElement {
  static override tagName = 'bx-dropdown';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-block;
      }

      :host([hidden]) {
        display: none;
      }

      :host([size='small']) .menu {
        --bx-dropdown-item-height: max(
          var(--bx-control-height-s),
          var(--bx-target-min, 1.5rem)
        );
      }
      :host([size='large']) .menu {
        --bx-dropdown-item-height: max(
          var(--bx-control-height-l),
          var(--bx-target-min, 1.5rem)
        );
      }

      .menu {
        box-sizing: border-box;
        inline-size: var(--bx-dropdown-width, calc(var(--bx-unit, 1rem) * 16));
        max-block-size: min(
          var(--auto-size-available-height, 100vh),
          calc(var(--bx-unit, 1rem) * 40)
        );
        overflow-y: auto;
        overscroll-behavior: contain;
        padding-block: var(--bx-space-xs);
        border: var(--bx-border-width) solid var(--bx-border-subtle);
        border-radius: var(--bx-radius-m);
        box-shadow: var(--bx-shadow-m);
        background: var(--bx-surface-base);
        color: var(--bx-text-primary);
        font-family: var(--bx-font-family-sans);
        font-size: var(--bx-font-m);
        outline: none;
      }

      .rows {
        position: relative;
      }

      .row-abs {
        position: absolute;
        inset-inline: 0;
        inset-block-start: 0;
      }

      .row hr {
        margin-block: var(--bx-space-xs);
        border: 0;
        border-block-start: var(--bx-border-width) solid var(--bx-border-subtle);
      }

      .heading {
        padding-block: var(--bx-space-xs);
        padding-inline: var(--bx-space-s);
        color: var(--bx-text-secondary);
        font-size: var(--bx-font-s);
        font-weight: var(--bx-font-weight-medium);
      }

      ::slotted(bx-divider) {
        margin-block: var(--bx-space-xs);
      }

      @media (forced-colors: active) {
        .menu {
          forced-color-adjust: none;
          border-color: CanvasText;
          background: Canvas;
          color: CanvasText;
        }
      }
    `,
  ];

  static override properties = {
    open: { type: Boolean, reflect: true },
    placement: { type: String },
    distance: { type: Number },
    skidding: { type: Number },
    size: { type: String, reflect: true },
    virtual: { type: Boolean, reflect: true },
    virtualThreshold: { type: Number, attribute: 'virtual-threshold' },
    focusableDisabled: {
      type: Boolean,
      reflect: true,
      attribute: 'focusable-disabled',
    },
    items: { attribute: false },
  };

  declare open: boolean;
  declare placement: Placement;
  declare distance: number;
  declare skidding: number;
  declare size: Size;
  declare virtual: boolean;
  declare virtualThreshold: number;
  /** Disabled items stay reachable with the arrow keys (FR-DROPDOWN-ITEM-02). */
  declare focusableDisabled: boolean;
  /** Data-driven alternative to slotted items; required for virtualization. */
  declare items?: readonly DropdownItemData[];

  #uid = `bx-dropdown-${nextId++}`;
  #popupRef = createRef<BxPopup>();
  #menuRef = createRef<HTMLElement>();
  #trigger: Element | null = null;
  #openFocus: 'first' | 'last' | 'menu' = 'menu';
  #typeahead = '';
  #typeaheadTimer?: ReturnType<typeof setTimeout>;

  // Data mode.
  #checked = new Map<number, boolean>();
  #ordinals: number[] = [];
  #itemTotal = 0;
  #reserveCheckmark = false;
  #activeIndex = -1;
  #dataDirty = true;

  #virtualizer = new VirtualizerController(this, {
    count: 0,
    getScrollElement: () => this.#menuRef.value ?? null,
    dynamic: true,
    overscan: OVERSCAN,
  });

  constructor() {
    super();
    this.open = false;
    this.placement = 'bottom-start';
    this.distance = 0;
    this.skidding = 0;
    this.size = 'medium';
    this.virtual = false;
    this.virtualThreshold = 100;
    this.focusableDisabled = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#syncTrigger();
    if (this.open) this.#addDocumentListeners();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#removeDocumentListeners();
    this.#detachTrigger();
    clearTimeout(this.#typeaheadTimer);
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('items')) {
      this.#dataDirty = true;
      this.#checked.clear();
      this.#activeIndex = -1;
    }
    if (this.#dataDirty) this.#syncData();

    if (changed.has('open') && this.open) {
      const cancelled = !this.dispatchEvent(
        new CustomEvent('bx-show', {
          bubbles: true,
          composed: true,
          cancelable: true,
        }),
      );
      if (cancelled) {
        this.open = false;
        return;
      }
    }

    const rows = this.items ?? [];
    this.#virtualizer.setOptions({
      count: rows.length,
      getScrollElement: this.#getMenu,
      dynamic: true,
      overscan: OVERSCAN,
      enabled: this.#windowed,
      getItemKey: this.#getKey,
      pinnedIndexes: this.#activeIndex >= 0 ? [this.#activeIndex] : [],
    });
  }

  protected override firstUpdated(): void {
    // Capture phase: a space typed mid-search ("Action 4") must reach typeahead before the focused
    // item's own Space-to-activate handler does.
    this.#menuRef.value?.addEventListener(
      'keydown',
      this.#handleSpaceTypeahead,
      true,
    );
  }

  protected override updated(changed: PropertyValues<this>): void {
    this.#trigger?.setAttribute('aria-expanded', String(this.open));
    this.#syncMenuLabel();

    if (this.#windowed)
      for (const row of this.shadowRoot!.querySelectorAll('.row-abs'))
        this.#virtualizer.measureElement(row);

    if (!changed.has('open')) return;
    if (this.open) {
      this.#addDocumentListeners();
      void this.#afterOpen();
    } else if (changed.get('open') === true) {
      this.#removeDocumentListeners();
      this.dispatchEvent(
        new CustomEvent('bx-after-hide', { bubbles: true, composed: true }),
      );
    }
  }

  async #afterOpen(): Promise<void> {
    // The popup becomes `display: block` in its own update; the menu can only be measured and
    // focused after that.
    await this.#popupRef.value?.updateComplete;
    if (!this.open) return;
    this.#virtualizer.sync();
    this.#popupRef.value?.reposition();
    await this.#focusOnOpen();
    this.dispatchEvent(
      new CustomEvent('bx-after-show', { bubbles: true, composed: true }),
    );
  }

  #getMenu = (): Element | null => this.#menuRef.value ?? null;
  #getKey = (index: number): string | number => index;

  // --- Data model ------------------------------------------------------------------------------

  get #usesData(): boolean {
    return this.items !== undefined && this.items !== null;
  }

  get #windowed(): boolean {
    return (
      this.#usesData &&
      this.virtual &&
      (this.items?.length ?? 0) > this.virtualThreshold
    );
  }

  #syncData(): void {
    this.#dataDirty = false;
    const rows = this.items ?? [];
    this.#ordinals = new Array<number>(rows.length);
    let total = 0;
    let reserve = false;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]!;
      this.#ordinals[i] = isItemRow(row) ? ++total : 0;
      if (row.type && row.type !== 'normal') reserve = true;
    }
    this.#itemTotal = total;
    this.#reserveCheckmark = reserve;
    this.#virtualizer.invalidate();
  }

  #isChecked(index: number): boolean {
    return this.#checked.get(index) ?? !!this.items?.[index]?.checked;
  }

  /** A data row's selection changed: radios in the same `name` group deselect each other. */
  #recordSelection(index: number, checked: boolean): void {
    const rows = this.items ?? [];
    const row = rows[index];
    if (!row) return;
    if (row.type === 'radio') {
      for (let i = 0; i < rows.length; i++) {
        const peer = rows[i]!;
        if (peer.type === 'radio' && (peer.name ?? '') === (row.name ?? ''))
          this.#checked.set(i, i === index);
      }
    } else {
      this.#checked.set(index, checked);
    }
  }

  // --- Trigger ---------------------------------------------------------------------------------

  #syncTrigger(): boolean {
    const slot = this.shadowRoot?.querySelector<HTMLSlotElement>(
      'slot[name="trigger"]',
    );
    const next = slot?.assignedElements()[0] ?? null;
    if (next === this.#trigger) return false;
    this.#detachTrigger();
    this.#trigger = next;
    next?.addEventListener('click', this.#handleTriggerClick);
    next?.addEventListener(
      'keydown',
      this.#handleTriggerKeydown as EventListener,
    );
    next?.setAttribute('aria-haspopup', 'menu');
    next?.setAttribute('aria-expanded', String(this.open));
    return true;
  }

  #detachTrigger(): void {
    const trigger = this.#trigger;
    if (!trigger) return;
    trigger.removeEventListener('click', this.#handleTriggerClick);
    trigger.removeEventListener(
      'keydown',
      this.#handleTriggerKeydown as EventListener,
    );
    trigger.removeAttribute('aria-haspopup');
    trigger.removeAttribute('aria-expanded');
    this.#trigger = null;
  }

  #handleTriggerSlotChange = (): void => {
    if (this.#syncTrigger()) this.requestUpdate();
  };

  #handleTriggerClick = (event: Event): void => {
    if (this.open) {
      this.hide('trigger');
      return;
    }
    // `detail` is 0 for a click synthesized by Enter/Space: open like the arrow keys do.
    this.#openFocus = (event as MouseEvent).detail === 0 ? 'first' : 'menu';
    this.show();
  };

  #handleTriggerKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    this.#openFocus = event.key === 'ArrowDown' ? 'first' : 'last';
    if (this.open) void this.#focusOnOpen();
    else this.show();
  };

  #syncMenuLabel(): void {
    const menu = this.#menuRef.value as
      (HTMLElement & { ariaLabelledByElements?: Element[] | null }) | undefined;
    if (menu && 'ariaLabelledByElements' in menu)
      menu.ariaLabelledByElements = this.#trigger ? [this.#trigger] : null;
  }

  // --- Open / close ----------------------------------------------------------------------------

  /** Opens the menu. No-op if already open. */
  show(): void {
    if (this.open) return;
    this.open = true;
  }

  /** Closes the menu. No-op if already closed. */
  hide(source: HideSource = 'method'): void {
    if (!this.open) return;
    const cancelled = !this.dispatchEvent(
      new CustomEvent('bx-hide', {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: { source },
      }),
    );
    if (cancelled) return;
    const restoreFocus = source !== 'focus-out' && source !== 'light-dismiss';
    const hadFocus = this.#focusIsInside();
    for (const item of this.querySelectorAll<BxDropdownItem>('[submenu-open]'))
      item.submenuOpen = false;
    this.open = false;
    if (restoreFocus || hadFocus)
      (this.#trigger as HTMLElement | null)?.focus?.();
  }

  /** Recomputes the menu's position (e.g. after the trigger moved). */
  reposition(): void {
    this.#popupRef.value?.reposition();
  }

  #focusIsInside(): boolean {
    const active = document.activeElement;
    return (
      (!!active && this.contains(active) && active !== this.#trigger) ||
      !!this.shadowRoot?.activeElement
    );
  }

  #addDocumentListeners(): void {
    document.addEventListener(
      'pointerdown',
      this.#handleDocumentPointerDown,
      true,
    );
  }

  #removeDocumentListeners(): void {
    document.removeEventListener(
      'pointerdown',
      this.#handleDocumentPointerDown,
      true,
    );
  }

  #handleDocumentPointerDown = (event: PointerEvent): void => {
    // The trigger is a light-DOM child, so "inside this element" covers trigger, menu and
    // submenus; the trigger's own click does the toggling.
    if (event.composedPath().includes(this)) return;
    this.hide('light-dismiss');
  };

  #handleFocusOut = (event: FocusEvent): void => {
    if (!this.open) return;
    const next = event.relatedTarget as Node | null;
    if (next && (this.contains(next) || this.shadowRoot?.contains(next)))
      return;
    // `relatedTarget` is null when focus goes to a non-focusable area; the pointer path handles
    // that case, so only react to focus moving to another element.
    if (next) this.hide('focus-out');
  };

  // --- Focus -----------------------------------------------------------------------------------

  #canFocus(item: BxDropdownItem): boolean {
    return !item.disabled || this.focusableDisabled;
  }

  /** Top-level entries when `from` is null, otherwise the siblings of `from`. */
  #siblingsOf(from: Element | null): BxDropdownItem[] {
    const parent = from ? from.parentElement : this;
    return Array.from(parent?.children ?? []).filter(
      (child): child is BxDropdownItem =>
        child instanceof BxDropdownItem &&
        !child.hidden &&
        child.getAttribute('slot') !== 'trigger',
    );
  }

  async #focusOnOpen(): Promise<void> {
    if (this.#usesData) {
      const rows = this.items ?? [];
      const wanted =
        this.#openFocus === 'last'
          ? this.#lastDataIndex(rows)
          : this.#openFocus === 'first'
            ? this.#firstDataIndex(rows)
            : -1;
      if (wanted >= 0) await this.#focusData(wanted);
      else this.#menuRef.value?.focus();
      return;
    }
    const items = this.#siblingsOf(null).filter((item) => this.#canFocus(item));
    const target = this.#openFocus === 'last' ? items.at(-1) : items[0];
    if (this.#openFocus === 'menu' || !target) this.#menuRef.value?.focus();
    else target.focus();
  }

  #firstDataIndex(rows: readonly DropdownItemData[]): number {
    return rows.findIndex((row) => this.#dataFocusable(row));
  }

  #lastDataIndex(rows: readonly DropdownItemData[]): number {
    for (let i = rows.length - 1; i >= 0; i--)
      if (this.#dataFocusable(rows[i]!)) return i;
    return -1;
  }

  #dataFocusable(row: DropdownItemData): boolean {
    return isItemRow(row) && (!row.disabled || this.focusableDisabled);
  }

  /** Scrolls a data row into the window, pins it, and focuses its (possibly just-created) node. */
  async #focusData(index: number): Promise<void> {
    this.#activeIndex = index;
    if (this.#windowed)
      this.#virtualizer.scrollToIndex(index, { align: 'auto' });
    this.requestUpdate();
    for (let attempt = 0; attempt < FOCUS_RETRIES; attempt++) {
      await this.updateComplete;
      const element = this.shadowRoot?.querySelector<BxDropdownItem>(
        `bx-dropdown-item[data-index="${index}"]`,
      );
      if (element) {
        element.focus();
        // Keep the node in view without relying on the focus call's own scrolling.
        this.#scrollIntoMenu(element);
        return;
      }
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
  }

  #scrollIntoMenu(element: HTMLElement): void {
    const menu = this.#menuRef.value;
    if (!menu) return;
    const list = menu.getBoundingClientRect();
    const item = element.getBoundingClientRect();
    if (item.top < list.top) menu.scrollTop -= list.top - item.top;
    else if (item.bottom > list.bottom)
      menu.scrollTop += item.bottom - list.bottom;
  }

  // --- Keyboard --------------------------------------------------------------------------------

  #handleSpaceTypeahead = (event: KeyboardEvent): void => {
    if (event.key !== ' ' || !this.#typeahead) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    event.stopPropagation();
    if (this.#usesData) this.#handleDataKey(event);
    else this.#handleSlottedKey(event);
  };

  #handleMenuKeydown = (event: KeyboardEvent): void => {
    const { key } = event;
    if (key === 'Escape') {
      event.preventDefault();
      event.stopPropagation(); // Don't also close a surrounding dialog.
      this.hide('keyboard');
      return;
    }
    if (key === 'Tab') {
      // Close and let the browser move on from the trigger, which is focused first.
      this.hide('keyboard');
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    if (this.#usesData) this.#handleDataKey(event);
    else this.#handleSlottedKey(event);
  };

  #handleSlottedKey(event: KeyboardEvent): void {
    const target = event.target;
    const current = target instanceof BxDropdownItem ? target : null;
    const siblings = this.#siblingsOf(current).filter((item) =>
      this.#canFocus(item),
    );
    if (siblings.length === 0) return;
    const position = current ? siblings.indexOf(current) : -1;
    let next: BxDropdownItem | undefined;

    switch (event.key) {
      case 'ArrowDown':
        next = siblings[(position + 1) % siblings.length];
        break;
      case 'ArrowUp':
        next = siblings[(position <= 0 ? siblings.length : position) - 1];
        break;
      case 'Home':
        next = siblings[0];
        break;
      case 'End':
        next = siblings.at(-1);
        break;
      default:
        if (event.key.length === 1 && (event.key !== ' ' || this.#typeahead)) {
          event.preventDefault();
          next = this.#typeaheadSlotted(event.key, siblings, position);
          break;
        }
        return;
    }
    event.preventDefault();
    next?.focus();
  }

  #typeaheadSlotted(
    character: string,
    siblings: BxDropdownItem[],
    position: number,
  ): BxDropdownItem | undefined {
    const needle = this.#bufferTypeahead(character);
    const repeated =
      needle.length > 1 && [...needle].every((c) => c === needle[0]);
    const prefix = repeated ? needle[0]! : needle;
    const start = position + (needle.length === 1 || repeated ? 1 : 0);
    for (let step = 0; step < siblings.length; step++) {
      const item = siblings[(Math.max(start, 0) + step) % siblings.length]!;
      if (item.textLabel.toLowerCase().startsWith(prefix)) return item;
    }
    return undefined;
  }

  #bufferTypeahead(character: string): string {
    clearTimeout(this.#typeaheadTimer);
    this.#typeahead += character.toLowerCase();
    this.#typeaheadTimer = setTimeout(() => {
      this.#typeahead = '';
    }, TYPEAHEAD_RESET_MS);
    return this.#typeahead;
  }

  #handleDataKey(event: KeyboardEvent): void {
    const rows = this.items ?? [];
    const step = (from: number, direction: 1 | -1): number => {
      for (let i = 1; i <= rows.length; i++) {
        const index = (from + direction * i + rows.length * 2) % rows.length;
        if (this.#dataFocusable(rows[index]!)) return index;
      }
      return -1;
    };
    let next = -1;
    switch (event.key) {
      case 'ArrowDown':
        next = step(this.#activeIndex, 1);
        break;
      case 'ArrowUp':
        next = step(this.#activeIndex < 0 ? 0 : this.#activeIndex, -1);
        break;
      case 'Home':
        next = this.#firstDataIndex(rows);
        break;
      case 'End':
        next = this.#lastDataIndex(rows);
        break;
      default: {
        if (event.key.length !== 1 || (event.key === ' ' && !this.#typeahead))
          return;
        event.preventDefault();
        const needle = this.#bufferTypeahead(event.key);
        const repeated =
          needle.length > 1 && [...needle].every((c) => c === needle[0]);
        const prefix = repeated ? needle[0]! : needle;
        const start =
          this.#activeIndex + (needle.length === 1 || repeated ? 1 : 0);
        for (let i = 0; i < rows.length; i++) {
          const index = (Math.max(start, 0) + i) % rows.length;
          const row = rows[index]!;
          if (
            this.#dataFocusable(row) &&
            (row.label ?? '').toLowerCase().startsWith(prefix)
          ) {
            next = index;
            break;
          }
        }
        if (next < 0) return;
      }
    }
    event.preventDefault();
    if (next >= 0) void this.#focusData(next);
  }

  // --- Selection -------------------------------------------------------------------------------

  #handleItemSelect = (event: Event): void => {
    const item = event.target;
    if (!(item instanceof BxDropdownItem)) return;
    const detail = (event as CustomEvent).detail as Record<string, unknown>;

    if (this.#usesData && item.dataset['index'] !== undefined) {
      const index = Number(item.dataset['index']);
      this.#recordSelection(index, item.checked);
      this.#activeIndex = index;
      Object.assign(detail, { index, data: this.items?.[index] });
      this.requestUpdate();
    }
    // Checkbox and radio items keep the menu open so several can be toggled; the rest dismiss it.
    if (item.type === 'normal') this.hide('select');
  };

  /** Clicking a data row focuses it, so keyboard navigation continues from there. */
  #handleMenuFocusIn = (event: FocusEvent): void => {
    const target = event.target;
    if (
      this.#usesData &&
      target instanceof BxDropdownItem &&
      target.dataset['index'] !== undefined
    )
      this.#activeIndex = Number(target.dataset['index']);
  };

  // --- Render ----------------------------------------------------------------------------------

  #renderDataRow(row: DropdownItemData, index: number, start?: number) {
    const absolute = start !== undefined;
    const classes = absolute ? 'row row-abs' : 'row';
    const style = absolute ? `transform: translateY(${start}px)` : nothing;
    if (row.divider)
      return html`<div
        class=${classes}
        role="separator"
        data-index=${index}
        style=${style}
      >
        <hr />
      </div>`;
    if (row.heading !== undefined)
      return html`<div
        class="${classes} heading"
        role="presentation"
        data-index=${index}
        style=${style}
      >
        ${row.heading}
      </div>`;
    return html`<bx-dropdown-item
      class=${classes}
      data-index=${index}
      value=${row.value ?? row.label ?? ''}
      type=${row.type ?? 'normal'}
      name=${row.name ?? ''}
      variant=${row.variant ?? 'default'}
      ?checked=${this.#isChecked(index)}
      ?disabled=${!!row.disabled}
      ?data-force-reserve=${this.#reserveCheckmark}
      set-size=${this.#itemTotal}
      pos-in-set=${this.#ordinals[index] ?? 0}
      style=${style}
      >${row.label ?? ''}${
        row.details ? html`<span slot="details">${row.details}</span>` : nothing
      }</bx-dropdown-item
    >`;
  }

  #renderRows() {
    const rows = this.items ?? [];
    if (this.#windowed)
      return html`<div
        class="rows"
        style="block-size: ${this.#virtualizer.totalSize}px"
      >
        ${repeat(
          this.#virtualizer.items,
          (item) => item.key,
          (item) =>
            rows[item.index]
              ? this.#renderDataRow(rows[item.index]!, item.index, item.start)
              : nothing,
        )}
      </div>`;
    return html`${repeat(
      rows,
      (_row, index) => index,
      (row, index) => this.#renderDataRow(row, index),
    )}`;
  }

  protected override render() {
    return html`
      <slot name="trigger" @slotchange=${this.#handleTriggerSlotChange}></slot>
      <bx-popup
        ${ref(this.#popupRef)}
        part="base"
        .anchor=${this.#trigger ?? undefined}
        ?active=${this.open}
        placement=${this.placement}
        distance=${this.distance}
        skidding=${this.skidding}
        strategy="fixed"
        auto-size="vertical"
        flip
        shift
      >
        <div
          ${ref(this.#menuRef)}
          class="menu"
          part="menu"
          id="${this.#uid}-menu"
          role="menu"
          tabindex="-1"
          ?focusable-disabled=${this.focusableDisabled}
          @keydown=${this.#handleMenuKeydown}
          @bx-select=${this.#handleItemSelect}
          @focusin=${this.#handleMenuFocusIn}
          @focusout=${this.#handleFocusOut}
        >
          ${this.#usesData ? this.#renderRows() : html`<slot></slot>`}
        </div>
      </bx-popup>
    `;
  }
}
