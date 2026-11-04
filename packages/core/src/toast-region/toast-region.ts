import { css, html } from 'lit';
import { BixElement } from '../bix-element.ts';
import type { BxToast, ToastOptions } from '../toast/toast.ts';

type Position =
  'top-start' | 'top' | 'top-end' | 'bottom-start' | 'bottom' | 'bottom-end';

let region: BxToastRegion | undefined;

/**
 * `<bx-toast-region>` — the fixed stack that hosts `bx-toast`s (FR-TOAST-01).
 *
 * One per document, created by the first `BxToast.toast()` / `BxToastRegion.shared()`. Honors
 * `--bx-safe-area-inset-*` (FR-TOAST-04) through `--bx-toast-offset`, spans the viewport width
 * minus gutters on narrow screens, and caps the visible stack at `max-visible`: when full, the
 * oldest non-sticky toast is replaced (FR-TOAST-05). New toasts appear nearest the viewport edge.
 *
 * @slot (default) - `bx-toast` children.
 *
 * @csspart base - The stack container.
 *
 * @cssprop --bx-toast-offset - Distance from the viewport edge (adds safe-area insets).
 * @cssprop --bx-toast-gap - Gap between toasts. Default `var(--bx-space-xs)`.
 */
export class BxToastRegion extends BixElement {
  static override tagName = 'bx-toast-region';

  /** The document's single region, created on first use. */
  static shared(): BxToastRegion {
    if (region?.isConnected) return region;
    region = document.createElement('bx-toast-region') as BxToastRegion;
    document.body.append(region);
    return region;
  }

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        position: fixed;
        inset: 0;
        z-index: var(--bx-z-toast, 1100);
        pointer-events: none;
        --_edge: var(--bx-toast-offset, var(--bx-space-m));
      }
      .base {
        position: absolute;
        display: flex;
        flex-direction: column;
        gap: var(--bx-toast-gap, var(--bx-space-xs));
        inline-size: min(
          var(--bx-toast-width, 26rem),
          calc(100% - var(--_edge) * 2)
        );
        padding-block: max(var(--_edge), var(--bx-safe-area-inset-top, 0px))
          max(var(--_edge), var(--bx-safe-area-inset-bottom, 0px));
        padding-inline: max(var(--_edge), var(--bx-safe-area-inset-left, 0px))
          max(var(--_edge), var(--bx-safe-area-inset-right, 0px));
        box-sizing: border-box;
      }
      ::slotted(*) {
        pointer-events: auto;
      }
      :host([position^='top']) .base {
        inset-block-start: 0;
      }
      :host([position^='bottom']) .base,
      :host(:not([position])) .base {
        inset-block-end: 0;
        flex-direction: column-reverse;
      }
      :host([position$='start']) .base {
        inset-inline-start: 0;
      }
      :host([position$='end']) .base,
      :host(:not([position])) .base {
        inset-inline-end: 0;
      }
      :host([position='top']) .base,
      :host([position='bottom']) .base {
        inset-inline-start: 50%;
        translate: -50% 0;
      }
      :host([position='top']:dir(rtl)) .base,
      :host([position='bottom']:dir(rtl)) .base {
        translate: 50% 0;
      }
      @container (max-width: 30rem) {
        .base {
          inline-size: 100%;
        }
      }
    `,
  ];

  static override properties = {
    position: { type: String, reflect: true },
    maxVisible: { type: Number, attribute: 'max-visible' },
  };

  declare position: Position;
  declare maxVisible: number;

  constructor() {
    super();
    this.position = 'bottom-end';
    this.maxVisible = 3;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'region');
    if (!this.hasAttribute('aria-label'))
      this.setAttribute('aria-label', 'Notifications');
  }

  /** Creates and shows a toast; evicts the oldest non-sticky one when the stack is full. */
  async push(options: ToastOptions): Promise<BxToast> {
    const toast = document.createElement('bx-toast') as BxToast;
    toast.variant = options.variant ?? 'neutral';
    toast.duration = options.duration ?? 5000;
    toast.closable = options.closable ?? true;
    toast.textContent = options.message;
    if (options.action) {
      const button = document.createElement('bx-button') as HTMLElement;
      button.slot = 'action';
      button.setAttribute('size', 'small');
      button.setAttribute('appearance', 'plain');
      button.textContent = options.action;
      toast.append(button);
      toast.addEventListener('bx-action', () => options.onAction?.());
    }
    toast.addEventListener('bx-after-hide', () => toast.remove());
    this.append(toast);
    const open = [...this.querySelectorAll<BxToast>('bx-toast')].filter(
      (t) => t.open,
    );
    const overflow = open.length + 1 - Math.max(this.maxVisible, 1);
    if (overflow > 0) {
      const victims = open.filter((t) => t.duration > 0).slice(0, overflow);
      for (const victim of victims) void victim.hide();
    }
    await toast.show();
    return toast;
  }

  protected override render() {
    return html`<div class="base" part="base"><slot></slot></div>`;
  }
}
