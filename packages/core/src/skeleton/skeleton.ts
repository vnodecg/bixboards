import { css, html } from 'lit';
import { BixElement } from '../bix-element.ts';
import { observeIntersection } from '../internal/shared-observers.ts';

type Effect = 'none' | 'pulse' | 'sheen';

/**
 * `<bx-skeleton>` — placeholder shimmer while content loads.
 *
 * Shape is composed with plain CSS on the host (width/height, `--bx-skeleton-border-radius`) —
 * there is no `shape` property; set `border-radius: 50%` for a circle avatar placeholder, a
 * fixed `block-size` for a block, or leave the 1-line-height default alone for a text line.
 * The skeleton itself is `aria-hidden` since it carries no content; a container holding one or
 * more skeletons should set `aria-busy="true"` (docs/features/core/skeleton.md §6).
 *
 * The shimmer pauses while off-screen, via the shared `IntersectionObserver`
 * (docs/features/_conventions.md §9), and under `prefers-reduced-motion`.
 *
 * @csspart indicator - The animated placeholder shape.
 *
 * @cssprop --bx-skeleton-color - Base fill color. Default `--bx-surface-muted`.
 * @cssprop --bx-skeleton-sheen-color - Highlight color swept across during `sheen`. Default a
 * translucent mix of `currentColor`.
 * @cssprop --bx-skeleton-border-radius - Corner radius. Default `--bx-radius-s`.
 */
export class BxSkeleton extends BixElement {
  static override tagName = 'bx-skeleton';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        inline-size: 100%;
        block-size: 1lh;
      }

      .indicator {
        inline-size: 100%;
        block-size: 100%;
        border-radius: var(--bx-skeleton-border-radius, var(--bx-radius-s));
        background: var(--bx-skeleton-color, var(--bx-surface-muted));
      }

      :host([effect='pulse']) .indicator {
        animation: bx-skeleton-pulse var(--bx-motion-duration-slow, 1.6s)
          var(--bx-motion-easing-standard, ease) infinite;
      }

      :host([effect='sheen']) .indicator {
        background-image: linear-gradient(
          100deg,
          transparent 30%,
          var(
              --bx-skeleton-sheen-color,
              color-mix(in srgb, currentColor 12%, transparent)
            )
            50%,
          transparent 70%
        );
        background-size: 200% 100%;
        background-position: 150% 0;
        animation: bx-skeleton-sheen var(--bx-motion-duration-slow, 1.6s) linear
          infinite;
      }

      .indicator.paused {
        animation-play-state: paused;
      }

      @keyframes bx-skeleton-pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      @keyframes bx-skeleton-sheen {
        to {
          background-position: -50% 0;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .indicator {
          animation: none !important;
        }
      }

      @media (forced-colors: active) {
        .indicator {
          forced-color-adjust: none;
          background: Canvas;
          border: var(--bx-border-width) solid CanvasText;
        }
      }
    `,
  ];

  static override properties = {
    effect: { type: String, reflect: true },
    _visible: { state: true },
  };

  declare effect: Effect;
  /** @internal */
  declare _visible: boolean;

  #unobserve?: () => void;

  constructor() {
    super();
    this.effect = 'none';
    this._visible = true;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#unobserve = observeIntersection(this, (entry) => {
      this._visible = entry.isIntersecting;
    });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#unobserve?.();
    this.#unobserve = undefined;
  }

  protected override updated(): void {
    this.setAttribute('aria-hidden', 'true');
  }

  protected override render() {
    return html`
      <div
        class="indicator ${this._visible ? '' : 'paused'}"
        part="indicator"
      ></div>
    `;
  }
}
