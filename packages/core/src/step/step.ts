import { css, html, nothing } from 'lit';
import { BixElement } from '../bix-element.ts';
import { textFamily, textStyle } from '../internal/text-style.ts';

export type StepStatus =
  'complete' | 'current' | 'upcoming' | 'error' | 'skipped';

const GLYPH: Partial<Record<StepStatus, string>> = {
  complete:
    'M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z',
  error:
    'M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z',
  skipped: 'M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z',
};

const STATUS_TEXT: Record<StepStatus, string> = {
  complete: 'completed',
  current: 'current step',
  upcoming: 'not started',
  error: 'has an error',
  skipped: 'skipped',
};

/**
 * `<bx-step>` — one step of a `bx-stepper`.
 *
 * `bx-stepper` stamps `index`, `status` (derived from `current` unless `status` is set explicitly
 * on the step), `navigable`, `orientation` and `last`. Status is shown as a glyph *and* spoken text
 * (FR-STEPPER-03). Navigable steps render a native `<button>`.
 *
 * @slot (default) - Description content.
 *
 * @csspart step - The step part.
 * @csspart indicator - Number/check/error glyph.
 * @csspart connector - Line between steps.
 * @csspart label - The label part.
 */
export class BxStep extends BixElement {
  static override tagName = 'bx-step';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: flex;
        flex: 1 1 0;
        min-inline-size: 0;
        ${textFamily('--bx-stepper', 'label')}
        --_size: var(--bx-stepper-indicator-size, calc(var(--bx-unit) * 1.75));
      }
      :host([last]) {
        flex: 0 0 auto;
      }
      :host([orientation='vertical']) {
        flex: none;
      }
      .step {
        display: flex;
        flex: 1 1 auto;
        align-items: flex-start;
        gap: var(--bx-space-xs);
        min-inline-size: 0;
        padding: 0;
        border: 0;
        background: none;
        color: inherit;
        font: inherit;
        text-align: start;
      }
      button.step {
        cursor: pointer;
      }
      button.step:focus-visible {
        outline: var(
            --bx-stepper-focus-ring-width,
            var(--bx-border-width-strong)
          )
          solid var(--bx-stepper-focus-ring-color, var(--bx-focus-ring));
        outline-offset: var(--bx-focus-ring-offset);
        border-radius: var(--bx-radius-s);
      }
      .indicator {
        box-sizing: border-box;
        display: inline-flex;
        flex: none;
        align-items: center;
        justify-content: center;
        inline-size: var(--_size);
        block-size: var(--_size);
        border: var(--bx-border-width-strong) solid
          var(--bx-border-strong, var(--bx-border-subtle));
        border-radius: 50%;
        background: var(--bx-surface-base);
        color: var(--bx-text-secondary);
        font-variant-numeric: tabular-nums;
        ${textStyle('--bx-stepper-indicator', 'label-s')}
      }
      .indicator svg {
        inline-size: 0.9em;
        block-size: 0.9em;
        fill: currentColor;
      }
      :host([status='current']) .indicator {
        border-color: var(--bx-role-brand-solid);
        color: var(--bx-role-brand-fg);
      }
      :host([status='complete']) .indicator {
        border-color: var(--bx-role-brand-solid);
        background: var(--bx-role-brand-solid);
        color: var(--bx-role-brand-on-solid);
      }
      :host([status='error']) .indicator {
        border-color: var(--bx-role-danger-solid);
        background: var(--bx-role-danger-solid);
        color: var(--bx-role-danger-on-solid);
      }
      .text {
        display: flex;
        flex-direction: column;
        min-inline-size: 0;
        padding-block-start: calc((var(--_size) - 1lh) / 2);
      }
      .label {
        color: var(--bx-text-primary);
        ${textStyle('--bx-stepper', 'label-m')}
      }
      :host([status='upcoming']) .label {
        color: var(--bx-text-secondary);
      }
      .description {
        color: var(--bx-text-secondary);
        ${textStyle('--bx-stepper-description', 'caption-m')}
      }
      .description:not(:has(*)):empty:not(:has(::slotted(*))) {
        display: none;
      }
      .connector {
        flex: 1 1 auto;
        align-self: center;
        min-inline-size: var(--bx-space-m);
        block-size: 2px;
        margin-inline: var(--bx-space-xs);
        background: var(--bx-stepper-connector-color, var(--bx-border-subtle));
      }
      :host([status='complete']) .connector {
        background: var(
          --bx-stepper-connector-color-complete,
          var(--bx-role-brand-solid)
        );
      }
      :host([last]) .connector {
        display: none;
      }
      :host([orientation='vertical']) {
        flex-direction: column;
      }
      :host([orientation='vertical']) .connector {
        align-self: flex-start;
        inline-size: 2px;
        block-size: var(--bx-space-m);
        min-inline-size: 0;
        margin-inline: calc(var(--_size) / 2 - 1px);
        margin-block: var(--bx-space-2xs);
      }
      @container (max-width: 24rem) {
        :host([orientation='horizontal']:not([status='current'])) {
          display: none;
        }
        :host([orientation='horizontal']) .connector {
          display: none;
        }
      }
      @media (forced-colors: active) {
        .indicator {
          forced-color-adjust: none;
          border-color: ButtonText;
        }
        :host([status='current']) .indicator,
        :host([status='complete']) .indicator {
          background: Highlight;
          color: HighlightText;
        }
      }
    `,
  ];

  static override properties = {
    label: { type: String },
    description: { type: String },
    status: { type: String, reflect: true },
    index: { type: Number },
    navigable: { type: Boolean, reflect: true },
    orientation: { type: String, reflect: true },
    last: { type: Boolean, reflect: true },
  };

  declare label: string;
  declare description: string;
  declare status: StepStatus;
  /** @internal Set by `bx-stepper`. */
  declare index: number;
  /** @internal Set by `bx-stepper`. */
  declare navigable: boolean;
  /** @internal Set by `bx-stepper`. */
  declare orientation: 'horizontal' | 'vertical';
  /** @internal Set by `bx-stepper`. */
  declare last: boolean;

  constructor() {
    super();
    this.label = '';
    this.description = '';
    this.status = 'upcoming';
    this.index = 0;
    this.navigable = false;
    this.orientation = 'horizontal';
    this.last = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'listitem');
  }

  protected override render() {
    const glyph = GLYPH[this.status];
    const body = html`<span
        class="indicator"
        part="indicator"
        aria-hidden="true"
        >${
          glyph
            ? html`<svg viewBox="0 0 256 256"><path d=${glyph} /></svg>`
            : this.index + 1
        }</span
      >
      <span class="text"
        ><span class="label" part="label">${this.label}</span
        ><span class="description">${this.description}<slot></slot></span
      ></span>`;
    const sr = html`<span
      style="position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap"
      >, ${STATUS_TEXT[this.status]}</span
    >`;
    return html`${
        this.navigable
          ? html`<button
              class="step"
              part="step"
              type="button"
              aria-current=${this.status === 'current' ? 'step' : nothing}
              @click=${() =>
                this.dispatchEvent(
                  new CustomEvent('bx-step-select', {
                    bubbles: true,
                    composed: true,
                    detail: { index: this.index },
                  }),
                )}
            >
              ${body}${sr}
            </button>`
          : html`<div
              class="step"
              part="step"
              aria-current=${this.status === 'current' ? 'step' : nothing}
            >
              ${body}${sr}
            </div>`
      } <span class="connector" part="connector" aria-hidden="true"></span>`;
  }
}
