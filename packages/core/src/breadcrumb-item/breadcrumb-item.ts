import { css, html, nothing } from 'lit';
import { BixElement } from '../bix-element.ts';

/**
 * `<bx-breadcrumb-item>` — one crumb; link or button.
 *
 * FR-BREADCRUMB-ITEM-01's three-way fallback (anchor / button / text) is resolved as: `href` set
 * → `<a>`; no `href` and not `current` → `<button type="button">` (the "interactive" case — a
 * crumb the parent `bx-breadcrumb` can navigate via a click handler without a real URL, e.g. SPA
 * routing); `current` set → plain text with `aria-current="page"` (docs/features/core/breadcrumb-
 * item.md §6's "aria-current on last" — `current` isn't in the spec's own properties table but is
 * how the not-yet-built `bx-breadcrumb` parent would mark the last item, per §10's "confirm final
 * property names during implementation").
 *
 * @slot (default) - Label content.
 * @slot start - Leading icon.
 * @slot end - Trailing icon.
 * @slot separator - Overrides the default `/` separator shown after this item.
 *
 * @csspart label - The anchor/button/text label.
 * @csspart prefix - The wrapper around the start slot.
 * @csspart suffix - The wrapper around the end slot.
 * @csspart separator - The wrapper around the separator slot.
 */
export class BxBreadcrumbItem extends BixElement {
  static override tagName = 'bx-breadcrumb-item';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-flex;
        align-items: center;
        gap: var(--bx-space-2xs);
        font-family: var(--bx-font-family-sans);
        font-size: var(--bx-font-s);
      }

      /* Author styles beat the UA stylesheet's [hidden] at equal specificity, so :host's own
         display above would otherwise silently win over the native hidden attribute (the same
         gotcha bx-tab-panel's own :host([hidden]) rule exists for) — relevant once
         bx-breadcrumb's overflow collapse (FR-BREADCRUMB-01) starts toggling it. */
      :host([hidden]) {
        display: none;
      }

      .label {
        display: inline-flex;
        align-items: center;
        gap: var(--bx-space-2xs);
        min-block-size: var(--bx-target-min, 2.75rem);
        color: var(--bx-text-secondary);
        text-decoration: none;
        font: inherit;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
      }

      a.label,
      button.label {
        color: var(--bx-role-accent);
      }

      a.label:hover,
      button.label:hover {
        text-decoration: underline;
      }

      a.label:focus-visible,
      button.label:focus-visible {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: var(--bx-focus-ring-offset);
        border-radius: var(--bx-radius-s);
      }

      span.label[aria-current] {
        color: var(--bx-text-primary);
        font-weight: var(--bx-font-weight-medium);
        cursor: default;
      }

      .separator {
        display: inline-flex;
        margin-inline-end: var(--bx-space-2xs);
        color: var(--bx-text-secondary);
        user-select: none;
      }

      .separator slot::slotted(*) {
        display: inline-flex;
      }

      :host(:last-child) .separator {
        display: none;
      }
    `,
  ];

  static override properties = {
    href: { type: String },
    target: { type: String },
    rel: { type: String },
    current: { type: Boolean, reflect: true },
  };

  declare href: string;
  declare target?: string;
  declare rel?: string;
  declare current: boolean;

  constructor() {
    super();
    this.href = '';
    this.current = false;
  }

  protected override render() {
    const label = html`<slot name="start" part="prefix"></slot><slot></slot><slot
        name="end"
        part="suffix"
      ></slot>`;

    return html`
      ${this.href
        ? html`<a
            class="label"
            part="label"
            href=${this.href}
            target=${this.target || nothing}
            rel=${this.rel || nothing}
            aria-current=${this.current ? 'page' : nothing}
            >${label}</a
          >`
        : this.current
          ? html`<span class="label" part="label" aria-current="page">${label}</span>`
          : html`<button class="label" part="label" type="button">${label}</button>`}
      <span class="separator" part="separator" aria-hidden="true">
        <slot name="separator">/</slot>
      </span>
    `;
  }
}
