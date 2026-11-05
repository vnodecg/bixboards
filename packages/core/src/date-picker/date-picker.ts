import { css, html, nothing, type PropertyValues } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';
import { FormAssociatedMixin } from '../internal/form-associated.ts';
import { getDateTimeFormatter } from '../internal/intl-cache.ts';
import { textFamily, textStyle } from '../internal/text-style.ts';
import { compare, parseISO, toISO } from '../calendar/dates.ts';
import type { BxCalendar } from '../calendar/calendar.ts';

let nextId = 0;

const CALENDAR_PATH =
  'M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z';

/**
 * Parses typed text into an ISO date for `locale`. Accepts `YYYY-MM-DD` anywhere, or numeric
 * day/month/year parts in the locale's own order (taken from `Intl.DateTimeFormat#formatToParts`).
 * Returns `undefined` for anything that is not a real calendar date.
 */
export function parseTypedDate(
  text: string,
  locale: string,
): string | undefined {
  const t = text.trim();
  if (!t) return undefined;
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t);
  if (iso) return fromParts(+iso[1]!, +iso[2]!, +iso[3]!);
  const nums = t
    .split(/[^\d]+/)
    .filter(Boolean)
    .map(Number);
  if (nums.length !== 3) return undefined;
  const order = getDateTimeFormatter(locale, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  })
    .formatToParts(new Date(2000, 10, 22))
    .filter((p) => p.type === 'day' || p.type === 'month' || p.type === 'year')
    .map((p) => p.type);
  const got: Record<string, number> = {};
  order.forEach((type, i) => (got[type] = nums[i]!));
  if (got['year']! < 100) got['year'] = got['year']! + 2000;
  return fromParts(got['year']!, got['month']!, got['day']!);
}

function fromParts(y: number, m: number, d: number): string | undefined {
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
    ? toISO(date)
    : undefined;
}

/**
 * `<bx-date-picker>` — date (or date range) field with a `bx-calendar` popup
 * (docs/features/core/date-picker.md).
 *
 * The field shows the value formatted with `Intl` (`format` options, default a short date) and
 * accepts typed entry in the locale's order or ISO; a typed value is validated against `min`/`max`
 * and committed on Enter or blur, an invalid one reverts. The calendar opens from the button or
 * ArrowDown, closes on selection (a range closes once both ends are picked), Escape or outside
 * click, and focus returns to the field. `value` is `YYYY-MM-DD`, or `start/end` with `range`.
 * Form-associated. The popup is a non-modal `bx-popup`, not a dialog.
 *
 * @fires input - Typed text changed.
 * @fires change - Committed value changed.
 * @fires bx-show - Popup is opening. Cancelable.
 * @fires bx-hide - Popup is closing. Cancelable.
 * @fires bx-invalid - Constraint validation failed.
 *
 * @slot label - Label content.
 * @slot hint - Help text.
 * @slot calendar-footer - Presets row, e.g. "Today".
 *
 * @csspart form-control - The form-control part.
 * @csspart input - The text input.
 * @csspart trigger - The calendar button.
 * @csspart calendar - The `bx-calendar`.
 *
 * @cssprop --bx-date-picker-bg - Field background.
 * @cssprop --bx-date-picker-border-color - Field border color.
 * @cssprop --bx-date-picker-radius - Field radius.
 * @cssprop --bx-date-picker-font-family - Font family of the root surface. Default `var(--bx-type-field-family)`.
 * @cssprop --bx-date-picker-font-size - Font size of the root surface. Default `var(--bx-type-field-size)`.
 * @cssprop --bx-date-picker-font-weight - Font weight of the root surface. Default `var(--bx-type-field-weight)`.
 * @cssprop --bx-date-picker-line-height - Line height of the root surface. Default `var(--bx-type-field-leading)`.
 * @cssprop --bx-date-picker-letter-spacing - Letter spacing of the root surface. Default `var(--bx-type-field-tracking)`.
 * @cssprop --bx-date-picker-hint-font-family - Font family of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-family)`.
 * @cssprop --bx-date-picker-hint-font-size - Font size of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-size)`.
 * @cssprop --bx-date-picker-hint-font-weight - Font weight of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-weight)`.
 * @cssprop --bx-date-picker-hint-line-height - Line height of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-leading)`.
 * @cssprop --bx-date-picker-hint-letter-spacing - Letter spacing of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-tracking)`.
 * @cssprop --bx-date-picker-label-font-family - Font family of the `label` text (text style `label-m`). Default `var(--bx-type-label-family)`.
 * @cssprop --bx-date-picker-label-font-size - Font size of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-size)`.
 * @cssprop --bx-date-picker-label-font-weight - Font weight of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-weight)`.
 * @cssprop --bx-date-picker-label-line-height - Line height of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-leading)`.
 * @cssprop --bx-date-picker-label-letter-spacing - Letter spacing of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-tracking)`.
 */
