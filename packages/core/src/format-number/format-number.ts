import { BixElement } from '../bix-element.ts';
import { getNumberFormatter } from '../internal/intl-cache.ts';

type NumberType = 'currency' | 'decimal' | 'percent';

/**
 * `<bx-format-number>` — formats numbers, currency and percent via `Intl.NumberFormat`.
 *
 * Renders straight into light DOM (`createRenderRoot` returns `this`) instead of the usual shadow
 * root: FR-FORMAT-NUMBER-02 calls this out explicitly because this element is meant to appear by
 * the thousand in `bx-data-table`/`bx-data-list` cells, where a shadow root per instance is
 * measurable overhead for a component that is, in the end, one text node. That also means there
 * are no `::part()`/slot hooks — style it like any other inline text via the host's own `style`/
 * `class`, same as a `<span>`.
 *
 * Formatters are cached per option set (`internal/intl-cache.ts`) and that cache is shared with
 * the future `bx-number-input` (FR-FORMAT-NUMBER-01), so the two never construct redundant
 * `Intl.NumberFormat` instances for the same shape.
 */
export class BxFormatNumber extends BixElement {
  static override tagName = 'bx-format-number';

  static override properties = {
    value: { type: Number },
    type: { type: String },
    noGrouping: { type: Boolean, attribute: 'no-grouping' },
    currency: { type: String },
    currencyDisplay: { type: String, attribute: 'currency-display' },
    minimumIntegerDigits: { type: Number, attribute: 'minimum-integer-digits' },
    minimumFractionDigits: {
      type: Number,
      attribute: 'minimum-fraction-digits',
    },
    maximumFractionDigits: {
      type: Number,
      attribute: 'maximum-fraction-digits',
    },
    minimumSignificantDigits: {
      type: Number,
      attribute: 'minimum-significant-digits',
    },
    maximumSignificantDigits: {
      type: Number,
      attribute: 'maximum-significant-digits',
    },
    lang: { type: String },
  };

  declare value: number;
  declare type: NumberType;
  declare noGrouping: boolean;
  declare currency: string;
  declare currencyDisplay: NonNullable<
    Intl.NumberFormatOptions['currencyDisplay']
  >;
  declare minimumIntegerDigits?: number;
  declare minimumFractionDigits?: number;
  declare maximumFractionDigits?: number;
  declare minimumSignificantDigits?: number;
  declare maximumSignificantDigits?: number;
  // `lang` is inherited from `HTMLElement`; declaring it in `properties` (above) is enough to make
  // Lit re-render on attribute/property change without redeclaring the field's type here.

  constructor() {
    super();
    this.value = 0;
    this.type = 'decimal';
    this.noGrouping = false;
    this.currency = 'USD';
    this.currencyDisplay = 'symbol';
  }

  // FR-FORMAT-NUMBER-02: light DOM, no shadow root per instance.
  protected override createRenderRoot(): this {
    return this;
  }

  #format(): string {
    const options: Intl.NumberFormatOptions = {
      style: this.type,
      useGrouping: !this.noGrouping,
      minimumIntegerDigits: this.minimumIntegerDigits,
      minimumFractionDigits: this.minimumFractionDigits,
      maximumFractionDigits: this.maximumFractionDigits,
      minimumSignificantDigits: this.minimumSignificantDigits,
      maximumSignificantDigits: this.maximumSignificantDigits,
    };
    if (this.type === 'currency') {
      options.currency = this.currency;
      options.currencyDisplay = this.currencyDisplay;
    }
    return getNumberFormatter(this.lang || undefined, options).format(
      this.value ?? 0,
    );
  }

  protected override render() {
    return this.#format();
  }
}
