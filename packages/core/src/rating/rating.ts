import { css, html, nothing, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';
import { FormAssociatedMixin } from '../internal/form-associated.ts';
import { textFamily } from '../internal/text-style.ts';

type Size = 'small' | 'medium' | 'large';

// Vendored from Phosphor Icons ("Star", fill variant), MIT — see
// packages/core/src/details/details.ts for the same vendoring approach with the chevron icons.
const STAR_PATH =
  'M239.2,97.29a16,16,0,0,0-13.81-11L166,81.17,142.72,25.81h0a15.95,15.95,0,0,0-29.44,0L90.07,81.17,30.61,86.32a16,16,0,0,0-9.11,28.06L67.11,154.1,53.09,212.34a16,16,0,0,0,23.84,17.34l51-31.05,51.11,31.05a16,16,0,0,0,23.84-17.34l-14-58.24,45.61-39.72A16,16,0,0,0,239.2,97.29Z';

let nextId = 0;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * `<bx-rating>` — star-style rating input/display with fractional precision, form-associated via
 * `ElementInternals`.
 *
 * FR-RATING-04's hover preview is a single `clip-path` on one `.fill` overlay (the fully "on"
 * symbols drawn on top of the always-visible dim `.track` row underneath), not one clip per
 * symbol — so hovering only ever repaints that one clip boundary, never touches the `max` symbol
 * nodes themselves, and the pointer handler writes `--_fill` straight to the overlay's
 * `style` (bypassing `requestUpdate`) so a fast mouse sweep doesn't schedule a render per pixel.
 * FR-RATING-05 (RTL fills right-to-left) falls out of the same technique: the clip inset flips
 * side under `:host(:dir(rtl))` instead of any per-symbol position math.
 *
 * `name` is not in the spec's own properties table (docs/features/core/rating.md §2) but is
 * required for `FormData` to pick the control up at all — the platform keys a form-associated
 * custom element's submitted entry off its `name` content attribute, the same gap noted on
 * `bx-radio` and `bx-details`'s `lazy`; see that spec's §10 "confirm final property names during
 * implementation".
 *
 * @fires input - Value changed by user (bubbles, composed).
 * @fires change - Committed change (bubbles, composed).
 * @fires bx-invalid - Constraint validation failed.
 * @fires bx-hover - Hover preview moved. `detail: { phase: 'enter' | 'move' | 'leave', value: number }`.
 *
 * @csspart base - The outer interactive region.
 * @csspart symbol - A single track (dim) symbol.
 * @csspart symbol-partial - The clipped overlay row of "on" symbols.
 *
 * @cssprop --bx-rating-symbol-color - Track (unfilled) symbol color. Default `--bx-border-strong`.
 * @cssprop --bx-rating-symbol-color-active - Filled symbol color. Default `--bx-role-accent`.
 * @cssprop --bx-rating-symbol-spacing - Gap between symbols. Default `--bx-space-2xs`.
 * @cssprop --bx-rating-min-height - Minimum height of the root surface. Default `var(--bx-target-min)`.
 * @cssprop --bx-rating-focus-ring-width - Focus ring width of the root surface (focus state). Default `var(--bx-border-width-strong)`.
 * @cssprop --bx-rating-focus-ring-color - Focus ring color of the root surface (focus state). Default `var(--bx-focus-ring)`.
 * @cssprop --bx-rating-focus-ring-offset - Focus ring offset of the root surface (focus state). Default `var(--bx-focus-ring-offset)`.
 * @cssprop --bx-rating-symbol-line-height - Line height of the `symbol` part. Default `1`.
 * @cssprop --bx-rating-symbol-disabled-opacity - Opacity of the `symbol` part (disabled state). Default `0.5`.
 * @cssprop --bx-rating-symbol-size - Symbol size (width and height). Default `calc(var(--bx-unit) * 1.5)`, or per `size`.
 * @cssprop --bx-rating-font-family - Font family of the root surface. Default `var(--bx-type-body-family)`.
 */
