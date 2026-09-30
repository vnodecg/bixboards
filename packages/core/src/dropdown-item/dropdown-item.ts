import { css, html, nothing, svg, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';

type Variant = 'default' | 'danger';
type ItemType = 'normal' | 'checkbox';

// Vendored from packages/core/src/icon/default-library.ts (Phosphor Icons, regular/fill, MIT).
// This glyph's own ink isn't centered in the usual 256x256 canvas (bbox roughly x:72-228,
// y:100-207) — rendered below with viewBox="48 76 204 155" (centered on that bbox) instead of
// "0 0 256 256", so preserveAspectRatio's default centers it in the icon's square box. See
// packages/core/src/checkbox/checkbox.ts's own copy of this constant for the full note.
const CHECK_PATH =
  'M225.86,102.82c-3.77-3.94-10-4.1-13.94-.34l-83.6,80.13-38.86-40.14a10,10,0,0,0-14.34,13.94l45.7,47.24a10,10,0,0,0,7.17,3.05,10,10,0,0,0,6.94-2.79l90.6-86.85C229.46,113,229.63,106.75,225.86,102.82Z';
const CHEVRON_RIGHT_PATH =
  'M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z';

// Peer coordination for FR-DROPDOWN-ITEM-01, keyed by the light-DOM parent that groups a set of
// sibling items (the future `bx-dropdown`'s menu list) — same pattern as `bx-details`' accordion
// groups and `bx-radio`'s mutual-exclusion groups. Checkmark gutter space is reserved for every
// item in a group the moment any sibling is a checkbox item, so adding/removing one never shifts
// the others' label column.
const groups = new Map<Element, Set<BxDropdownItem>>();

function updateGroup(parent: Element): void {
  const set = groups.get(parent);
  if (!set) return;
  const reserve = [...set].some((item) => item.type === 'checkbox');
  for (const item of set)
    item.toggleAttribute('data-reserve-checkmark', reserve);
}

let nextId = 0;

/**
 * `<bx-dropdown-item>` — a single menu entry: plain, checkbox, or submenu parent.
 *
 * `role`/`aria-haspopup` are set from this element's own state (`type`, whether the `submenu`
 * slot has assigned content) rather than by a parent — `bx-dropdown` doesn't exist yet, but
 * nothing here needs it to be correct standalone. FR-DROPDOWN-ITEM-02's `focusable-disabled` is
 * read from the nearest ancestor carrying that attribute via `closest()` so a future `bx-dropdown`
 * only has to set it once on itself, no wiring required on each item.
 *
 * @fires bx-select - The item was activated (bubbles to `bx-dropdown`). Not fired when `disabled`.
 *
 * @slot (default) - Label.
 * @slot icon - Leading icon.
 * @slot details - Trailing hint (e.g. shortcut). Hidden under 12 fluid units (§5).
 * @slot submenu - Nested `bx-dropdown-item` elements.
 *
 * @csspart checkmark - The checkbox-type checkmark (or its reserved gutter space).
 * @csspart icon - The wrapper around the icon slot.
 * @csspart label - The wrapper around the default slot.
 * @csspart details - The wrapper around the details slot.
 * @csspart submenu-icon - The trailing chevron shown when a submenu is present.
 */
export class BxDropdownItem extends BixElement {
  static override tagName = 'bx-dropdown-item';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        container-type: inline-size;
        font-family: var(--bx-font-family-sans);
      }

      .base {
        display: flex;
        align-items: center;
        gap: var(--bx-space-xs);
        min-block-size: var(--bx-target-min, 2.75rem);
        padding-inline: var(--bx-space-s);
        color: var(--bx-text-primary);
        cursor: pointer;
        outline: none;
      }

      :host([variant='danger']) .base {
        color: var(--bx-role-danger-fg);
      }

      .base:hover,
      .base:focus-visible {
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

      :host([data-reserve-checkmark]) .checkmark {
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

      ::slotted([slot='submenu']) {
        display: none;
      }

      @media (forced-colors: active) {
        .base:hover,
        .base:focus-visible {
          forced-color-adjust: none;
          background: Highlight;
          color: HighlightText;
        }
      }
    `,
  ];

  static override properties = {
    variant: { type: String, reflect: true },
    type: { type: String },
    checked: { type: Boolean, reflect: true },
    value: { type: String },
    disabled: { type: Boolean, reflect: true },
  };

  declare variant: Variant;
  declare type: ItemType;
  declare checked: boolean;
  declare value: string;
  declare disabled: boolean;

  #labelId = `bx-dropdown-item-label-${nextId++}`;
  #group?: Element;
  #hasSubmenu = false;

  constructor() {
    super();
    this.variant = 'default';
    this.type = 'normal';
    this.checked = false;
    this.value = '';
    this.disabled = false;

    this.addEventListener('click', this.#handleActivate);
    this.addEventListener('keydown', this.#handleKeydown);
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

  get #focusableDisabled(): boolean {
    return this.disabled && this.closest('[focusable-disabled]') !== null;
  }

  #handleSubmenuSlotChange = (event: Event): void => {
    this.#hasSubmenu =
      (event.target as HTMLSlotElement).assignedElements().length > 0;
    this.requestUpdate();
  };

  #toggle(): void {
    if (this.type === 'checkbox') this.checked = !this.checked;
    this.dispatchEvent(
      new CustomEvent('bx-select', {
        bubbles: true,
        composed: true,
        detail: { value: this.value, checked: this.checked },
      }),
    );
  }

  #handleActivate = (): void => {
    if (this.disabled) return;
    this.#toggle();
  };

  #handleKeydown = (event: KeyboardEvent): void => {
    if (this.disabled) return;
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.#toggle();
    }
  };

  protected override render() {
    const role = this.type === 'checkbox' ? 'menuitemcheckbox' : 'menuitem';
    const canFocus = !this.disabled || this.#focusableDisabled;

    return html`
      <div
        class="base"
        part="base"
        role=${role}
        tabindex=${canFocus ? 0 : -1}
        aria-checked=${this.type === 'checkbox' ? this.checked : nothing}
        aria-disabled=${this.disabled}
        aria-haspopup=${this.#hasSubmenu ? 'menu' : nothing}
        aria-labelledby=${this.#labelId}
      >
        <span class="checkmark" part="checkmark">
          ${
            this.type === 'checkbox' && this.checked
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
      <slot name="submenu" @slotchange=${this.#handleSubmenuSlotChange}></slot>
    `;
  }
}
