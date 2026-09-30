import { css, html, nothing, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';

type HideSource = 'close-button' | 'light-dismiss' | 'keyboard' | 'method';
type Placement = 'top' | 'end' | 'bottom' | 'start';

let nextId = 0;

/**
 * `<bx-drawer>` — edge-anchored panel (top/end/bottom/start), modal or contained to a parent
 * (docs/features/core/drawer.md).
 *
 * Same dialog semantics as `bx-dialog` (FR-DRAWER, §6): a native `<dialog>`, so the default modal
 * mode gets the inert background, focus trap and top-layer stacking from `showModal()`. The
 * header chrome (title slot, header-actions, close `bx-button`), light-dismiss, `data-drawer="close"`
 * delegation, cancelable `bx-hide` with `detail.source` and focus return all mirror `bx-dialog`
 * — kept as a parallel implementation rather than a shared base since the two only overlap in
 * that bookkeeping, not in layout, and a base class would be the first abstraction extracted from
 * exactly two users.
 *
 * `contained` opens the native dialog non-modally (`show()`) instead, and positions it inside the
 * nearest positioned ancestor rather than the viewport: the drawer's host fills that ancestor
 * (`position: absolute; inset: 0`), so **the parent must establish a containing block**
 * (`position: relative`). A rendered `overlay` scrim sits behind the panel and, without a trap,
 * focus is free to leave — FR-DRAWER-02's "do not trap focus outside their parent". Escape is
 * handled by a keydown listener since a non-modal `<dialog>` doesn't receive the native `cancel`.
 *
 * Placements use logical insets (RTL-aware `start`/`end`, FR-DRAWER-03); the slide-in animates
 * `transform` only and is disabled under `prefers-reduced-motion` (FR-DRAWER-01). Size uses `vi`
 * in modal mode for the same top-layer reason `bx-dialog` does, and clamps to the container so it
 * fills narrow ones (§5). There is no close animation, matching `bx-dialog`.
 *
 * @fires bx-show - The drawer is opening. Cancelable; canceling keeps it closed.
 * @fires bx-after-show - The drawer opened.
 * @fires bx-hide - The drawer is closing. Cancelable; canceling keeps it open. `detail.source`
 *   is `'close-button' | 'light-dismiss' | 'keyboard' | 'method'`.
 * @fires bx-after-hide - The drawer closed and focus has returned to the opener.
 *
 * @slot (default) - Body content.
 * @slot label - Overrides the `label` attribute's text as the title.
 * @slot header-actions - Actions in the header, before the close button.
 * @slot footer - Footer content (typically action buttons).
 *
 * @csspart dialog - The native `<dialog>` element.
 * @csspart overlay - The scrim behind the panel; only rendered when `contained` (a modal drawer
 *   uses the dialog's own `::backdrop`).
 * @csspart header - The header region.
 * @csspart title - The title text.
 * @csspart header-actions - The wrapper around the header-actions slot.
 * @csspart close-button - The default close button.
 * @csspart body - The scrollable body region.
 * @csspart footer - The footer region.
 *
 * @cssprop --bx-drawer-size - Panel size along its axis (width for start/end, height for
 *   top/bottom). Default `clamp(20rem, 30vi, 32rem)`-equivalent.
 * @cssprop --bx-drawer-spacing - Header/body/footer padding. Default `--bx-space-l`.
 */
export class BxDrawer extends BixElement {
  static override tagName = 'bx-drawer';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: contents;
      }

      :host([contained]) {
        position: absolute;
        inset: 0;
        display: block;
        overflow: hidden;
        pointer-events: none;
      }

      :host([contained]) .overlay,
      :host([contained]) dialog {
        pointer-events: auto;
      }

      .overlay {
        position: absolute;
        inset: 0;
        background: var(--bx-surface-overlay, rgb(0 0 0 / 0.4));
      }

      dialog {
        --_size: var(
          --bx-drawer-size,
          clamp(calc(var(--bx-unit) * 20), 30vi, calc(var(--bx-unit) * 32))
        );
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        margin: 0;
        padding: 0;
        max-inline-size: 100%;
        max-block-size: 100%;
        border: 0 solid var(--bx-border-subtle);
        background: var(--bx-surface-base, Canvas);
        color: var(--bx-text-primary);
        font-family: var(--bx-font-family-sans);
        box-shadow: var(--bx-shadow-l);
      }

      :host([contained]) dialog {
        position: absolute;
      }

      dialog:not([open]) {
        display: none;
      }

      /* Placement: logical insets so start/end follow writing direction. */
      dialog,
      :host([placement='end']) dialog {
        inset-block: 0;
        inset-inline: auto 0;
        inline-size: var(--_size);
        block-size: 100%;
        border-inline-start-width: var(--bx-border-width);
        --_x: 100%;
        --_y: 0px;
      }
      dialog:dir(rtl),
      :host([placement='end']) dialog:dir(rtl) {
        --_x: -100%;
      }

      :host([placement='start']) dialog {
        inset-inline: 0 auto;
        border-inline-start-width: 0;
        border-inline-end-width: var(--bx-border-width);
        --_x: -100%;
      }
      :host([placement='start']) dialog:dir(rtl) {
        --_x: 100%;
      }

      :host([placement='top']) dialog,
      :host([placement='bottom']) dialog {
        inset-inline: 0;
        inline-size: 100%;
        block-size: var(--_size);
        border-inline-width: 0;
        --_x: 0px;
      }
      :host([placement='top']) dialog {
        inset-block: 0 auto;
        border-block-end-width: var(--bx-border-width);
        --_y: -100%;
      }
      :host([placement='bottom']) dialog {
        inset-block: auto 0;
        border-block-start-width: var(--bx-border-width);
        --_y: 100%;
      }

      dialog::backdrop {
        background: var(--bx-surface-overlay, rgb(0 0 0 / 0.4));
      }

      dialog[open] {
        animation: bx-drawer-in var(--bx-motion-duration-base, 0.2s)
          var(--bx-motion-easing-standard, ease);
      }

      @keyframes bx-drawer-in {
        from {
          transform: translate(var(--_x), var(--_y));
        }
      }

      @media (prefers-reduced-motion: reduce) {
        dialog[open] {
          animation: none;
        }
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--bx-space-s);
        flex-shrink: 0;
        padding: var(--bx-drawer-spacing, var(--bx-space-l));
        padding-block-end: var(--bx-space-m);
      }

      .title {
        flex: 1;
        min-inline-size: 0;
        font-size: var(--bx-font-l);
        font-weight: var(--bx-font-weight-semibold);
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: var(--bx-space-xs);
      }

      .close-button::part(base) {
        inline-size: var(--bx-target-min, 2.75rem);
        padding-inline: 0;
        border-radius: var(--bx-radius-pill, 50%);
        color: var(--bx-text-secondary);
      }

      .close-button::part(base):hover {
        background: var(--bx-surface-subtle);
      }

      .body {
        flex: 1;
        overflow: auto;
        min-block-size: 0;
        padding: var(--bx-drawer-spacing, var(--bx-space-l));
        padding-block: var(--bx-space-m);
      }

      :host([without-header]) .body {
        padding-block-start: var(--bx-drawer-spacing, var(--bx-space-l));
      }

      .footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: var(--bx-space-s);
        flex-shrink: 0;
        padding: var(--bx-drawer-spacing, var(--bx-space-l));
        padding-block-start: var(--bx-space-m);
      }

      .footer:empty {
        display: none;
      }

      @media (forced-colors: active) {
        dialog {
          forced-color-adjust: none;
          background: Canvas;
          color: CanvasText;
          border-color: CanvasText;
        }
      }
    `,
  ];

  static override properties = {
    open: { type: Boolean, reflect: true },
    label: { type: String },
    placement: { type: String, reflect: true },
    contained: { type: Boolean, reflect: true },
    withoutHeader: {
      type: Boolean,
      reflect: true,
      attribute: 'without-header',
    },
    lightDismiss: {
      type: Boolean,
      reflect: true,
      attribute: 'light-dismiss',
    },
  };

  declare open: boolean;
  declare label: string;
  declare placement: Placement;
  declare contained: boolean;
  declare withoutHeader: boolean;
  declare lightDismiss: boolean;

  #titleId = `bx-drawer-title-${nextId++}`;
  #previouslyFocused: HTMLElement | null = null;

  constructor() {
    super();
    this.open = false;
    this.label = '';
    this.placement = 'end';
    this.contained = false;
    this.withoutHeader = false;
    this.lightDismiss = true;
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (!changed.has('open') || !this.open) return;

    const cancelled = !this.dispatchEvent(
      new CustomEvent('bx-show', {
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    if (cancelled) {
      this.open = false;
      return;
    }
    this.#previouslyFocused = document.activeElement as HTMLElement | null;
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (!changed.has('open')) return;

    const dialogEl = this.shadowRoot!.querySelector('dialog')!;
    if (this.open) {
      if (!dialogEl.open) {
        if (this.contained) dialogEl.show();
        else dialogEl.showModal();
      }
      this.#dispatchAfter('bx-after-show');
    } else if (dialogEl.open) {
      dialogEl.close();
      this.#previouslyFocused?.focus();
      this.#previouslyFocused = null;
      this.#dispatchAfter('bx-after-hide');
    }
  }

  #dispatchAfter(name: string): void {
    this.dispatchEvent(
      new CustomEvent(name, { bubbles: true, composed: true }),
    );
  }

  /** Opens the drawer. No-op if already open. */
  show(): void {
    if (this.open) return;
    this.open = true;
  }

  /** Closes the drawer. No-op if already closed. */
  hide(source: HideSource = 'method'): void {
    if (!this.open) return;
    const cancelled = !this.dispatchEvent(
      new CustomEvent('bx-hide', {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: { source },
      }),
    );
    if (cancelled) return;
    this.open = false;
  }

  #handleCancel = (event: Event): void => {
    // Native `cancel` (Escape, modal only) would close the <dialog> immediately; route it through
    // `hide()` so `bx-hide` stays cancelable and the source is reported consistently.
    event.preventDefault();
    this.hide('keyboard');
  };

  #handleKeydown = (event: KeyboardEvent): void => {
    // A non-modal (contained) <dialog> gets no native `cancel`, so handle Escape ourselves.
    if (this.contained && event.key === 'Escape') {
      event.stopPropagation();
      this.hide('keyboard');
    }
  };

  #handleDialogClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    const dialogEl = this.shadowRoot!.querySelector('dialog')!;

    if (target.closest('[data-drawer="close"]')) {
      this.hide('close-button');
      return;
    }

    // A click landing on the <dialog> element itself (not its content) is a backdrop click.
    if (this.lightDismiss && target === dialogEl) this.hide('light-dismiss');
  };

  #handleOverlayClick = (): void => {
    if (this.lightDismiss) this.hide('light-dismiss');
  };

  protected override render() {
    return html`
      ${
        this.contained && this.open
          ? html`<div
              class="overlay"
              part="overlay"
              @click=${this.#handleOverlayClick}
            ></div>`
          : nothing
      }
      <dialog
        part="dialog"
        aria-labelledby=${this.withoutHeader ? nothing : this.#titleId}
        aria-label=${this.withoutHeader && this.label ? this.label : nothing}
        @cancel=${this.#handleCancel}
        @keydown=${this.#handleKeydown}
        @click=${this.#handleDialogClick}
      >
        ${
          this.withoutHeader
            ? nothing
            : html`
                <div class="header" part="header">
                  <div class="title" part="title" id=${this.#titleId}>
                    <slot name="label">${this.label}</slot>
                  </div>
                  <div class="header-actions" part="header-actions">
                    <slot name="header-actions"></slot>
                    <bx-button
                      class="close-button"
                      part="close-button"
                      appearance="plain"
                      aria-label="Close"
                      data-drawer="close"
                    >
                      <bx-icon name="close"></bx-icon>
                    </bx-button>
                  </div>
                </div>
              `
        }
        <div class="body" part="body">
          <slot></slot>
        </div>
        <div class="footer" part="footer">
          <slot name="footer"></slot>
        </div>
      </dialog>
    `;
  }
}
