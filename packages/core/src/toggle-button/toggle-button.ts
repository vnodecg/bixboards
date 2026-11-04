import { css, html, nothing, type PropertyValues } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';
import { FormAssociatedMixin } from '../internal/form-associated.ts';
import { textFamily, textStyle } from '../internal/text-style.ts';

type Variant = 'default' | 'secondary' | 'tertiary' | 'error' | 'warning';
type Appearance = 'filled' | 'outlined' | 'plain';

/**
 * `<bx-toggle-button>` — a button with a persistent pressed state
 * (docs/features/core/toggle-button.md).
 *
 * Renders a native `<button aria-pressed>` (FR role/Space/Enter come free). Form-associated:
 * submits `name=value` only while pressed (FR-TOGGLEBUTTON-01). The pressed state is shown by a
 * filled role surface *and* a check glyph, so it is distinguishable without colour
 * (FR-TOGGLEBUTTON-03). `bx-button-group` selection modes (FR-TOGGLEBUTTON-02) are not
 * implemented: the group has no selection mode yet, so exclusivity is the consumer's to manage.
 *
 * @fires input - Pressed state changed by the user; fires before `change`.
 * @fires change - Pressed state changed by the user.
 *
 * @slot (default) - Label.
 * @slot start - Leading icon.
 * @slot end - Trailing icon.
 *
 * @csspart base - The button surface.
 *
 * @cssprop --bx-toggle-button-pressed-bg - Background when pressed. Default role solid color.
 * @cssprop --bx-toggle-button-pressed-fg - Foreground when pressed. Default role on-solid color.
 * @cssprop --bx-toggle-button-bg - Background when not pressed. Default derived from `appearance`.
 * @cssprop --bx-toggle-button-gap - Gap between slots. Default `var(--bx-space-2xs)`.
 * @cssprop --bx-toggle-button-font-family - Font family of the root surface. Default `var(--bx-type-body-family)`.
 * @cssprop --bx-toggle-button-font-size - Font size of the root surface. Default `var(--bx-type-body-size)`.
 * @cssprop --bx-toggle-button-font-weight - Font weight of the root surface. Default `var(--bx-type-body-weight)`.
 * @cssprop --bx-toggle-button-line-height - Line height of the root surface. Default `var(--bx-type-body-leading)`.
 * @cssprop --bx-toggle-button-letter-spacing - Letter spacing of the root surface. Default `var(--bx-type-body-tracking)`.
 */
