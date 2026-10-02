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
 * @cssprop --bx-comparison-divider-width - Divider line thickness. Default `--bx-border-width-strong`.
 * @cssprop --bx-comparison-handle-size - Handle knob diameter. Default `calc(var(--bx-unit) * 2)`.
 * @cssprop --bx-comparison-divider-bg - Background of the `divider` part. Default `var(--bx-surface-base)`.
 * @cssprop --bx-comparison-divider-shadow - Box shadow of the `divider` part. Default `0 0 0 var(--bx-border-width) var(--bx-border-strong)`.
 * @cssprop --bx-comparison-handle-knob-bg - Background of the `handle` part's knob. Default `var(--bx-surface-base)`.
 * @cssprop --bx-comparison-handle-knob-border-width - Border width of the `handle` part's knob. Default `var(--bx-border-width)`.
 * @cssprop --bx-comparison-handle-knob-border-color - Border color of the `handle` part's knob. Default `var(--bx-border-strong)`.
 * @cssprop --bx-comparison-handle-knob-shadow - Box shadow of the `handle` part's knob. Default `var(--bx-shadow-s)`.
 * @cssprop --bx-comparison-handle-knob-focus-ring-width - Focus ring width of the `handle` part's knob (focus state). Default `var(--bx-border-width-strong)`.
 * @cssprop --bx-comparison-handle-knob-focus-ring-color - Focus ring color of the `handle` part's knob (focus state). Default `var(--bx-focus-ring)`.
 * @cssprop --bx-comparison-handle-knob-focus-ring-offset - Focus ring offset of the `handle` part's knob (focus state). Default `var(--bx-focus-ring-offset)`.
 * @cssprop --bx-comparison-aspect-ratio - Aspect ratio of the comparison area. Default `16 / 9`.
 * @cssprop --bx-comparison-handle-icon-size - Size (width and height) of the icon inside the `handle` element. Default `0.85em`.
 * @cssprop --bx-comparison-handle-hit-size - Size of the handle's pointer hit area (the visible knob is `--bx-comparison-handle-size`). Default `var(--bx-target-min)`.
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
        clip-path: inset(0 calc(100% - var(--_position, 50%)) 0 0);
      }

      :host(:dir(rtl)) .before {
        clip-path: inset(0 0 0 calc(100% - var(--_position, 50%)));
      }

      .divider {
        position: absolute;
        inset-block: 0;
        inset-inline-start: var(--_position, 50%);
        translate: -50% 0;
        inline-size: var(
          --bx-comparison-divider-width,
          var(--bx-border-width-strong)
        );
        background: var(--bx-comparison-divider-bg, var(--bx-surface-base));
        box-shadow: var(
          --bx-comparison-divider-shadow,
          0 0 0 var(--bx-border-width)
            color-mix(in srgb, var(--bx-text-primary) 24%, transparent)
        );
        cursor: ew-resize;
      }

      :host(:dir(rtl)) .divider {
        inset-inline-start: calc(100% - var(--_position, 50%));
      }

      .handle {
        position: absolute;
        inset-block-start: 50%;
        inset-inline-start: 50%;
        translate: -50% -50%;
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: var(--bx-comparison-handle-hit-size, var(--bx-target-min));
        block-size: var(--bx-comparison-handle-hit-size, var(--bx-target-min));
      }

      .handle::before {
        content: '';
        position: absolute;
        /* "inset: 0" + "margin: auto" centering doesn't reliably split evenly when the sized
           properties are logical (inline-size/block-size) but the position is physical (inset) —
           observed in this project's pinned Chromium: it collapsed one margin to 0 and put the
           entire overflow on the other side instead of splitting it, visibly off-center. The
           top/left-50%-plus-translate technique is physical throughout and doesn't have that
           ambiguity. */
        inset-block-start: 50%;
        inset-inline-start: 50%;
        translate: -50% -50%;
        box-sizing: border-box;
        inline-size: var(--bx-comparison-handle-size, calc(var(--bx-unit) * 2));
        block-size: var(--bx-comparison-handle-size, calc(var(--bx-unit) * 2));
        border-radius: 50%;
        background: var(--bx-comparison-handle-knob-bg, var(--bx-surface-base));
        border: var(
            --bx-comparison-handle-knob-border-width,
            var(--bx-border-width)
          )
          solid
          var(--bx-comparison-handle-knob-border-color, var(--bx-border-strong));
        box-shadow: var(--bx-comparison-handle-knob-shadow, var(--bx-shadow-s));
      }

      .handle svg {
        position: relative;
        inline-size: var(--bx-comparison-handle-icon-size, 0.85em);
        block-size: var(--bx-comparison-handle-icon-size, 0.85em);
        fill: var(--bx-text-secondary);
      }

      .handle svg:first-of-type {
        margin-inline-end: -0.15em;
      }

      .handle svg:last-of-type {
        margin-inline-start: -0.15em;
      }

      .divider:focus-visible .handle::before {
        outline: var(
            --bx-comparison-handle-knob-focus-ring-width,
            var(--bx-border-width-strong)
          )
          solid
          var(
            --bx-comparison-handle-knob-focus-ring-color,
            var(--bx-focus-ring)
          );
        outline-offset: var(
          --bx-comparison-handle-knob-focus-ring-offset,
          var(--bx-focus-ring-offset)
        );
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
      <div class="before" part="before" style="--_position: ${this.position}%">
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
        style="--_position: ${this.position}%"
        @pointerdown=${this.#handlePointerDown}
        @pointermove=${this.#handlePointerMove}
        @pointerup=${this.#handlePointerUp}
        @pointercancel=${this.#handlePointerUp}
        @keydown=${this.#handleKeydown}
      >
        <div class="handle" part="handle">
          <slot name="handle">
            <svg viewBox="0 0 256 256" aria-hidden="true">
              <path
                d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"
              ></path>
            </svg>
            <svg viewBox="0 0 256 256" aria-hidden="true">
              <path
                d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"
              ></path>
            </svg>
          </slot>
        </div>
      </div>
    `;
  }
}
