import { css, html } from 'lit';
import { BixElement } from '../bix-element.ts';
import { getRelativeTimeFormatter } from '../internal/intl-cache.ts';

type Format = 'long' | 'short' | 'narrow';
type Numeric = 'always' | 'auto';
type Unit = Intl.RelativeTimeFormatUnit;

const DIVISIONS: Array<{ amount: number; unit: Unit }> = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
];

// Update cadence per displayed unit: sub-minute values are worth refreshing every second, but
// once a timestamp reads in days/weeks/months/years, a much coarser tick is plenty.
const INTERVAL_MS: Record<Unit | string, number> = {
  second: 1_000,
  minute: 60_000,
  hour: 3_600_000,
  day: 86_400_000,
  week: 86_400_000,
  month: 86_400_000,
  year: 86_400_000,
};

function divide(seconds: number): { value: number; unit: Unit } {
  let duration = seconds;
  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount)
      return { value: Math.round(duration), unit: division.unit };
    duration /= division.amount;
  }
  return { value: Math.round(duration), unit: 'year' };
}

/**
 * Page-wide "sync" ticker (FR-RELATIVE-TIME-01): instances opted into `sync` register here
 * instead of running their own `setTimeout`, so N instances collapse into one timer whose delay
 * tracks the shortest interval any registered instance currently needs. Pauses while the tab is
 * hidden (FR-RELATIVE-TIME-02) and resumes (with an immediate refresh) on visibility return.
 */
class SyncTicker {
  #instances = new Set<BxRelativeTime>();
  #timer?: ReturnType<typeof setTimeout>;

  register(instance: BxRelativeTime): void {
    this.#instances.add(instance);
    this.#schedule();
    if (typeof document !== 'undefined' && this.#instances.size === 1)
      document.addEventListener('visibilitychange', this.#onVisibility);
  }

  unregister(instance: BxRelativeTime): void {
    this.#instances.delete(instance);
    if (this.#instances.size === 0) {
      clearTimeout(this.#timer);
      this.#timer = undefined;
      document.removeEventListener('visibilitychange', this.#onVisibility);
    }
  }

  #onVisibility = (): void => {
    if (document.hidden) {
      clearTimeout(this.#timer);
      this.#timer = undefined;
      return;
    }
    for (const instance of this.#instances) instance.refresh();
    this.#schedule();
  };

  #schedule(): void {
    if (typeof document !== 'undefined' && document.hidden) return;
    clearTimeout(this.#timer);
    let delay = Number.POSITIVE_INFINITY;
    for (const instance of this.#instances)
      delay = Math.min(delay, instance.nextInterval);
    if (!Number.isFinite(delay)) return;
    this.#timer = setTimeout(() => {
      for (const instance of this.#instances) instance.refresh();
      this.#schedule();
    }, delay);
  }
}

const syncTicker = new SyncTicker();

/**
 * `<bx-relative-time>` — self-updating relative timestamp ("3 minutes ago") formatted via
 * `Intl.RelativeTimeFormat`.
 *
 * Every instance keeps itself current: by default each schedules its own `setTimeout` at an
 * interval adapted to the displayed unit (every second while reading in seconds, every day once
 * it reads in months). Setting `sync` opts an instance into the shared page-wide ticker instead
 * (FR-RELATIVE-TIME-01) — useful for a list of many timestamps, where one coalesced timer beats
 * dozens of independent ones. Both paths pause while the tab is hidden and catch up immediately on
 * return (FR-RELATIVE-TIME-02, via the `visibilitychange` listener in {@link SyncTicker} and this
 * class's own `#onVisibility`).
 */
export class BxRelativeTime extends BixElement {
  static override tagName = 'bx-relative-time';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline;
        font-family: inherit;
      }
    `,
  ];

  static override properties = {
    date: {},
    format: { type: String },
    numeric: { type: String },
    sync: { type: Boolean },
    lang: { type: String },
  };

  declare date?: Date | string;
  declare format: Format;
  declare numeric: Numeric;
  declare sync: boolean;
  // `lang` is inherited from `HTMLElement`; declaring it in `properties` (above) is enough to make
  // Lit re-render on attribute/property change without redeclaring the field's type here.

  #resolvedDate?: Date;
  #text = '';
  #timer?: ReturnType<typeof setTimeout>;
  #onVisibility = (): void => {
    if (document.hidden) {
      clearTimeout(this.#timer);
      this.#timer = undefined;
      return;
    }
    this.refresh();
  };

  /** Next self-timer delay, in ms, for the unit currently displayed. Read by {@link SyncTicker}. */
  nextInterval = INTERVAL_MS['minute']!;

  constructor() {
    super();
    this.format = 'long';
    this.numeric = 'auto';
    this.sync = false;
  }

  #resolveDate(): Date | undefined {
    if (this.date === undefined) return undefined;
    const parsed = this.date instanceof Date ? this.date : new Date(this.date);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  protected override willUpdate(): void {
    const resolved = this.#resolveDate();
    this.#resolvedDate = resolved;

    if (resolved === undefined) {
      if (this.date !== undefined)
        console.warn(
          `<bx-relative-time>: "${String(this.date)}" is not a valid date.`,
        );
      this.#text = '';
      return;
    }

    const seconds = (resolved.getTime() - Date.now()) / 1000;
    const { value, unit } = divide(seconds);
    this.nextInterval = INTERVAL_MS[unit] ?? INTERVAL_MS['day']!;

    const formatter = getRelativeTimeFormatter(this.lang || undefined, {
      style: this.format,
      numeric: this.numeric,
    });
    this.#text = formatter.format(value, unit);
  }

  /** Recomputes and re-renders. Called by the self timer or {@link SyncTicker}. */
  refresh(): void {
    this.requestUpdate();
  }

  #scheduleSelf(): void {
    clearTimeout(this.#timer);
    if (typeof document !== 'undefined' && document.hidden) return;
    this.#timer = setTimeout(() => {
      this.refresh();
      this.#scheduleSelf();
    }, this.nextInterval);
  }

  #teardownSelf(): void {
    clearTimeout(this.#timer);
    this.#timer = undefined;
    document.removeEventListener('visibilitychange', this.#onVisibility);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.sync) syncTicker.register(this);
    else if (typeof document !== 'undefined')
      document.addEventListener('visibilitychange', this.#onVisibility);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    syncTicker.unregister(this);
    this.#teardownSelf();
  }

  protected override updated(): void {
    if (!this.sync) this.#scheduleSelf();
  }

  protected override render() {
    return html`<time datetime=${this.#resolvedDate?.toISOString() ?? ''}
      >${this.#text}</time
    >`;
  }
}