export class BxDatePicker extends FormAssociatedMixin(BixElement) {
  static override tagName = 'bx-date-picker';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        ${textFamily('--bx-date-picker', 'field')}
        --_h: var(--bx-control-height-m);
      }
      :host([size='s']) {
        --_h: var(--bx-control-height-s);
      }
      :host([size='l']) {
        --_h: var(--bx-control-height-l);
      }
      .label {
        display: block;
        margin-block-end: var(--bx-space-2xs);
        color: var(--bx-text-primary);
        ${textStyle('--bx-date-picker-label', 'label-m')}
      }
      .label:not(:has(*)):empty {
        display: none;
      }
      .control {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: var(--bx-space-2xs);
        min-block-size: max(var(--_h), var(--bx-target-min));
        padding-inline: var(--bx-space-s) var(--bx-space-3xs);
        border: var(--bx-border-width) solid
          var(
            --bx-date-picker-border-color,
            var(--bx-border-strong, var(--bx-border-subtle))
          );
        border-radius: var(--bx-date-picker-radius, var(--bx-radius-m));
        background: var(--bx-date-picker-bg, var(--bx-surface-base));
        color: var(--bx-text-primary);
      }
      .control:focus-within {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: var(--bx-focus-ring-offset);
      }
      :host([invalid]) .control {
        border-color: var(--bx-role-danger-border);
      }
      :host([disabled]) .control {
        opacity: 0.5;
      }
      input {
        flex: 1;
        min-inline-size: 0;
        padding: 0;
        border: 0;
        outline: 0;
        background: transparent;
        color: inherit;
        ${textStyle('--bx-date-picker', 'field-m')}
      }
      input::placeholder {
        color: var(--bx-text-secondary);
      }
      .hint {
        margin-block-start: var(--bx-space-2xs);
        color: var(--bx-text-secondary);
        ${textStyle('--bx-date-picker-hint', 'caption-m')}
      }
      .hint:not(:has(::slotted(*))):empty {
        display: none;
      }
      .panel {
        padding: var(--bx-space-s);
        border: var(--bx-border-width) solid var(--bx-border-subtle);
        border-radius: var(--bx-radius-m);
        box-shadow: var(--bx-shadow-m);
        background: var(--bx-surface-base);
        color: var(--bx-text-primary);
      }
      .footer:not(:has(::slotted(*))) {
        display: none;
      }
      .footer {
        margin-block-start: var(--bx-space-xs);
      }
    `,
  ];

  static override properties = {
    label: { type: String },
    hint: { type: String },
    name: { type: String },
    value: { type: String },
    range: { type: Boolean, reflect: true },
    min: { type: String },
    max: { type: String },
    format: { attribute: false },
    locale: { type: String },
    placeholder: { type: String },
    required: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    open: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
    clearable: { type: Boolean },
    invalid: { type: Boolean, reflect: true },
    _text: { state: true },
  };

  declare label: string;
  declare hint: string;
  declare name: string;
  declare value: string;
  declare range: boolean;
  declare min: string;
  declare max: string;
  declare format?: Intl.DateTimeFormatOptions;
  declare locale: string;
  declare placeholder: string;
  declare required: boolean;
  declare disabled: boolean;
  declare open: boolean;
  declare size: 's' | 'm' | 'l';
  declare clearable: boolean;
  declare invalid: boolean;
  /** @internal */
  declare _text: string;

  #id = `bx-dp-${nextId++}`;
  #inputRef = createRef<HTMLInputElement>();
  #calRef = createRef<BxCalendar>();
  #typing = false;
  #defaultValue?: string;

  constructor() {
    super();
    this.label = '';
    this.hint = '';
    this.name = '';
    this.value = '';
    this.range = false;
    this.min = '';
    this.max = '';
    this.locale = '';
    this.placeholder = '';
    this.required = false;
    this.disabled = false;
    this.open = false;
    this.size = 'm';
    this.clearable = false;
    this.invalid = false;
    this._text = '';
  }

  get #locale(): string {
    return (
      this.locale || document.documentElement.lang || navigator.language || 'en'
    );
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#defaultValue ??= this.value;
    document.addEventListener('pointerdown', this.#onOutside, true);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('pointerdown', this.#onOutside, true);
  }

  #display(value: string): string {
    const fmt = getDateTimeFormatter(
      this.#locale,
      this.format ?? { dateStyle: 'medium' },
    );
    const one = (iso: string) => {
      const d = parseISO(iso);
      return d ? fmt.format(d) : iso;
    };
    if (!value) return '';
    return this.range
      ? value.split('/').filter(Boolean).map(one).join(' – ')
      : one(value);
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (
      (changed.has('value') ||
        changed.has('format') ||
        changed.has('locale')) &&
      !this.#typing
    )
      this._text = this.#display(this.value);
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (
      changed.has('value') ||
      changed.has('name') ||
      changed.has('required') ||
      changed.has('min') ||
      changed.has('max')
    ) {
      this.internals.setFormValue(this.name && this.value ? this.value : null);
      const dates = this.value.split('/').filter(Boolean);
      let flags: ValidityStateFlags = {};
      let message = '';
      if (this.required && !dates.length) {
        flags = { valueMissing: true };
        message = 'Please choose a date.';
      } else if (this.min && dates.some((d) => compare(d, this.min) < 0)) {
        flags = { rangeUnderflow: true };
        message = `Date must be on or after ${this.min}.`;
      } else if (this.max && dates.some((d) => compare(d, this.max) > 0)) {
        flags = { rangeOverflow: true };
        message = `Date must be on or before ${this.max}.`;
      }
      this.internals.setValidity(
        flags,
        message || undefined,
        this.#inputRef.value,
      );
    }
  }

  formResetCallback(): void {
    this.value = this.#defaultValue ?? '';
    this.invalid = false;
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

  // --- popup -----------------------------------------------------------------------------------

  show(): void {
    if (this.open || this.disabled) return;
    if (
      !this.dispatchEvent(
        new Event('bx-show', {
          bubbles: true,
          composed: true,
          cancelable: true,
        }),
      )
    )
      return;
    this.open = true;
    this.updateComplete.then(() => {
      const cal = this.#calRef.value;
      const first = cal?.value.split('/')[0];
      if (cal && first) cal.month = first.slice(0, 7);
      void cal?.updateComplete.then(() =>
        cal.shadowRoot
          ?.querySelector<HTMLElement>('button[tabindex="0"]')
          ?.focus(),
      );
    });
  }

  hide(refocus = true): void {
    if (!this.open) return;
    if (
      !this.dispatchEvent(
        new Event('bx-hide', {
          bubbles: true,
          composed: true,
          cancelable: true,
        }),
      )
    )
      return;
    this.open = false;
    if (refocus) this.focus();
  }

  #onOutside = (event: Event): void => {
    if (this.open && !event.composedPath().includes(this)) this.hide(false);
  };

  // --- value -----------------------------------------------------------------------------------

  #commit(value: string): void {
    if (value === this.value) {
      this._text = this.#display(this.value);
      return;
    }
    this.value = value;
    this.invalid = false;
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  #commitTyped(): void {
    this.#typing = false;
    const text = this._text.trim();
    if (!text) {
      this.#commit('');
      return;
    }
    const parts = this.range
      ? text.split(/\s*[–—]\s*|\s+to\s+|\s*\/\s*/)
      : [text];
    const dates = parts.map((p) => parseTypedDate(p, this.#locale));
    const ok =
      dates.every((d): d is string => !!d) &&
      (this.range ? dates.length === 2 : dates.length === 1) &&
      dates.every(
        (d) =>
          (!this.min || compare(d!, this.min) >= 0) &&
          (!this.max || compare(d!, this.max) <= 0),
      );
    if (!ok) {
      this.invalid = true;
      this._text = this.#display(this.value);
      this.internals.setValidity(
        { badInput: true },
        'Enter a valid date.',
        this.#inputRef.value,
      );
      this.dispatchEvent(
        new Event('bx-invalid', { bubbles: true, composed: true }),
      );
      return;
    }
    const sorted = [...(dates as string[])].sort(compare);
    this.#commit(sorted.join('/'));
    this._text = this.#display(this.value);
  }

  #onCalendarChange = (event: CustomEvent<{ value: string }>): void => {
    event.stopPropagation();
    this.#typing = false;
    this.#commit(event.detail.value);
    this._text = this.#display(this.value);
    this.hide();
  };

  protected override render() {
    return html`
      <label class="label" for=${this.#id}
        ><slot name="label">${this.label}</slot></label
      >
      <div class="control" part="form-control" id="${this.#id}-control">
        <input
          ${ref(this.#inputRef)}
          part="input"
          id=${this.#id}
          type="text"
          autocomplete="off"
          inputmode="numeric"
          .value=${this._text}
          placeholder=${this.placeholder || nothing}
          ?disabled=${this.disabled}
          aria-invalid=${this.invalid ? 'true' : 'false'}
          aria-describedby="${this.#id}-hint"
          @input=${(e: Event) => {
            e.stopPropagation();
            this.#typing = true;
            this._text = (e.target as HTMLInputElement).value;
            this.dispatchEvent(
              new Event('input', { bubbles: true, composed: true }),
            );
          }}
          @keydown=${(e: KeyboardEvent) => {
            if (e.key === 'Enter') {
              this.#commitTyped();
            } else if (e.key === 'ArrowDown' && (e.altKey || !this.open)) {
              e.preventDefault();
              this.show();
            } else if (e.key === 'Escape' && this.open) {
              e.preventDefault();
              this.hide();
            }
          }}
          @blur=${() => this.#typing && this.#commitTyped()}
        />
        ${
          this.clearable && this.value
            ? html`<bx-icon-button
                name="close"
                size="s"
                label="Clear date"
                ?disabled=${this.disabled}
                @click=${() => {
                  this.#typing = false;
                  this.#commit('');
                  this.focus();
                }}
              ></bx-icon-button>`
            : nothing
        }
        <button
          class="trigger"
          part="trigger"
          type="button"
          aria-label=${this.open ? 'Close calendar' : 'Open calendar'}
          aria-haspopup="dialog"
          aria-expanded=${this.open ? 'true' : 'false'}
          ?disabled=${this.disabled}
          style="all: unset; display:inline-flex; cursor:pointer; padding: var(--bx-space-2xs); border-radius: var(--bx-radius-s);"
          @click=${() => (this.open ? this.hide() : this.show())}
        >
          <svg
            viewBox="0 0 256 256"
            width="1.1em"
            height="1.1em"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d=${CALENDAR_PATH} />
          </svg>
        </button>
      </div>
      <div class="hint" id="${this.#id}-hint">
        <slot name="hint">${this.hint}</slot>
      </div>
      <bx-popup
        anchor="${this.#id}-control"
        ?active=${this.open}
        placement="bottom-start"
        strategy="fixed"
        distance="4"
        flip
        shift
      >
        <div
          class="panel"
          role="dialog"
          aria-label="Choose date"
          @keydown=${(e: KeyboardEvent) => {
            if (e.key === 'Escape') {
              e.stopPropagation();
              this.hide();
            }
          }}
        >
          <bx-calendar
            ${ref(this.#calRef)}
            part="calendar"
            mode=${this.range ? 'range' : 'single'}
            .value=${this.value}
            min=${this.min}
            max=${this.max}
            locale=${this.#locale}
            @change=${this.#onCalendarChange}
          ></bx-calendar>
          <div class="footer"><slot name="calendar-footer"></slot></div>
        </div>
      </bx-popup>
    `;
  }
}
