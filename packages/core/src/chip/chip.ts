import { css, html, nothing } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';
import { textFamily, textStyle } from '../internal/text-style.ts';

type Variant =
  'default' | 'secondary' | 'tertiary' | 'error' | 'warning' | 'neutral';
type Appearance = 'filled' | 'outlined' | 'subtle';

/**
 * `<bx-chip>` — compact token for tags, filters and selections (docs/features/core/chip.md).
 *
 * Distinct from `bx-badge` (FR-CHIP-03): a chip is interactive. `selectable` renders a native
 * `<button aria-pressed>` toggling `selected`; `clickable` renders a plain button that only emits
 * `click` (an addition to the spec's property table, for filter-style chips); with neither it is
 * static text. `removable` adds a `bx-close-button`; Delete/Backspace on the focused chip requests
 * removal as well (FR-CHIP-02). Removal fires a cancelable `bx-remove`; if nobody cancels it the
 * chip removes itself from the DOM. `bx-chip-group` (FR-CHIP-01, optional in the spec) is not
 * implemented.
 *
 * @fires change - Selected state changed by the user.
 * @fires bx-remove - Removal requested. Cancelable; uncancelled, the chip removes itself.
 *
 * @slot (default) - Label.
 * @slot start - Avatar or icon.
 * @slot end - Trailing content.
 *
 * @csspart base - The chip surface.
 * @csspart label - The label part.
 * @csspart remove-button - The remove button.
 *
 * @cssprop --bx-chip-bg - Background.
 * @cssprop --bx-chip-fg - Foreground.
 * @cssprop --bx-chip-radius - Corner radius.
 * @cssprop --bx-chip-gap - Gap between parts. Default `var(--bx-space-2xs)`.
 */
