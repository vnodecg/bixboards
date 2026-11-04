import { css, html, nothing } from 'lit';
import { BixElement } from '../bix-element.ts';
import { textFamily, textStyle } from '../internal/text-style.ts';

/**
 * `<bx-segment>` — one option of a `bx-segmented-control` (FR-SEGMENTEDCONTROL-03).
 *
 * The host is the `role="radio"` element; `bx-segmented-control` owns `selected`, `tabindex` and
 * arrow-key movement. `label` (or the default slot) is the text, `icon` an optional leading icon
 * name.
 *
 * @slot (default) - Label content; overrides `label`.
 * @slot icon - Leading icon; overrides `icon`.
 *
 * @csspart segment - The segment surface.
 */
export class BxSegment extends BixElement {
  static override tagName = 'bx-segment';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-flex;
        position: relative;
        z-index: 1;
        cursor: pointer;
        outline: none;
        ${textFamily('--bx-segmented-control', 'label')}
      }
      :host([full-width]) {
        flex: 1 1 0;
      }
      .segment {
        box-sizing: border-box;
        display: inline-flex;
        flex: 1 1 auto;
        align-items: center;
        justify-content: center;
        gap: var(--bx-space-2xs);
        min-block-size: max(var(--_h), var(--bx-target-min));
        padding-inline: var(--bx-space-m);
        border-radius: var(--bx-radius-s);
        color: var(--bx-text-secondary);
        white-space: nowrap;
        ${textStyle('--bx-segmented-control', 'label-m')}
      }
      :host([selected]) .segment {
        color: var(--bx-text-primary);
      }
      :host(:focus-visible) .segment {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: var(--bx-focus-ring-offset);
      }
      :host([disabled]) {
        cursor: not-allowed;
        opacity: 0.5;
      }
      .icon {
        display: inline-flex;
      }
      .icon:not(:has(*)):not(:has(::slotted(*))) {
        display: none;
      }
      @media (forced-colors: active) {
        :host([selected]) .segment {
          background: Highlight;
          color: HighlightText;
          forced-color-adjust: none;
        }
      }
    `,
  ];

  static override properties = {
    value: { type: String },
    label: { type: String },
    icon: { type: String },
    disabled: { type: Boolean, reflect: true },
    selected: { type: Boolean, reflect: true },
    fullWidth: { type: Boolean, reflect: true, attribute: 'full-width' },
  };

  declare value: string;
  declare label: string;
  declare icon: string;
  declare disabled: boolean;
  /** @internal Owned by `bx-segmented-control`. */
  declare selected: boolean;
  /** @internal Set by `bx-segmented-control`. */
  declare fullWidth: boolean;

  constructor() {
    super();
    this.value = '';
    this.label = '';
    this.icon = '';
    this.disabled = false;
    this.selected = false;
    this.fullWidth = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'radio');
  }

  protected override updated(): void {
    this.setAttribute('aria-checked', String(this.selected));
    if (this.disabled) this.setAttribute('aria-disabled', 'true');
    else this.removeAttribute('aria-disabled');
  }

  protected override render() {
    return html`<span class="segment" part="segment">
      <span class="icon"
        ><slot name="icon"
          >${
            this.icon ? html`<bx-icon name=${this.icon}></bx-icon>` : nothing
          }</slot
        ></span
      >
      <slot>${this.label}</slot>
    </span>`;
  }
}