export class BxToggleButton extends FormAssociatedMixin(BixElement) {
  static override tagName = 'bx-toggle-button';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-block;
        vertical-align: middle;
        ${textFamily('--bx-toggle-button', 'body')}
        --_role-solid: var(--bx-role-neutral-solid);
        --_role-on-solid: var(--bx-role-neutral-on-solid);
        --_role-subtle: var(--bx-role-neutral-subtle);
        --_role-fg: var(--bx-role-neutral-fg);
        --_role-border: var(--bx-role-neutral-border);
        --_min-height: max(var(--bx-control-height-m), var(--bx-target-min));
        --_padding: var(--bx-space-m);
      }
      :host([variant='default']) {
        --_role-solid: var(--bx-role-brand-solid);
        --_role-on-solid: var(--bx-role-brand-on-solid);
        --_role-subtle: var(--bx-role-brand-subtle);
        --_role-fg: var(--bx-role-brand-fg);
        --_role-border: var(--bx-role-brand-border);
      }
      :host([variant='tertiary']) {
        --_role-solid: var(--bx-role-tertiary-solid);
        --_role-on-solid: var(--bx-role-tertiary-on-solid);
        --_role-subtle: var(--bx-role-tertiary-subtle);
        --_role-fg: var(--bx-role-tertiary-fg);
        --_role-border: var(--bx-role-tertiary-border);
      }
      :host([variant='warning']) {
        --_role-solid: var(--bx-role-warning-solid);
        --_role-on-solid: var(--bx-role-warning-on-solid);
        --_role-subtle: var(--bx-role-warning-subtle);
        --_role-fg: var(--bx-role-warning-fg);
        --_role-border: var(--bx-role-warning-border);
      }
      :host([variant='error']) {
        --_role-solid: var(--bx-role-danger-solid);
        --_role-on-solid: var(--bx-role-danger-on-solid);
        --_role-subtle: var(--bx-role-danger-subtle);
        --_role-fg: var(--bx-role-danger-fg);
        --_role-border: var(--bx-role-danger-border);
      }
      :host([size='s']) {
        --_min-height: max(var(--bx-control-height-s), var(--bx-target-min));
        --_padding: var(--bx-space-s);
      }
      :host([size='l']) {
        --_min-height: max(var(--bx-control-height-l), var(--bx-target-min));
        --_padding: var(--bx-space-l);
      }

      .base {
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--bx-toggle-button-gap, var(--bx-space-2xs));
        min-block-size: var(--_min-height);
        padding-inline: var(--_padding);
        border: var(--bx-border-width) solid transparent;
        border-radius: var(--bx-radius-m);
        background: var(--bx-toggle-button-bg, var(--_bg, transparent));
        color: var(--_role-fg);
        font: inherit;
        ${textStyle('--bx-toggle-button', 'label-m')}
        cursor: pointer;
        transition:
          background var(--bx-motion-duration-fast)
            var(--bx-motion-easing-standard),
          filter var(--bx-motion-duration-fast) var(--bx-motion-easing-standard);
      }
      :host([appearance='outlined']) .base,
      :host(:not([appearance])) .base {
        border-color: var(--_role-border);
      }
      :host([appearance='filled']) .base {
        --_bg: var(--_role-subtle);
      }
      .base:hover {
        filter: brightness(0.95);
      }
      .base:focus-visible {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: var(--bx-focus-ring-offset);
      }
      .base[aria-pressed='true'] {
        background: var(--bx-toggle-button-pressed-bg, var(--_role-solid));
        color: var(--bx-toggle-button-pressed-fg, var(--_role-on-solid));
        border-color: var(--_role-solid);
      }
      .base:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
      .start,
      .end,
      .check {
        display: inline-flex;
        align-items: center;
      }
      .start:empty,
      .end:empty {
        display: none;
      }
      .check svg {
        inline-size: 1em;
        block-size: 1em;
        fill: currentColor;
      }

      @media (prefers-reduced-motion: reduce) {
        .base {
          transition: none;
        }
      }
      @media (forced-colors: active) {
        .base {
          forced-color-adjust: none;
          border-color: ButtonText;
          background: ButtonFace;
          color: ButtonText;
        }
        .base[aria-pressed='true'] {
          background: Highlight;
          color: HighlightText;
        }
        .base:disabled {
          border-color: GrayText;
          color: GrayText;
        }
      }
    `,
  ];

  static override properties = {
    pressed: { type: Boolean, reflect: true },
    value: { type: String },
    name: { type: String },
    variant: { type: String, reflect: true },
    appearance: { type: String, reflect: true },
    size: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  declare pressed: boolean;
  declare value: string;
  declare name: string;
  declare variant: Variant;
  declare appearance: Appearance;
  declare size: 's' | 'm' | 'l';
  declare disabled: boolean;

  #baseRef = createRef<HTMLButtonElement>();

  constructor() {
    super();
    this.pressed = false;
    this.value = 'on';
    this.name = '';
    this.variant = 'secondary';
    this.appearance = 'outlined';
    this.size = 'm';
    this.disabled = false;
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('pressed') || changed.has('value') || changed.has('name'))
      this.internals.setFormValue(
        this.pressed && this.name ? this.value : null,
      );
  }

  #defaultPressed?: boolean;

  override connectedCallback(): void {
    super.connectedCallback();
    // `pressed` reflects, so the attribute stops being the initial value once toggled.
    this.#defaultPressed ??= this.hasAttribute('pressed');
  }

  formResetCallback(): void {
    this.pressed = this.#defaultPressed ?? false;
  }

  formStateRestoreCallback(state: string | null): void {
    this.pressed = state === 'true';
  }

  override focus(options?: FocusOptions): void {
    this.#baseRef.value?.focus(options);
  }

  override blur(): void {
    this.#baseRef.value?.blur();
  }

  override click(): void {
    this.#baseRef.value?.click();
  }

  #onClick = (): void => {
    if (this.disabled) return;
    this.pressed = !this.pressed;
    for (const type of ['input', 'change'])
      this.dispatchEvent(new Event(type, { bubbles: true, composed: true }));
  };

  protected override render() {
    return html`<button
      ${ref(this.#baseRef)}
      class="base"
      part="base"
      type="button"
      aria-pressed=${this.pressed ? 'true' : 'false'}
      ?disabled=${this.disabled}
      @click=${this.#onClick}
    >
      <span class="start"><slot name="start"></slot></span>
      ${
        this.pressed
          ? html`<span class="check" aria-hidden="true"
              ><svg viewBox="0 0 256 256">
                <path
                  d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"
                /></svg
            ></span>`
          : nothing
      }
      <span class="label"><slot></slot></span>
      <span class="end"><slot name="end"></slot></span>
    </button>`;
  }
}
