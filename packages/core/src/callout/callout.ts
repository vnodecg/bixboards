import { css, html, nothing, svg, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';

type Variant = 'default' | 'secondary' | 'tertiary' | 'error' | 'warning';
type Appearance =
  'accent' | 'filled' | 'outlined' | 'plain' | 'filled outlined';
type Size = 'small' | 'medium' | 'large';

// Vendored from packages/core/src/icon/default-library.ts (Phosphor Icons, regular, MIT) — kept
// inline rather than depending on `bx-icon` so `bx-callout` stays independently importable
// (docs/features/_conventions.md §1). `error` reuses the warning glyph pending a dedicated one.
const DEFAULT_ICON_PATHS: Record<Variant, string> = {
  default:
    'M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z',
  secondary:
    'M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z',
  tertiary:
    'M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z',
  warning:
    'M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z',
  error:
    'M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z',
};

const CLOSE_PATH =
  'M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z';

/**
 * `<bx-callout>` — inline message block for info, warning and error.
 *
 * `role` follows docs/features/core/callout.md §6: a callout present (and open) at first render
 * is treated as static page content (`role="note"`); a `warning`/`error` callout that is shown
 * *after* that — via `show()` or setting `.open = true` — is treated as a live alert
 * (`role="alert"`) so assistive tech announces it immediately.
 *
 * Dismissal animates the host's height to 0 via the `grid-template-rows` technique (no layout
 * jump, FR-CALLOUT-02) rather than an abrupt `display: none`.
 *
 * @fires bx-hide - Requested by `hide()` or the close button. Cancelable: call `preventDefault()`
 * to keep the callout open.
 * @fires bx-after-hide - The hide transition finished and the callout is fully closed.
 *
 * @slot (default) - Message content.
 * @slot icon - Overrides the default per-variant icon.
 *
 * @csspart base - The outer wrapper (the animated grid row).
 * @csspart icon - The wrapper around the icon slot.
 * @csspart message - The wrapper around the default slot.
 * @csspart close-button - The dismiss button, present with `dismissible`.
 */
export class BxCallout extends BixElement {
  static override tagName = 'bx-callout';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: grid;
        grid-template-rows: 1fr;
        opacity: 1;
        transition:
          grid-template-rows var(--bx-motion-duration-base, 0.2s)
            var(--bx-motion-easing-standard, ease),
          opacity var(--bx-motion-duration-base, 0.2s)
            var(--bx-motion-easing-standard, ease);
      }

      :host(:not([open])) {
        grid-template-rows: 0fr;
        opacity: 0;
      }

      .base {
        container-type: inline-size;
        overflow: hidden;
        min-block-size: 0;
        display: flex;
        align-items: flex-start;
        gap: var(--bx-space-s);
        border-radius: var(--bx-radius-m);
        font-family: var(--bx-font-family-sans);
        color: var(--bx-callout-fg, var(--bx-callout-variant-fg));
        background: var(--bx-callout-bg, transparent);
        border: var(--bx-border-width) solid transparent;
      }

      @container (max-width: calc(var(--bx-unit) * 24)) {
        .base {
          flex-direction: column;
        }
      }

      /* Variant → role tokens. */
      :host([variant='secondary']) {
        --bx-callout-variant-solid: var(--bx-role-neutral-solid);
        --bx-callout-variant-subtle: var(--bx-role-neutral-subtle);
        --bx-callout-variant-fg: var(--bx-role-neutral-fg);
        --bx-callout-variant-border: var(--bx-role-neutral-border);
      }
      :host([variant='default']),
      :host(:not([variant])) {
        --bx-callout-variant-solid: var(--bx-role-brand-solid);
        --bx-callout-variant-subtle: var(--bx-role-brand-subtle);
        --bx-callout-variant-fg: var(--bx-role-brand-fg);
        --bx-callout-variant-border: var(--bx-role-brand-border);
      }
      :host([variant='warning']) {
        --bx-callout-variant-solid: var(--bx-role-warning-solid);
        --bx-callout-variant-subtle: var(--bx-role-warning-subtle);
        --bx-callout-variant-fg: var(--bx-role-warning-fg);
        --bx-callout-variant-border: var(--bx-role-warning-border);
      }
      :host([variant='tertiary']) {
        --bx-callout-variant-solid: var(--bx-role-tertiary-solid);
        --bx-callout-variant-subtle: var(--bx-role-tertiary-subtle);
        --bx-callout-variant-fg: var(--bx-role-tertiary-fg);
        --bx-callout-variant-border: var(--bx-role-tertiary-border);
      }
      :host([variant='error']) {
        --bx-callout-variant-solid: var(--bx-role-danger-solid);
        --bx-callout-variant-subtle: var(--bx-role-danger-subtle);
        --bx-callout-variant-fg: var(--bx-role-danger-fg);
        --bx-callout-variant-border: var(--bx-role-danger-border);
      }

      :host([appearance~='filled']) .base {
        background: var(--bx-callout-bg, var(--bx-callout-variant-subtle));
      }
      :host([appearance~='outlined']) .base {
        border-color: var(--bx-callout-variant-border);
      }
      :host([appearance='accent']) .base {
        background: var(--bx-callout-bg, var(--bx-callout-variant-subtle));
        border-inline-start: calc(var(--bx-border-width-strong) * 2) solid
          var(--bx-callout-variant-solid);
      }

      /* Size steps: padding, icon and type scale together (§4). */
      :host([size='small']) .base {
        padding: var(--bx-space-xs) var(--bx-space-s);
        font-size: var(--bx-font-xs);
      }
      :host([size='medium']) .base,
      :host(:not([size])) .base {
        padding: var(--bx-space-s) var(--bx-space-m);
        font-size: var(--bx-font-s);
      }
      :host([size='large']) .base {
        padding: var(--bx-space-m) var(--bx-space-l);
        font-size: var(--bx-font-m);
      }

      .icon {
        display: inline-flex;
        flex-shrink: 0;
        inline-size: 1.25em;
        block-size: 1.25em;
        color: var(--bx-callout-variant-fg);
      }

      .icon ::slotted(*),
      .icon svg {
        inline-size: 100%;
        block-size: 100%;
        fill: currentColor;
      }

      .message {
        flex: 1;
        min-inline-size: 0;
        line-height: var(--bx-font-leading-normal);
      }

      .actions {
        display: flex;
        align-items: center;
        gap: var(--bx-space-xs);
        flex-shrink: 0;
      }

      .close-button {
        all: unset;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: var(--bx-target-min);
        block-size: var(--bx-target-min);
        border-radius: var(--bx-radius-pill);
        cursor: pointer;
        flex-shrink: 0;
      }

      .close-button:hover {
        background: color-mix(in srgb, currentColor 12%, transparent);
      }

      .close-button:focus-visible {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: var(--bx-focus-ring-offset);
      }

      .close-button svg {
        inline-size: 1em;
        block-size: 1em;
        fill: currentColor;
      }

      @media (prefers-reduced-motion: reduce) {
        :host {
          transition: none;
        }
      }

      @media (forced-colors: active) {
        .base {
          forced-color-adjust: none;
          background: Canvas;
          color: CanvasText;
          border-color: CanvasText;
        }
      }
    `,
  ];

  static override properties = {
    variant: { type: String, reflect: true },
    appearance: { type: String, reflect: true },
    size: { type: String, reflect: true },
    dismissible: { type: Boolean, reflect: true },
    open: { type: Boolean, reflect: true },
  };

  declare variant: Variant;
  declare appearance: Appearance;
  declare size: Size;
  declare dismissible: boolean;
  declare open: boolean;

  #shownDynamically = false;

  constructor() {
    super();
    this.variant = 'default';
    this.appearance = 'outlined';
    this.size = 'medium';
    this.dismissible = false;
    this.open = true;
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('open') && this.open && changed.get('open') === false)
      this.#shownDynamically = true;
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (this.open) this.removeAttribute('aria-hidden');
    else this.setAttribute('aria-hidden', 'true');

    const isAlertVariant =
      this.variant === 'warning' || this.variant === 'error';
    this.setAttribute(
      'role',
      isAlertVariant && this.#shownDynamically ? 'alert' : 'note',
    );

    if (changed.has('open') && !this.open) {
      const cleanup = (event: TransitionEvent) => {
        if (
          event.target !== this ||
          event.propertyName !== 'grid-template-rows'
        )
          return;
        this.removeEventListener('transitionend', cleanup);
        this.dispatchEvent(
          new CustomEvent('bx-after-hide', { bubbles: true, composed: true }),
        );
      };
      if (this.prefersReducedMotion) {
        this.dispatchEvent(
          new CustomEvent('bx-after-hide', { bubbles: true, composed: true }),
        );
      } else {
        this.addEventListener('transitionend', cleanup);
      }
    }
  }

  /** Opens the callout. No-op if already open. */
  show(): void {
    this.open = true;
  }

  /**
   * Requests that the callout close, firing the cancelable `bx-hide` event first. Closes (and
   * later fires `bx-after-hide`) unless a listener calls `preventDefault()`.
   */
  hide(): void {
    if (!this.open) return;
    const cancelled = !this.dispatchEvent(
      new CustomEvent('bx-hide', {
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    if (!cancelled) this.open = false;
  }

  #handleCloseClick = (): void => this.hide();

  protected override render() {
    return html`
      <div class="base" part="base">
        <span class="icon" part="icon">
          <slot name="icon"
            >${svg`<svg viewBox="0 0 256 256"><path d=${DEFAULT_ICON_PATHS[this.variant]}></path></svg>`}</slot
          >
        </span>
        <div class="message" part="message"><slot></slot></div>
        <div class="actions">
          ${
            this.dismissible
              ? html`
                  <button
                    type="button"
                    class="close-button"
                    part="close-button"
                    aria-label="Dismiss"
                    @click=${this.#handleCloseClick}
                  >
                    <svg viewBox="0 0 256 256" aria-hidden="true">
                      <path d=${CLOSE_PATH}></path>
                    </svg>
                  </button>
                `
              : nothing
          }
        </div>
      </div>
    `;
  }
}
