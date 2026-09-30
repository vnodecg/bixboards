import { css, html, nothing, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';

type Variant = 'default' | 'secondary' | 'tertiary' | 'error' | 'warning';
type Appearance = 'accent' | 'filled' | 'outlined' | 'filled outlined';
type Size = 'small' | 'medium' | 'large';
type Attention = 'none' | 'pulse' | 'bounce';
type Anchor = 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start';

const NUMERIC_PATTERN = /^\d+$/;

/**
 * `<bx-badge>` — compact status, count or label.
 *
 * One component for what many libraries split into "badge" and "tag": a plain badge is a
 * status/count, `with-remove` makes it a removable chip. There is no separate `bx-tag`.
 *
 * @fires bx-remove - The remove button (or Backspace/Delete on a focused chip) requested removal.
 * Cancelable: call `preventDefault()` to keep the badge in the DOM (e.g. pending an async delete).
 *
 * @slot (default) - Content.
 * @slot start - Leading icon/dot.
 * @slot end - Trailing content.
 *
 * @csspart base - The host's inner wrapper.
 * @csspart content - The wrapper around slotted/overflow content.
 * @csspart remove-button - The remove button, present with `with-remove`.
 *
 * @cssprop --bx-badge-bg - Background color. Defaults to a role/appearance combination.
 * @cssprop --bx-badge-fg - Text/icon color. Defaults to a role/appearance combination.
 * @cssprop --bx-badge-border - Border color. Defaults to a role/appearance combination.
 * @cssprop --bx-badge-radius - Corner radius when `pill` is unset. Default `--bx-radius-s`.
 * @cssprop --bx-badge-border-width - Border thickness. Default `--bx-border-width`.
 * @cssprop --bx-badge-gap - Gap between slots. Default `--bx-space-2xs`.
 * @cssprop --bx-badge-min-height - Minimum height, drives the `size` step.
 * @cssprop --bx-badge-padding-inline - Horizontal padding, drives the `size` step.
 * @cssprop --bx-badge-font-size - Font size, drives the `size` step.
 * @cssprop --bx-badge-font-weight - Font weight. Default `--bx-font-weight-medium`.
 * @cssprop --bx-badge-max-width - Truncation width for the content.
 */
export class BxBadge extends BixElement {
  static override tagName = 'bx-badge';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-flex;
        vertical-align: middle;
        font-family: var(--bx-font-family-sans);
        --bx-badge-computed-bg: transparent;
        --bx-badge-computed-fg: var(--bx-badge-variant-fg);
        --bx-badge-computed-border: transparent;
      }

      /* Variant → role tokens. */
      :host([variant='secondary']) {
        --bx-badge-variant-solid: var(--bx-role-neutral-solid);
        --bx-badge-variant-on-solid: var(--bx-role-neutral-on-solid);
        --bx-badge-variant-subtle: var(--bx-role-neutral-subtle);
        --bx-badge-variant-fg: var(--bx-role-neutral-fg);
        --bx-badge-variant-border: var(--bx-role-neutral-border);
      }
      :host([variant='default']),
      :host(:not([variant])) {
        --bx-badge-variant-solid: var(--bx-role-brand-solid);
        --bx-badge-variant-on-solid: var(--bx-role-brand-on-solid);
        --bx-badge-variant-subtle: var(--bx-role-brand-subtle);
        --bx-badge-variant-fg: var(--bx-role-brand-fg);
        --bx-badge-variant-border: var(--bx-role-brand-border);
      }
      :host([variant='warning']) {
        --bx-badge-variant-solid: var(--bx-role-warning-solid);
        --bx-badge-variant-on-solid: var(--bx-role-warning-on-solid);
        --bx-badge-variant-subtle: var(--bx-role-warning-subtle);
        --bx-badge-variant-fg: var(--bx-role-warning-fg);
        --bx-badge-variant-border: var(--bx-role-warning-border);
      }
      :host([variant='tertiary']) {
        --bx-badge-variant-solid: var(--bx-role-tertiary-solid);
        --bx-badge-variant-on-solid: var(--bx-role-tertiary-on-solid);
        --bx-badge-variant-subtle: var(--bx-role-tertiary-subtle);
        --bx-badge-variant-fg: var(--bx-role-tertiary-fg);
        --bx-badge-variant-border: var(--bx-role-tertiary-border);
      }
      :host([variant='error']) {
        --bx-badge-variant-solid: var(--bx-role-danger-solid);
        --bx-badge-variant-on-solid: var(--bx-role-danger-on-solid);
        --bx-badge-variant-subtle: var(--bx-role-danger-subtle);
        --bx-badge-variant-fg: var(--bx-role-danger-fg);
        --bx-badge-variant-border: var(--bx-role-danger-border);
      }

      /* Appearance → computed bg/fg/border, using ~= so "filled outlined" applies both. */
      :host([appearance~='filled']) {
        --bx-badge-computed-bg: var(--bx-badge-variant-subtle);
      }
      :host([appearance~='outlined']) {
        --bx-badge-computed-border: var(--bx-badge-variant-border);
      }
      :host([appearance='accent']) {
        --bx-badge-computed-bg: var(--bx-badge-variant-solid);
        --bx-badge-computed-fg: var(--bx-badge-variant-on-solid);
        --bx-badge-computed-border: var(--bx-badge-variant-solid);
      }

      /* Size steps (docs/features/core/badge.md §4: 1.25u / 1.75u / 2.25u). */
      :host([size='small']),
      :host(:not([size])) {
        --bx-badge-computed-min-height: calc(var(--bx-unit) * 1.25);
        --bx-badge-computed-padding-inline: var(--bx-space-xs);
        --bx-badge-computed-font-size: var(--bx-font-xs);
      }
      :host([size='medium']) {
        --bx-badge-computed-min-height: calc(var(--bx-unit) * 1.75);
        --bx-badge-computed-padding-inline: var(--bx-space-s);
        --bx-badge-computed-font-size: var(--bx-font-s);
      }
      :host([size='large']) {
        --bx-badge-computed-min-height: calc(var(--bx-unit) * 2.25);
        --bx-badge-computed-padding-inline: var(--bx-space-m);
        --bx-badge-computed-font-size: var(--bx-font-m);
      }

      .base {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--bx-badge-gap, var(--bx-space-2xs));
        min-block-size: var(
          --bx-badge-min-height,
          var(--bx-badge-computed-min-height)
        );
        padding-inline: var(
          --bx-badge-padding-inline,
          var(--bx-badge-computed-padding-inline)
        );
        background: var(--bx-badge-bg, var(--bx-badge-computed-bg));
        color: var(--bx-badge-fg, var(--bx-badge-computed-fg));
        border: var(--bx-badge-border-width, var(--bx-border-width)) solid
          var(--bx-badge-border, var(--bx-badge-computed-border));
        border-radius: var(--bx-badge-radius, var(--bx-radius-s));
        font-size: var(
          --bx-badge-font-size,
          var(--bx-badge-computed-font-size)
        );
        font-weight: var(--bx-badge-font-weight, var(--bx-font-weight-medium));
        line-height: 1;
        white-space: nowrap;
        max-inline-size: 100%;
      }

      :host([with-remove]) .base {
        padding-inline-end: var(--bx-badge-gap, var(--bx-space-2xs));
      }

      :host([pill]) .base {
        border-radius: var(--bx-radius-pill);
      }

      :host([pill]) .base.circular {
        min-inline-size: var(
          --bx-badge-min-height,
          var(--bx-badge-computed-min-height)
        );
        padding-inline: 0;
      }

      :host([anchor]) {
        position: absolute;
      }
      :host([anchor='top-end']) {
        inset-block-start: 0;
        inset-inline-end: 0;
        translate: 50% -50%;
      }
      :host([anchor='top-start']) {
        inset-block-start: 0;
        inset-inline-start: 0;
        translate: -50% -50%;
      }
      :host([anchor='bottom-end']) {
        inset-block-end: 0;
        inset-inline-end: 0;
        translate: 50% 50%;
      }
      :host([anchor='bottom-start']) {
        inset-block-end: 0;
        inset-inline-start: 0;
        translate: -50% 50%;
      }

      .content {
        display: inline-flex;
        align-items: center;
        gap: inherit;
        overflow: hidden;
        max-inline-size: var(--bx-badge-max-width, none);
      }

      .content ::slotted(*) {
        overflow: hidden;
        text-overflow: ellipsis;
      }

      slot:not([name]) {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      slot[hidden] {
        display: none;
      }

      .remove-button {
        all: unset;
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 1.4em;
        block-size: 1.4em;
        border-radius: var(--bx-radius-pill);
        cursor: pointer;
      }

      .remove-button::before {
        content: '';
        position: absolute;
        inset-block-start: 50%;
        inset-inline-start: 50%;
        translate: -50% -50%;
        inline-size: max(100%, var(--bx-target-min));
        block-size: max(100%, var(--bx-target-min));
      }

      .remove-button:hover {
        background: color-mix(in srgb, currentColor 16%, transparent);
      }

      .remove-button:focus-visible {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: var(--bx-focus-ring-offset);
      }

      .remove-button svg {
        inline-size: 0.85em;
        block-size: 0.85em;
      }

      :host([attention='pulse']) .base {
        animation: bx-badge-pulse var(--bx-motion-duration-slow, 1.6s)
          var(--bx-motion-easing-standard) infinite;
      }
      :host([attention='bounce']) .base {
        animation: bx-badge-bounce var(--bx-motion-duration-slow, 1.6s)
          var(--bx-motion-easing-standard) infinite;
      }

      @keyframes bx-badge-pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
      @keyframes bx-badge-bounce {
        0%,
        100% {
          translate: 0 0;
        }
        50% {
          translate: 0 -20%;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        :host([attention='pulse']) .base,
        :host([attention='bounce']) .base {
          animation: none;
        }
      }

      @media (forced-colors: active) {
        .base {
          forced-color-adjust: none;
          background: Canvas;
          color: CanvasText;
          border-color: CanvasText;
        }
      }
    `,
  ];

  static override properties = {
    variant: { type: String, reflect: true },
    appearance: { type: String, reflect: true },
    size: { type: String, reflect: true },
    pill: { type: Boolean, reflect: true },
    attention: { type: String, reflect: true },
    max: { type: Number },
    anchor: { type: String, reflect: true },
    withRemove: { type: Boolean, reflect: true, attribute: 'with-remove' },
    live: { type: Boolean, reflect: true },
    _overflow: { state: true },
  };

  declare variant: Variant;
  declare appearance: Appearance;
  declare size: Size;
  declare pill: boolean;
  declare attention: Attention;
  declare max: number;
  declare anchor?: Anchor;
  declare withRemove: boolean;
  declare live: boolean;
  /** @internal */
  declare _overflow?: string;

  #circular = false;

  constructor() {
    super();
    this.variant = 'default';
    this.appearance = 'filled outlined';
    this.size = 'medium';
    this.pill = false;
    this.attention = 'none';
    this.max = 99;
    this.withRemove = false;
    this.live = false;
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('withRemove') || changed.has('_overflow'))
      this.tabIndex = this.withRemove ? 0 : -1;
  }

  #handleSlotChange = (event: Event): void => {
    const slot = event.target as HTMLSlotElement;
    const nodes = slot.assignedNodes({ flatten: true });
    const text = nodes
      .map((n) => n.textContent ?? '')
      .join('')
      .trim();

    this._overflow =
      NUMERIC_PATTERN.test(text) && Number(text) > this.max
        ? `${this.max}+`
        : undefined;

    this.#circular = text.length <= 1 || this._overflow !== undefined;
    this.title = text;
    this.requestUpdate();
  };

  #handleRemoveClick = (event: MouseEvent): void => {
    event.stopPropagation();
    this.#requestRemove();
  };

  #handleKeydown = (event: KeyboardEvent): void => {
    if (!this.withRemove) return;
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      this.#requestRemove();
    }
  };

  #requestRemove(): void {
    const displayText = this._overflow ?? this.title ?? '';
    const cancelled = !this.dispatchEvent(
      new CustomEvent('bx-remove', {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: { content: displayText },
      }),
    );
    if (!cancelled) this.remove();
  }

  protected override render() {
    return html`
      <span
        class="base ${this.#circular ? 'circular' : ''}"
        part="base"
        role=${this.live ? 'status' : nothing}
        @keydown=${this.#handleKeydown}
      >
        <slot name="start" part="start"></slot>
        <span class="content" part="content">
          <slot
            @slotchange=${this.#handleSlotChange}
            ?hidden=${this._overflow !== undefined}
          ></slot>
          ${this._overflow ? html`<span>${this._overflow}</span>` : nothing}
        </span>
        <slot name="end" part="end"></slot>
        ${
          this.withRemove
            ? html`
                <button
                  type="button"
                  class="remove-button"
                  part="remove-button"
                  aria-label="Remove ${this._overflow ?? this.title ?? ''}"
                  @click=${this.#handleRemoveClick}
                >
                  <svg
                    viewBox="0 0 256 256"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"
                    />
                  </svg>
                </button>
              `
            : nothing
        }
      </span>
    `;
  }
}
