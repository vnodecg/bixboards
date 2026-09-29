import { css, html, nothing } from 'lit';
import { BixElement } from '../bix-element.ts';

// Vendored from packages/core/src/icon/default-library.ts (Phosphor Icons, regular, MIT).
const X_PATH =
  'M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z';

/**
 * `<bx-tab>` — a tab button.
 *
 * `aria-controls` is set directly from `panel` (docs/features/core/tab.md §2's "Panel name"),
 * assuming the future `bx-tab-group` keeps a tab's `panel` value equal to its matching
 * `bx-tab-panel`'s `id` — the same direct-value approach `bx-breadcrumb-item` takes for
 * `aria-current`, standing in until that parent exists to coordinate ids itself. Roving tabindex
 * across a set of tabs (only the active or, once one has focus, the most recently focused tab is a
 * tab stop) is also `bx-tab-group`'s job; standalone, a tab is a tab stop whenever it's `active` or
 * not yet part of any group, so it's still independently keyboard-testable.
 *
 * @fires bx-close - The close button (present when `closable`) was activated, by click or by
 *   Backspace/Delete on the focused tab. Not fired when `disabled`.
 *
 * @slot (default) - Label.
 *
 * @csspart base - The tab's interactive row (`role="tab"`).
 * @csspart close-button - The close glyph, present when `closable` (not in the spec's own CSS
 *   parts table — added the same way `bx-badge`'s `remove-button` part exists for its own
 *   removable-chip case). It's a plain `aria-hidden` span, not its own focusable control: a
 *   focusable descendant of a `role="tab"` element is an ARIA nested-interactive violation (axe:
 *   nested-interactive) no matter its `tabindex`, since `tab` is itself an interactive widget role.
 *   Mouse users click it directly; keyboard users close via Backspace/Delete on the tab itself, the
 *   same pattern `bx-badge`'s removable chip uses for the same reason.
 */
export class BxTab extends BixElement {
  static override tagName = 'bx-tab';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-block;
        font-family: var(--bx-font-family-sans);
      }

      .base {
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        gap: var(--bx-space-2xs);
        min-block-size: var(--bx-target-min, 2.75rem);
        padding-inline: var(--bx-space-m);
        border-radius: var(--bx-radius-s) var(--bx-radius-s) 0 0;
        color: var(--bx-text-secondary);
        font-weight: var(--bx-font-weight-medium);
        font: inherit;
        cursor: pointer;
        outline: none;
      }

      .base:hover {
        color: var(--bx-text-primary);
        background: var(--bx-surface-subtle);
      }

      :host([active]) .base {
        color: var(--bx-role-accent);
        box-shadow: inset 0 calc(var(--bx-border-width-strong) * -1) 0 0 var(--bx-role-accent);
      }

      .base:focus-visible {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: calc(var(--bx-focus-ring-offset) * -1);
      }

      :host([disabled]) .base {
        cursor: not-allowed;
        color: var(--bx-text-disabled);
      }

      .close-button {
        all: unset;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 1em;
        block-size: 1em;
        min-inline-size: var(--bx-target-min);
        min-block-size: var(--bx-target-min);
        margin-inline-end: calc(var(--bx-space-2xs) * -1);
        border-radius: var(--bx-radius-pill);
        cursor: pointer;
      }

      .close-button:hover {
        background: color-mix(in srgb, currentColor 16%, transparent);
      }

      .close-button:focus-visible {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: var(--bx-focus-ring-offset);
      }

      .close-button svg {
        inline-size: 0.65em;
        block-size: 0.65em;
        fill: currentColor;
      }

      @media (forced-colors: active) {
        :host([active]) .base {
          forced-color-adjust: none;
          box-shadow: inset 0 calc(var(--bx-border-width-strong) * -1) 0 0 Highlight;
          color: Highlight;
        }
      }
    `,
  ];

  static override properties = {
    panel: { type: String },
    active: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    closable: { type: Boolean, reflect: true },
  };

  declare panel: string;
  declare active: boolean;
  declare disabled: boolean;
  declare closable: boolean;

  constructor() {
    super();
    this.panel = '';
    this.active = false;
    this.disabled = false;
    this.closable = false;
  }

  #close(): void {
    if (this.disabled) return;
    this.dispatchEvent(new CustomEvent('bx-close', { bubbles: true, composed: true }));
  }

  #handleCloseClick = (event: MouseEvent): void => {
    event.stopPropagation();
    this.#close();
  };

  // The close button is `tabindex="-1"` — a focusable descendant of a `role="tab"` element is an
  // ARIA nested-interactive violation (axe: nested-interactive) regardless of real keyboard
  // behavior, since `tab` is itself an interactive widget role. Keyboard users close via
  // Backspace/Delete on the focused tab instead, the same pattern `bx-badge`'s removable chip
  // uses; mouse users can still click the visible button.
  #handleBaseKeydown = (event: KeyboardEvent): void => {
    if (!this.closable) return;
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      this.#close();
    }
  };

  protected override render() {
    return html`
      <div
        class="base"
        part="base"
        role="tab"
        tabindex=${this.disabled ? -1 : 0}
        aria-selected=${this.active}
        aria-controls=${this.panel || nothing}
        aria-disabled=${this.disabled}
        @keydown=${this.#handleBaseKeydown}
      >
        <slot></slot>
        ${this.closable
          ? html`<span
              class="close-button"
              part="close-button"
              aria-hidden="true"
              @click=${this.#handleCloseClick}
            >
              <svg viewBox="0 0 256 256"><path d=${X_PATH}></path></svg>
            </span>`
          : nothing}
      </div>
    `;
  }
}
