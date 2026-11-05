import { css, html } from 'lit';
import { BixElement } from '../bix-element.ts';
import { textStyle } from '../internal/text-style.ts';
import type { BxStep } from '../step/step.ts';

/**
 * `<bx-stepper>` — multi-step progress indicator and wizard navigation
 * (docs/features/core/stepper.md).
 *
 * Navigation only (FR-STEPPER-01): it never owns the step content. It stamps each `bx-step` child
 * with its index, derived status (`complete` before `current`, `upcoming` after; an explicit `status`
 * attribute on a step, e.g. `error`/`skipped`, wins) and whether it is navigable. Selecting a step
 * fires a cancelable `bx-step-change`; if nobody cancels it, `current` moves. In a container
 * narrower than 24rem it collapses to the current step plus a "Step 2 of 5" summary
 * (FR-STEPPER-02). Status is a glyph and spoken text, not colour alone (FR-STEPPER-03).
 *
 * @fires bx-step-change - Cancelable. `detail.from`, `detail.to`.
 *
 * @slot (default) - `bx-step` children.
 *
 * @csspart base - The base part.
 * @csspart summary - The collapsed "Step N of M" text.
 *
 * @cssprop --bx-stepper-indicator-size - Indicator size.
 * @cssprop --bx-stepper-connector-color - Line color.
 * @cssprop --bx-stepper-connector-color-complete - Completed line color.
 * @cssprop --bx-stepper-summary-font-family - Font family of the `summary` text (text style `caption-m`). Default `var(--bx-type-caption-family)`.
 * @cssprop --bx-stepper-summary-font-size - Font size of the `summary` text (text style `caption-m`). Default `var(--bx-type-caption-m-size)`.
 * @cssprop --bx-stepper-summary-font-weight - Font weight of the `summary` text (text style `caption-m`). Default `var(--bx-type-caption-m-weight)`.
 * @cssprop --bx-stepper-summary-line-height - Line height of the `summary` text (text style `caption-m`). Default `var(--bx-type-caption-m-leading)`.
 * @cssprop --bx-stepper-summary-letter-spacing - Letter spacing of the `summary` text (text style `caption-m`). Default `var(--bx-type-caption-m-tracking)`.
 * @cssprop --bx-stepper-font-family - Font family of the item text. Default `var(--bx-type-label-family)`.
 * @cssprop --bx-stepper-indicator-font-family - Font family of the `indicator` text (text style `label-s`). Default `var(--bx-type-label-family)`.
 * @cssprop --bx-stepper-indicator-font-size - Font size of the `indicator` text (text style `label-s`). Default `var(--bx-type-label-s-size)`.
 * @cssprop --bx-stepper-indicator-font-weight - Font weight of the `indicator` text (text style `label-s`). Default `var(--bx-type-label-s-weight)`.
 * @cssprop --bx-stepper-indicator-line-height - Line height of the `indicator` text (text style `label-s`). Default `var(--bx-type-label-s-leading)`.
 * @cssprop --bx-stepper-indicator-letter-spacing - Letter spacing of the `indicator` text (text style `label-s`). Default `var(--bx-type-label-s-tracking)`.
 * @cssprop --bx-stepper-font-family - Font family of the item text (text style `label-m`). Default `var(--bx-type-label-family)`.
 * @cssprop --bx-stepper-font-size - Font size of the item text (text style `label-m`). Default `var(--bx-type-label-m-size)`.
 * @cssprop --bx-stepper-font-weight - Font weight of the item text (text style `label-m`). Default `var(--bx-type-label-m-weight)`.
 * @cssprop --bx-stepper-line-height - Line height of the item text (text style `label-m`). Default `var(--bx-type-label-m-leading)`.
 * @cssprop --bx-stepper-letter-spacing - Letter spacing of the item text (text style `label-m`). Default `var(--bx-type-label-m-tracking)`.
 * @cssprop --bx-stepper-description-font-family - Font family of the `description` text (text style `caption-m`). Default `var(--bx-type-caption-family)`.
 * @cssprop --bx-stepper-description-font-size - Font size of the `description` text (text style `caption-m`). Default `var(--bx-type-caption-m-size)`.
 * @cssprop --bx-stepper-description-font-weight - Font weight of the `description` text (text style `caption-m`). Default `var(--bx-type-caption-m-weight)`.
 * @cssprop --bx-stepper-description-line-height - Line height of the `description` text (text style `caption-m`). Default `var(--bx-type-caption-m-leading)`.
 * @cssprop --bx-stepper-description-letter-spacing - Letter spacing of the `description` text (text style `caption-m`). Default `var(--bx-type-caption-m-tracking)`.
 * @cssprop --bx-stepper-focus-ring-width - Focus ring width of the steps (focus state). Default `var(--bx-border-width-strong)`.
 * @cssprop --bx-stepper-focus-ring-color - Focus ring color of the steps (focus state). Default `var(--bx-focus-ring)`.
 */
export class BxStepper extends BixElement {
  static override tagName = 'bx-stepper';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        container-type: inline-size;
      }
      .base {
        display: flex;
        align-items: flex-start;
      }
      :host([orientation='vertical']) .base {
        flex-direction: column;
      }
      .summary {
        display: none;
        margin-block-start: var(--bx-space-2xs);
        color: var(--bx-text-secondary);
        ${textStyle('--bx-stepper-summary', 'caption-m')}
      }
      @container (max-width: 24rem) {
        :host([orientation='horizontal']) .summary {
          display: block;
        }
      }
    `,
  ];

  static override properties = {
    current: { type: Number, reflect: true },
    orientation: { type: String, reflect: true },
    linear: { type: Boolean },
    clickable: { type: Boolean },
    size: { type: String, reflect: true },
  };

  declare current: number;
  declare orientation: 'horizontal' | 'vertical';
  declare linear: boolean;
  declare clickable: boolean;
  declare size: 's' | 'm' | 'l';

  constructor() {
    super();
    this.current = 0;
    this.orientation = 'horizontal';
    this.linear = false;
    this.clickable = true;
    this.size = 'm';
  }

  get #steps(): BxStep[] {
    return [...this.children].filter(
      (c) => c.localName === 'bx-step',
    ) as BxStep[];
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'list');
    this.addEventListener('bx-step-select', this.#onSelect as EventListener);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('bx-step-select', this.#onSelect as EventListener);
  }

  protected override updated(): void {
    this.#stamp();
  }

  #stamp = (): void => {
    const steps = this.#steps;
    steps.forEach((step, i) => {
      step.index = i;
      step.orientation = this.orientation;
      step.last = i === steps.length - 1;
      const explicit = step.status === 'error' || step.status === 'skipped';
      if (!explicit) {
        step.status =
          i < this.current
            ? 'complete'
            : i === this.current
              ? 'current'
              : 'upcoming';
      }
      step.navigable =
        this.clickable &&
        i !== this.current &&
        (this.linear ? i < this.current : true);
    });
  };

  #onSelect = (event: CustomEvent<{ index: number }>): void => {
    event.stopPropagation();
    const to = event.detail.index;
    if (to === this.current) return;
    if (this.linear && to > this.current) return;
    const from = this.current;
    const go = this.dispatchEvent(
      new CustomEvent('bx-step-change', {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: { from, to },
      }),
    );
    if (go) this.current = to;
  };

  protected override render() {
    return html`<div class="base" part="base">
        <slot
          @slotchange=${() => {
            this.#stamp();
            this.requestUpdate();
          }}
        ></slot>
      </div>
      <div class="summary" part="summary" aria-hidden="true">
        Step ${this.current + 1} of ${this.#steps.length}
      </div>`;
  }
}
