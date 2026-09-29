import { css, html, nothing, type PropertyValues } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';
import { FormAssociatedMixin } from '../internal/form-associated.ts';

type Size = 'small' | 'medium' | 'large';

let nextId = 0;

// Vendored from packages/core/src/icon/default-library.ts (Phosphor Icons, regular, MIT).
const PLUS_PATH =
  'M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z';
const MINUS_PATH =
  'M228,128a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,128Z';

const INITIAL_REPEAT_DELAY_MS = 400;
const MIN_REPEAT_DELAY_MS = 40;
const REPEAT_ACCELERATION = 0.85;

function localeParts(locale: string | undefined): { decimal: string; group: string } {
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
  return {
    decimal: parts.find((part) => part.type === 'decimal')?.value ?? '.',
    group: parts.find((part) => part.type === 'group')?.value ?? ',',
  };
}

/** Locale-aware parse (FR-NUMBER-INPUT-04): strips the locale's group separator, normalizes its
 *  decimal separator to `.`, then a plain `Number()`. Returns `NaN` for unparseable input. */
function parseLocaleNumber(raw: string, locale: string | undefined): number {
  const { decimal, group } = localeParts(locale);
  const normalized = raw
    .trim()
    .split(group)
    .join('')
    .split(decimal)
    .join('.');
  return normalized === '' ? Number.NaN : Number(normalized);
}

function decimalPlaces(n: number): number {
  const str = String(n);
  const dot = str.indexOf('.');
  return dot === -1 ? 0 : str.length - dot - 1;
}

/** Floating-point-safe stepping (FR-NUMBER-INPUT-06): rounds to the larger of `step`'s and the
 *  current value's own decimal precision, instead of letting `0.1 + 0.2` drift. */
function applyStep(current: number, step: number, direction: 1 | -1): number {
  const places = Math.max(decimalPlaces(step), decimalPlaces(current));
  const factor = 10 ** places;
  return Math.round((current + direction * step) * factor) / factor;
}

function clamp(value: number, min: number | undefined, max: number | undefined): number {
  let result = value;
  if (min !== undefined) result = Math.max(result, min);
  if (max !== undefined) result = Math.min(result, max);
  return result;
}

/**
 * `<bx-number-input>` — numeric field with steppers, locale-aware parsing and min/max clamping,
 * form-associated via `ElementInternals` (docs/features/core/number-input.md).
 *
 * The native control is `<input type="text" inputmode="decimal">`, not `type="number"`: a native
 * number input can't show a locale-formatted display string (grouping separators, currency/
 * percent via `format`) while still accepting locale-aware typed input, which is exactly
 * FR-NUMBER-INPUT-04's split — this component shows the raw parseable string while focused/being
 * edited, and the `Intl.NumberFormat`-formatted string once blurred. `role="spinbutton"` plus
 * `aria-valuenow`/`-min`/`-max`/`-valuetext` (§6) are set directly on the input to compensate for
 * what `type="number"` would otherwise give for free.
 *
 * @fires input - Value changed by user (bubbles, composed).
 * @fires change - Committed change.
 * @fires bx-invalid - Constraint validation failed.
 *
 * @slot label - Overrides the `label` attribute's text.
 * @slot hint - Overrides the `hint` attribute's text.
 * @slot start - Content before the input.
 * @slot end - Content after the input.
 * @slot increment-icon - Overrides the default increment stepper icon.
 * @slot decrement-icon - Overrides the default decrement stepper icon.
 *
 * @csspart form-control - The outer wrapper (label + base + hint).
 * @csspart label - The label element.
 * @csspart hint - The wrapper around the hint slot.
 * @csspart base - The wrapper around start/input/end/steppers.
 * @csspart input - The native `<input>`.
 * @csspart stepper-up - The increment button.
 * @csspart stepper-down - The decrement button.
 */
export class BxNumberInput extends FormAssociatedMixin(BixElement) {
  static override tagName = 'bx-number-input';

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

