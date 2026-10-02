import { css, html } from 'lit';
import { BixElement } from '../bix-element.ts';
import { getDateTimeFormatter } from '../internal/intl-cache.ts';
import { textFamily } from '../internal/text-style.ts';

type Weekday = 'long' | 'short' | 'narrow';
type Era = 'long' | 'short' | 'narrow';
type YearFmt = 'numeric' | '2-digit';
type MonthFmt = 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
type DayFmt = 'numeric' | '2-digit';
type TimeFmt = 'numeric' | '2-digit';
type TimeZoneNameFmt =
  | 'long'
  | 'short'
  | 'shortOffset'
  | 'longOffset'
  | 'shortGeneric'
  | 'longGeneric';
type HourFormat = 'h11' | 'h12' | 'h23' | 'h24';

/**
 * `<bx-format-date>` — formats a date via `Intl.DateTimeFormat`.
 *
 * `date` accepts a `Date` (set as a JS property) or an ISO-parseable string (attribute or
 * property); omitted, it formats the current time at each render, matching the spec's "now"
 * default. The remaining attributes mirror `Intl.DateTimeFormat` option names 1:1 (`hour-format`
 * maps to `hourCycle`) so callers already familiar with the `Intl` API need no translation table.
 * Formatters are cached per option set (`internal/intl-cache.ts`, FR-FORMAT-DATE-01).
 *
 * An unparseable `date` renders nothing and logs a console warning rather than throwing or
 * showing "Invalid Date" (FR-FORMAT-DATE-01).
 * @cssprop --bx-format-date-font-family - Font family of the root surface. Default `var(--bx-type-body-family)`.
 */
export class BxFormatDate extends BixElement {
  static override tagName = 'bx-format-date';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline;
        ${textFamily('--bx-format-date', 'body')}
      }
    `,
  ];

  static override properties = {
    date: {},
    weekday: { type: String },
    era: { type: String },
    year: { type: String },
    month: { type: String },
    day: { type: String },
    hour: { type: String },
    minute: { type: String },
    second: { type: String },
    timeZoneName: { type: String, attribute: 'time-zone-name' },
    timeZone: { type: String, attribute: 'time-zone' },
    hourFormat: { type: String, attribute: 'hour-format' },
    lang: { type: String },
  };

  declare date?: Date | string;
  declare weekday?: Weekday;
  declare era?: Era;
  declare year?: YearFmt;
  declare month?: MonthFmt;
  declare day?: DayFmt;
  declare hour?: TimeFmt;
  declare minute?: TimeFmt;
  declare second?: TimeFmt;
  declare timeZoneName?: TimeZoneNameFmt;
  declare timeZone?: string;
  declare hourFormat?: HourFormat;
  // `lang` is inherited from `HTMLElement`; declaring it in `properties` (above) is enough to make
  // Lit re-render on attribute/property change without redeclaring the field's type here.

  #resolvedDate?: Date;
  #text = '';

  #resolveDate(): Date | undefined {
    if (this.date === undefined) return new Date();
    const parsed = this.date instanceof Date ? this.date : new Date(this.date);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  protected override willUpdate(): void {
    const resolved = this.#resolveDate();
    this.#resolvedDate = resolved;

    if (resolved === undefined) {
      if (this.date !== undefined)
        console.warn(
          `<bx-format-date>: "${String(this.date)}" is not a valid date.`,
        );
      this.#text = '';
      return;
    }

    const formatter = getDateTimeFormatter(this.lang || undefined, {
      weekday: this.weekday,
      era: this.era,
      year: this.year,
      month: this.month,
      day: this.day,
      hour: this.hour,
      minute: this.minute,
      second: this.second,
      timeZoneName: this.timeZoneName,
      timeZone: this.timeZone,
      hourCycle: this.hourFormat,
    });
    this.#text = formatter.format(resolved);
  }

  protected override render() {
    return html`<time datetime=${this.#resolvedDate?.toISOString() ?? ''}
      >${this.#text}</time
    >`;
  }
}
