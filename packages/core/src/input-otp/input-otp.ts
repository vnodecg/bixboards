import { css, html, nothing, type PropertyValues } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';
import { FormAssociatedMixin } from '../internal/form-associated.ts';
import { textFamily, textStyle } from '../internal/text-style.ts';

type OtpType = 'numeric' | 'alphanumeric' | 'text';

const STRIP: Record<OtpType, RegExp> = {
  numeric: /\D/g,
  alphanumeric: /[^a-z0-9]/gi,
  text: /\s/g,
};

let nextId = 0;

/**
 * `<bx-input-otp>` — segmented one-time-code entry (docs/features/core/input-otp.md).
 *
 * One real, visually transparent `<input autocomplete="one-time-code" inputmode>` is stretched
 * over presentational cells (FR-INPUTOTP-01), so OS autofill, password managers, native paste and
 * arrow/Backspace caret movement all work without reimplementation (FR-INPUTOTP-02); disallowed
 * characters are stripped on input. Form-associated: `required` is only satisfied once every cell
 * is filled (FR-INPUTOTP-03). The cell row is `dir="ltr"` so digits never reverse in RTL
 * (FR-INPUTOTP-04).
 *
 * @fires input - Any cell changed.
 * @fires change - Value committed (blur or completion).
 * @fires bx-complete - All cells filled. `detail.value`.
 *
 * @slot label - Label content (alternative to `label`).
 * @slot hint - Help text.
 * @slot separator - Between groups.
 *
 * @csspart group - A visual group of cells.
 * @csspart cell - A single character cell.
 * @csspart separator - The separator part.
 *
 * @cssprop --bx-input-otp-gap - Gap between cells. Default `var(--bx-space-2xs)`.
 * @cssprop --bx-input-otp-bg - Cell background.
 * @cssprop --bx-input-otp-border-color - Cell border color.
 * @cssprop --bx-input-otp-radius - Cell radius.
 * @cssprop --bx-input-otp-font-family - Font family of the root surface. Default `var(--bx-type-field-family)`.
 * @cssprop --bx-input-otp-font-size - Font size of the root surface. Default `var(--bx-type-field-size)`.
 * @cssprop --bx-input-otp-font-weight - Font weight of the root surface. Default `var(--bx-type-field-weight)`.
 * @cssprop --bx-input-otp-line-height - Line height of the root surface. Default `var(--bx-type-field-leading)`.
 * @cssprop --bx-input-otp-letter-spacing - Letter spacing of the root surface. Default `var(--bx-type-field-tracking)`.
 * @cssprop --bx-input-otp-hint-font-family - Font family of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-family)`.
 * @cssprop --bx-input-otp-hint-font-size - Font size of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-size)`.
 * @cssprop --bx-input-otp-hint-font-weight - Font weight of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-weight)`.
 * @cssprop --bx-input-otp-hint-line-height - Line height of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-leading)`.
 * @cssprop --bx-input-otp-hint-letter-spacing - Letter spacing of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-tracking)`.
 * @cssprop --bx-input-otp-label-font-family - Font family of the `label` text (text style `label-m`). Default `var(--bx-type-label-family)`.
 * @cssprop --bx-input-otp-label-font-size - Font size of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-size)`.
 * @cssprop --bx-input-otp-label-font-weight - Font weight of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-weight)`.
 * @cssprop --bx-input-otp-label-line-height - Line height of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-leading)`.
 * @cssprop --bx-input-otp-label-letter-spacing - Letter spacing of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-tracking)`.
 */