export class BxChip extends BixElement {
  static override tagName = 'bx-chip';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-block;
        vertical-align: middle;
        ${textFamily('--bx-chip', 'label')}
        --_solid: var(--bx-role-neutral-solid);
        --_on-solid: var(--bx-role-neutral-on-solid);
        --_subtle: var(--bx-role-neutral-subtle);
        --_fg: var(--bx-role-neutral-fg);
        --_border: var(--bx-role-neutral-border);
        --_height: var(--bx-control-height-s);
      }
      :host([variant='default']) {
        --_solid: var(--bx-role-brand-solid);
        --_on-solid: var(--bx-role-brand-on-solid);
        --_subtle: var(--bx-role-brand-subtle);
        --_fg: var(--bx-role-brand-fg);
        --_border: var(--bx-role-brand-border);
      }
      :host([variant='tertiary']) {
        --_solid: var(--bx-role-tertiary-solid);
        --_on-solid: var(--bx-role-tertiary-on-solid);
        --_subtle: var(--bx-role-tertiary-subtle);
        --_fg: var(--bx-role-tertiary-fg);
        --_border: var(--bx-role-tertiary-border);
      }
      :host([variant='warning']) {
        --_solid: var(--bx-role-warning-solid);
        --_on-solid: var(--bx-role-warning-on-solid);
        --_subtle: var(--bx-role-warning-subtle);
        --_fg: var(--bx-role-warning-fg);
        --_border: var(--bx-role-warning-border);
      }
      :host([variant='error']) {
        --_solid: var(--bx-role-danger-solid);
        --_on-solid: var(--bx-role-danger-on-solid);
        --_subtle: var(--bx-role-danger-subtle);
        --_fg: var(--bx-role-danger-fg);
        --_border: var(--bx-role-danger-border);
      }
      :host([size='s']) {
        --_height: calc(var(--bx-control-height-s) * 0.8);
      }
      :host([size='l']) {
        --_height: var(--bx-control-height-m);
      }

      .base {
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        gap: var(--bx-chip-gap, var(--bx-space-2xs));
        min-block-size: var(--_height);
        padding-inline: var(--bx-space-s);
        border: var(--bx-border-width) solid transparent;
        border-radius: var(--bx-chip-radius, var(--bx-radius-m));
        background: var(--bx-chip-bg, var(--_subtle));
        color: var(--bx-chip-fg, var(--_fg));
        ${textStyle('--bx-chip', 'label-s')}
      }
      :host([pill]) .base {
        border-radius: var(--bx-chip-radius, var(--bx-radius-pill));
      }
      :host([appearance='filled']) .base {
        background: var(--bx-chip-bg, var(--_solid));
        color: var(--bx-chip-fg, var(--_on-solid));
      }
      :host([appearance='outlined']) .base {
        background: var(--bx-chip-bg, transparent);
        border-color: var(--_border);
      }
      :host([selected]) .base {
        background: var(--bx-chip-bg, var(--_solid));
        color: var(--bx-chip-fg, var(--_on-solid));
        border-color: var(--_solid);
      }
      :host([disabled]) .base {
        opacity: 0.5;
      }

      .label {
        all: unset;
        display: inline-flex;
        align-items: center;
        gap: var(--bx-chip-gap, var(--bx-space-2xs));
        min-inline-size: 0;
      }
      button.label {
        cursor: pointer;
      }
      .label:focus-visible,
      .base:focus-visible {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: var(--bx-focus-ring-offset);
      }
      .label[tabindex],
      button.label {
        border-radius: inherit;
      }
      :host([disabled]) button.label {
        cursor: not-allowed;
      }
      .text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .start,
      .end {
        display: inline-flex;
        align-items: center;
      }
      .start:empty,
      .end:empty {
        display: none;
      }
      .check {
        inline-size: 1em;
        block-size: 1em;
        fill: currentColor;
      }
      .remove-button {
        --bx-close-button-size: calc(var(--_height) * 0.75);
        --bx-close-button-icon-size: 0.75em;
        margin-inline-end: calc(var(--bx-space-xs) * -1);
      }

      @media (forced-colors: active) {
        .base {
          forced-color-adjust: none;
          border-color: ButtonText;
          background: ButtonFace;
          color: ButtonText;
        }
        :host([selected]) .base {
          background: Highlight;
          color: HighlightText;
        }
      }
    `,
  ];

  static override properties = {
    variant: { type: String, reflect: true },
    appearance: { type: String, reflect: true },
    size: { type: String, reflect: true },
    selectable: { type: Boolean, reflect: true },
    selected: { type: Boolean, reflect: true },
    clickable: { type: Boolean, reflect: true },
    removable: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    pill: { type: Boolean, reflect: true },
    value: { type: String },
    removeLabel: { type: String, attribute: 'remove-label' },
  };

  declare variant: Variant;
  declare appearance: Appearance;
  declare size: 's' | 'm' | 'l';
  declare selectable: boolean;
  declare selected: boolean;
  declare clickable: boolean;
  declare removable: boolean;
  declare disabled: boolean;
  declare pill: boolean;
  declare value: string;
  declare removeLabel: string;

  #labelRef = createRef<HTMLElement>();

  constructor() {
    super();
    this.variant = 'neutral';
    this.appearance = 'subtle';
    this.size = 'm';
    this.selectable = false;
    this.selected = false;
    this.clickable = false;
    this.removable = false;
    this.disabled = false;
    this.pill = true;
    this.value = '';
    this.removeLabel = 'Remove';
  }

  override focus(options?: FocusOptions): void {
    this.#labelRef.value?.focus(options);
  }

  override blur(): void {
    this.#labelRef.value?.blur();
  }

  #toggle = (): void => {
    if (this.disabled) return;
    if (this.selectable) {
      this.selected = !this.selected;
      this.dispatchEvent(
        new Event('change', { bubbles: true, composed: true }),
      );
    }
  };

  #remove = (): void => {
    if (this.disabled) return;
    const proceed = this.dispatchEvent(
      new CustomEvent('bx-remove', {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: { value: this.value },
      }),
    );
    if (proceed) this.remove();
  };

  #onKeydown = (event: KeyboardEvent): void => {
    if (
      this.removable &&
      (event.key === 'Delete' || event.key === 'Backspace')
    ) {
      event.preventDefault();
      this.#remove();
    }
  };

  protected override render() {
    const interactive = this.selectable || this.clickable;
    const inner = html`<span class="start"><slot name="start"></slot></span>
      ${
        this.selectable && this.selected
          ? html`<svg class="check" viewBox="0 0 256 256" aria-hidden="true">
              <path
                d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"
              />
            </svg>`
          : nothing
      }
      <span class="text"><slot></slot></span>
      <span class="end"><slot name="end"></slot></span>`;
    return html`<span class="base" part="base" @keydown=${this.#onKeydown}>
      ${
        interactive
          ? html`<button
              ${ref(this.#labelRef)}
              class="label"
              part="label"
              type="button"
              aria-pressed=${
                this.selectable ? (this.selected ? 'true' : 'false') : nothing
              }
              ?disabled=${this.disabled}
              @click=${this.#toggle}
            >
              ${inner}
            </button>`
          : html`<span
              ${ref(this.#labelRef)}
              class="label"
              part="label"
              tabindex=${this.removable && !this.disabled ? '0' : nothing}
              >${inner}</span
            >`
      }
      ${
        this.removable
          ? html`<bx-close-button
              class="remove-button"
              part="remove-button"
              size="s"
              label=${this.removeLabel}
              ?disabled=${this.disabled}
              @bx-close=${(e: Event) => {
                e.stopPropagation();
                this.#remove();
              }}
            ></bx-close-button>`
          : nothing
      }
    </span>`;
  }
}
