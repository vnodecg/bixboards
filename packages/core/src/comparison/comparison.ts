import { css, html, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';

const ARROW_STEP = 1;
const ARROW_STEP_LARGE = 10;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * `<bx-comparison>` — before/after image comparison with a draggable divider.
 *
 * The `before` layer is clipped with `clip-path` at `position` (FR-COMPARISON-01); the `after`
 * layer sits underneath at full size. The divider is a single `role="slider"` element (matching
 * `bx-slider`'s single-thumb pattern) that takes pointer capture while dragging so a fast drag
 * that leaves the host's bounds doesn't drop the gesture.
 *
 * @fires change - `position` changed by user (bubbles, composed). `detail: { position: number }`.
 *
 * @slot before - The "before" image/content, clipped to `position`.
 * @slot after - The "after" image/content, shown in full.
 * @slot handle - Overrides the default divider handle glyph.
 *
 * @csspart before - The wrapper around the before slot.
 * @csspart after - The wrapper around the after slot.
 * @csspart divider - The draggable divider line + handle.
 * @csspart handle - The handle knob.
 *
 * @cssprop --divider-width - Divider line thickness. Default `--bx-border-width-strong`.
 * @cssprop --handle-size - Handle knob diameter. Default `calc(var(--bx-unit) * 2)`.
 */
export class BxComparison extends BixElement {
  static override tagName = 'bx-comparison';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        position: relative;
        overflow: hidden;
        container-type: inline-size;
        inline-size: 100%;
        block-size: 100%;
        aspect-ratio: var(--bx-comparison-aspect-ratio, 16 / 9);
        touch-action: none;
        user-select: none;
      }

      .after,
      .before {
        position: absolute;
        inset: 0;
      }

      .after ::slotted(*),
      .before ::slotted(*) {
        display: block;
        inline-size: 100%;
        block-size: 100%;
        object-fit: cover;
      }

      .before {
        clip-path: inset(0 calc(100% - var(--bx-comparison-position, 50%)) 0 0);
      }

      :host(:dir(rtl)) .before {
        clip-path: inset(0 0 0 calc(100% - var(--bx-comparison-position, 50%)));
      }

      .divider {
        position: absolute;
        inset-block: 0;
        inset-inline-start: var(--bx-comparison-position, 50%);
        translate: -50% 0;
        inline-size: var(--divider-width, var(--bx-border-width-strong));
        background: var(--bx-surface);
        cursor: ew-resize;
      }

      :host(:dir(rtl)) .divider {
        inset-inline-start: calc(100% - var(--bx-comparison-position, 50%));
      }

      .handle {
        position: absolute;
        inset-block-start: 50%;
        inset-inline-start: 50%;
        translate: -50% -50%;
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: var(--bx-target-min, 2.75rem);
        block-size: var(--bx-target-min, 2.75rem);
      }

      .handle::before {
        content: '';
        box-sizing: border-box;
        inline-size: var(--handle-size, calc(var(--bx-unit) * 2));
        block-size: var(--handle-size, calc(var(--bx-unit) * 2));
        border-radius: 50%;
        background: var(--bx-surface);
        border: var(--bx-border-width) solid var(--bx-border-strong);
      }

      .divider:focus-visible .handle::before {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: var(--bx-focus-ring-offset);
      }

      @media (forced-colors: active) {
        .divider {
          forced-color-adjust: none;
          background: CanvasText;
        }
        .handle::before {
          background: Canvas;
          border-color: CanvasText;
        }
      }
    `,
  ];

  static override properties = {
    position: { type: Number },
  };

  declare position: number;

  #dragging = false;

  get #hostEl(): HTMLElement {
    return this;
  }

  constructor() {
    super();
    this.position = 50;
  }

  static override shadowRootOptions: ShadowRootInit = {
    ...BixElement.shadowRootOptions,
    delegatesFocus: true,
  };

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('position')) this.position = clamp(this.position, 0, 100);
  }

  #valueFromPointer(clientX: number): number {
    const rect = this.#hostEl.getBoundingClientRect();
    const isRtl = getComputedStyle(this).direction === 'rtl';
    let ratio = (clientX - rect.left) / rect.width;
    if (isRtl) ratio = 1 - ratio;
    return clamp(Math.round(ratio * 100), 0, 100);
  }

  #commit(next: number): void {
    if (next === this.position) return;
    this.position = next;
    this.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: { position: this.position },
      }),
    );
  }

  #handlePointerDown = (event: PointerEvent): void => {
    this.#dragging = true;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.#commit(this.#valueFromPointer(event.clientX));
  };

  #handlePointerMove = (event: PointerEvent): void => {
    if (!this.#dragging) return;
    this.#commit(this.#valueFromPointer(event.clientX));
  };

  #handlePointerUp = (event: PointerEvent): void => {
    this.#dragging = false;
    (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
  };

  #handleKeydown = (event: KeyboardEvent): void => {
    const isRtl = getComputedStyle(this).direction === 'rtl';
    let delta = 0;
    switch (event.key) {
      case 'ArrowRight':
        delta = isRtl ? -ARROW_STEP : ARROW_STEP;
        break;
      case 'ArrowLeft':
        delta = isRtl ? ARROW_STEP : -ARROW_STEP;
        break;
      case 'ArrowUp':
        delta = event.shiftKey ? ARROW_STEP_LARGE : ARROW_STEP;
        break;
      case 'ArrowDown':
        delta = -(event.shiftKey ? ARROW_STEP_LARGE : ARROW_STEP);
        break;
      case 'Home':
        this.#commit(0);
        event.preventDefault();
        return;
      case 'End':
        this.#commit(100);
        event.preventDefault();
        return;
      default:
        return;
    }
    if (
      event.shiftKey &&
      (event.key === 'ArrowRight' || event.key === 'ArrowLeft')
    )
      delta *= ARROW_STEP_LARGE;
    event.preventDefault();
    this.#commit(clamp(this.position + delta, 0, 100));
  };

  protected override render() {
    return html`
      <div class="after" part="after"><slot name="after"></slot></div>
      <div
        class="before"
        part="before"
        style="--bx-comparison-position: ${this.position}%"
      >
        <slot name="before"></slot>
      </div>
      <div
        class="divider"
        part="divider"
        role="slider"
        tabindex="0"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow=${this.position}
        aria-valuetext="${this.position}%"
        aria-label="Comparison position"
        aria-orientation="horizontal"
        style="--bx-comparison-position: ${this.position}%"
        @pointerdown=${this.#handlePointerDown}
        @pointermove=${this.#handlePointerMove}
        @pointerup=${this.#handlePointerUp}
        @pointercancel=${this.#handlePointerUp}
        @keydown=${this.#handleKeydown}
      >
        <div class="handle" part="handle"><slot name="handle"></slot></div>
      </div>
    `;
  }
}
