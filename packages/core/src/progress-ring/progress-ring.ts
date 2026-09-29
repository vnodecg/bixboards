import { css, html, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';

const MIN = 0;
const MAX = 100;
// Chosen so 2 * PI * r ≈ 100: stroke-dasharray/dashoffset values read directly as percentages,
// with no JS measurement of the rendered SVG (FR-PROGRESS-RING-01).
const RADIUS = 15.9155;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function clampValue(value: number): number {
  if (Number.isNaN(value)) return MIN;
  return Math.min(MAX, Math.max(MIN, value));
}

/**
 * `<bx-progress-ring>` — circular progress indicator with a centered label.
 *
 * The filled arc is pure `stroke-dashoffset` math off `value`; there is no JS layout read at
 * render time (docs/features/core/progress-ring.md FR-PROGRESS-RING-01). `label` is an
 * accessible label surfaced via `aria-label`; the default slot is the visual text centered
 * inside the ring — the two are independent, same split as `bx-progress-bar`.
 *
 * @slot (default) - Center label content.
 *
 * @csspart base - The SVG element.
 * @csspart label - The wrapper around the default slot.
 *
 * @cssprop --bx-ring-size - Diameter. Default `calc(var(--bx-unit) * 4)`.
 * @cssprop --bx-ring-track-width - Track stroke width. Default `2`.
 * @cssprop --bx-ring-indicator-width - Indicator stroke width. Default `--bx-ring-track-width`.
 * @cssprop --bx-ring-track-color - Track color. Default `--bx-role-neutral-subtle`.
 * @cssprop --bx-ring-indicator-color - Indicator color. Default `--bx-role-brand-solid`.
 */
export class BxProgressRing extends BixElement {
  static override tagName = 'bx-progress-ring';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-block;
        position: relative;
        inline-size: var(--bx-ring-size, calc(var(--bx-unit) * 4));
        block-size: var(--bx-ring-size, calc(var(--bx-unit) * 4));
        container-type: inline-size;
      }

      svg {
        display: block;
        inline-size: 100%;
        block-size: 100%;
        transform: rotate(-90deg);
      }

      circle {
        fill: none;
      }

      .track {
        stroke: var(--bx-ring-track-color, var(--bx-role-neutral-subtle));
        stroke-width: var(--bx-ring-track-width, 2);
      }

      .indicator {
        stroke: var(--bx-ring-indicator-color, var(--bx-role-brand-solid));
        stroke-width: var(
          --bx-ring-indicator-width,
          var(--bx-ring-track-width, 2)
        );
        stroke-linecap: round;
        transition: stroke-dashoffset var(--bx-motion-duration-base, 0.3s)
          var(--bx-motion-easing-standard, ease);
      }

      .label {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        font-family: var(--bx-font-family-sans);
        font-size: 22cqi;
        line-height: 1;
        color: var(--bx-text-primary);
        text-align: center;
      }

      @media (forced-colors: active) {
        .track {
          stroke: CanvasText;
          opacity: 0.3;
        }
        .indicator {
          stroke: CanvasText;
        }
      }
    `,
  ];

  static override properties = {
    value: { type: Number },
    label: { type: String },
  };

  declare value: number;
  declare label: string;

  constructor() {
    super();
    this.value = MIN;
    this.label = '';
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('value')) this.value = clampValue(this.value);
  }

  protected override updated(): void {
    this.setAttribute('role', 'progressbar');
    this.setAttribute('aria-valuemin', String(MIN));
    this.setAttribute('aria-valuemax', String(MAX));
    this.setAttribute('aria-valuenow', String(this.value));
    if (this.label) this.setAttribute('aria-label', this.label);
    else this.removeAttribute('aria-label');
  }

  protected override render() {
    const offset = CIRCUMFERENCE - (this.value / MAX) * CIRCUMFERENCE;
    return html`
      <svg part="base" viewBox="0 0 36 36" aria-hidden="true">
        <circle class="track" r=${RADIUS} cx="18" cy="18"></circle>
        <circle
          class="indicator"
          r=${RADIUS}
          cx="18"
          cy="18"
          stroke-dasharray=${CIRCUMFERENCE}
          stroke-dashoffset=${offset}
        ></circle>
      </svg>
      <span class="label" part="label"><slot></slot></span>
    `;
  }
}
