import { css, html, nothing } from 'lit';
import { BixElement } from '../bix-element.ts';
import { textFamily, textStyle } from '../internal/text-style.ts';
import type { BxSidebar } from '../sidebar/sidebar.ts';

const CARET =
  'M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z';

/**
 * `<bx-sidebar-item>` — one navigation entry of a `bx-sidebar` (FR-SIDEBAR-03).
 *
 * A link with `href` (a real `<a>`, `aria-current="page"` when `active`), otherwise a button. Items
 * in the `children` slot make it a disclosure (`aria-expanded`); nesting is meant for two levels.
 * In a collapsed sidebar only the icon shows and a `bx-tooltip` carries the label (FR-SIDEBAR-02);
 * a parent item's children are not shown in a flyout there — activating the parent expands the
 * sidebar instead. Activation fires a cancelable `bx-navigate` (`detail.href`).
 *
 * @fires bx-navigate - Link activated. Cancelable. `detail.href`.
 *
 * @slot (default) - Label.
 * @slot icon - Icon; overrides `icon`.
 * @slot children - Nested `bx-sidebar-item`s.
 *
 * @csspart item - The link/button.
 * @csspart label - The label.
 * @csspart badge - The badge.
 *
 * @cssprop --bx-sidebar-item-bg-active - Active item background.
 */
export class BxSidebarItem extends BixElement {
  static override tagName = 'bx-sidebar-item';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        ${textFamily('--bx-sidebar', 'label')}
      }
      .item {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: var(--bx-space-xs);
        inline-size: 100%;
        min-block-size: max(var(--bx-control-height-m), var(--bx-target-min));
        padding: 0 var(--bx-space-s);
        border: 0;
        border-radius: var(--bx-radius-m);
        background: transparent;
        color: var(--bx-text-primary);
        font: inherit;
        ${textStyle('--bx-sidebar', 'label-m')}
        text-align: start;
        text-decoration: none;
        cursor: pointer;
      }
      .item:hover:not([aria-disabled='true']) {
        background: var(--bx-surface-subtle);
      }
      .item:focus-visible {
        outline: var(
            --bx-sidebar-focus-ring-width,
            var(--bx-border-width-strong)
          )
          solid var(--bx-sidebar-focus-ring-color, var(--bx-focus-ring));
        outline-offset: -2px;
      }
      :host([active]) .item {
        background: var(
          --bx-sidebar-item-bg-active,
          var(--bx-role-brand-subtle)
        );
        color: var(--bx-role-brand-fg);
        font-weight: 600;
      }
      .item[aria-disabled='true'] {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .icon {
        display: inline-flex;
        flex: none;
        font-size: 1.15em;
      }
      .icon:not(:has(*)):not(:has(::slotted(*))) {
        display: none;
      }
      .label {
        flex: 1;
        min-inline-size: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .caret {
        inline-size: 1em;
        block-size: 1em;
        fill: currentColor;
        transition: rotate var(--bx-motion-duration-fast);
      }
      :host([expanded]) .caret {
        rotate: 180deg;
      }
      .children {
        padding-inline-start: var(--bx-space-m);
        display: none;
      }
      :host([expanded]) .children {
        display: block;
      }
      :host([collapsed]) .label,
      :host([collapsed]) .caret,
      :host([collapsed]) bx-badge,
      :host([collapsed]) .children {
        display: none;
      }
      :host([collapsed]) .item {
        justify-content: center;
        padding-inline: 0;
      }
      bx-tooltip {
        display: block;
      }
      @media (prefers-reduced-motion: reduce) {
        .caret {
          transition: none;
        }
      }
      @media (forced-colors: active) {
        :host([active]) .item {
          forced-color-adjust: none;
          background: Highlight;
          color: HighlightText;
        }
      }
    `,
  ];

  static override properties = {
    href: { type: String },
    active: { type: Boolean, reflect: true },
    icon: { type: String },
    badge: { type: String },
    disabled: { type: Boolean, reflect: true },
    expanded: { type: Boolean, reflect: true },
    collapsed: { type: Boolean, reflect: true },
    label: { type: String },
    _hasChildren: { state: true },
  };

  declare href: string;
  declare active: boolean;
  declare icon: string;
  declare badge: string;
  declare disabled: boolean;
  declare expanded: boolean;
  /** @internal Mirrored from the owning `bx-sidebar`. */
  declare collapsed: boolean;
  /** Accessible/tooltip label; defaults to the text content. */
  declare label: string;
  /** @internal */
  declare _hasChildren: boolean;

  constructor() {
    super();
    this.href = '';
    this.active = false;
    this.icon = '';
    this.badge = '';
    this.disabled = false;
    this.expanded = false;
    this.collapsed = false;
    this.label = '';
    this._hasChildren = false;
  }

  get #text(): string {
    return (
      this.label ||
      [...this.childNodes]
        .filter(
          (n) => n.nodeType === Node.TEXT_NODE || (n as Element).slot === '',
        )
        .map((n) => n.textContent)
        .join('')
        .trim()
    );
  }

  #activate = (event: MouseEvent): void => {
    if (this.disabled) {
      event.preventDefault();
      return;
    }
    if (this._hasChildren) {
      const sidebar = this.closest('bx-sidebar') as BxSidebar | null;
      if (this.collapsed && sidebar) sidebar.expand();
      this.expanded = !this.expanded || this.collapsed ? true : false;
      return;
    }
    if (!this.href) return;
    const proceed = this.dispatchEvent(
      new CustomEvent('bx-navigate', {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: { href: this.href },
      }),
    );
    if (!proceed) event.preventDefault();
  };

  protected override render() {
    const content = html`<span class="icon"
        ><slot name="icon"
          >${this.icon ? html`<bx-icon name=${this.icon}></bx-icon>` : nothing}</slot
        ></span
      >
      <span class="label" part="label"
        ><slot @slotchange=${() => this.requestUpdate()}></slot
      ></span>
      ${
        this.badge
          ? html`<bx-badge part="badge" size="small">${this.badge}</bx-badge>`
          : nothing
      }
      ${
        this._hasChildren
          ? html`<svg class="caret" viewBox="0 0 256 256" aria-hidden="true">
              <path d=${CARET} />
            </svg>`
          : nothing
      }`;
    const label = this.#text;
    const control =
      this.href && !this._hasChildren
        ? html`<a
            class="item"
            part="item"
            href=${this.disabled ? nothing : this.href}
            role=${this.disabled ? 'link' : nothing}
            aria-current=${this.active ? 'page' : nothing}
            aria-disabled=${this.disabled ? 'true' : nothing}
            aria-label=${this.collapsed && label ? label : nothing}
            @click=${this.#activate}
            >${content}</a
          >`
        : html`<button
            class="item"
            part="item"
            type="button"
            aria-expanded=${this._hasChildren ? String(this.expanded) : nothing}
            aria-disabled=${this.disabled ? 'true' : nothing}
            aria-label=${this.collapsed && label ? label : nothing}
            @click=${this.#activate}
          >
            ${content}
          </button>`;
    return html`${
        this.collapsed && label
          ? html`<bx-tooltip placement="right"
              ><span slot="anchor" style="display:block">${control}</span
              >${label}</bx-tooltip
            >`
          : control
      }
      <div class="children">
        <slot
          name="children"
          @slotchange=${(e: Event) => {
            this._hasChildren =
              (e.target as HTMLSlotElement).assignedElements().length > 0;
          }}
        ></slot>
      </div>`;
  }
}
