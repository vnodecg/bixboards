import { css, html } from 'lit';
import { BixElement } from '../bix-element.ts';
import { textFamily } from '../internal/text-style.ts';

/**
 * `<bx-tab-panel>` — content for a tab.
 *
 * `role="tabpanel"` lives on the host itself (the `bx-divider`/`bx-carousel-item` host-attribute
 * pattern) since there's no interactive shadow content to hang it on. `aria-labelledby` — "labelled
 * by tab" (docs/features/core/tab-panel.md §6) — is left for the consumer/future `bx-tab-group` to
 * set directly as a plain attribute on the host, the same way any ARIA-reflecting custom element
 * accepts it; nothing here needs to compute or own that value.
 *
 * FR-TAB-PANEL-01: inactive panels use the `hidden` content attribute rather than a CSS display
 * trick, so they're fully removed from the accessibility tree (and from tab order) rather than
 * merely invisible.
 *
 * @slot (default) - Panel content.
 *
 * @csspart base - The content wrapper.
 *
 * @cssprop --bx-tab-panel-padding - Panel padding. Default `--bx-space-m`.
 * @cssprop --bx-tab-panel-font-family - Font family of the root surface. Default `var(--bx-type-body-family)`.
 */
export class BxTabPanel extends BixElement {
  static override tagName = 'bx-tab-panel';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        ${textFamily('--bx-tab-panel', 'body')}
      }

      :host([hidden]) {
        display: none;
      }

      .base {
        padding: var(--bx-tab-panel-padding, var(--bx-space-m));
      }
    `,
  ];

  static override properties = {
    name: { type: String },
    active: { type: Boolean, reflect: true },
  };

  declare name: string;
  declare active: boolean;

  constructor() {
    super();
    this.name = '';
    this.active = false;
  }

  protected override updated(): void {
    this.setAttribute('role', 'tabpanel');
    this.hidden = !this.active;
  }

  protected override render() {
    return html`<div class="base" part="base"><slot></slot></div>`;
  }
}
