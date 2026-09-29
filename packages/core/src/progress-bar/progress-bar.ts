import { css, html, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';

const MIN = 0;
const MAX = 100;

function clampValue(value: number): number {
  if (Number.isNaN(value)) return MIN;
  return Math.min(MAX, Math.max(MIN, value));
}

/**
 * `<bx-progress-bar>` — linear progress indicator, determinate or indeterminate.
 *
 * `value` and the accessible `label` attribute are independent of the default slot: the slot is
 * an overlay label rendered on top of the track (e.g. "42%"), hidden once the track's container
 * is narrower than ~8 fluid units (docs/features/core/progress-bar.md §5), while `label` always
 * reaches assistive tech via `aria-label` regardless of width.
 *
 * @slot (default) - Overlay label text rendered on top of the track.
 *
 * @csspart base - The track.
 * @csspart indicator - The filled (or sweeping, when `indeterminate`) portion.
 * @csspart label - The wrapper around the default slot.
 *
 * @cssprop --bx-progress-height - Track thickness. Default `--bx-space-xs`.
 * @cssprop --bx-progress-track - Track background. Default `--bx-role-neutral-subtle`.
 * @cssprop --bx-progress-indicator - Indicator color. Default `--bx-role-brand-solid`.
 * @cssprop --bx-progress-transition - Value-change transition. Default `0.3s` standard easing.
 */
export class BxProgressBar extends BixElement {
  static override tagName = 'bx-progress-bar';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        container-type: inline-size;
        inline-size: 100%;
      }

      .base {
        position: relative;
        display: flex;
        align-items: center;
        overflow: hidden;
        inline-size: 100%;
        block-size: var(--bx-progress-height, var(--bx-space-xs));
        border-radius: var(--bx-radius-pill);
        background: var(--bx-progress-track, var(--bx-role-neutral-subtle));
      }

      .indicator {
        position: absolute;
        inset-block: 0;
        inset-inline-start: 0;
        inline-size: 100%;
        border-radius: inherit;
        background: var(--bx-progress-indicator, var(--bx-role-brand-solid));
        transform: scaleX(var(--bx-progress-scale, 0));
        transform-origin: left;
        transition: transform
          var(
            --bx-progress-transition,
            0.3s var(--bx-motion-easing-standard, ease)
          );
      }

      :host(:dir(rtl)) .indicator {
        transform-origin: right;
      }

      :host([indeterminate]) .indicator {
        inline-size: 40%;
        transform: none;
        animation: bx-progress-bar-indeterminate 1.6s
          var(--bx-motion-easing-standard, ease) infinite;
      }

      @keyframes bx-progress-bar-indeterminate {
        from {
          translate: -40% 0;
        }
        to {
          translate: 250% 0;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        :host([indeterminate]) .indicator {
          animation: none;
          inline-size: 100%;
          opacity: 0.5;
        }
      }

      .label {
        position: relative;
        z-index: 1;
        margin-inline: var(--bx-space-2xs);
        font-family: var(--bx-font-family-sans);
        font-size: var(--bx-font-xs);
        color: var(--bx-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .label[hidden] {
        display: none;
      }

      @container (max-width: calc(var(--bx-unit) * 8)) {
        .label {
          display: none;
        }
      }

      @media (forced-colors: active) {
        .base {
          forced-color-adjust: none;
          background: Canvas;
          border: var(--bx-border-width) solid CanvasText;
        }
        .indicator {
          background: Highlight;
        }
      }
    `,
  ];

  static override properties = {
    value: { type: Number },
    indeterminate: { type: Boolean, reflect: true },
    label: { type: String },
    _hasOverlay: { state: true },
  };

  declare value: number;
  declare indeterminate: boolean;
  declare label: string;
  /** @internal */
  declare _hasOverlay: boolean;

  constructor() {
    super();
    this.value = MIN;
    this.indeterminate = false;
    this.label = '';
    this._hasOverlay = false;
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('value')) this.value = clampValue(this.value);
  }

  protected override updated(): void {
    this.setAttribute('role', 'progressbar');
    this.setAttribute('aria-valuemin', String(MIN));
    this.setAttribute('aria-valuemax', String(MAX));
    if (this.indeterminate) this.removeAttribute('aria-valuenow');
    else this.setAttribute('aria-valuenow', String(this.value));
    if (this.label) this.setAttribute('aria-label', this.label);
    else this.removeAttribute('aria-label');
  }

  #handleSlotChange = (event: Event): void => {
    const slot = event.target as HTMLSlotElement;
    this._hasOverlay = slot
      .assignedNodes({ flatten: true })
      .some((node) => (node.textContent ?? '').trim().length > 0);
  };

  protected override render() {
    return html`
      <div
        class="base"
        part="base"
        style="--bx-progress-scale: ${this.value / MAX}"
      >
        <div class="indicator" part="indicator"></div>
        <span class="label" part="label" ?hidden=${!this._hasOverlay}>
          <slot @slotchange=${this.#handleSlotChange}></slot>
        </span>
      </div>
    `;
  }
}