export class BxRating extends FormAssociatedMixin(BixElement) {
  static override tagName = 'bx-rating';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-block;
        ${textFamily('--bx-rating', 'body')}
      }

      .base {
        position: relative;
        display: inline-flex;
        align-items: center;
        min-block-size: var(--bx-rating-min-height, var(--bx-target-min));
        gap: var(--bx-rating-symbol-spacing, var(--bx-space-2xs));
        cursor: pointer;
        touch-action: manipulation;
      }

      :host([disabled]) .base,
      :host([readonly]) .base {
        cursor: default;
      }

      .base:focus-visible {
        outline: var(
            --bx-rating-focus-ring-width,
            var(--bx-border-width-strong)
          )
          solid var(--bx-rating-focus-ring-color, var(--bx-focus-ring));
        outline-offset: var(
          --bx-rating-focus-ring-offset,
          var(--bx-focus-ring-offset)
        );
      }

      .track,
      .fill {
        display: inline-flex;
        gap: var(--bx-rating-symbol-spacing, var(--bx-space-2xs));
      }

      .fill {
        position: absolute;
        inset-inline-start: 0;
        inset-block-start: 0;
        clip-path: inset(0 calc(100% - var(--_fill, 0%)) 0 0);
        pointer-events: none;
      }

      :host(:dir(rtl)) .fill {
        clip-path: inset(0 0 0 calc(100% - var(--_fill, 0%)));
      }

      .symbol {
        --_symbol: var(
          --bx-rating-symbol-size,
          var(--_default-symbol, calc(var(--bx-unit) * 1.5))
        );
        inline-size: var(--_symbol);
        block-size: var(--_symbol);
        color: var(--bx-rating-symbol-color, var(--bx-border-strong));
      }

      :host([size='small']) {
        --_default-symbol: var(--bx-unit);
      }
      :host([size='large']) {
        --_default-symbol: calc(var(--bx-unit) * 2);
      }

      .fill .symbol {
        color: var(--bx-rating-symbol-color-active, var(--bx-role-accent));
      }

      .symbol svg {
        inline-size: 100%;
        block-size: 100%;
        fill: currentColor;
      }

      .symbol span {
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: 100%;
        block-size: 100%;
        font-size: var(--_symbol);
        line-height: var(--bx-rating-symbol-line-height, 1);
      }

      :host([disabled]) .track .symbol {
        opacity: var(--bx-rating-symbol-disabled-opacity, 0.5);
      }

      @media (forced-colors: active) {
        .track .symbol {
          forced-color-adjust: none;
          color: GrayText;
        }
        .fill .symbol {
          color: Highlight;
        }
      }
    `,
  ];

  static override properties = {
    name: { type: String },
    label: { type: String },
    value: { type: Number },
    max: { type: Number },
    precision: { type: Number },
    readonly: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
    getSymbol: { attribute: false },
  };

  declare name: string;
  declare label: string;
  declare value: number;
  declare max: number;
  declare precision: number;
  declare readonly: boolean;
  declare disabled: boolean;
  declare size: Size;
  declare getSymbol?: (value: number) => string;

  #labelId = `bx-rating-label-${nextId++}`;
  #hasInteracted = false;
  #hovering = false;

  get #baseEl(): HTMLElement {
    return this.shadowRoot!.querySelector('.base')!;
  }

  get #fillEl(): HTMLElement | null {
    return this.shadowRoot!.querySelector('.fill');
  }

  constructor() {
    super();
    this.name = '';
    this.label = '';
    this.value = 0;
    this.max = 5;
    this.precision = 1;
    this.readonly = false;
    this.disabled = false;
    this.size = 'medium';
  }

  static override shadowRootOptions: ShadowRootInit = {
    ...BixElement.shadowRootOptions,
    delegatesFocus: true,
  };

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('value') || changed.has('max'))
      this.value = clamp(this.value, 0, this.max);
    if (changed.has('value')) this.#syncFormState();
  }

  #syncFormState(): void {
    this.internals.setFormValue(String(this.value));
    if (this.#hasInteracted) this.toggleAttribute('data-user-valid', true);
  }

  formResetCallback(): void {
    this.value = 0;
    this.#hasInteracted = false;
    this.removeAttribute('data-user-valid');
    this.removeAttribute('data-user-invalid');
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    if (typeof state === 'string') this.value = Number(state);
  }

  #round(raw: number): number {
    const stepped = Math.round(raw / this.precision) * this.precision;
    return clamp(Number(stepped.toFixed(10)), 0, this.max);
  }

  #valueFromPointer(clientX: number): number {
    const rect = this.#baseEl.getBoundingClientRect();
    const isRtl = getComputedStyle(this).direction === 'rtl';
    let ratio = (clientX - rect.left) / rect.width;
    if (isRtl) ratio = 1 - ratio;
    return this.#round(clamp(ratio, 0, 1) * this.max);
  }

  #setFillPercent(value: number): void {
    this.#fillEl?.style.setProperty('--_fill', `${(value / this.max) * 100}%`);
  }

  #handlePointerMove = (event: PointerEvent): void => {
    if (this.disabled || this.readonly) return;
    const previewValue = this.#valueFromPointer(event.clientX);
    this.#setFillPercent(previewValue);
    this.dispatchEvent(
      new CustomEvent('bx-hover', {
        bubbles: true,
        composed: true,
        detail: {
          phase: this.#hovering ? 'move' : 'enter',
          value: previewValue,
        },
      }),
    );
    this.#hovering = true;
  };

  #handlePointerLeave = (): void => {
    if (!this.#hovering) return;
    this.#hovering = false;
    this.#setFillPercent(this.value);
    this.dispatchEvent(
      new CustomEvent('bx-hover', {
        bubbles: true,
        composed: true,
        detail: { phase: 'leave', value: this.value },
      }),
    );
  };

  #commit(next: number): void {
    if (this.disabled || this.readonly || next === this.value) return;
    this.value = next;
    this.#hasInteracted = true;
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    if (!this.internals.checkValidity())
      this.dispatchEvent(
        new CustomEvent('bx-invalid', { bubbles: true, composed: true }),
      );
  }

  #handleClick = (event: MouseEvent): void => {
    if (this.disabled || this.readonly) return;
    this.#commit(this.#valueFromPointer(event.clientX));
  };

  #handleKeydown = (event: KeyboardEvent): void => {
    if (this.disabled || this.readonly) return;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        this.#commit(this.#round(this.value + this.precision));
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault();
        this.#commit(this.#round(this.value - this.precision));
        break;
      case 'Home':
        event.preventDefault();
        this.#commit(0);
        break;
      case 'End':
        event.preventDefault();
        this.#commit(this.max);
        break;
    }
  };

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('value') && !this.#hovering)
      this.#setFillPercent(this.value);
  }

  #renderSymbol(index: number) {
    const custom = this.getSymbol?.(index + 1);
    return html`
      <span class="symbol" part="symbol">
        ${
          custom
            ? html`<span>${custom}</span>`
            : html`<svg viewBox="0 0 256 256">
                <path d=${STAR_PATH}></path>
              </svg>`
        }
      </span>
    `;
  }

  protected override render() {
    const symbols = Array.from({ length: this.max }, (_, i) => i);
    const valueText = `${this.value} of ${this.max}`;

    return html`
      <div
        class="base"
        part="base"
        role="slider"
        tabindex=${this.disabled ? -1 : 0}
        aria-valuemin="0"
        aria-valuemax=${this.max}
        aria-valuenow=${this.value}
        aria-valuetext=${valueText}
        aria-disabled=${this.disabled}
        aria-readonly=${this.readonly}
        aria-labelledby=${this.label ? nothing : this.#labelId}
        aria-label=${this.label || nothing}
        @click=${this.#handleClick}
        @keydown=${this.#handleKeydown}
        @pointermove=${this.#handlePointerMove}
        @pointerleave=${this.#handlePointerLeave}
      >
        <span class="track">${symbols.map((i) => this.#renderSymbol(i))}</span>
        <span class="fill" part="symbol-partial"
          >${symbols.map((i) => this.#renderSymbol(i))}</span
        >
      </div>
      ${this.label ? nothing : html`<span id=${this.#labelId} hidden>Rating</span>`}
    `;
  }
}
