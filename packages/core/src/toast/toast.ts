import { css, html, nothing, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';
import { textFamily, textStyle } from '../internal/text-style.ts';

type Variant = 'info' | 'success' | 'warning' | 'error' | 'neutral';

const ICON: Record<Variant, string> = {
  info: 'info',
  success: 'check',
  warning: 'warning',
  error: 'close',
  neutral: 'info',
};

export interface ToastOptions {
  message: string;
  variant?: Variant;
  /** ms before auto-dismiss; 0 = sticky. */
  duration?: number;
  closable?: boolean;
  /** Label of an action button (e.g. "Undo"); activating it fires `bx-action` and dismisses. */
  action?: string;
  onAction?: () => void;
}

/**
 * `<bx-toast>` — transient, non-blocking message (docs/features/core/toast.md).
 *
 * Declarative: a `<bx-toast open>` anywhere; imperative: `BxToast.toast({ message })` creates one
 * inside a single `bx-toast-region` appended to the body on first use (FR-TOAST-01) and resolves
 * to the element. The auto-dismiss timer pauses on hover, focus-within and while the tab is hidden
 * (FR-TOAST-02) and resumes with what was left. Motion is a fade plus a short slide, fade only
 * under reduced motion (FR-TOAST-03). `role` is `status`, or `alert` for errors, so assistive tech
 * announces it without the region having to be a live region of its own.
 *
 * @fires bx-show - Before showing. Cancelable.
 * @fires bx-after-show - After the show animation.
 * @fires bx-hide - Before hiding. Cancelable.
 * @fires bx-after-hide - After the hide animation.
 * @fires bx-action - The action slot was used.
 *
 * @slot (default) - Message.
 * @slot icon - Overrides the variant icon.
 * @slot action - Action button (e.g. Undo).
 *
 * @csspart base - The base part.
 * @csspart icon - The icon part.
 * @csspart message - The message part.
 * @csspart action - The action part.
 * @csspart close-button - The close button.
 *
 * @cssprop --bx-toast-width - Max width.
 * @cssprop --bx-toast-duration - Enter/exit transition.
 */
export class BxToast extends BixElement {
  static override tagName = 'bx-toast';

  /** Creates a toast in the shared region and shows it. Resolves once shown. */
  static async toast(options: ToastOptions): Promise<BxToast> {
    // Importing the folder's index registers `<bx-toast-region>` as a side effect.
    const { BxToastRegion } = await import('../toast-region/index.ts');
    return BxToastRegion.shared().push(options);
  }

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: none;
        ${textFamily('--bx-toast', 'body')}
        --_solid: var(--bx-role-neutral-solid);
        --_subtle: var(--bx-role-neutral-subtle);
        --_fg: var(--bx-role-neutral-fg);
        --_border: var(--bx-role-neutral-border);
      }
      :host([open]),
      :host([data-closing]) {
        display: block;
      }
      :host([variant='info']) {
        --_solid: var(--bx-role-brand-solid);
        --_subtle: var(--bx-role-brand-subtle);
        --_fg: var(--bx-role-brand-fg);
        --_border: var(--bx-role-brand-border);
      }
      :host([variant='success']) {
        --_solid: var(--bx-role-success-solid);
        --_subtle: var(--bx-role-success-subtle);
        --_fg: var(--bx-role-success-fg);
        --_border: var(--bx-role-success-border);
      }
      :host([variant='warning']) {
        --_solid: var(--bx-role-warning-solid);
        --_subtle: var(--bx-role-warning-subtle);
        --_fg: var(--bx-role-warning-fg);
        --_border: var(--bx-role-warning-border);
      }
      :host([variant='error']) {
        --_solid: var(--bx-role-danger-solid);
        --_subtle: var(--bx-role-danger-subtle);
        --_fg: var(--bx-role-danger-fg);
        --_border: var(--bx-role-danger-border);
      }
      .base {
        box-sizing: border-box;
        display: flex;
        align-items: flex-start;
        gap: var(--bx-space-xs);
        inline-size: min(var(--bx-toast-width, 26rem), 100%);
        max-inline-size: 100%;
        padding: var(--bx-space-xs) var(--bx-space-s);
        border: var(--bx-border-width) solid var(--_border);
        border-inline-start: var(--bx-space-3xs) solid var(--_solid);
        border-radius: var(--bx-radius-m);
        background: var(--bx-surface-raised, var(--bx-surface-base));
        color: var(--bx-text-primary);
        box-shadow: var(--bx-shadow-m);
      }
      .icon {
        display: inline-flex;
        flex: none;
        padding-block-start: calc((1lh - 1em) / 2);
        color: var(--_fg);
        font-size: 1.1em;
      }
      .message {
        flex: 1 1 auto;
        min-inline-size: 0;
        overflow-wrap: anywhere;
        ${textStyle('--bx-toast', 'body-m')}
      }
      .action {
        flex: none;
      }
      .action:not(:has(::slotted(*))) {
        display: none;
      }
      .close-button {
        flex: none;
        margin-block: calc(var(--bx-space-2xs) * -1);
        margin-inline-end: calc(var(--bx-space-2xs) * -1);
      }
      @media (forced-colors: active) {
        .base {
          border-color: CanvasText;
        }
      }
    `,
  ];

  static override properties = {
    variant: { type: String, reflect: true },
    duration: { type: Number },
    closable: { type: Boolean },
    open: { type: Boolean, reflect: true },
  };

  declare variant: Variant;
  declare duration: number;
  declare closable: boolean;
  declare open: boolean;

  #timer?: ReturnType<typeof setTimeout>;
  #remaining = 0;
  #startedAt = 0;
  #paused = false;
  #hoverPaused = false;
  #animating?: Promise<void>;

  constructor() {
    super();
    this.variant = 'neutral';
    this.duration = 5000;
    this.closable = true;
    this.open = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', this.variant === 'error' ? 'alert' : 'status');
    this.addEventListener('mouseenter', this.#pause);
    this.addEventListener('mouseleave', this.#resume);
    this.addEventListener('focusin', this.#pause);
    this.addEventListener('focusout', this.#resume);
    document.addEventListener('visibilitychange', this.#onVisibility);
    if (this.open) this.#arm(this.duration);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('mouseenter', this.#pause);
    this.removeEventListener('mouseleave', this.#resume);
    this.removeEventListener('focusin', this.#pause);
    this.removeEventListener('focusout', this.#resume);
    document.removeEventListener('visibilitychange', this.#onVisibility);
    clearTimeout(this.#timer);
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('variant'))
      this.setAttribute('role', this.variant === 'error' ? 'alert' : 'status');
    if (changed.has('open') && changed.get('open') !== undefined) {
      if (this.open) void this.#animate(true);
      else {
        clearTimeout(this.#timer);
      }
    }
  }

  /** Shows the toast. Resolves after the show animation. */
  async show(): Promise<void> {
    if (this.open) return;
    if (
      !this.dispatchEvent(
        new Event('bx-show', {
          bubbles: true,
          composed: true,
          cancelable: true,
        }),
      )
    )
      return;
    this.open = true;
    await this.updateComplete;
    await this.#animating;
  }

  /** Hides the toast. Resolves after the hide animation. */
  async hide(): Promise<void> {
    if (!this.open) return;
    if (
      !this.dispatchEvent(
        new Event('bx-hide', {
          bubbles: true,
          composed: true,
          cancelable: true,
        }),
      )
    )
      return;
    clearTimeout(this.#timer);
    this.setAttribute('data-closing', '');
    this.open = false;
    await this.#animate(false);
    this.removeAttribute('data-closing');
    this.dispatchEvent(
      new Event('bx-after-hide', { bubbles: true, composed: true }),
    );
  }

  async #animate(show: boolean): Promise<void> {
    const base = this.shadowRoot?.querySelector<HTMLElement>('.base');
    const run = async () => {
      if (base && typeof base.animate === 'function') {
        const slide = this.prefersReducedMotion ? '0' : '0.5rem';
        const frames: Keyframe[] = [
          { opacity: 0, transform: `translateY(${slide})` },
          { opacity: 1, transform: 'translateY(0)' },
        ];
        await base
          .animate(show ? frames : [...frames].reverse(), {
            duration: this.prefersReducedMotion ? 0 : 180,
            easing: 'ease-out',
          })
          .finished.catch(() => undefined);
      }
      if (show) {
        this.dispatchEvent(
          new Event('bx-after-show', { bubbles: true, composed: true }),
        );
        this.#arm(this.duration);
      }
    };
    this.#animating = run();
    await this.#animating;
  }

  #arm(duration: number): void {
    clearTimeout(this.#timer);
    this.#remaining = duration;
    if (duration <= 0 || !this.open) return;
    if (this.#paused || document.hidden) return;
    this.#startedAt = Date.now();
    this.#timer = setTimeout(() => void this.hide(), duration);
  }

  #pause = (): void => {
    this.#hoverPaused = true;
    this.#suspend();
  };

  #resume = (): void => {
    this.#hoverPaused = false;
    if (this.matches(':hover') || this.matches(':focus-within')) return;
    this.#unsuspend();
  };

  #onVisibility = (): void => {
    if (document.hidden) this.#suspend();
    else if (!this.#hoverPaused) this.#unsuspend();
  };

  #suspend(): void {
    if (this.#paused || !this.open || this.duration <= 0) return;
    this.#paused = true;
    clearTimeout(this.#timer);
    this.#remaining = Math.max(
      this.#remaining - (Date.now() - this.#startedAt),
      0,
    );
  }

  #unsuspend(): void {
    if (!this.#paused) return;
    this.#paused = false;
    this.#arm(Math.max(this.#remaining, 1000));
  }

  protected override render() {
    const variant = this.variant in ICON ? this.variant : 'neutral';
    return html`<div class="base" part="base">
      <span class="icon" part="icon"
        ><slot name="icon"
          ><bx-icon name=${ICON[variant]} aria-hidden="true"></bx-icon></slot
      ></span>
      <div class="message" part="message"><slot></slot></div>
      <span
        class="action"
        part="action"
        @click=${() => {
          this.dispatchEvent(
            new Event('bx-action', { bubbles: true, composed: true }),
          );
          void this.hide();
        }}
        ><slot name="action"></slot
      ></span>
      ${
        this.closable
          ? html`<bx-close-button
              class="close-button"
              part="close-button"
              size="s"
              label="Dismiss"
              @bx-close=${(e: Event) => {
                e.stopPropagation();
                void this.hide();
              }}
            ></bx-close-button>`
          : nothing
      }
    </div>`;
  }
}
