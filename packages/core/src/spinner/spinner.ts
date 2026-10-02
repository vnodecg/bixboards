import { css, html } from 'lit';
import { BixElement } from '../bix-element.ts';

const VIEWBOX_R = 14;

/**
 * `<bx-spinner>` — indeterminate loading spinner.
 *
 * Sized in `1em` by default so it tracks the surrounding text's `font-size`; set `font-size` on
 * the host (or an ancestor) to scale it instead of a dedicated size property. Has no `value` —
 * for determinate progress use `bx-progress-ring` or `bx-progress-bar`.
 *
 * Consumers must supply an `aria-label` (or `aria-labelledby`) describing what is loading; the
 * host exposes `role="progressbar"` with no `aria-valuenow` so assistive tech announces it as
 * busy rather than reading a stale percentage.
 *
 * @csspart base - The SVG element.
 *
 * @cssprop --bx-spinner-size - Diameter. Default `1em`.
 * @cssprop --bx-spinner-track-width - Stroke width shared by the track and the indicator arc. Default `2`.
 * @cssprop --bx-spinner-track-color - Track color. Default transparent.
 * @cssprop --bx-spinner-indicator-color - Sweeping arc color. Default `currentColor`.
 * @cssprop --bx-spinner-speed - Full-rotation duration. Default `--bx-motion-duration-spin`.
 */
export class BxSpinner extends BixElement {
  static override tagName = 'bx-spinner';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-block;
        inline-size: var(--bx-spinner-size, 1em);
        block-size: var(--bx-spinner-size, 1em);
        color: inherit;
        vertical-align: middle;
        flex-shrink: 0;
      }

      svg {
        display: block;
        inline-size: 100%;
        block-size: 100%;
        animation: bx-spinner-spin
          var(--bx-spinner-speed, var(--bx-motion-duration-spin)) linear
          infinite;
      }

      circle {
        fill: none;
        stroke-linecap: round;
        stroke-width: var(--bx-spinner-track-width, 2);
      }

      .track {
        stroke: var(--bx-spinner-track-color, transparent);
      }

      .indicator {
        stroke: var(--bx-spinner-indicator-color, currentColor);
      }

      @keyframes bx-spinner-spin {
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes bx-spinner-pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.35;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        svg {
          animation: bx-spinner-pulse
            calc(var(--bx-spinner-speed, var(--bx-motion-duration-spin)) * 2)
            ease-in-out infinite;
        }
      }

      @media (forced-colors: active) {
        .track {
          stroke: transparent;
        }
        .indicator {
          stroke: CanvasText;
        }
      }
    `,
  ];

  protected override updated(): void {
    this.setAttribute('role', 'progressbar');
    this.removeAttribute('aria-valuenow');
  }

  protected override render() {
    return html`
      <svg part="base" viewBox="0 0 32 32" aria-hidden="true">
        <circle class="track" cx="16" cy="16" r=${VIEWBOX_R}></circle>
        <circle
          class="indicator"
          cx="16"
          cy="16"
          r=${VIEWBOX_R}
          stroke-dasharray="60 200"
        ></circle>
      </svg>
    `;
  }
}
