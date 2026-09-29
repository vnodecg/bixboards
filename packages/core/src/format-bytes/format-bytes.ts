import { css, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';
import { getNumberFormatter } from '../internal/intl-cache.ts';

type Unit = 'byte' | 'bit';
type Display = 'long' | 'short' | 'narrow';

// `Intl.NumberFormat`'s `unit` style accepts these digital-information units (ECMA-402); index 0
// is the base unit itself. Bytes step in binary multiples (1024, matching the conventional
// KB/MB/GB reading of a file size); bits step in decimal multiples (1000, matching kbps/Mbps).
const BYTE_UNITS = [
  'byte',
  'kilobyte',
  'megabyte',
  'gigabyte',
  'terabyte',
  'petabyte',
] as const;
const BIT_UNITS = [
  'bit',
  'kilobit',
  'megabit',
  'gigabit',
  'terabit',
  'petabit',
] as const;

function scale(
  value: number,
  units: readonly string[],
  base: number,
): { scaled: number; unit: string } {
  const abs = Math.abs(value);
  let index = 0;
  let divisor = 1;
  while (abs / divisor >= base && index < units.length - 1) {
    divisor *= base;
    index++;
  }
  return { scaled: value / divisor, unit: units[index]! };
}

/**
 * `<bx-format-bytes>` — formats a byte/bit count in a locale-aware, human-readable form.
 *
 * Picks the largest unit that keeps the magnitude under the base (1024 for bytes, 1000 for bits)
 * and formats it through `Intl.NumberFormat`'s `unit` style, so "1536" renders as "1.5 kB" rather
 * than a raw byte count (FR-FORMAT-BYTES-01). Formatters are cached per (locale, unit, display) —
 * see `internal/intl-cache.ts` — since instantiating `Intl.NumberFormat` repeatedly is expensive
 * and this component is meant to appear many times (e.g. one per row in a file list).
 *
 * @cssprop --bx-format-bytes-font-size - Font size. Inherits by default.
 */
export class BxFormatBytes extends BixElement {
  static override tagName = 'bx-format-bytes';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline;
        font-family: inherit;
        font-size: var(--bx-format-bytes-font-size, inherit);
      }
    `,
  ];

  static override properties = {
    value: { type: Number },
    unit: { type: String },
    display: { type: String },
    lang: { type: String },
  };

  declare value: number;
  declare unit: Unit;
  declare display: Display;
  // `lang` is inherited from `HTMLElement`; declaring it in `properties` (above) is enough to make
  // Lit re-render on attribute/property change without redeclaring the field's type here.

  #text = '';

  constructor() {
    super();
    this.value = 0;
    this.unit = 'byte';
    this.display = 'short';
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (
      changed.has('value') ||
      changed.has('unit') ||
      changed.has('display') ||
      changed.has('lang')
    ) {
      this.#text = this.#format();
    }
  }

  #format(): string {
    const units = this.unit === 'bit' ? BIT_UNITS : BYTE_UNITS;
    const base = this.unit === 'bit' ? 1000 : 1024;
    const { scaled, unit } = scale(this.value ?? 0, units, base);
    const formatter = getNumberFormatter(this.lang || undefined, {
      style: 'unit',
      unit,
      unitDisplay: this.display,
      maximumFractionDigits: 2,
    });
    return formatter.format(scaled);
  }

  protected override render() {
    return this.#text;
  }
}
