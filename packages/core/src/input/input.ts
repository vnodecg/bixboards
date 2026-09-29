import { css, html, nothing, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';
import { FormAssociatedMixin } from '../internal/form-associated.ts';

type InputType =
  | 'text'
  | 'email'
  | 'number'
  | 'password'
  | 'search'
  | 'tel'
  | 'url'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'month'
  | 'week';
type Size = 'small' | 'medium' | 'large';
type Appearance = 'outlined' | 'filled' | 'filled outlined';
type LabelPosition = 'auto' | 'inline' | 'stacked';

const CLEAR_PATH =
  'M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20Zm37.66,130.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,22.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32L139.31,128Z';
const EYE_PATH =
  'M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-58.67-11.19-80.67-32.4A129.6,129.6,0,0,1,25,128,129.6,129.6,0,0,1,47.33,96.4C69.33,75.19,97.22,64,128,64s58.67,11.19,80.67,32.4A129.6,129.6,0,0,1,231,128,129.6,129.6,0,0,1,208.67,159.6C186.67,180.81,158.78,192,128,192Zm0-104a40,40,0,1,0,40,40A40,40,0,0,0,128,88Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,152Z';
const EYE_SLASH_PATH =
  'M53.92,34.62A8,8,0,1,0,42.08,45.38l14.7,16.15C31.13,79.14,17.06,103.15,16.4,104.34a8,8,0,0,0,0,7.32C16.75,112.45,49.66,176,128,176a114.63,114.63,0,0,0,40.44-7.29l17.83,19.6a8,8,0,1,0,11.84-10.76ZM128,160c-46.87,0-77.08-38.24-88.05-56C46,95.71,55.19,84.62,66.74,75.44l13.53,14.87A40,40,0,0,0,152.83,146.6L166.9,161.7A96.7,96.7,0,0,1,128,160Zm-24-56.65a24,24,0,0,1,26.28-26.28l14.62,16.07A8,8,0,0,0,148,104a8.11,8.11,0,0,0,.86,0,24,24,0,0,1-21.5,26.61ZM231.6,111.66c-.19.29-4.9,7.63-13.11,17.61a8,8,0,1,1-12.24-10.32c5.51-6.55,9-11.68,10.77-14.51-11-17.74-41.24-56.44-88.02-56.44a89.6,89.6,0,0,0-19.03,2A8,8,0,1,1,106.7,34a105.5,105.5,0,0,1,21.3-2.22c78.34,0,111.25,63.55,111.6,64.34A8,8,0,0,1,231.6,111.66Z';

let nextId = 0;

/**
 * `<bx-input>` — single-line text field, form-associated via `ElementInternals`, wrapping a real
 * native `<input>` in its shadow root.
 *
 * The native input does the heavy lifting the spec asks for: constraint attributes
 * (`required`/`pattern`/`min`/`max`/`step`/`minlength`/`maxlength`) are mirrored onto it and its
 * own `ValidityState` is forwarded verbatim to `internals.setValidity` (FR-INPUT-02) rather than
 * reimplemented — this also gives native focus-on-invalid/`reportValidity()` UI for free, with the
 * native element as the validation anchor.
 *
 * @fires input - Value changed by user (bubbles, composed; debounced by the `debounce` attribute).
 * @fires change - Committed change (bubbles, composed).
 * @fires bx-invalid - Constraint validation failed.
 * @fires bx-clear - The clear button was activated.
 *
 * @slot label - Overrides the `label` attribute's text.
 * @slot hint - Overrides the `hint` attribute's text.
 * @slot start - Content before the input (icon, prefix).
 * @slot end - Content after the input (icon, suffix).
 * @slot clear-icon - Overrides the default clear-button icon.
 * @slot show-password-icon - Overrides the default "reveal password" icon.
 * @slot hide-password-icon - Overrides the default "hide password" icon.
 *
 * @csspart form-control - The outer wrapper (label + base + hint).
 * @csspart label - The label element.
 * @csspart hint - The wrapper around the hint slot.
 * @csspart base - The wrapper around start/input/end.
 * @csspart input - The native `<input>`.
 * @csspart start - The wrapper around the start slot.
 * @csspart end - The wrapper around the end slot.
 * @csspart clear-button - The clear button.
 * @csspart password-toggle-button - The password-reveal toggle button.
 *
 * @cssprop --bx-input-height - Control height. Default derived from `size`.
 * @cssprop --bx-input-padding-inline - Horizontal padding. Default `--bx-space-m`.
 */
export class BxInput extends FormAssociatedMixin(BixElement) {
  static override tagName = 'bx-input';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        container-type: inline-size;
        font-family: var(--bx-font-family-sans);
      }

      .form-control {
        display: flex;
        flex-direction: column;
        gap: var(--bx-space-xs);
      }

      :host([label-position='inline']) .form-control {
        flex-direction: row;
        align-items: center;
        gap: var(--bx-space-s);
      }

      @container (max-width: calc(var(--bx-unit) * 28)) {
        :host([label-position='auto']) .form-control {
          flex-direction: column;
          align-items: stretch;
        }
      }

      .label {
        color: var(--bx-text-primary);
        font-weight: var(--bx-font-weight-medium);
        font-size: var(--bx-font-size-s);
      }

      .label:empty {
        display: none;
      }

      .base {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: var(--bx-space-xs);
        min-block-size: var(--bx-input-height, var(--bx-target-min, 2.75rem));
        padding-inline: var(--bx-input-padding-inline, var(--bx-space-m));
        border-radius: var(--bx-radius-m);
        border: var(--bx-border-width) solid var(--bx-border-subtle);
        background: var(--bx-surface);
        flex: 1;
        min-inline-size: 0;
      }

      :host([size='small']) .base {
        --bx-input-height: calc(var(--bx-target-min, 2.75rem) * 0.8);
      }
      :host([size='large']) .base {
        --bx-input-height: calc(var(--bx-target-min, 2.75rem) * 1.2);
      }

      :host([appearance~='filled']) .base {
        background: var(--bx-surface-subtle);
        border-color: transparent;
      }

      :host([pill]) .base {
        border-radius: var(--bx-radius-full, 999px);
      }

      .base:has(.input:focus-visible) {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: var(--bx-focus-ring-offset);
      }

      :host([disabled]) .base {
        background: var(--bx-surface-subtle);
        color: var(--bx-text-disabled);
      }

      .base:has(.input[data-user-invalid]) {
        border-color: var(--bx-role-danger);
      }

      .input {
        all: unset;
        box-sizing: border-box;
        flex: 1;
        min-inline-size: 0;
        font: inherit;
        font-size: max(1rem, var(--bx-font-size-m));
        color: inherit;
      }

      .input::placeholder {
        color: var(--bx-text-secondary);
      }

      .start,
      .end {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
        color: var(--bx-text-secondary);
      }

      .start:empty,
      .end:empty {
        display: none;
      }

      .clear-button,
      .password-toggle-button {
        all: unset;
        box-sizing: border-box;
        display: inline-flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        inline-size: 1.5em;
        block-size: 1.5em;
        border-radius: var(--bx-radius-full, 50%);
        color: var(--bx-text-secondary);
        cursor: pointer;
      }

      .clear-button:hover,
      .password-toggle-button:hover {
        background: var(--bx-surface-subtle);
      }

      .clear-button:focus-visible,
      .password-toggle-button:focus-visible {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: var(--bx-focus-ring-offset);
      }

      .clear-button svg,
      .password-toggle-button svg {
        inline-size: 1em;
        block-size: 1em;
        fill: currentColor;
      }

      .hint {
        color: var(--bx-text-secondary);
        font-size: var(--bx-font-size-s);
      }

      .hint:empty {
        display: none;
      }

      .hint[data-user-invalid] {
        color: var(--bx-role-danger);
      }

      @media (forced-colors: active) {
        .base {
          forced-color-adjust: none;
          border-color: CanvasText;
          background: Canvas;
        }
      }
    `,
  ];

  static override properties = {
    name: { type: String },
    value: { type: String },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    hint: { type: String },
    label: { type: String },
    withLabel: { type: Boolean, reflect: true, attribute: 'with-label' },
    withHint: { type: Boolean, reflect: true, attribute: 'with-hint' },
    size: { type: String, reflect: true },
    type: { type: String, reflect: true },
    placeholder: { type: String },
    clearable: { type: Boolean, reflect: true },
    passwordToggle: {
      type: Boolean,
      reflect: true,
      attribute: 'password-toggle',
    },
    readonly: { type: Boolean, reflect: true },
    pattern: { type: String },
    minlength: { type: Number },
    maxlength: { type: Number },
    min: { type: String },
    max: { type: String },
    step: { type: String },
    autocomplete: { type: String },
    inputmode: { type: String },
    spellcheck: { type: Boolean },
    appearance: { type: String, reflect: true },
    pill: { type: Boolean, reflect: true },
    labelPosition: {
      type: String,
      reflect: true,
      attribute: 'label-position',
    },
    debounce: { type: Number },
  };

  declare name: string;
  declare value: string;
  declare disabled: boolean;
  declare required: boolean;
  declare hint: string;
  declare label: string;
  declare withLabel: boolean;
  declare withHint: boolean;
  declare size: Size;
  declare type: InputType;
  declare placeholder: string;
  declare clearable: boolean;
  declare passwordToggle: boolean;
  declare readonly: boolean;
  declare pattern: string;
  declare minlength?: number;
  declare maxlength?: number;
  declare min?: string;
  declare max?: string;
  declare step?: string;
  declare autocomplete: string;
  declare inputmode: string;
  declare spellcheck: boolean;
  declare appearance: Appearance;
  declare pill: boolean;
  declare labelPosition: LabelPosition;
  declare debounce?: number;

  #inputId = `bx-input-${nextId++}`;
  #hintId = `bx-input-hint-${nextId++}`;
  #hasInteracted = false;
  #revealed = false;
  #defaultValue = '';
  #debounceTimer?: ReturnType<typeof setTimeout>;

  get #inputEl(): HTMLInputElement {
    return this.shadowRoot!.querySelector('.input')!;
  }

  constructor() {
    super();
    this.name = '';
    this.value = '';
    this.disabled = false;
    this.required = false;
    this.hint = '';
    this.label = '';
    this.withLabel = false;
    this.withHint = false;
    this.size = 'medium';
    this.type = 'text';
    this.placeholder = '';
    this.clearable = false;
    this.passwordToggle = false;
    this.readonly = false;
    this.pattern = '';
    this.autocomplete = '';
    this.inputmode = '';
    this.spellcheck = true;
    this.appearance = 'outlined';
    this.pill = false;
    this.labelPosition = 'auto';
  }

  protected override createRenderRoot() {
    return this.attachShadow({ mode: 'open', delegatesFocus: true });
  }

  protected override firstUpdated(): void {
    // Captured here, not the constructor: the initial `value` attribute is applied by Lit after
    // the constructor runs but before `firstUpdated`, so this is the first point that reflects
    // what the form should reset back to.
    this.#defaultValue = this.value;
    this.#syncValidity();
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('value')) {
      this.internals.setFormValue(this.value);
      this.#syncExternalValue(changed.get('value') as string | undefined);
    }
    if (
      changed.has('required') ||
      changed.has('pattern') ||
      changed.has('minlength') ||
      changed.has('maxlength') ||
      changed.has('min') ||
      changed.has('max') ||
      changed.has('step') ||
      changed.has('type')
    )
      this.#syncValidity();
  }

  // FR-INPUT-05: a programmatic `value` assignment (not the user typing) shouldn't move the
  // caret if the input already has the resulting text and focus — only resync when the DOM
  // input's own value has drifted from the property (i.e. the assignment came from outside).
  #syncExternalValue(previous: string | undefined): void {
    const inputEl = this.#inputEl;
    if (!inputEl || inputEl.value === this.value || previous === undefined) return;
    const selectionStart = inputEl.selectionStart;
    const selectionEnd = inputEl.selectionEnd;
    inputEl.value = this.value;
    if (document.activeElement === this && selectionStart !== null && selectionEnd !== null) {
      const max = this.value.length;
      inputEl.setSelectionRange(Math.min(selectionStart, max), Math.min(selectionEnd, max));
    }
  }

  #syncValidity(hasInteracted = this.#hasInteracted): void {
    const inputEl = this.#inputEl;
    if (!inputEl) return;
    this.internals.setValidity(inputEl.validity, inputEl.validationMessage, inputEl);
    if (hasInteracted) {
      this.toggleAttribute('data-user-valid', inputEl.validity.valid);
      this.toggleAttribute('data-user-invalid', !inputEl.validity.valid);
      inputEl.toggleAttribute('data-user-invalid', !inputEl.validity.valid);
    }
  }

  formResetCallback(): void {
    this.value = this.#defaultValue;
    this.#hasInteracted = false;
    this.removeAttribute('data-user-valid');
    this.removeAttribute('data-user-invalid');
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    if (typeof state === 'string') this.value = state;
  }

  #handleInput = (event: Event): void => {
    this.value = (event.target as HTMLInputElement).value;
    this.#hasInteracted = true;
    this.#syncValidity();

    if (this.debounce && this.debounce > 0) {
      clearTimeout(this.#debounceTimer);
      this.#debounceTimer = setTimeout(() => this.#dispatchInput(), this.debounce);
    } else {
      this.#dispatchInput();
    }
  };

  #dispatchInput(): void {
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  }

  #handleChange = (): void => {
    this.#hasInteracted = true;
    this.#syncValidity();
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    if (!this.internals.checkValidity())
      this.dispatchEvent(new CustomEvent('bx-invalid', { bubbles: true, composed: true }));
  };

  #handleInvalid = (event: Event): void => {
    event.preventDefault(); // Suppress the native validation bubble; the host owns error UI.
    this.#hasInteracted = true;
    this.#syncValidity();
  };

  #handleClear = (): void => {
    this.value = '';
    this.#hasInteracted = true;
    this.#syncValidity();
    this.#inputEl.focus();
    this.dispatchEvent(new CustomEvent('bx-clear', { bubbles: true, composed: true }));
    this.#dispatchInput();
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  };

  #handleTogglePassword = (): void => {
    this.#revealed = !this.#revealed;
    this.requestUpdate();
  };

  /** Focuses the internal input. */
  override focus(options?: FocusOptions): void {
    this.#inputEl?.focus(options);
  }

  /** Blurs the internal input. */
  override blur(): void {
    this.#inputEl?.blur();
  }

  /** Selects all text in the internal input. */
  select(): void {
    this.#inputEl?.select();
  }

  setSelectionRange(start: number | null, end: number | null, direction?: 'forward' | 'backward' | 'none'): void {
    this.#inputEl?.setSelectionRange(start, end, direction);
  }

  setRangeText(...args: Parameters<HTMLInputElement['setRangeText']>): void {
    this.#inputEl?.setRangeText(...args);
    this.value = this.#inputEl.value;
  }

  showPicker(): void {
    this.#inputEl?.showPicker();
  }

  stepUp(stepIncrement?: number): void {
    this.#inputEl?.stepUp(stepIncrement);
    this.value = this.#inputEl.value;
  }

  stepDown(stepIncrement?: number): void {
    this.#inputEl?.stepDown(stepIncrement);
    this.value = this.#inputEl.value;
  }

  protected override render() {
    const showLabel = this.withLabel || this.label.length > 0;
    const showHint = this.withHint || this.hint.length > 0;
    const showClear = this.clearable && !!this.value && !this.disabled && !this.readonly;
    const showPasswordToggle = this.passwordToggle && this.type === 'password';
    const effectiveType = showPasswordToggle && this.#revealed ? 'text' : this.type;

    return html`
      <div class="form-control" part="form-control">
        ${showLabel
          ? html`<label class="label" part="label" for=${this.#inputId}
              ><slot name="label">${this.label}</slot></label
            >`
          : nothing}
        <div class="base" part="base">
          <span class="start" part="start"><slot name="start"></slot></span>
          <input
            class="input"
            part="input"
            id=${this.#inputId}
            type=${effectiveType}
            name=${this.name || nothing}
            .value=${this.value}
            placeholder=${this.placeholder || nothing}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            ?required=${this.required}
            ?spellcheck=${this.spellcheck}
            pattern=${this.pattern || nothing}
            minlength=${this.minlength ?? nothing}
            maxlength=${this.maxlength ?? nothing}
            min=${this.min ?? nothing}
            max=${this.max ?? nothing}
            step=${this.step ?? nothing}
            autocomplete=${this.autocomplete || nothing}
            inputmode=${this.inputmode || nothing}
            aria-describedby=${showHint ? this.#hintId : nothing}
            @input=${this.#handleInput}
            @change=${this.#handleChange}
            @invalid=${this.#handleInvalid}
          />
          ${showClear
            ? html`
                <button
                  type="button"
                  class="clear-button"
                  part="clear-button"
                  aria-label="Clear"
                  @click=${this.#handleClear}
                >
                  <slot name="clear-icon"
                    ><svg viewBox="0 0 256 256"><path d=${CLEAR_PATH}></path></svg></slot
                  >
                </button>
              `
            : nothing}
          ${showPasswordToggle
            ? html`
                <button
                  type="button"
                  class="password-toggle-button"
                  part="password-toggle-button"
                  aria-label=${this.#revealed ? 'Hide password' : 'Show password'}
                  aria-pressed=${this.#revealed}
                  @click=${this.#handleTogglePassword}
                >
                  ${this.#revealed
                    ? html`<slot name="hide-password-icon"
                        ><svg viewBox="0 0 256 256"><path d=${EYE_SLASH_PATH}></path></svg></slot
                      >`
                    : html`<slot name="show-password-icon"
                        ><svg viewBox="0 0 256 256"><path d=${EYE_PATH}></path></svg></slot
                      >`}
                </button>
              `
            : nothing}
          <span class="end" part="end"><slot name="end"></slot></span>
        </div>
        ${showHint
          ? html`<div class="hint" part="hint" id=${this.#hintId}>
              <slot name="hint">${this.hint}</slot>
            </div>`
          : nothing}
      </div>
    `;
  }
}
