import { css, html, nothing, svg, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';
import type { BxPopup } from '../popup/popup.ts';
import { inSafeTriangle, pointInBox } from './safe-triangle.ts';

type Variant = 'default' | 'error';
type ItemType = 'normal' | 'checkbox' | 'radio';

// Vendored from packages/core/src/icon/default-library.ts (Phosphor Icons, regular/fill, MIT).
// This glyph's own ink isn't centered in the usual 256x256 canvas (bbox roughly x:72-228,
// y:100-207) — rendered below with viewBox="48 76 204 155" (centered on that bbox) instead of
// "0 0 256 256", so preserveAspectRatio's default centers it in the icon's square box. See
// packages/core/src/checkbox/checkbox.ts's own copy of this constant for the full note.
const CHECK_PATH =
  'M225.86,102.82c-3.77-3.94-10-4.1-13.94-.34l-83.6,80.13-38.86-40.14a10,10,0,0,0-14.34,13.94l45.7,47.24a10,10,0,0,0,7.17,3.05,10,10,0,0,0,6.94-2.79l90.6-86.85C229.46,113,229.63,106.75,225.86,102.82Z';
const CHEVRON_RIGHT_PATH =
  'M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z';

/** Pointer dwell before a hovered submenu parent opens, so sweeping past items does not flicker. */
const HOVER_OPEN_MS = 120;
/** How long a pointer resting inside the safe triangle keeps the submenu open. */
const SAFE_TRIANGLE_GRACE_MS = 300;

// Peer coordination for FR-DROPDOWN-ITEM-01, keyed by the light-DOM parent that groups a set of
// sibling items (`bx-dropdown`'s menu, or a parent item's submenu) — same pattern as
// `bx-details`' accordion groups and `bx-radio`'s mutual-exclusion groups. Checkmark gutter space
// is reserved for every item in a group the moment any sibling is a checkable item, so adding or
// removing one never shifts the others' label column. The same group also carries radio-item
// exclusivity and "only one submenu open at a time".
const groups = new Map<Element, Set<BxDropdownItem>>();

function updateGroup(parent: Element): void {
  const set = groups.get(parent);
  if (!set) return;
  const reserve = [...set].some((item) => item.type !== 'normal');
  for (const item of set)
    item.toggleAttribute('data-reserve-checkmark', reserve);
}

let nextId = 0;

/**
 * `<bx-dropdown-item>` — a single menu entry: plain, checkbox, radio, or submenu parent.
 *
 * `role`/`aria-haspopup` are set from this element's own state (`type`, whether the `submenu`
 * slot has assigned content) rather than by a parent, so it is correct standalone.
 * FR-DROPDOWN-ITEM-02's `focusable-disabled` is read from the nearest ancestor carrying that
 * attribute via `closest()` so `bx-dropdown` only has to set it once on itself.
 *
 * **Submenus (FR-DROPDOWN-03).** A `submenu` slot with children turns the item into a submenu
 * parent: the nested items render in an internal `bx-popup` beside the row. It opens on hover
 * (after a short dwell), on `ArrowRight` (`ArrowLeft` in RTL), and on Enter/Space; `ArrowLeft`/
 * `Escape` close it and return focus to the parent. Hover uses a safe triangle — while the pointer
 * crosses sibling rows on its way to the submenu it stays open. Activating a submenu parent opens
 * it instead of firing `bx-select`. Only one submenu per menu is open at a time.
 *
 * **Additions beyond the spec's tables** (flagged per docs/features/_conventions.md): `type="radio"`
 * with a `name` makes `menuitemradio` items that deselect same-`name` siblings (FR-DROPDOWN-04's
 * "radio-like groups"); `submenu-open`; `set-size`/`pos-in-set` for windowed menus, which cannot
 * rely on DOM siblings for `aria-setsize`/`aria-posinset`; a `submenu` CSS part; `focus()`
 * delegates to the row. The host no longer carries `container-type` — it made every fixed-position
 * descendant (the submenu popup) resolve against the row instead of the viewport — so the
 * "details hide when narrow" container query now measures the inner row.
 *
 * @fires bx-select - The item was activated (bubbles to `bx-dropdown`). `detail` is
 *   `{ value, checked, item }`. Not fired when `disabled`, nor for a submenu parent.
 *
 * @slot (default) - Label.
 * @slot icon - Leading icon.
 * @slot details - Trailing hint (e.g. shortcut). Hidden under 12 fluid units (§5).
 * @slot submenu - Nested `bx-dropdown-item` elements.
 *
 * @csspart checkmark - The checkbox/radio checkmark (or its reserved gutter space).
 * @csspart icon - The wrapper around the icon slot.
 * @csspart label - The wrapper around the default slot.
 * @csspart details - The wrapper around the details slot.
 * @csspart submenu-icon - The trailing chevron shown when a submenu is present.
 * @csspart submenu - The floating panel around the nested items.
 */
export class BxDropdownItem extends BixElement {
  static override tagName = 'bx-dropdown-item';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        font-family: var(--bx-font-family-sans);
      }

      :host([hidden]) {
        display: none;
      }

      .base {
        container-type: inline-size;
        display: flex;
        align-items: center;
        gap: var(--bx-space-xs);
        min-block-size: var(
          --bx-dropdown-item-height,
          var(--bx-target-min, 2.75rem)
        );
        padding-inline: var(--bx-space-s);
        color: var(--bx-text-primary);
        cursor: pointer;
        outline: none;
      }

      :host([variant='error']) .base {
        color: var(--bx-role-danger-fg);
      }

      .base:hover,
      .base:focus-visible,
      :host([submenu-open]) .base {
        background: var(--bx-surface-subtle);
      }

      .base:focus-visible {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: calc(var(--bx-focus-ring-offset) * -1);
      }

      :host([disabled]) .base {
        cursor: not-allowed;
        color: var(--bx-text-disabled);
        background: transparent;
      }

      .checkmark {
        display: none;
        flex-shrink: 0;
        inline-size: 1em;
        block-size: 1em;
      }

      :host([data-reserve-checkmark]) .checkmark,
      :host([data-force-reserve]) .checkmark {
        display: inline-flex;
      }

      .checkmark svg {
        inline-size: 100%;
        block-size: 100%;
        fill: var(--bx-role-accent);
      }

      .icon {
        display: inline-flex;
        flex-shrink: 0;
        inline-size: 1em;
        block-size: 1em;
      }

      .icon ::slotted(*) {
        inline-size: 100%;
        block-size: 100%;
      }

      .label {
        flex: 1;
        min-inline-size: 0;
      }

      .details {
        color: var(--bx-text-secondary);
        font-size: var(--bx-font-s);
      }

      @container (max-width: calc(var(--bx-unit) * 12)) {
        .details {
          display: none;
        }
      }

      .submenu-icon {
        display: inline-flex;
        flex-shrink: 0;
        inline-size: 0.75em;
        block-size: 0.75em;
        color: var(--bx-text-secondary);
      }

      .submenu-icon svg {
        inline-size: 100%;
        block-size: 100%;
        fill: currentColor;
      }

      :host(:dir(rtl)) .submenu-icon svg {
        transform: scaleX(-1);
      }

      .submenu {
        box-sizing: border-box;
        min-inline-size: calc(var(--bx-unit, 1rem) * 12);
        border: var(--bx-border-width) solid var(--bx-border-subtle);
        border-radius: var(--bx-radius-m);
        box-shadow: var(--bx-shadow-m);
        background: var(--bx-surface-base);
        color: var(--bx-text-primary);
        font-size: var(--bx-font-m);
        overflow: hidden;
      }

      @media (forced-colors: active) {
        .base:hover,
        .base:focus-visible {
          forced-color-adjust: none;
          background: Highlight;
          color: HighlightText;
        }

        .submenu {
          forced-color-adjust: none;
          border-color: CanvasText;
          background: Canvas;
          color: CanvasText;
        }
      }
    `,
  ];

  static override properties = {
    variant: { type: String, reflect: true },
    type: { type: String },
    checked: { type: Boolean, reflect: true },
    value: { type: String },
    name: { type: String },
    disabled: { type: Boolean, reflect: true },
    submenuOpen: { type: Boolean, reflect: true, attribute: 'submenu-open' },
    setSize: { type: Number, attribute: 'set-size' },
    posInSet: { type: Number, attribute: 'pos-in-set' },
  };

  declare variant: Variant;
  declare type: ItemType;
  declare checked: boolean;
  declare value: string;
  /** Radio items sharing a `name` within one menu are mutually exclusive. */
  declare name: string;
  declare disabled: boolean;
  declare submenuOpen: boolean;
  declare setSize?: number;
  declare posInSet?: number;

  #labelId = `bx-dropdown-item-label-${nextId++}`;
  #group?: Element;
  #hasSubmenu = false;
  #hoverTimer?: ReturnType<typeof setTimeout>;
  #graceTimer?: ReturnType<typeof setTimeout>;
  #leftAt?: { x: number; y: number };
  #tracking = false;

  constructor() {
    super();
    this.variant = 'default';
    this.type = 'normal';
    this.checked = false;
    this.value = '';
    this.name = '';
    this.disabled = false;
    this.submenuOpen = false;

    this.addEventListener('click', this.#handleActivate);
    this.addEventListener('keydown', this.#handleKeydown);
    this.addEventListener('pointerenter', this.#handlePointerEnter);
    this.addEventListener('pointerleave', this.#handlePointerLeave);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.parentElement) {
      this.#group = this.parentElement;
      let set = groups.get(this.#group);
      if (!set) {
        set = new Set();
        groups.set(this.#group, set);
      }
      set.add(this);
      updateGroup(this.#group);
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#stopTracking();
    clearTimeout(this.#hoverTimer);
    if (this.#group) {
      const set = groups.get(this.#group);
      set?.delete(this);
      if (set && set.size === 0) groups.delete(this.#group);
      else updateGroup(this.#group);
    }
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('type') && this.#group) updateGroup(this.#group);
  }

  /** Whether a `submenu` slot has assigned items. */
  get hasSubmenu(): boolean {
    return this.#hasSubmenu;
  }

  /**
   * The item's own text (default slot), excluding icon/details/submenu content — what typeahead
   * matches against.
   */
  get textLabel(): string {
    let text = '';
    for (const node of Array.from(this.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE) text += node.textContent ?? '';
      else if (node instanceof Element && !node.getAttribute('slot'))
        text += node.textContent ?? '';
    }
    return text.replace(/\s+/g, ' ').trim();
  }

  get #focusableDisabled(): boolean {
    return this.disabled && this.closest('[focusable-disabled]') !== null;
  }

  get #popup(): BxPopup | null {
    return this.shadowRoot?.querySelector('bx-popup') ?? null;
  }

  get #isRtl(): boolean {
    return getComputedStyle(this).direction === 'rtl';
  }

  /** Moves focus to this item's row (the host itself is not focusable). */
  override focus(options?: FocusOptions): void {
    this.shadowRoot?.querySelector<HTMLElement>('.base')?.focus(options);
  }

  // --- Submenu ---------------------------------------------------------------------------------

  /** Opens the nested menu; with `focusFirst` also focuses its first enabled item. */
  async openSubmenu(focusFirst = false): Promise<void> {
    if (!this.#hasSubmenu || this.disabled) return;
    if (this.#group)
      for (const peer of groups.get(this.#group) ?? [])
        if (peer !== this && peer.submenuOpen) peer.closeSubmenu();
    this.submenuOpen = true;
    if (!focusFirst) return;
    await this.updateComplete;
    await this.#popup?.updateComplete;
    const first = this.querySelector<BxDropdownItem>(
      ':scope > [slot="submenu"]:not([disabled])',
    );
    first?.focus();
  }

  /** Closes this item's nested menu and any menus nested inside it. */
  closeSubmenu(): void {
    this.#stopTracking();
    clearTimeout(this.#hoverTimer);
    if (!this.submenuOpen) return;
    this.submenuOpen = false;
    for (const nested of this.querySelectorAll<BxDropdownItem>(
      '[submenu-open]',
    ))
      nested.submenuOpen = false;
  }

  #handleSubmenuSlotChange = (event: Event): void => {
    const has = (event.target as HTMLSlotElement).assignedElements().length > 0;
    if (has === this.#hasSubmenu) return;
    this.#hasSubmenu = has;
    if (!has) this.submenuOpen = false;
    this.requestUpdate();
  };

  #handlePointerEnter = (event: PointerEvent): void => {
    this.#stopTracking();
    clearTimeout(this.#graceTimer);
    if (event.pointerType === 'touch' || !this.#hasSubmenu || this.disabled)
      return;
    clearTimeout(this.#hoverTimer);
    this.#hoverTimer = setTimeout(
      () => void this.openSubmenu(false),
      HOVER_OPEN_MS,
    );
  };

  #handlePointerLeave = (event: PointerEvent): void => {
    clearTimeout(this.#hoverTimer);
    if (!this.submenuOpen) return;
    this.#leftAt = { x: event.clientX, y: event.clientY };
    if (!this.#tracking) {
      this.#tracking = true;
      document.addEventListener('pointermove', this.#trackPointer, {
        passive: true,
      });
    }
  };

  #trackPointer = (event: PointerEvent): void => {
    const popup = this.#popup;
    if (!popup || !this.submenuOpen || !this.#leftAt) {
      this.#stopTracking();
      return;
    }
    const point = { x: event.clientX, y: event.clientY };
    const submenu = popup.getBoundingClientRect();
    const item = this.getBoundingClientRect();
    if (pointInBox(point, submenu) || pointInBox(point, item)) {
      // Arrived: ordinary hover rules take over from here.
      clearTimeout(this.#graceTimer);
      this.#stopTracking();
      return;
    }
    if (inSafeTriangle(point, this.#leftAt, submenu, item)) {
      clearTimeout(this.#graceTimer);
      this.#graceTimer = setTimeout(
        () => this.closeSubmenu(),
        SAFE_TRIANGLE_GRACE_MS,
      );
      return;
    }
    clearTimeout(this.#graceTimer);
    this.closeSubmenu();
  };

  #stopTracking(): void {
    if (!this.#tracking) return;
    this.#tracking = false;
    document.removeEventListener('pointermove', this.#trackPointer);
    clearTimeout(this.#graceTimer);
  }

  // --- Activation ------------------------------------------------------------------------------

  #toggle(): void {
    if (this.type === 'checkbox') {
      this.checked = !this.checked;
    } else if (this.type === 'radio') {
      this.checked = true;
      if (this.#group)
        for (const peer of groups.get(this.#group) ?? [])
          if (peer !== this && peer.type === 'radio' && peer.name === this.name)
            peer.checked = false;
    }
    this.dispatchEvent(
      new CustomEvent('bx-select', {
        bubbles: true,
        composed: true,
        detail: { value: this.value, checked: this.checked, item: this },
      }),
    );
  }

  #handleActivate = (event: Event): void => {
    // Clicks from nested submenu items bubble through this host; they are not ours.
    if (event.target !== this || this.disabled) return;
    if (this.#hasSubmenu) {
      void this.openSubmenu(false);
      return;
    }
    this.#toggle();
  };

  #handleKeydown = (event: KeyboardEvent): void => {
    const rtl = this.#isRtl;
    const closeKey = rtl ? 'ArrowRight' : 'ArrowLeft';
    const openKey = rtl ? 'ArrowLeft' : 'ArrowRight';

    if (event.target !== this) {
      // Bubbled from a nested item: close this submenu and hand focus back to this row.
      if (
        this.submenuOpen &&
        (event.key === closeKey || event.key === 'Escape')
      ) {
        event.preventDefault();
        event.stopPropagation();
        this.closeSubmenu();
        this.focus();
      }
      return;
    }
    if (this.disabled) return;

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (this.#hasSubmenu) void this.openSubmenu(true);
      else this.#toggle();
    } else if (event.key === openKey && this.#hasSubmenu) {
      event.preventDefault();
      event.stopPropagation();
      void this.openSubmenu(true);
    }
  };

  // --- Render ----------------------------------------------------------------------------------

  #renderSubmenu() {
    const slot = html`<slot
      name="submenu"
      @slotchange=${this.#handleSubmenuSlotChange}
    ></slot>`;
    if (!this.#hasSubmenu) return html`<div hidden>${slot}</div>`;
    return html`<bx-popup
      .anchor=${this}
      ?active=${this.submenuOpen}
      placement=${this.#isRtl ? 'left-start' : 'right-start'}
      strategy="fixed"
      flip
      shift
    >
      <div
        class="submenu"
        part="submenu"
        role="menu"
        aria-labelledby=${this.#labelId}
      >
        ${slot}
      </div>
    </bx-popup>`;
  }

  protected override render() {
    const role =
      this.type === 'checkbox'
        ? 'menuitemcheckbox'
        : this.type === 'radio'
          ? 'menuitemradio'
          : 'menuitem';
    const canFocus = !this.disabled || this.#focusableDisabled;
    const checkable = this.type !== 'normal';

    return html`
      <div
        class="base"
        part="base"
        role=${role}
        tabindex=${canFocus ? 0 : -1}
        aria-checked=${checkable ? this.checked : nothing}
        aria-disabled=${this.disabled}
        aria-haspopup=${this.#hasSubmenu ? 'menu' : nothing}
        aria-expanded=${this.#hasSubmenu ? this.submenuOpen : nothing}
        aria-setsize=${this.setSize ?? nothing}
        aria-posinset=${this.posInSet ?? nothing}
        aria-labelledby=${this.#labelId}
      >
        <span class="checkmark" part="checkmark">
          ${
            checkable && this.checked
              ? svg`<svg viewBox="48 76 204 155"><path d=${CHECK_PATH}></path></svg>`
              : nothing
          }
        </span>
        <span class="icon" part="icon"><slot name="icon"></slot></span>
        <span class="label" part="label" id=${this.#labelId}
          ><slot></slot
        ></span>
        <span class="details" part="details"><slot name="details"></slot></span>
        ${
          this.#hasSubmenu
            ? html`<span class="submenu-icon" part="submenu-icon">
                ${svg`<svg viewBox="0 0 256 256"><path d=${CHEVRON_RIGHT_PATH}></path></svg>`}
              </span>`
            : nothing
        }
      </div>
      ${this.#renderSubmenu()}
    `;
  }
}
