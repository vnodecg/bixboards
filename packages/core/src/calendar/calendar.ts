import { css, html, nothing, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';
import { getDateTimeFormatter } from '../internal/intl-cache.ts';
import { textFamily, textStyle } from '../internal/text-style.ts';
import {
  addDays,
  addMonths,
  compare,
  daysInMonth,
  isoWeek,
  localeFirstDay,
  parseISO,
  todayISO,
  toISO,
} from './dates.ts';

type Mode = 'single' | 'range' | 'multiple';

let nextId = 0;

/**
 * `<bx-calendar>` — month grid for picking a date, a range or several dates
 * (docs/features/core/calendar.md).
 *
 * The ARIA date-grid pattern: each month is a `role="grid"` whose day buttons have a roving
 * tabindex; arrows move by day/week, Home/End jump to the week's ends, PageUp/PageDown change month
 * (Shift: year). Locale names come from `Intl` with no date library (FR-CALENDAR-01); every date in
 * the API is a plain `YYYY-MM-DD` string with no timezone shifting (FR-CALENDAR-02). `value` is the
 * date (`single`), `start/end` (`range`) or comma-separated dates (`multiple`). Range mode
 * previews the range on hover and while moving with the keyboard (FR-CALENDAR-03). Disabled days
 * (outside `min`/`max`, or rejected by `disabled-dates`) are announced as unavailable and skipped by
 * keyboard movement (FR-CALENDAR-04). The `day` slot is not implemented; `events` marks days with a
 * dot.
 *
 * @fires change - Selection changed. `detail.value`.
 * @fires bx-month-change - The visible month changed. `detail.month` (`YYYY-MM`).
 * @fires bx-day-hover - The pointer or keyboard focus is over a day. `detail.date`.
 *
 * @slot header - Replaces nothing; extra content shown above the grids.
 *
 * @csspart header - Month/year row.
 * @csspart grid - Day grid.
 * @csspart weekday - Column heading.
 * @csspart day - A day cell.
 * @csspart nav-button - Prev/next.
 *
 * @cssprop --bx-calendar-day-size - Day cell size. Default `var(--bx-target-min)`.
 * @cssprop --bx-calendar-day-bg-selected - Selected day background.
 * @cssprop --bx-calendar-range-bg - In-range band.
 * @cssprop --bx-calendar-font-family - Font family of the root surface. Default `var(--bx-type-body-family)`.
 * @cssprop --bx-calendar-day-font-family - Font family of the `day` text (text style `label-m`). Default `var(--bx-type-label-family)`.
 * @cssprop --bx-calendar-day-font-size - Font size of the `day` text (text style `label-m`). Default `var(--bx-type-label-m-size)`.
 * @cssprop --bx-calendar-day-font-weight - Font weight of the `day` text (text style `label-m`). Default `var(--bx-type-label-m-weight)`.
 * @cssprop --bx-calendar-day-line-height - Line height of the `day` text (text style `label-m`). Default `var(--bx-type-label-m-leading)`.
 * @cssprop --bx-calendar-day-letter-spacing - Letter spacing of the `day` text (text style `label-m`). Default `var(--bx-type-label-m-tracking)`.
 * @cssprop --bx-calendar-title-font-family - Font family of the `title` text (text style `label-l`). Default `var(--bx-type-label-family)`.
 * @cssprop --bx-calendar-title-font-size - Font size of the `title` text (text style `label-l`). Default `var(--bx-type-label-l-size)`.
 * @cssprop --bx-calendar-title-font-weight - Font weight of the `title` text (text style `label-l`). Default `var(--bx-type-label-l-weight)`.
 * @cssprop --bx-calendar-title-line-height - Line height of the `title` text (text style `label-l`). Default `var(--bx-type-label-l-leading)`.
 * @cssprop --bx-calendar-title-letter-spacing - Letter spacing of the `title` text (text style `label-l`). Default `var(--bx-type-label-l-tracking)`.
 * @cssprop --bx-calendar-week-font-family - Font family of the `week` text (text style `caption-s`). Default `var(--bx-type-caption-family)`.
 * @cssprop --bx-calendar-week-font-size - Font size of the `week` text (text style `caption-s`). Default `var(--bx-type-caption-s-size)`.
 * @cssprop --bx-calendar-week-font-weight - Font weight of the `week` text (text style `caption-s`). Default `var(--bx-type-caption-s-weight)`.
 * @cssprop --bx-calendar-week-line-height - Line height of the `week` text (text style `caption-s`). Default `var(--bx-type-caption-s-leading)`.
 * @cssprop --bx-calendar-week-letter-spacing - Letter spacing of the `week` text (text style `caption-s`). Default `var(--bx-type-caption-s-tracking)`.
 * @cssprop --bx-calendar-weekday-font-family - Font family of the `weekday` text (text style `caption-m`). Default `var(--bx-type-caption-family)`.
 * @cssprop --bx-calendar-weekday-font-size - Font size of the `weekday` text (text style `caption-m`). Default `var(--bx-type-caption-m-size)`.
 * @cssprop --bx-calendar-weekday-font-weight - Font weight of the `weekday` text (text style `caption-m`). Default `var(--bx-type-caption-m-weight)`.
 * @cssprop --bx-calendar-weekday-line-height - Line height of the `weekday` text (text style `caption-m`). Default `var(--bx-type-caption-m-leading)`.
 * @cssprop --bx-calendar-weekday-letter-spacing - Letter spacing of the `weekday` text (text style `caption-m`). Default `var(--bx-type-caption-m-tracking)`.
 * @cssprop --bx-calendar-focus-ring-width - Focus ring width of the day cells (focus state). Default `var(--bx-border-width-strong)`.
 * @cssprop --bx-calendar-focus-ring-color - Focus ring color of the day cells (focus state). Default `var(--bx-focus-ring)`.
 */
export class BxCalendar extends BixElement {
  static override tagName = 'bx-calendar';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-block;
        ${textFamily('--bx-calendar', 'body')}
        --_day: var(--bx-calendar-day-size, max(var(--bx-control-height-m), var(--bx-target-min)));
      }
      .base {
        display: flex;
        flex-direction: column;
        gap: var(--bx-space-s);
      }
      .months {
        display: flex;
        flex-wrap: wrap;
        gap: var(--bx-space-m);
      }
      .month {
        display: flex;
        flex-direction: column;
        gap: var(--bx-space-xs);
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--bx-space-xs);
        min-block-size: var(--_day);
      }
      .title {
        flex: 1;
        text-align: center;
        color: var(--bx-text-primary);
        ${textStyle('--bx-calendar-title', 'label-l')}
      }
      .nav-spacer {
        inline-size: var(--_day);
      }
      table {
        border-collapse: collapse;
        table-layout: fixed;
      }
      th {
        padding-block-end: var(--bx-space-3xs);
        color: var(--bx-text-secondary);
        font-weight: normal;
        text-align: center;
        ${textStyle('--bx-calendar-weekday', 'caption-m')}
      }
      td {
        padding: 0;
        text-align: center;
      }
      .week {
        color: var(--bx-text-secondary);
        ${textStyle('--bx-calendar-week', 'caption-s')}
      }
      .day {
        box-sizing: border-box;
        inline-size: var(--_day);
        block-size: var(--_day);
        padding: 0;
        border: var(--bx-border-width) solid transparent;
        border-radius: var(--bx-radius-m);
        background: transparent;
        color: var(--bx-text-primary);
        font: inherit;
        ${textStyle('--bx-calendar-day', 'label-m')}
        font-variant-numeric: tabular-nums;
        cursor: pointer;
        position: relative;
      }
      .day:hover:not([aria-disabled='true']) {
        background: var(--bx-surface-subtle);
      }
      .day:focus-visible {
        outline: var(
            --bx-calendar-focus-ring-width,
            var(--bx-border-width-strong)
          )
          solid var(--bx-calendar-focus-ring-color, var(--bx-focus-ring));
        outline-offset: calc(var(--bx-border-width-strong) * -1);
        z-index: 1;
      }
      .day[aria-current='date'] {
        border-color: var(--bx-role-brand-border);
        font-weight: bolder;
      }
      .day[aria-disabled='true'] {
        color: var(--bx-text-secondary);
        opacity: 0.45;
        cursor: not-allowed;
        text-decoration: line-through;
      }
      td[data-in-range] .day {
        border-radius: 0;
        background: var(--bx-calendar-range-bg, var(--bx-role-brand-subtle));
      }
      td[data-selected] .day {
        background: var(
          --bx-calendar-day-bg-selected,
          var(--bx-role-brand-solid)
        );
        color: var(--bx-role-brand-on-solid);
      }
      td[data-range-start] .day {
        border-start-start-radius: var(--bx-radius-m);
        border-end-start-radius: var(--bx-radius-m);
      }
      td[data-range-end] .day {
        border-start-end-radius: var(--bx-radius-m);
        border-end-end-radius: var(--bx-radius-m);
      }
      .dot {
        position: absolute;
        inset-block-end: var(--bx-space-3xs);
        inset-inline-start: 50%;
        inline-size: var(--bx-space-2xs);
        block-size: var(--bx-space-2xs);
        border-radius: 50%;
        background: currentColor;
        translate: -50% 0;
      }
      .sr {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        overflow: hidden;
        clip-path: inset(50%);
      }
      @media (forced-colors: active) {
        td[data-selected] .day {
          forced-color-adjust: none;
          background: Highlight;
          color: HighlightText;
        }
        td[data-in-range] .day {
          outline: 1px solid Highlight;
        }
      }
    `,
  ];

  static override properties = {
    mode: { type: String, reflect: true },
    value: { type: String },
    min: { type: String },
    max: { type: String },
    locale: { type: String },
    firstDayOfWeek: { type: Number, attribute: 'first-day-of-week' },
    disabledDates: { attribute: false },
    month: { type: String },
    months: { type: Number },
    showWeekNumbers: { type: Boolean, attribute: 'show-week-numbers' },
    events: { attribute: false },
    _focus: { state: true },
    _pending: { state: true },
    _hover: { state: true },
  };

  declare mode: Mode;
  declare value: string;
  declare min: string;
  declare max: string;
  declare locale: string;
  declare firstDayOfWeek?: number;
  declare disabledDates?: (date: string) => boolean;
  declare month: string;
  declare months: number;
  declare showWeekNumbers: boolean;
  declare events?: Map<string, unknown> | Set<string>;
  /** @internal */
  declare _focus: string;
  /** @internal Range start waiting for its end. */
  declare _pending: string;
  /** @internal */
  declare _hover: string;

  #id = `bx-cal-${nextId++}`;
  #refocus = false;

  constructor() {
    super();
    this.mode = 'single';
    this.value = '';
    this.min = '';
    this.max = '';
    this.locale = '';
    this.month = '';
    this.months = 1;
    this.showWeekNumbers = false;
    this._focus = '';
    this._pending = '';
    this._hover = '';
  }

  get #locale(): string {
    return (
      this.locale || document.documentElement.lang || navigator.language || 'en'
    );
  }

  get #selected(): string[] {
    if (!this.value) return [];
    if (this.mode === 'range') return this.value.split('/').filter(Boolean);
    if (this.mode === 'multiple')
      return this.value.split(',').filter(Boolean).sort(compare);
    return [this.value];
  }

  /** `YYYY-MM-01` of the first visible month. */
  get #visible(): string {
    const m = /^(\d{4})-(\d{2})$/.exec(this.month);
    if (m) return `${m[1]}-${m[2]}-01`;
    const anchor = this.#selected[0] || todayISO();
    return `${anchor.slice(0, 7)}-01`;
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (!this._focus || changed.has('value')) {
      const first = this.#selected[0];
      if (!this._focus && first) this._focus = first;
    }
    if (!this._focus) {
      const today = todayISO();
      const vis = this.#visible.slice(0, 7);
      this._focus = vis === today.slice(0, 7) ? today : `${vis}-01`;
    }
  }

  protected override updated(): void {
    if (this.#refocus) {
      this.#refocus = false;
      this.shadowRoot
        ?.querySelector<HTMLButtonElement>(`button[data-date="${this._focus}"]`)
        ?.focus();
    }
  }

  isDisabled(iso: string): boolean {
    if (this.min && compare(iso, this.min) < 0) return true;
    if (this.max && compare(iso, this.max) > 0) return true;
    return !!this.disabledDates?.(iso);
  }

  // --- selection -------------------------------------------------------------------------------

  #setValue(value: string): void {
    this.value = value;
    this.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: { value },
      }),
    );
  }

  #pick(iso: string): void {
    if (this.isDisabled(iso)) return;
    this._focus = iso;
    if (this.mode === 'range') {
      if (!this._pending) {
        this._pending = iso;
        this._hover = iso;
      } else {
        const [a, b] = [this._pending, iso].sort(compare);
        this._pending = '';
        this._hover = '';
        this.#setValue(`${a}/${b}`);
      }
    } else if (this.mode === 'multiple') {
      const set = new Set(this.#selected);
      set.has(iso) ? set.delete(iso) : set.add(iso);
      this.#setValue([...set].sort(compare).join(','));
    } else {
      this.#setValue(iso);
    }
  }

  // --- navigation ------------------------------------------------------------------------------

  #showMonthOf(iso: string): void {
    const vis = this.#visible.slice(0, 7);
    const last = addMonths(this.#visible, this.months - 1).slice(0, 7);
    const target = iso.slice(0, 7);
    if (target < vis || target > last) {
      this.month = target;
      this.dispatchEvent(
        new CustomEvent('bx-month-change', {
          bubbles: true,
          composed: true,
          detail: { month: target },
        }),
      );
    }
  }

  #shift(months: number): void {
    this.month = addMonths(this.#visible, months).slice(0, 7);
    this.dispatchEvent(
      new CustomEvent('bx-month-change', {
        bubbles: true,
        composed: true,
        detail: { month: this.month },
      }),
    );
    // Keep the roving stop inside the visible range.
    this._focus = addMonths(this._focus, months);
  }

  #move(iso: string, step: number): string {
    // Walk in the direction of travel, skipping disabled days (FR-CALENDAR-04), within bounds.
    let next = iso;
    for (let i = 0; i < 400; i++) {
      next = addDays(next, step);
      if (this.min && compare(next, this.min) < 0) return iso;
      if (this.max && compare(next, this.max) > 0) return iso;
      if (!this.isDisabled(next)) return next;
    }
    return iso;
  }

  #onKeydown = (event: KeyboardEvent): void => {
    const cur = this._focus;
    let next = cur;
    const dir = getComputedStyle(this).direction === 'rtl' ? -1 : 1;
    const firstDay = this.firstDayOfWeek ?? localeFirstDay(this.#locale);
    switch (event.key) {
      case 'ArrowRight':
        next = this.#move(cur, dir);
        break;
      case 'ArrowLeft':
        next = this.#move(cur, -dir);
        break;
      case 'ArrowDown':
        next = this.#move(cur, 7);
        break;
      case 'ArrowUp':
        next = this.#move(cur, -7);
        break;
      case 'Home': {
        const offset = (parseISO(cur)!.getDay() - firstDay + 7) % 7;
        next = addDays(cur, -offset);
        break;
      }
      case 'End': {
        const offset = (parseISO(cur)!.getDay() - firstDay + 7) % 7;
        next = addDays(cur, 6 - offset);
        break;
      }
      case 'PageUp':
        next = addMonths(cur, event.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        next = addMonths(cur, event.shiftKey ? 12 : 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.#pick(cur);
        return;
      case 'Escape':
        if (this._pending) {
          this._pending = '';
          this._hover = '';
        }
        return;
      default:
        return;
    }
    event.preventDefault();
    if (next === cur || this.isDisabled(next)) return;
    this._focus = next;
    if (this._pending) this._hover = next;
    this.#showMonthOf(next);
    this.#refocus = true;
    this.dispatchEvent(
      new CustomEvent('bx-day-hover', {
        bubbles: true,
        composed: true,
        detail: { date: next },
      }),
    );
  };

  // --- render ----------------------------------------------------------------------------------

  #rangeBounds(): [string, string] | undefined {
    if (this.mode !== 'range') return undefined;
    if (this._pending)
      return [this._pending, this._hover || this._pending].sort(compare) as [
        string,
        string,
      ];
    const [a, b] = this.#selected;
    return a && b ? [a, b] : a ? [a, a] : undefined;
  }

  #renderMonth(first: string, index: number) {
    const locale = this.#locale;
    const d0 = parseISO(first)!;
    const year = d0.getFullYear();
    const m0 = d0.getMonth();
    const firstDay = this.firstDayOfWeek ?? localeFirstDay(locale);
    const title = getDateTimeFormatter(locale, {
      month: 'long',
      year: 'numeric',
    }).format(d0);
    const weekday = getDateTimeFormatter(locale, { weekday: 'short' });
    const weekdayLong = getDateTimeFormatter(locale, { weekday: 'long' });
    const full = getDateTimeFormatter(locale, { dateStyle: 'full' });
    const today = todayISO();
    const lead = (d0.getDay() - firstDay + 7) % 7;
    const count = daysInMonth(year, m0);
    const cells: (string | undefined)[] = [
      ...Array<undefined>(lead).fill(undefined),
      ...Array.from({ length: count }, (_, i) =>
        toISO(new Date(year, m0, i + 1)),
      ),
    ];
    while (cells.length % 7) cells.push(undefined);
    const rows = Array.from({ length: cells.length / 7 }, (_, r) =>
      cells.slice(r * 7, r * 7 + 7),
    );
    const selected = new Set(this.#selected);
    const bounds = this.#rangeBounds();
    const titleId = `${this.#id}-t${index}`;
    const sunday = new Date(2023, 0, 1); // a Sunday
    const headers = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(sunday);
      day.setDate(1 + ((firstDay + i) % 7));
      return day;
    });
    const hasStop = cells.includes(this._focus);
    const stop = hasStop
      ? this._focus
      : cells.find((c) => c && !this.isDisabled(c));
    return html`<div class="month">
      <div class="header" part="header">
        ${
          index === 0
            ? html`<bx-icon-button
                part="nav-button"
                name="chevron-left"
                size="s"
                label="Previous month"
                @click=${() => this.#shift(-1)}
              ></bx-icon-button>`
            : html`<span class="nav-spacer"></span>`
        }
        <div class="title" id=${titleId} aria-live="polite">${title}</div>
        ${
          index === this.months - 1
            ? html`<bx-icon-button
                part="nav-button"
                name="chevron-right"
                size="s"
                label="Next month"
                @click=${() => this.#shift(1)}
              ></bx-icon-button>`
            : html`<span class="nav-spacer"></span>`
        }
      </div>
      <table
        role="grid"
        part="grid"
        aria-labelledby=${titleId}
        @keydown=${this.#onKeydown}
      >
        <thead>
          <tr>
            ${this.showWeekNumbers ? html`<th scope="col"><span class="sr">Week</span></th>` : nothing}
            ${headers.map(
              (h) =>
                html`<th
                  scope="col"
                  part="weekday"
                  abbr=${weekdayLong.format(h)}
                >
                  ${weekday.format(h)}
                </th>`,
            )}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => {
            const firstReal = row.find(Boolean);
            return html`<tr>
              ${
                this.showWeekNumbers
                  ? html`<th scope="row" class="week">
                      ${firstReal ? isoWeek(firstReal) : ''}
                    </th>`
                  : nothing
              }
              ${row.map((iso) => {
                if (!iso) return html`<td></td>`;
                const disabled = this.isDisabled(iso);
                const isSel = bounds
                  ? iso === bounds[0] || iso === bounds[1]
                  : selected.has(iso);
                const inRange =
                  !!bounds &&
                  compare(iso, bounds[0]) >= 0 &&
                  compare(iso, bounds[1]) <= 0;
                return html`<td
                  role="gridcell"
                  aria-selected=${isSel || inRange ? 'true' : 'false'}
                  ?data-selected=${isSel}
                  ?data-in-range=${inRange && !isSel}
                  ?data-range-start=${!!bounds && iso === bounds[0]}
                  ?data-range-end=${!!bounds && iso === bounds[1]}
                >
                  <button
                    class="day"
                    part="day"
                    type="button"
                    data-date=${iso}
                    tabindex=${iso === stop ? '0' : '-1'}
                    aria-label=${`${full.format(parseISO(iso)!)}${disabled ? ', unavailable' : ''}`}
                    aria-disabled=${disabled ? 'true' : nothing}
                    aria-current=${iso === today ? 'date' : nothing}
                    @click=${() => this.#pick(iso)}
                    @pointerenter=${() => {
                      if (this._pending) this._hover = iso;
                      this.dispatchEvent(
                        new CustomEvent('bx-day-hover', {
                          bubbles: true,
                          composed: true,
                          detail: { date: iso },
                        }),
                      );
                    }}
                    @focus=${() => {
                      this._focus = iso;
                      if (this._pending) this._hover = iso;
                    }}
                  >
                    ${Number(iso.slice(8))}${this.events?.has(iso) ? html`<span class="dot" aria-hidden="true"></span>` : nothing}
                  </button>
                </td>`;
              })}
            </tr>`;
          })}
        </tbody>
      </table>
    </div>`;
  }

  protected override render() {
    const n = Math.min(Math.max(Math.round(this.months) || 1, 1), 12);
    return html`<div class="base">
      <slot name="header"></slot>
      <div class="months">
        ${Array.from({ length: n }, (_, i) => this.#renderMonth(addMonths(this.#visible, i), i))}
      </div>
    </div>`;
  }
}