      .label {
        color: var(--bx-text-primary);
        font-weight: var(--bx-font-weight-medium);
        font-size: var(--bx-font-s);
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
        background: var(--bx-surface-base);
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

      .base:has(.input:focus-visible) {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: var(--bx-focus-ring-offset);
      }

      :host([disabled]) .base {
        background: var(--bx-surface-subtle);
        color: var(--bx-text-disabled);
      }

      .base:has(.input[data-user-invalid]) {
        border-color: var(--bx-role-danger-border);
      }

      .input {
        all: unset;
        box-sizing: border-box;
        flex: 1;
        min-inline-size: 0;
        font: inherit;
        font-size: max(1rem, var(--bx-font-m));
        color: inherit;
        text-align: end;
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

      .steppers {
        display: flex;
        flex-direction: column;
        margin-inline: calc(var(--bx-space-2xs) * -1);
      }

      @container (max-width: 200px) {
        .steppers {
          flex-direction: row;
        }
      }

      .stepper {
        all: unset;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: calc(var(--bx-target-min, 2.75rem) * 0.6);
        block-size: calc(var(--bx-target-min, 2.75rem) * 0.5);
        color: var(--bx-text-secondary);
        cursor: pointer;
      }

      .stepper:hover:not(:disabled) {
        background: var(--bx-surface-subtle);
        color: var(--bx-text-primary);
      }

      .stepper:focus-visible {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: calc(var(--bx-focus-ring-offset) * -1);
      }

      .stepper:disabled {
        cursor: not-allowed;
        opacity: 0.4;
      }

      .stepper svg {
        inline-size: 0.7em;
        block-size: 0.7em;
        fill: currentColor;
      }

      .hint {
        color: var(--bx-text-secondary);
        font-size: var(--bx-font-s);
      }

      .hint:empty {
        display: none;
      }

      .hint[data-user-invalid] {
        color: var(--bx-role-danger-fg);
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
    min: { type: Number },
    max: { type: Number },
    step: { type: Number },
    locale: { type: String },
    format: { attribute: false },
    withoutSteppers: { type: Boolean, reflect: true, attribute: 'without-steppers' },
    wheel: { type: Boolean },
    _editing: { state: true },
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
  declare min?: number;
  declare max?: number;
  declare step: number;
  declare locale?: string;
  declare format?: Intl.NumberFormatOptions;
  declare withoutSteppers: boolean;
  declare wheel: boolean;
  /** @internal */
  declare _editing: boolean;

  #inputId = `bx-number-input-${nextId++}`;
  #hintId = `bx-number-input-hint-${nextId++}`;
  #hasInteracted = false;
  #defaultValue = '';
  #repeatTimer?: ReturnType<typeof setTimeout>;
  #inputRef = createRef<HTMLInputElement>();

  get #inputEl(): HTMLInputElement {
    return this.#inputRef.value!;
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
    this.step = 1;
    this.withoutSteppers = false;
    this.wheel = false;
    this._editing = false;

    window.addEventListener('pointerup', this.#stopRepeat);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('pointerup', this.#stopRepeat);
    this.#stopRepeat();
  }

  protected override firstUpdated(): void {
    this.#defaultValue = this.value;
    this.#syncValidity();
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('value')) {
      this.internals.setFormValue(this.value);
      this.#syncValidity();
    }
    if (changed.has('required') || changed.has('min') || changed.has('max')) this.#syncValidity();
  }

  get #numericValue(): number {
    return this.value === '' ? Number.NaN : Number(this.value);
  }

  #displayValue(): string {
    if (this.value === '') return '';
    const numeric = this.#numericValue;
    if (Number.isNaN(numeric)) return this.value;
    if (this._editing) return String(numeric);
    return new Intl.NumberFormat(this.locale, this.format).format(numeric);
  }

  #syncValidity(): void {
    const numeric = this.#numericValue;
    const missing = this.required && this.value === '';
    const rangeUnderflow = !missing && this.min !== undefined && !Number.isNaN(numeric) && numeric < this.min;
    const rangeOverflow = !missing && this.max !== undefined && !Number.isNaN(numeric) && numeric > this.max;
    const badInput = !missing && this.value !== '' && Number.isNaN(numeric);

    this.internals.setValidity(
      missing
        ? { valueMissing: true }
        : rangeUnderflow
          ? { rangeUnderflow: true }
          : rangeOverflow
            ? { rangeOverflow: true }
            : badInput
              ? { badInput: true }
              : {},
      missing
        ? 'Please fill out this field.'
        : rangeUnderflow
          ? `Value must be greater than or equal to ${this.min}.`
          : rangeOverflow
            ? `Value must be less than or equal to ${this.max}.`
            : badInput
              ? 'Please enter a valid number.'
              : undefined,
      this.#inputEl,
    );

    if (this.#hasInteracted) {
      this.toggleAttribute('data-user-valid', this.internals.validity.valid);
      this.toggleAttribute('data-user-invalid', !this.internals.validity.valid);
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

  #commit(numeric: number, fireChange: boolean): void {
    const clamped = clamp(numeric, this.min, this.max);
    const next = Number.isNaN(clamped) ? '' : String(clamped);
    const changed = next !== this.value;
    this.value = next;
    this.#hasInteracted = true;
    if (changed) this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    if (fireChange) {
      this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
      if (!this.internals.checkValidity())
        this.dispatchEvent(new CustomEvent('bx-invalid', { bubbles: true, composed: true }));
    }
  }