export class BxInputOtp extends FormAssociatedMixin(BixElement) {
  static override tagName = 'bx-input-otp';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-block;
        ${textFamily('--bx-input-otp', 'field')}
      }
      .label {
        display: block;
        margin-block-end: var(--bx-space-2xs);
        color: var(--bx-text-primary);
        ${textStyle('--bx-input-otp-label', 'label-m')}
      }
      .label:not(:has(*)):empty {
        display: none;
      }
      .field {
        position: relative;
        display: inline-block;
      }
      .cells {
        display: flex;
        align-items: center;
        gap: calc(var(--bx-input-otp-gap, var(--bx-space-2xs)) * 2);
      }
      .group {
        display: flex;
        gap: var(--bx-input-otp-gap, var(--bx-space-2xs));
      }
      .cell {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: calc(var(--bx-control-height-m) * 0.9);
        block-size: var(--bx-control-height-m);
        min-inline-size: calc(var(--bx-target-min) * 0.8);
        min-block-size: var(--bx-target-min);
        border: var(--bx-border-width) solid
          var(
            --bx-input-otp-border-color,
            var(--bx-border-strong, var(--bx-border-subtle))
          );
        border-radius: var(--bx-input-otp-radius, var(--bx-radius-m));
        background: var(--bx-input-otp-bg, var(--bx-surface-base));
        color: var(--bx-text-primary);
        ${textStyle('--bx-input-otp', 'field-l')}
        font-variant-numeric: tabular-nums;
      }
      .cell[data-active] {
        border-color: var(--bx-focus-ring);
        box-shadow: 0 0 0 var(--bx-border-width-strong) var(--bx-focus-ring);
      }
      :host([invalid]) .cell {
        border-color: var(--bx-role-danger-border);
      }
      :host([disabled]) .cell {
        opacity: 0.5;
      }
      .caret {
        inline-size: 1px;
        block-size: 1.2em;
        background: currentColor;
        animation: blink var(--bx-motion-duration-spin) steps(2, start) infinite;
      }
      @keyframes blink {
        to {
          visibility: hidden;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .caret {
          animation: none;
        }
      }
      input {
        position: absolute;
        inset: 0;
        inline-size: 100%;
        block-size: 100%;
        margin: 0;
        padding: 0;
        border: 0;
        opacity: 0;
        cursor: text;
        font-size: var(--bx-font-floor); /* prevents iOS zoom-on-focus */
      }
      .hint {
        margin-block-start: var(--bx-space-2xs);
        color: var(--bx-text-secondary);
        ${textStyle('--bx-input-otp-hint', 'caption-m')}
      }
      .hint:not(:has(::slotted(*))) {
        display: none;
      }
      @media (forced-colors: active) {
        .cell {
          border-color: ButtonText;
        }
        .cell[data-active] {
          border-color: Highlight;
        }
      }
    `,
  ];

  static override properties = {
    length: { type: Number },
    value: { type: String },
    type: { type: String },
    mask: { type: Boolean },
    groupSize: { type: Number, attribute: 'group-size' },
    label: { type: String },
    name: { type: String },
    invalid: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    autofocus: { type: Boolean },
    _caret: { state: true },
    _focused: { state: true },
  };

  declare length: number;
  declare value: string;
  declare type: OtpType;
  declare mask: boolean;
  declare groupSize: number;
  declare label: string;
  declare name: string;
  declare invalid: boolean;
  declare disabled: boolean;
  declare required: boolean;
  declare autofocus: boolean;
  /** @internal */
  declare _caret: number;
  /** @internal */
  declare _focused: boolean;

  #inputRef = createRef<HTMLInputElement>();
  #id = `bx-otp-${nextId++}`;
  #defaultValue?: string;

  constructor() {
    super();
    this.length = 6;
    this.value = '';
    this.type = 'numeric';
    this.mask = false;
    this.groupSize = 0;
    this.label = '';
    this.name = '';
    this.invalid = false;
    this.disabled = false;
    this.required = false;
    this.autofocus = false;
    this._caret = 0;
    this._focused = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#defaultValue ??= this.value;
  }

  protected override firstUpdated(): void {
    if (this.autofocus) this.focus();
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('value') || changed.has('type') || changed.has('length'))
      this.value = this.#clean(this.value);
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (
      changed.has('value') ||
      changed.has('required') ||
      changed.has('length') ||
      changed.has('name')
    ) {
      this.internals.setFormValue(this.name ? this.value : null);
      const missing = this.required && this.value.length < this.length;
      this.internals.setValidity(
        missing ? { valueMissing: true } : {},
        missing ? 'Please enter the full code.' : undefined,
        this.#inputRef.value,
      );
    }
  }

  formResetCallback(): void {
    this.value = this.#defaultValue ?? '';
  }

  formStateRestoreCallback(state: string | null): void {
    this.value = state ?? '';
  }

  override focus(options?: FocusOptions): void {
    this.#inputRef.value?.focus(options);
  }

  override blur(): void {
    this.#inputRef.value?.blur();
  }

  #clean(raw: string): string {
    return (raw ?? '')
      .replace(STRIP[this.type] ?? STRIP.text, '')
      .slice(0, Math.max(this.length, 0));
  }

  #syncCaret = (): void => {
    const input = this.#inputRef.value;
    if (input) this._caret = input.selectionStart ?? input.value.length;
  };

  #onInput = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    const cleaned = this.#clean(input.value);
    input.value = cleaned;
    this.value = cleaned;
    this.#syncCaret();
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    if (cleaned.length === this.length) {
      this.dispatchEvent(
        new CustomEvent('bx-complete', {
          bubbles: true,
          composed: true,
          detail: { value: cleaned },
        }),
      );
      this.dispatchEvent(
        new Event('change', { bubbles: true, composed: true }),
      );
    }
  };

  #onBlur = (): void => {
    this._focused = false;
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  };

  protected override render() {
    const size = this.groupSize > 0 ? this.groupSize : this.length;
    const cells = Array.from({ length: this.length }, (_, i) => i);
    const groups: number[][] = [];
    for (let i = 0; i < cells.length; i += size)
      groups.push(cells.slice(i, i + size));
    const active = Math.min(this._caret, this.length - 1);
    const inputmode = this.type === 'numeric' ? 'numeric' : 'text';
    return html`
      <label class="label" for=${this.#id}
        ><slot name="label">${this.label}</slot></label
      >
      <div class="field">
        <div class="cells" dir="ltr" aria-hidden="true">
          ${groups.map(
            (group, g) =>
              html`${
                  g > 0
                    ? html`<span class="separator" part="separator"
                        ><slot name="separator">–</slot></span
                      >`
                    : nothing
                }<span class="group" part="group"
                  >${group.map((i) => {
                    const char = this.value[i];
                    const isActive = this._focused && i === active;
                    return html`<span
                      class="cell"
                      part="cell"
                      ?data-active=${isActive}
                      >${
                        char
                          ? this.mask
                            ? '•'
                            : char
                          : isActive
                            ? html`<span class="caret"></span>`
                            : nothing
                      }</span
                    >`;
                  })}</span
                >`,
          )}
        </div>
        <input
          ${ref(this.#inputRef)}
          id=${this.#id}
          .value=${this.value}
          type=${this.mask ? 'password' : 'text'}
          inputmode=${inputmode}
          autocomplete="one-time-code"
          autocapitalize="off"
          spellcheck="false"
          maxlength=${this.length}
          ?disabled=${this.disabled}
          ?required=${this.required}
          aria-invalid=${this.invalid ? 'true' : 'false'}
          aria-describedby="hint"
          @input=${this.#onInput}
          @focus=${() => {
            this._focused = true;
            this.#syncCaret();
          }}
          @blur=${this.#onBlur}
          @keyup=${this.#syncCaret}
          @click=${this.#syncCaret}
          @select=${this.#syncCaret}
        />
      </div>
      <div class="hint" id="hint"><slot name="hint"></slot></div>
    `;
  }
}
