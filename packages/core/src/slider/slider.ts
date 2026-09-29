import { css, html, nothing, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';
import { FormAssociatedMixin } from '../internal/form-associated.ts';

type Size = 'small' | 'medium' | 'large';
type Orientation = 'horizontal' | 'vertical';
type TooltipPlacement = 'top' | 'bottom' | 'start' | 'end';
type Thumb = 'min' | 'max';

const PAGE_STEP_MULTIPLIER = 10;

let nextId = 0;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * `<bx-slider>` — single or range slider, form-associated via `ElementInternals`.
 *
 * Single mode reports through `value`/`name` like a native `<input type="range">`. Range mode
 * (FR-SLIDER-05: thumbs cannot cross) reports both ends as a `FormData` pair under `${name}-min`/
 * `${name}-max` — `ElementInternals.setFormValue` accepts a `FormData` for exactly this
 * multi-value case, so no extra hidden inputs are needed (docs/features/core/slider.md §10:
 * "confirm final property names during implementation" — the `-min`/`-max` suffix is this
 * component's answer for now).
 *
 * A slider's value is never "missing" the way a checkbox or text field can be — there's always a
 * number in range — so `required` has no native meaning here either (`<input type="range">` does
 * not support it); validity stays permanently valid, matching that platform gap intentionally
 * rather than inventing a made-up failure mode.
 *
 * @fires input - Value changed by user (bubbles, composed).
 * @fires change - Committed change (bubbles, composed).
 * @fires bx-invalid - Constraint validation failed. (Never fires — see above — kept for API parity
 *   with the other form-associated controls per docs/features/core/slider.md §2.)
 *
 * @slot label - Label content above the track.
 * @slot hint - Hint content below the track.
 * @slot reference - Marker label content, positioned via `--bx-marker-*` custom properties.
 *
 * @csspart label - The wrapper around the label slot.
 * @csspart hint - The wrapper around the hint slot.
 * @csspart slider - The outer interactive region (track + thumbs).
 * @csspart track - The background track.
 * @csspart indicator - The filled portion of the track.
 * @csspart markers - The wrapper around tick marks.
 * @csspart marker - A single tick mark.
 * @csspart thumb - A single thumb (non-range mode).
 * @csspart thumb-min - The low thumb (range mode).
 * @csspart thumb-max - The high thumb (range mode).
 * @csspart tooltip - The value tooltip shown while `with-tooltip` is set.
 *
 * @cssprop --bx-track-size - Track thickness. Default `--bx-space-xs`.
 * @cssprop --bx-thumb-size - Thumb diameter. Default `calc(var(--bx-unit) * 1.25)`.
 * @cssprop --bx-marker-width - Tick mark width. Default `--bx-border-width-strong`.
 * @cssprop --bx-marker-height - Tick mark height. Default `--bx-space-xs`.
 */
export class BxSlider extends FormAssociatedMixin(BixElement) {
  static override tagName = 'bx-slider';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        container-type: inline-size;
        font-family: var(--bx-font-family-sans);
      }

      .form-control {
        display: flex;
        flex-direction: column;
        gap: var(--bx-space-s);
      }

      .label:empty,
      .hint:empty {
        display: none;
      }

      .label {
        color: var(--bx-text-primary);
        font-weight: var(--bx-font-weight-medium);
        font-size: var(--bx-font-s);
      }

      .hint {
        color: var(--bx-text-secondary);
        font-size: var(--bx-font-s);
      }

      .slider {
        position: relative;
        display: flex;
        align-items: center;
        inline-size: 100%;
        block-size: var(--bx-target-min, 2.75rem);
        touch-action: pan-y;
      }

      :host([orientation='vertical']) .slider {
        inline-size: var(--bx-target-min, 2.75rem);
        block-size: calc(var(--bx-unit) * 12);
        touch-action: pan-x;
      }

      :host([disabled]) .slider {
        cursor: not-allowed;
        opacity: 0.6;
      }

      .track {
        position: relative;
        inline-size: 100%;
        block-size: var(--bx-track-size, var(--bx-space-xs));
        border-radius: var(--bx-radius-pill, 999px);
        background: var(--bx-surface-subtle);
      }

      :host([orientation='vertical']) .track {
        inline-size: var(--bx-track-size, var(--bx-space-xs));
        block-size: 100%;
      }

      .indicator {
        position: absolute;
        inset-block: 0;
        inset-inline-start: var(--bx-fill-start, 0%);
        inline-size: calc(var(--bx-fill-end, 0%) - var(--bx-fill-start, 0%));
        border-radius: inherit;
        background: var(--bx-role-accent);
      }

      :host([orientation='vertical']) .indicator {
        inset-inline: 0;
        inset-block-start: auto;
        inset-block-end: var(--bx-fill-start, 0%);
        block-size: calc(var(--bx-fill-end, 0%) - var(--bx-fill-start, 0%));
        inline-size: auto;
      }

      :host([disabled]) .indicator {
        background: var(--bx-border-strong);
      }

      .markers {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      .marker {
        position: absolute;
        inset-block-start: 50%;
        inset-inline-start: var(--bx-marker-position, 0%);
        inline-size: var(--bx-marker-width, var(--bx-border-width-strong));
        block-size: var(--bx-marker-height, var(--bx-space-xs));
        translate: -50% -50%;
        background: var(--bx-border-strong);
      }

      :host([orientation='vertical']) .marker {
        inset-inline-start: 50%;
        inset-block-start: var(--bx-marker-position, 0%);
        inline-size: var(--bx-marker-height, var(--bx-space-xs));
        block-size: var(--bx-marker-width, var(--bx-border-width-strong));
      }

      /* The hit target is always --bx-target-min (44px on coarse pointers,
         docs/features/_conventions.md §2) even at "small" size; the visible knob drawn by
         ::before can be smaller without shrinking what's actually tappable — the same idea as
         bx-checkbox/bx-switch's control-plus-margin box, adapted for a thumb positioned by
         percentage rather than sitting in flow. */
      .thumb {
        position: absolute;
        inset-inline-start: var(--bx-thumb-position, 0%);
        inset-block-start: 50%;
        translate: -50% -50%;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: var(--bx-target-min, 2.75rem);
        block-size: var(--bx-target-min, 2.75rem);
        cursor: grab;
        touch-action: none;
      }

      :host([orientation='vertical']) .thumb {
        inset-inline-start: 50%;
        inset-block-start: var(--bx-thumb-position, 0%);
      }

      .thumb::before {
        content: '';
        box-sizing: border-box;
        inline-size: var(--bx-thumb-size, calc(var(--bx-unit) * 1.25));
        block-size: var(--bx-thumb-size, calc(var(--bx-unit) * 1.25));
        border-radius: 50%;
        border: var(--bx-border-width-strong) solid var(--bx-role-accent);
        background: var(--bx-surface-base);
      }

      :host([size='small']) .thumb {
        --bx-thumb-size: var(--bx-unit);
      }
      :host([size='large']) .thumb {
        --bx-thumb-size: calc(var(--bx-unit) * 1.5);
      }

      .thumb:focus-visible::before {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: var(--bx-focus-ring-offset);
      }

      :host([disabled]) .thumb {
        cursor: not-allowed;
      }

      :host([disabled]) .thumb::before {
        border-color: var(--bx-border-strong);
      }

      .tooltip {
        position: absolute;
        inset-inline-start: 50%;
        inset-block-end: calc(100% + var(--bx-space-xs));
        translate: -50% 0;
        padding: var(--bx-space-2xs) var(--bx-space-xs);
        border-radius: var(--bx-radius-s);
        background: var(--bx-surface-inverse, var(--bx-text-primary));
        color: var(--bx-on-accent, var(--bx-surface-base));
        font-size: var(--bx-font-xs);
        white-space: nowrap;
        pointer-events: none;
      }

      :host([tooltip-placement='bottom']) .tooltip {
        inset-block-end: auto;
        inset-block-start: calc(100% + var(--bx-space-xs));
      }

      @container (max-width: calc(var(--bx-unit) * 20)) {
        .markers .marker:not(:first-child):not(:last-child) {
          display: none;
        }
      }

      @media (forced-colors: active) {
        .track {
          forced-color-adjust: none;
          background: Canvas;
          border: var(--bx-border-width) solid CanvasText;
        }
        .indicator {
          background: Highlight;
        }
        .thumb::before {
          background: Canvas;
          border-color: Highlight;
        }
      }
    `,
  ];

  static override properties = {
    name: { type: String },
    value: { type: Number },
    minValue: { type: Number, attribute: 'min-value' },
    maxValue: { type: Number, attribute: 'max-value' },
    min: { type: Number },
    max: { type: Number },
    step: { type: Number },
    range: { type: Boolean, reflect: true },
    orientation: { type: String, reflect: true },
    indicatorOffset: { type: Number, attribute: 'indicator-offset' },
    withMarkers: { type: Boolean, reflect: true, attribute: 'with-markers' },
    withTooltip: { type: Boolean, reflect: true, attribute: 'with-tooltip' },
    tooltipPlacement: {
      type: String,
      reflect: true,
      attribute: 'tooltip-placement',
    },
    disabled: { type: Boolean, reflect: true },
    readonly: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
  };

  declare name: string;
  declare value: number;
  declare minValue: number;
  declare maxValue: number;
  declare min: number;
  declare max: number;
  declare step: number;
  declare range: boolean;
  declare orientation: Orientation;
  declare indicatorOffset?: number;
  declare withMarkers: boolean;
  declare withTooltip: boolean;
  declare tooltipPlacement: TooltipPlacement;
  declare disabled: boolean;
  declare readonly: boolean;
  declare required: boolean;
  declare size: Size;

  #labelId = `bx-slider-label-${nextId++}`;
  #hintId = `bx-slider-hint-${nextId++}`;
  #activeThumb: Thumb = 'max';
  #dragThumb?: Thumb;
  #showTooltipFor?: Thumb;

  get #sliderEl(): HTMLElement {
    return this.shadowRoot!.querySelector('.slider')!;
  }

  constructor() {
    super();
    this.name = '';
    this.min = 0;
    this.max = 100;
    this.value = this.min;
    this.minValue = this.min;
    this.maxValue = this.max;
    this.step = 1;
    this.range = false;
    this.orientation = 'horizontal';
    this.withMarkers = false;
    this.withTooltip = false;
    this.tooltipPlacement = 'top';
    this.disabled = false;
    this.readonly = false;
    this.required = false;
    this.size = 'medium';
  }

  static override shadowRootOptions: ShadowRootInit = {
    ...BixElement.shadowRootOptions,
    delegatesFocus: true,
  };

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('value'))
      this.value = clamp(this.value, this.min, this.max);
    if (
      changed.has('minValue') ||
      changed.has('maxValue') ||
      changed.has('min') ||
      changed.has('max')
    ) {
      this.minValue = clamp(this.minValue, this.min, this.max);
      this.maxValue = clamp(this.maxValue, this.minValue, this.max);
    }
    if (
      changed.has('value') ||
      changed.has('minValue') ||
      changed.has('maxValue') ||
      changed.has('range')
    )
      this.#syncFormState();
  }

  #syncFormState(): void {
    if (this.range) {
      const data = new FormData();
      if (this.name) {
        data.append(`${this.name}-min`, String(this.minValue));
        data.append(`${this.name}-max`, String(this.maxValue));
      }
      this.internals.setFormValue(data);
    } else {
      this.internals.setFormValue(String(this.value));
    }
    this.internals.setValidity({}); // See class doc comment: a slider value is never "missing".
  }

  formResetCallback(): void {
    this.value = this.min;
    this.minValue = this.min;
    this.maxValue = this.max;
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    if (typeof state === 'string') this.value = Number(state);
  }

  #percent(value: number): number {
    if (this.max === this.min) return 0;
    return ((value - this.min) / (this.max - this.min)) * 100;
  }

  #snap(raw: number): number {
    const stepped =
      Math.round((raw - this.min) / this.step) * this.step + this.min;
    return clamp(Number(stepped.toFixed(10)), this.min, this.max);
  }

  #valueFromPointer(clientX: number, clientY: number): number {
    const rect = this.#sliderEl.getBoundingClientRect();
    const isVertical = this.orientation === 'vertical';
    const isRtl = !isVertical && getComputedStyle(this).direction === 'rtl';
    let ratio = isVertical
      ? (rect.bottom - clientY) / rect.height
      : (clientX - rect.left) / rect.width;
    if (isRtl) ratio = 1 - ratio;
    ratio = clamp(ratio, 0, 1);
    return this.#snap(this.min + ratio * (this.max - this.min));
  }

  #commit(dispatchChange: boolean): void {
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    if (dispatchChange)
      this.dispatchEvent(
        new Event('change', { bubbles: true, composed: true }),
      );
  }

  #setSingle(next: number, dispatchChange: boolean): void {
    if (this.disabled || this.readonly || next === this.value) return;
    this.value = next;
    this.#commit(dispatchChange);
  }

  #setRange(thumb: Thumb, next: number, dispatchChange: boolean): void {
    if (this.disabled || this.readonly) return;
    if (thumb === 'min') {
      const clamped = clamp(next, this.min, this.maxValue);
      if (clamped === this.minValue) return;
      this.minValue = clamped;
    } else {
      const clamped = clamp(next, this.minValue, this.max);
      if (clamped === this.maxValue) return;
      this.maxValue = clamped;
    }
    this.#commit(dispatchChange);
  }

  #handleThumbKeydown =
    (thumb: Thumb) =>
    (event: KeyboardEvent): void => {
      if (this.disabled || this.readonly) return;
      let delta = 0;
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          delta = this.step;
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          delta = -this.step;
          break;
        case 'PageUp':
          delta = this.step * PAGE_STEP_MULTIPLIER;
          break;
        case 'PageDown':
          delta = -this.step * PAGE_STEP_MULTIPLIER;
          break;
        case 'Home':
          delta = -Infinity;
          break;
        case 'End':
          delta = Infinity;
          break;
        default:
          return;
      }
      event.preventDefault();
      this.#activeThumb = thumb;
      const current = this.range
        ? thumb === 'min'
          ? this.minValue
          : this.maxValue
        : this.value;
      const next = this.#snap(clamp(current + delta, this.min, this.max));
      if (this.range) this.#setRange(thumb, next, true);
      else this.#setSingle(next, true);
    };

  #handleThumbPointerDown =
    (thumb: Thumb) =>
    (event: PointerEvent): void => {
      if (this.disabled || this.readonly) return;
      this.#activeThumb = thumb;
      this.#dragThumb = thumb;
      this.#showTooltipFor = thumb;
      (event.target as HTMLElement).setPointerCapture(event.pointerId);
      this.requestUpdate();
    };

  #handleThumbPointerMove = (event: PointerEvent): void => {
    if (!this.#dragThumb) return;
    const next = this.#valueFromPointer(event.clientX, event.clientY);
    if (this.range) this.#setRange(this.#dragThumb, next, false);
    else this.#setSingle(next, false);
  };

  #handleThumbPointerUp = (): void => {
    if (!this.#dragThumb) return;
    this.#dragThumb = undefined;
    this.#showTooltipFor = undefined;
    this.#commit(true);
  };

  #handleThumbFocus = (): void => this.requestUpdate();
  #handleThumbBlur = (): void => this.requestUpdate();

  #handleTrackPointerDown = (event: PointerEvent): void => {
    if (this.disabled || this.readonly || event.target !== event.currentTarget)
      return;
    const next = this.#valueFromPointer(event.clientX, event.clientY);
    if (this.range) {
      const thumb: Thumb =
        Math.abs(next - this.minValue) <= Math.abs(next - this.maxValue)
          ? 'min'
          : 'max';
      this.#activeThumb = thumb;
      this.#setRange(thumb, next, true);
    } else {
      this.#setSingle(next, true);
    }
  };

  /** Focuses the active (single mode) or most-recently-used (range mode) thumb. */
  override focus(options?: FocusOptions): void {
    this.shadowRoot
      ?.querySelector<HTMLElement>(
        this.range ? `[data-thumb="${this.#activeThumb}"]` : '.thumb',
      )
      ?.focus(options);
  }

  override blur(): void {
    (document.activeElement as HTMLElement | null)?.blur();
  }

  stepUp(): void {
    if (this.range) {
      const current =
        this.#activeThumb === 'min' ? this.minValue : this.maxValue;
      this.#setRange(this.#activeThumb, this.#snap(current + this.step), true);
    } else {
      this.#setSingle(this.#snap(this.value + this.step), true);
    }
  }

  stepDown(): void {
    if (this.range) {
      const current =
        this.#activeThumb === 'min' ? this.minValue : this.maxValue;
      this.#setRange(this.#activeThumb, this.#snap(current - this.step), true);
    } else {
      this.#setSingle(this.#snap(this.value - this.step), true);
    }
  }

  #renderMarkers() {
    if (!this.withMarkers || this.step <= 0) return nothing;
    const count = Math.floor((this.max - this.min) / this.step);
    if (!Number.isFinite(count) || count > 100) return nothing;
    const marks = Array.from(
      { length: count + 1 },
      (_, i) => this.min + i * this.step,
    );
    return html`
      <div class="markers" part="markers">
        ${marks.map(
          (mark) =>
            html`<span
              class="marker"
              part="marker"
              style="--bx-marker-position: ${this.#percent(mark)}%"
            ></span>`,
        )}
      </div>
      <slot name="reference"></slot>
    `;
  }

  #renderThumb(thumb: Thumb, value: number, ariaLabel: string) {
    const isFocused =
      typeof document !== 'undefined' &&
      document.activeElement ===
        this.shadowRoot?.querySelector(`[data-thumb="${thumb}"]`);
    const showTooltip =
      this.withTooltip && (this.#showTooltipFor === thumb || isFocused);
    return html`
      <div
        class="thumb"
        part=${this.range ? `thumb-${thumb}` : 'thumb'}
        data-thumb=${thumb}
        role="slider"
        tabindex=${this.disabled ? -1 : 0}
        aria-valuemin=${thumb === 'max' ? this.minValue : this.min}
        aria-valuemax=${thumb === 'min' ? this.maxValue : this.max}
        aria-valuenow=${value}
        aria-valuetext=${value}
        aria-orientation=${this.orientation}
        aria-disabled=${this.disabled}
        aria-readonly=${this.readonly}
        aria-label=${ariaLabel}
        style="--bx-thumb-position: ${this.#percent(value)}%"
        @keydown=${this.#handleThumbKeydown(thumb)}
        @pointerdown=${this.#handleThumbPointerDown(thumb)}
        @pointermove=${this.#handleThumbPointerMove}
        @pointerup=${this.#handleThumbPointerUp}
        @pointercancel=${this.#handleThumbPointerUp}
        @focus=${this.#handleThumbFocus}
        @blur=${this.#handleThumbBlur}
      >
        ${
          showTooltip
            ? html`<span class="tooltip" part="tooltip">${value}</span>`
            : nothing
        }
      </div>
    `;
  }

  protected override render() {
    const offset = this.indicatorOffset ?? this.min;
    const fillStart = this.range
      ? this.#percent(this.minValue)
      : this.#percent(Math.min(offset, this.value));
    const fillEnd = this.range
      ? this.#percent(this.maxValue)
      : this.#percent(Math.max(offset, this.value));

    return html`
      <div class="form-control" part="form-control">
        <div class="label" part="label" id=${this.#labelId}>
          <slot name="label"></slot>
        </div>
        <div
          class="slider"
          part="slider"
          @pointerdown=${this.#handleTrackPointerDown}
        >
          <div
            class="track"
            part="track"
            style="--bx-fill-start: ${fillStart}%; --bx-fill-end: ${fillEnd}%"
          >
            <div class="indicator" part="indicator"></div>
            ${this.#renderMarkers()}
          </div>
          ${
            this.range
              ? html`${this.#renderThumb('min', this.minValue, 'Minimum value')}
                ${this.#renderThumb('max', this.maxValue, 'Maximum value')}`
              : this.#renderThumb('max', this.value, 'Value')
          }
        </div>
        <div class="hint" part="hint" id=${this.#hintId}>
          <slot name="hint"></slot>
        </div>
      </div>
    `;
  }
}
