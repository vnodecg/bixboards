import { css, html, nothing, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';

type HideSource = 'close-button' | 'light-dismiss' | 'keyboard' | 'method';

let nextId = 0;

/**
 * `<bx-dialog>` — modal dialog built on native `<dialog>`, with header, footer and light dismiss.
 *
 * `showModal()`/`close()` on the native element provide the inert background, focus trap and
 * top-layer stacking for free (FR-DIALOG-01) — this component only adds the header/footer
 * chrome, light-dismiss, `data-dialog="close"` delegation and focus-return bookkeeping on top.
 *
 * The default close button is a real `<bx-button>` (styled via `::part(base)` into its round
 * icon-button shape) rather than a bespoke `<button>` — this makes `bx-dialog` a Tier 1 component
 * that depends on a Tier 2 one (docs/features/IMPLEMENTATION.md), a deliberate exception to the
 * usual build-order layering now that `bx-button` exists, so every dialog's close control gets
 * `bx-button`'s own disabled/hover/focus/forced-colors handling for free instead of a second,
 * separately-maintained implementation of the same thing.
 *
 * Sizing intentionally uses `vi` (viewport-inline), not a container query: a top-layer element has
 * no ancestor that provides an `inline-size` containment context to query against — its size
 * decision is inherently relative to the viewport, which is the one legitimate exception to
 * "container queries, never media queries" (docs/features/_conventions.md §3); see also
 * `scroller.md`'s documented fallback-path exception for the same kind of API-availability gap.
 *
 * @fires bx-show - The dialog is opening. Cancelable; canceling prevents `showModal()`.
 * @fires bx-after-show - The open transition finished.
 * @fires bx-hide - The dialog is closing. Cancelable; canceling keeps it open. `detail.source` is
 *   `'close-button' | 'light-dismiss' | 'keyboard' | 'method'`.
 * @fires bx-after-hide - The close transition finished and focus has returned to the opener.
 *
 * @slot (default) - Body content.
 * @slot label - Overrides the `label` attribute's text as the title.
 * @slot header-actions - Actions in the header, before the close button.
 * @slot footer - Footer content (typically action buttons).
 *
 * @csspart dialog - The native `<dialog>` element.
 * @csspart header - The header region.
 * @csspart title - The title text.
 * @csspart header-actions - The wrapper around the header-actions slot.
 * @csspart close-button - The default close button.
 * @csspart body - The scrollable body region.
 * @csspart footer - The footer region.
 *
 * @cssprop --bx-dialog-width - Max width. Default `40rem`-equivalent fluid width.
 * @cssprop --bx-dialog-spacing - Header/body/footer padding. Default `--bx-space-l`.
 */
export class BxDialog extends BixElement {
  static override tagName = 'bx-dialog';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: contents;
      }

      dialog {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        max-block-size: min(85vh, 100%);
        inline-size: clamp(
          calc(var(--bx-unit) * 20),
          90vi,
          var(--bx-dialog-width, calc(var(--bx-unit) * 32))
        );
        padding: 0;
        border: var(--bx-border-width) solid var(--bx-border-subtle);
        border-radius: var(--bx-radius-l);
        box-shadow: var(--bx-shadow-l);
        background: var(--bx-surface-base, Canvas);
        color: var(--bx-text-primary);
        font-family: var(--bx-font-family-sans);
      }

      dialog::backdrop {
        background: var(--bx-surface-overlay, rgb(0 0 0 / 0.4));
      }

      dialog[open] {
        animation: bx-dialog-in var(--bx-motion-duration-base, 0.2s)
          var(--bx-motion-easing-standard, ease);
      }

      @keyframes bx-dialog-in {
        from {
          opacity: 0;
          transform: translateY(var(--bx-space-s)) scale(0.98);
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
        padding: var(--bx-dialog-spacing, var(--bx-space-l));
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

      /* bx-button's own base part is styled directly (rather than reaching for a bespoke
         close-button look) so this uses the same control every other composite in the package
         does, per docs/features/_conventions.md's spirit of one canonical trigger element. */
      .close-button::part(base) {
        inline-size: var(--bx-target-min, 2.75rem);
        padding-inline: 0;
        border-radius: var(--bx-radius-pill, 50%);
        color: var(--bx-text-secondary);
      }

      .close-button::part(base):hover {
        background: var(--bx-surface-subtle);
      }

      .close-button svg {
        inline-size: 1em;
        block-size: 1em;
        fill: currentColor;
      }

      .body {
        flex: 1;
        overflow: auto;
        min-block-size: 0;
        padding: var(--bx-dialog-spacing, var(--bx-space-l));
        padding-block: var(--bx-space-m);
      }

      :host([without-header]) .body {
        padding-block-start: var(--bx-dialog-spacing, var(--bx-space-l));
      }

      .footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: var(--bx-space-s);
        flex-shrink: 0;
        padding: var(--bx-dialog-spacing, var(--bx-space-l));
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
  declare withoutHeader: boolean;
  declare lightDismiss: boolean;

  #titleId = `bx-dialog-title-${nextId++}`;
  #previouslyFocused: HTMLElement | null = null;

  constructor() {
    super();
    this.open = false;
    this.label = '';
    this.withoutHeader = false;
    this.lightDismiss = false;
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (!changed.has('open')) return;

    if (this.open) {
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
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (!changed.has('open')) return;

    const dialogEl = this.shadowRoot!.querySelector('dialog')!;
    if (this.open) {
      if (!dialogEl.open) dialogEl.showModal();
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

  /** Opens the dialog. No-op if already open. */
  show(): void {
    if (this.open) return;
    this.open = true;
  }

  /** Closes the dialog. No-op if already closed. */
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
    // Native `cancel` (Escape) would close the <dialog> immediately; run it through `hide()`
    // instead so `bx-hide` stays cancelable and the source is reported consistently.
    event.preventDefault();
    this.hide('keyboard');
  };

  #handleDialogClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    const dialogEl = this.shadowRoot!.querySelector('dialog')!;

    if (target.closest('[data-dialog="close"]')) {
      this.hide('close-button');
      return;
    }

    // A click landing on the <dialog> element itself (not its content) is a backdrop click: the
    // ::backdrop pseudo-element isn't a real hit-testable node, so clicks through it target the
    // dialog's own border box.
    if (this.lightDismiss && target === dialogEl) this.hide('light-dismiss');
  };

  protected override render() {
    return html`
      <dialog
        part="dialog"
        aria-labelledby=${this.withoutHeader ? nothing : this.#titleId}
        @cancel=${this.#handleCancel}
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
                      data-dialog="close"
                    >
                      <svg viewBox="0 0 256 256">
                        <path
                          d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"
                        ></path>
                      </svg>
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
