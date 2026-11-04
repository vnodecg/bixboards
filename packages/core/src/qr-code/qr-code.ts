import qrcode from 'qrcode-generator';
import { css, html, nothing } from 'lit';
import { BixElement } from '../bix-element.ts';

type Level = 'L' | 'M' | 'Q' | 'H';

/**
 * Encodes `value` as a QR matrix with the `qrcode-generator` library (version chosen
 * automatically). Returns `rows[r][c] === true` for dark modules.
 */
export function qrMatrix(value: string, level: Level = 'H'): boolean[][] {
  const qr = qrcode(0, level);
  qr.addData(value, 'Byte');
  qr.make();
  const n = qr.getModuleCount();
  return Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => qr.isDark(r, c)),
  );
}

/**
 * `<bx-qr-code>` — QR code from `value` (docs/features/core/qr-code.md).
 *
 * Encoding is done by the `qrcode-generator` library (a deliberate change from the spec's "own
 * encoder"); drawing is one SVG `<path>` (crisp at any size, instead of a canvas), regenerated only
 * when `value` or `error-correction` change. `size` is in px, or `fill` to follow the container
 * width. `fill`/`background` are CSS colors; the default `currentColor` on a transparent
 * background keeps contrast with the theme (scanners need dark-on-light, so set `background` when
 * the page is dark). `role="img"` with `label` (falling back to the value). A value too long for
 * the chosen error-correction level renders nothing and fires `bx-error`.
 *
 * @fires bx-error - The value could not be encoded.
 */
export class BxQrCode extends BixElement {
  static override tagName = 'bx-qr-code';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-block;
        line-height: 0;
      }
      :host([size='fill']) {
        display: block;
        inline-size: 100%;
      }
      svg {
        display: block;
        inline-size: 100%;
        block-size: auto;
        aspect-ratio: 1;
      }
      @media (forced-colors: active) {
        svg {
          forced-color-adjust: none;
        }
      }
    `,
  ];

  static override properties = {
    value: { type: String },
    label: { type: String },
    size: { type: String },
    fill: { type: String },
    background: { type: String },
    radius: { type: Number },
    errorCorrection: { type: String, attribute: 'error-correction' },
  };

  declare value: string;
  declare label: string;
  declare size: string;
  declare fill: string;
  declare background: string;
  declare radius: number;
  declare errorCorrection: Level;

  #key = '';
  #matrix: boolean[][] = [];
  #path = '';

  constructor() {
    super();
    this.value = '';
    this.label = '';
    this.size = '128';
    this.fill = 'currentColor';
    this.background = 'transparent';
    this.radius = 0;
    this.errorCorrection = 'H';
  }

  /** Re-encodes only when the inputs changed. */
  #encode(): void {
    const key = `${this.errorCorrection}|${this.value}`;
    if (key === this.#key) return;
    this.#key = key;
    this.#matrix = [];
    this.#path = '';
    if (!this.value) return;
    try {
      this.#matrix = qrMatrix(this.value, this.errorCorrection);
    } catch (error) {
      this.dispatchEvent(
        new CustomEvent('bx-error', {
          bubbles: true,
          composed: true,
          detail: { error },
        }),
      );
      return;
    }
    const parts: string[] = [];
    this.#matrix.forEach((row, r) => {
      let c = 0;
      while (c < row.length) {
        if (!row[c]) {
          c++;
          continue;
        }
        const start = c;
        while (c < row.length && row[c]) c++;
        parts.push(`M${start} ${r}h${c - start}v1h-${c - start}z`);
      }
    });
    this.#path = parts.join('');
  }

  protected override willUpdate(): void {
    this.#encode();
  }

  protected override render() {
    const n = this.#matrix.length;
    const quiet = 2;
    const px = this.size === 'fill' ? undefined : Number(this.size) || 128;
    if (!n) return nothing;
    return html`<svg
      viewBox="${-quiet} ${-quiet} ${n + quiet * 2} ${n + quiet * 2}"
      width=${px ?? nothing}
      height=${px ?? nothing}
      role="img"
      aria-label=${this.label || this.value}
      shape-rendering="crispEdges"
    >
      <rect
        x=${-quiet}
        y=${-quiet}
        width=${n + quiet * 2}
        height=${n + quiet * 2}
        rx=${this.radius ? (this.radius / (px ?? 128)) * (n + quiet * 2) : 0}
        fill=${this.background}
      ></rect>
      <path d=${this.#path} fill=${this.fill}></path>
    </svg>`;
  }
}
