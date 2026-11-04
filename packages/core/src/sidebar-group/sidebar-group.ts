import { css, html } from 'lit';
import { BixElement } from '../bix-element.ts';
import { textStyle } from '../internal/text-style.ts';

let nextId = 0;

/**
 * `<bx-sidebar-group>` — a labelled group of `bx-sidebar-item`s inside a `bx-sidebar`.
 *
 * `role="group"` named by its visible `label`; the label is hidden while the sidebar is collapsed
 * (the owning sidebar mirrors `collapsed`).
 *
 * @slot (default) - `bx-sidebar-item` children.
 *
 * @csspart group-label - The group label.
 */
export class BxSidebarGroup extends BixElement {
  static override tagName = 'bx-sidebar-group';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        padding-block: var(--bx-space-2xs);
      }
      .group-label {
        padding: var(--bx-space-xs) var(--bx-space-s) var(--bx-space-3xs);
        color: var(--bx-text-secondary);
        text-transform: uppercase;
        ${textStyle('--bx-sidebar-group-label', 'label-xs')}
      }
      :host([collapsed]) .group-label {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        overflow: hidden;
        clip-path: inset(50%);
      }
      :host([collapsed]) {
        border-block-start: var(--bx-border-width) solid var(--bx-border-subtle);
      }
      :host([collapsed]:first-child) {
        border-block-start: 0;
      }
    `,
  ];

  static override properties = {
    label: { type: String },
    collapsed: { type: Boolean, reflect: true },
  };

  declare label: string;
  /** @internal Mirrored from the owning `bx-sidebar`. */
  declare collapsed: boolean;

  #id = `bx-sidebar-group-${nextId++}`;

  constructor() {
    super();
    this.label = '';
    this.collapsed = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'group');
  }

  protected override updated(): void {
    if (this.label) this.setAttribute('aria-labelledby', this.#id);
  }

  protected override render() {
    return html`<div class="group-label" part="group-label" id=${this.#id}>
        ${this.label}
      </div>
      <slot></slot>`;
  }
}