  #handleFocus = (): void => {
    this._editing = true;
  };

  #handleBlur = (): void => {
    this._editing = false;
    const raw = this.#inputEl.value;
    this.#commit(raw === '' ? Number.NaN : parseLocaleNumber(raw, this.locale), true);
  };

  #handleInput = (event: Event): void => {
    const raw = (event.target as HTMLInputElement).value;
    this.#hasInteracted = true;
    if (raw === '') {
      this.value = '';
      this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      return;
    }
    const numeric = parseLocaleNumber(raw, this.locale);
    if (Number.isNaN(numeric)) return; // Let the user keep typing (e.g. a lone "-" or "1.").
    this.value = String(numeric);
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  };

  #doStep(direction: 1 | -1): void {
    if (this.disabled) return;
    const base = Number.isNaN(this.#numericValue) ? 0 : this.#numericValue;
    this.#commit(applyStep(base, this.step, direction), true);
    if (this._editing) this.#inputEl.value = this.#displayValue();
  }

  #startRepeat(direction: 1 | -1): void {
    this.#doStep(direction);
    let delay = INITIAL_REPEAT_DELAY_MS;
    const tick = (): void => {
      this.#doStep(direction);
      delay = Math.max(MIN_REPEAT_DELAY_MS, delay * REPEAT_ACCELERATION);
      this.#repeatTimer = setTimeout(tick, delay);
    };
    this.#repeatTimer = setTimeout(tick, delay);
  }

  #stopRepeat = (): void => {
    clearTimeout(this.#repeatTimer);
    this.#repeatTimer = undefined;
  };

  #handleStepperPointerDown(direction: 1 | -1, event: PointerEvent): void {
    event.preventDefault(); // Keep focus (and the caret) in the input.
    if (this.disabled) return;
    this.#startRepeat(direction);
  }

  #handleInputKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.#doStep(1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.#doStep(-1);
    } else if (event.key === 'PageUp') {
      event.preventDefault();
      this.#commit(applyStep(this.#numericValue || 0, this.step * 10, 1), true);
    } else if (event.key === 'PageDown') {
      event.preventDefault();
      this.#commit(applyStep(this.#numericValue || 0, this.step * 10, -1), true);
    }
  };

  #handleWheel = (event: WheelEvent): void => {
    if (!this.wheel || document.activeElement !== this) return;
    event.preventDefault();
    this.#doStep(event.deltaY < 0 ? 1 : -1);
  };

  /** Increments by `step` (or a caller-supplied amount), clamped to `max`. */
  stepUp(amount = this.step): void {
    this.#commit(applyStep(this.#numericValue || 0, amount, 1), true);
  }

  /** Decrements by `step` (or a caller-supplied amount), clamped to `min`. */
  stepDown(amount = this.step): void {
    this.#commit(applyStep(this.#numericValue || 0, amount, -1), true);
  }

  /** Focuses the internal input. */
  override focus(options?: FocusOptions): void {
    this.#inputEl?.focus(options);
  }

  protected override render() {
    const showLabel = this.withLabel || this.label.length > 0;
    const showHint = this.withHint || this.hint.length > 0;
    const numeric = this.#numericValue;
    const atMin = this.min !== undefined && !Number.isNaN(numeric) && numeric <= this.min;
    const atMax = this.max !== undefined && !Number.isNaN(numeric) && numeric >= this.max;

    return html`
      <div class="form-control" part="form-control">
        ${
          showLabel
            ? html`<label class="label" part="label" for=${this.#inputId}
                ><slot name="label">${this.label}</slot></label
              >`
            : nothing
        }
        <div class="base" part="base" @wheel=${this.#handleWheel}>
          <span class="start" part="start"><slot name="start"></slot></span>
          <input
            ${ref(this.#inputRef)}
            class="input"
            part="input"
            id=${this.#inputId}
            type="text"
            inputmode="decimal"
            role="spinbutton"
            name=${this.name || nothing}
            .value=${this.#displayValue()}
            ?disabled=${this.disabled}
            ?required=${this.required}
            aria-valuenow=${Number.isNaN(numeric) ? nothing : numeric}
            aria-valuemin=${this.min ?? nothing}
            aria-valuemax=${this.max ?? nothing}
            aria-valuetext=${Number.isNaN(numeric) ? nothing : this.#displayValue()}
            aria-describedby=${showHint ? this.#hintId : nothing}
            @focus=${this.#handleFocus}
            @blur=${this.#handleBlur}
            @input=${this.#handleInput}
            @keydown=${this.#handleInputKeydown}
          />
          <span class="end" part="end"><slot name="end"></slot></span>
          ${
            this.withoutSteppers
              ? nothing
              : html`<span class="steppers">
                  <button
                    type="button"
                    class="stepper"
                    part="stepper-up"
                    tabindex="-1"
                    aria-hidden="true"
                    ?disabled=${this.disabled || atMax}
                    @pointerdown=${(event: PointerEvent) => this.#handleStepperPointerDown(1, event)}
                  >
                    <slot name="increment-icon"
                      ><svg viewBox="0 0 256 256"><path d=${PLUS_PATH}></path></svg
                    ></slot>
                  </button>
                  <button
                    type="button"
                    class="stepper"
                    part="stepper-down"
                    tabindex="-1"
                    aria-hidden="true"
                    ?disabled=${this.disabled || atMin}
                    @pointerdown=${(event: PointerEvent) => this.#handleStepperPointerDown(-1, event)}
                  >
                    <slot name="decrement-icon"
                      ><svg viewBox="0 0 256 256"><path d=${MINUS_PATH}></path></svg
                    ></slot>
                  </button>
                </span>`
          }
        </div>
        ${
          showHint
            ? html`<div class="hint" part="hint" id=${this.#hintId}>
                <slot name="hint">${this.hint}</slot>
              </div>`
            : nothing
        }
      </div>
    `;
  }
}
