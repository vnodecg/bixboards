import { css, html, nothing, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';
import { FormAssociatedMixin } from '../internal/form-associated.ts';
import { textFamily, textStyle } from '../internal/text-style.ts';

type Seg = 'hour' | 'minute' | 'second' | 'period';
type HourCycle = 'h12' | 'h23' | 'auto';

let nextId = 0;

const pad = (n: number) => String(n).padStart(2, '0');

/** `HH:mm[:ss]` -> numbers, or undefined. */
export function parseTime(
  value: string,
): { h: number; m: number; s: number } | undefined {
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
  if (!m) return undefined;
  const [h, mi, s] = [Number(m[1]), Number(m[2]), Number(m[3] ?? 0)];
  return h < 24 && mi < 60 && s < 60 ? { h, m: mi, s } : undefined;
}

/** Whether the locale uses a 12-hour clock by default. */
export function localeIs12h(locale: string): boolean {
  try {
    return (
      new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions()
        .hour12 === true
    );
  } catch {
    return false;
  }
}

/**
 * `<bx-time-field>` — segmented time entry (docs/features/core/time-field.md).
 *
 * Hour, minute, optional second and AM/PM are separate `role="spinbutton"` segments, each a tab
 * stop: type digits (auto-advancing once the segment can take no more), ArrowUp/Down step
 * (minutes by `step`), PageUp/Down step by 10, Home/End jump to the bounds, Backspace clears,
 * ArrowLeft/Right move between segments, and `a`/`p` set AM/PM. `value` is always 24-hour
 * `HH:mm[:ss]` and is only set once every segment is filled. 12/24-hour display follows
 * `hour-cycle` (default: the locale's). Form-associated, with `min`/`max` validity. It is a
 * standalone field — it does not build on `bx-date-picker`, and it has no popup.
 *
 * @fires input - A segment changed.
 * @fires change - The complete value changed.
 * @fires bx-invalid - Constraint validation failed.
 *
 * @slot label - Label content.
 * @slot hint - Help text.
 *
 * @csspart form-control - The form-control part.
 * @csspart segment - One editable segment.
 *
 * @cssprop --bx-time-field-bg - Field background.
 * @cssprop --bx-time-field-border-color - Field border color.
 * @cssprop --bx-time-field-radius - Field radius.
 * @cssprop --bx-time-field-font-family - Font family of the root surface. Default `var(--bx-type-field-family)`.
 * @cssprop --bx-time-field-font-size - Font size of the root surface. Default `var(--bx-type-field-size)`.
 * @cssprop --bx-time-field-font-weight - Font weight of the root surface. Default `var(--bx-type-field-weight)`.
 * @cssprop --bx-time-field-line-height - Line height of the root surface. Default `var(--bx-type-field-leading)`.
 * @cssprop --bx-time-field-letter-spacing - Letter spacing of the root surface. Default `var(--bx-type-field-tracking)`.
 * @cssprop --bx-time-field-hint-font-family - Font family of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-family)`.
 * @cssprop --bx-time-field-hint-font-size - Font size of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-size)`.
 * @cssprop --bx-time-field-hint-font-weight - Font weight of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-weight)`.
 * @cssprop --bx-time-field-hint-line-height - Line height of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-leading)`.
 * @cssprop --bx-time-field-hint-letter-spacing - Letter spacing of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-tracking)`.
 * @cssprop --bx-time-field-label-font-family - Font family of the `label` text (text style `label-m`). Default `var(--bx-type-label-family)`.
 * @cssprop --bx-time-field-label-font-size - Font size of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-size)`.
 * @cssprop --bx-time-field-label-font-weight - Font weight of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-weight)`.
 * @cssprop --bx-time-field-label-line-height - Line height of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-leading)`.
 * @cssprop --bx-time-field-label-letter-spacing - Letter spacing of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-tracking)`.
 */
export class BxTimeField extends FormAssociatedMixin(BixElement) {
  static override tagName = 'bx-time-field';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        ${textFamily('--bx-time-field', 'field')}
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
        ${textStyle('--bx-time-field-label', 'label-m')}
      }
      .label:not(:has(*)):empty {
        display: none;
      }
      .control {
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        min-block-size: max(var(--_h), var(--bx-target-min));
        padding-inline: var(--bx-space-s);
        border: var(--bx-border-width) solid
          var(
            --bx-time-field-border-color,
            var(--bx-border-strong, var(--bx-border-subtle))
          );
        border-radius: var(--bx-time-field-radius, var(--bx-radius-m));
        background: var(--bx-time-field-bg, var(--bx-surface-base));
        color: var(--bx-text-primary);
        ${textStyle('--bx-time-field', 'field-m')}
        font-variant-numeric: tabular-nums;
        direction: ltr;
      }
      :host([disabled]) .control {
        opacity: 0.5;
      }
      :host([invalid]) .control {
        border-color: var(--bx-role-danger-border);
      }
      .segment {
        min-inline-size: 2ch;
        padding-inline: var(--bx-space-3xs);
        border-radius: var(--bx-radius-s);
        text-align: center;
        outline: none;
        caret-color: transparent;
      }
      .segment[data-empty] {
        color: var(--bx-text-secondary);
      }
      .segment:focus {
        background: var(--bx-role-brand-solid);
        color: var(--bx-role-brand-on-solid);
      }
      .sep {
        color: var(--bx-text-secondary);
        user-select: none;
      }
      .hint {
        margin-block-start: var(--bx-space-2xs);
        color: var(--bx-text-secondary);
        ${textStyle('--bx-time-field-hint', 'caption-m')}
      }
      .hint:not(:has(::slotted(*))):empty {
        display: none;
      }
      @media (forced-colors: active) {
        .segment:focus {
          forced-color-adjust: none;
          background: Highlight;
          color: HighlightText;
        }
      }
    `,
  ];

  static override properties = {
    label: { type: String },
    hint: { type: String },
    name: { type: String },
    value: { type: String },
    hourCycle: { type: String, attribute: 'hour-cycle' },
    granularity: { type: String },
    min: { type: String },
    max: { type: String },
    step: { type: Number },
    locale: { type: String },
    required: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
    invalid: { type: Boolean, reflect: true },
    _h: { state: true },
    _m: { state: true },
    _s: { state: true },
  };

  declare label: string;
  declare hint: string;
  declare name: string;
  declare value: string;
  declare hourCycle: HourCycle;
  declare granularity: 'hour' | 'minute' | 'second';
  declare min: string;
  declare max: string;
  declare step: number;
  declare locale: string;
  declare required: boolean;
  declare disabled: boolean;
  declare size: 's' | 'm' | 'l';
  declare invalid: boolean;
  /** @internal 24h hour, undefined when empty. */
  declare _h?: number;
  /** @internal */
  declare _m?: number;
  /** @internal */
  declare _s?: number;

  #id = `bx-time-${nextId++}`;
  #buffer = '';
  #bufferSeg?: Seg;
  #defaultValue?: string;
  #period: 'am' | 'pm' | undefined;
  /** The last value this element set itself, so a self-made clear keeps the partial entry. */
  #internalValue?: string;

  constructor() {
    super();
    this.label = '';
    this.hint = '';
    this.name = '';
    this.value = '';
    this.hourCycle = 'auto';
    this.granularity = 'minute';
    this.min = '';
    this.max = '';
    this.step = 1;
    this.locale = '';
    this.required = false;
    this.disabled = false;
    this.size = 'm';
    this.invalid = false;
  }

  get #h12(): boolean {
    if (this.hourCycle === 'h12') return true;
    if (this.hourCycle === 'h23') return false;
    return localeIs12h(
      this.locale ||
        document.documentElement.lang ||
        navigator.language ||
        'en',
    );
  }

  get #segs(): Seg[] {
    const segs: Seg[] = ['hour'];
    if (this.granularity !== 'hour') segs.push('minute');
    if (this.granularity === 'second') segs.push('second');
    if (this.#h12) segs.push('period');
    return segs;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#defaultValue ??= this.value;
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('value')) {
      const t = parseTime(this.value);
      if (t) {
        this.#internalValue = undefined;
        this._h = t.h;
        this._m = t.m;
        this._s = t.s;
        this.#period = t.h >= 12 ? 'pm' : 'am';
      } else if (!this.value) {
        // Keep partial entry when the field cleared itself; an external clear resets everything.
        if (changed.get('value') && this.#internalValue !== '') {
          this._h = this._m = this._s = undefined;
          this.#period = undefined;
        }
      }
    }
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
      let flags: ValidityStateFlags = {};
      let message = '';
      if (this.required && !this.value) {
        flags = { valueMissing: true };
        message = 'Please enter a time.';
      } else if (this.value && this.min && this.value < this.min) {
        flags = { rangeUnderflow: true };
        message = `Time must be ${this.min} or later.`;
      } else if (this.value && this.max && this.value > this.max) {
        flags = { rangeOverflow: true };
        message = `Time must be ${this.max} or earlier.`;
      }
      this.internals.setValidity(
        flags,
        message || undefined,
        this.shadowRoot?.querySelector<HTMLElement>('.segment') ?? undefined,
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
    this.shadowRoot?.querySelector<HTMLElement>('.segment')?.focus(options);
  }

  // --- model -----------------------------------------------------------------------------------

  #range(seg: Seg): [number, number] {
    if (seg === 'hour') return this.#h12 ? [1, 12] : [0, 23];
    if (seg === 'period') return [0, 1];
    return [0, 59];
  }

  #display(seg: Seg): number | undefined {
    if (seg === 'hour') {
      if (this._h === undefined) return undefined;
      if (!this.#h12) return this._h;
      return this._h % 12 === 0 ? 12 : this._h % 12;
    }
    return seg === 'minute' ? this._m : this._s;
  }

  #set(seg: Seg, n: number | undefined): void {
    if (seg === 'hour') {
      if (n === undefined) this._h = undefined;
      else if (this.#h12) {
        const pm = (this.#period ?? 'am') === 'pm';
        this._h = (n % 12) + (pm ? 12 : 0);
        this.#period ??= 'am';
      } else this._h = n;
    } else if (seg === 'minute') this._m = n;
    else if (seg === 'second') this._s = n;
    this.#sync();
  }

  #setPeriod(period: 'am' | 'pm'): void {
    this.#period = period;
    if (this._h !== undefined)
      this._h = (this._h % 12) + (period === 'pm' ? 12 : 0);
    this.#sync();
  }

  #sync(): void {
    const needMinute = this.granularity !== 'hour';
    const needSecond = this.granularity === 'second';
    const complete =
      this._h !== undefined &&
      (!needMinute || this._m !== undefined) &&
      (!needSecond || this._s !== undefined) &&
      (!this.#h12 || this.#period !== undefined);
    const next = complete
      ? `${pad(this._h!)}:${pad(needMinute ? this._m! : 0)}${needSecond ? `:${pad(this._s!)}` : ''}`
      : '';
    this.requestUpdate();
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    if (next !== this.value) {
      this.#internalValue = next;
      this.value = next;
      this.invalid = false;
      this.dispatchEvent(
        new Event('change', { bubbles: true, composed: true }),
      );
    }
  }

  #step(seg: Seg, delta: number): void {
    if (seg === 'period') {
      this.#setPeriod((this.#period ?? 'am') === 'am' ? 'pm' : 'am');
      return;
    }
    const [lo, hi] = this.#range(seg);
    const size = hi - lo + 1;
    const unit = seg === 'minute' ? Math.max(this.step, 1) : 1;
    const cur = this.#display(seg);
    const base = cur === undefined ? (delta > 0 ? lo - unit : hi + 1) : cur;
    const next = ((((base - lo + delta * unit) % size) + size) % size) + lo;
    this.#set(seg, next);
  }

  // --- keyboard --------------------------------------------------------------------------------

  #focusSeg(index: number): void {
    this.shadowRoot?.querySelectorAll<HTMLElement>('.segment')[index]?.focus();
  }

  #onKeydown = (event: KeyboardEvent, seg: Seg, index: number): void => {
    if (this.disabled) return;
    const key = event.key;
    if (/^\d$/.test(key) && seg !== 'period') {
      event.preventDefault();
      this.#type(seg, key, index);
      return;
    }
    if (seg === 'period' && /^[ap]$/i.test(key)) {
      event.preventDefault();
      this.#setPeriod(key.toLowerCase() === 'a' ? 'am' : 'pm');
      return;
    }
    switch (key) {
      case 'ArrowUp':
        event.preventDefault();
        this.#step(seg, 1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.#step(seg, -1);
        break;
      case 'PageUp':
        event.preventDefault();
        if (seg !== 'period')
          this.#step(seg, 10 / (seg === 'minute' ? Math.max(this.step, 1) : 1));
        break;
      case 'PageDown':
        event.preventDefault();
        if (seg !== 'period')
          this.#step(
            seg,
            -10 / (seg === 'minute' ? Math.max(this.step, 1) : 1),
          );
        break;
      case 'Home':
        event.preventDefault();
        if (seg === 'period') this.#setPeriod('am');
        else this.#set(seg, this.#range(seg)[0]);
        break;
      case 'End':
        event.preventDefault();
        if (seg === 'period') this.#setPeriod('pm');
        else this.#set(seg, this.#range(seg)[1]);
        break;
      case 'Backspace':
      case 'Delete':
        event.preventDefault();
        if (seg === 'period') {
          this.#period = undefined;
          this.#sync();
        } else this.#set(seg, undefined);
        this.#buffer = '';
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.#focusSeg(Math.max(index - 1, 0));
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.#focusSeg(Math.min(index + 1, this.#segs.length - 1));
        break;
    }
  };

  #type(seg: Seg, digit: string, index: number): void {
    const [lo, hi] = this.#range(seg);
    if (this.#bufferSeg !== seg) this.#buffer = '';
    this.#bufferSeg = seg;
    let buffer = this.#buffer + digit;
    let n = Number(buffer);
    if (n > hi) {
      // A third digit or an overshoot restarts with this digit.
      buffer = digit;
      n = Number(digit);
    }
    this.#buffer = buffer;
    const done = buffer.length >= 2 || n * 10 > hi;
    this.#set(seg, Math.max(n, seg === 'hour' && this.#h12 ? 1 : lo));
    if (done) {
      this.#buffer = '';
      if (index < this.#segs.length - 1) this.#focusSeg(index + 1);
    }
  }

  protected override render() {
    const segs = this.#segs;
    return html`
      <label class="label" id="${this.#id}-label"
        ><slot name="label">${this.label}</slot></label
      >
      <div
        class="control"
        part="form-control"
        role="group"
        aria-labelledby="${this.#id}-label"
        aria-describedby="${this.#id}-hint"
      >
        ${segs.map((seg, i) => {
          const [lo, hi] = this.#range(seg);
          const n = seg === 'period' ? undefined : this.#display(seg);
          const text =
            seg === 'period'
              ? this.#period
                ? this.#period.toUpperCase()
                : '––'
              : n === undefined
                ? '––'
                : pad(n);
          const empty = seg === 'period' ? !this.#period : n === undefined;
          return html`${
              i > 0 && seg !== 'period'
                ? html`<span class="sep" aria-hidden="true">:</span>`
                : seg === 'period'
                  ? html`<span aria-hidden="true">&nbsp;</span>`
                  : nothing
            }<span
              class="segment"
              part="segment"
              role="spinbutton"
              tabindex=${this.disabled ? '-1' : '0'}
              aria-label=${{ hour: 'Hour', minute: 'Minute', second: 'Second', period: 'AM/PM' }[seg]}
              aria-valuemin=${lo}
              aria-valuemax=${hi}
              aria-valuenow=${n ?? nothing}
              aria-valuetext=${empty ? 'Empty' : text}
              aria-disabled=${this.disabled ? 'true' : nothing}
              ?data-empty=${empty}
              inputmode=${seg === 'period' ? 'text' : 'numeric'}
              @keydown=${(e: KeyboardEvent) => this.#onKeydown(e, seg, i)}
              @blur=${() => (this.#buffer = '')}
              >${text}</span
            >`;
        })}
      </div>
      <div class="hint" id="${this.#id}-hint">
        <slot name="hint">${this.hint}</slot>
      </div>
    `;
  }
}
