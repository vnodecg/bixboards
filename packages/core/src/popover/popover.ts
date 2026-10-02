import { css, html, nothing, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';
import type { Placement } from '../popup/popup.ts';
import { textStyle } from '../internal/text-style.ts';

type HideSource = 'anchor' | 'light-dismiss' | 'keyboard' | 'method';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'bx-button:not([disabled])',
  'bx-input:not([disabled])',
  'bx-textarea:not([disabled])',
  'bx-number-input:not([disabled])',
  'bx-checkbox:not([disabled])',
  'bx-switch:not([disabled])',
  'bx-slider:not([disabled])',
  'bx-radio-group',
].join(',');

/**
 * `<bx-popover>` — rich, interactive floating panel anchored to an element, positioned by an
 * internal `bx-popup` (docs/features/core/popover.md). Unlike `bx-tooltip` its content can be
 * interactive: focus moves into it on open and it stays open until dismissed.
 *
 * Anchoring is `for` (an id, resolved in this element's own root so it works inside shadow trees)
 * or, when `for` is unset, a slotted `slot="anchor"` element. Clicking the anchor toggles the
 * popover. The anchor gets `aria-expanded` and `aria-haspopup="dialog"`; `aria-controls` is not
 * set for the same reason `bx-tooltip` skips `aria-describedby` — the anchor lives in a different
 * tree than the popup body inside this shadow root, so the ID reference cannot resolve.
 *
 * Deviations from the spec, flagged inline per docs/features/_conventions.md: FR-POPOVER-01's
 * native Popover API path is not used (only the `bx-popup` positioning path, the same
 * one-code-path-everywhere reasoning as `bx-popup` itself); `label` and the `anchor` slot are
 * added (the `role="dialog"` popup needs an accessible name, and `for`-less anchoring needs a
 * slot); the `sheet-narrow` bottom-sheet behavior (§5) is not implemented.
 *
 * @fires bx-show - The popover is opening. Cancelable; canceling keeps it closed.
 * @fires bx-after-show - The popover opened and focus moved in.
 * @fires bx-hide - The popover is closing. Cancelable; canceling keeps it open. `detail.source`
 *   is `'anchor' | 'light-dismiss' | 'keyboard' | 'method'`.
 * @fires bx-after-hide - The popover closed.
 *
 * @slot (default) - Popover content.
 * @slot anchor - The anchor element, used when `for` is unset.
 *
 * @csspart dialog - The inner `bx-popup` (carries `role="dialog"`).
 * @csspart body - The padded surface around the default slot.
 * @csspart arrow - The arrow, present unless `without-arrow`.
 *
 * @cssprop --bx-popover-bg - Body/arrow background. Default `--bx-surface-base`.
 * @cssprop --bx-popover-arrow-size - Arrow diameter. Default `calc(var(--bx-unit) * 0.75)`.
 * @cssprop --bx-popover-max-width - Max width of the body. Default `20rem`.
 * @cssprop --bx-popover-body-padding - Padding of the `body` part. Default `var(--bx-space-m)`.
 * @cssprop --bx-popover-body-border-width - Border width of the `body` part. Default `var(--bx-border-width)`.
 * @cssprop --bx-popover-body-border-color - Border color of the `body` part. Default `var(--bx-border-subtle)`.
 * @cssprop --bx-popover-body-radius - Corner radius of the `body` part. Default `var(--bx-radius-m)`.
 * @cssprop --bx-popover-body-shadow - Box shadow of the `body` part. Default `var(--bx-shadow-m)`.
 * @cssprop --bx-popover-body-fg - Text/icon color of the `body` part. Default `var(--bx-text-primary)`.
 * @cssprop --bx-popover-body-font-family - Font family of the `body` part (text style `body-m`). Default `var(--bx-type-body-family)`.
 * @cssprop --bx-popover-body-font-size - Font size of the `body` part (text style `body-m`). Default `var(--bx-type-body-m-size)`.
 * @cssprop --bx-popover-body-font-weight - Font weight of the `body` part (text style `body-m`). Default `var(--bx-type-body-m-weight)`.
 * @cssprop --bx-popover-body-line-height - Line height of the `body` part (text style `body-m`). Default `var(--bx-type-body-m-leading)`.
 * @cssprop --bx-popover-body-letter-spacing - Letter spacing of the `body` part (text style `body-m`). Default `var(--bx-type-body-m-tracking)`.
 */
export class BxPopover extends BixElement {
  static override tagName = 'bx-popover';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: contents;
      }

      bx-popup {
        --bx-popup-arrow-color: var(--bx-popover-bg, var(--bx-surface-base));
        --bx-popup-arrow-size: var(
          --bx-popover-arrow-size,
          calc(var(--bx-unit) * 0.75)
        );
      }

      .body {
        box-sizing: border-box;
        max-inline-size: var(--bx-popover-max-width, calc(var(--bx-unit) * 20));
        padding: var(--bx-popover-body-padding, var(--bx-space-m));
        border: var(--bx-popover-body-border-width, var(--bx-border-width))
          solid var(--bx-popover-body-border-color, var(--bx-border-subtle));
        border-radius: var(--bx-popover-body-radius, var(--bx-radius-m));
        box-shadow: var(--bx-popover-body-shadow, var(--bx-shadow-m));
        background: var(--bx-popover-bg, var(--bx-surface-base));
        color: var(--bx-popover-body-fg, var(--bx-text-primary));

        ${textStyle('--bx-popover-body', 'body-m')}
      }

      @media (forced-colors: active) {
        .body {
          forced-color-adjust: none;
          border-color: CanvasText;
          background: Canvas;
          color: CanvasText;
        }
      }
    `,
  ];

  static override properties = {
    for: { type: String },
    label: { type: String },
    placement: { type: String },
    open: { type: Boolean, reflect: true },
    distance: { type: Number },
    skidding: { type: Number },
    withoutArrow: { type: Boolean, reflect: true, attribute: 'without-arrow' },
  };

  declare for: string;
  declare label: string;
  declare placement: Placement;
  declare open: boolean;
  declare distance: number;
  declare skidding: number;
  declare withoutArrow: boolean;

  #anchorEl: Element | null = null;

  constructor() {
    super();
    this.for = '';
    this.label = '';
    this.placement = 'top';
    this.open = false;
    this.distance = 8;
    this.skidding = 0;
    this.withoutArrow = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#syncAnchor();
    if (this.open) this.#addDocumentListeners();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#removeDocumentListeners();
    this.#detachAnchor();
  }

  protected override firstUpdated(): void {
    // The `for` target may be declared after this element, so it can't be resolved reliably in
    // `connectedCallback`; retry once the tree has been parsed.
    if (this.#syncAnchor()) this.requestUpdate();
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('for')) this.#syncAnchor();

    if (changed.has('open') && this.open) {
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
    }
  }

  protected override updated(changed: PropertyValues<this>): void {
    this.#anchorEl?.setAttribute('aria-expanded', String(this.open));
    if (!changed.has('open')) return;

    if (this.open) {
      this.#addDocumentListeners();
      this.#focusIn();
      this.#dispatchAfter('bx-after-show');
    } else if (changed.get('open') === true) {
      this.#removeDocumentListeners();
      this.#dispatchAfter('bx-after-hide');
    }
  }

  #dispatchAfter(name: string): void {
    this.dispatchEvent(
      new CustomEvent(name, { bubbles: true, composed: true }),
    );
  }

  #resolveAnchor(): Element | null {
    if (this.for) {
      const root = this.getRootNode() as Document | ShadowRoot;
      return (
        root.getElementById?.(this.for) ?? document.getElementById(this.for)
      );
    }
    return this.querySelector('[slot="anchor"]');
  }

  /** Re-resolves the anchor; returns whether it changed. */
  #syncAnchor(): boolean {
    const next = this.#resolveAnchor();
    if (next === this.#anchorEl) return false;
    this.#detachAnchor();
    this.#anchorEl = next;
    next?.addEventListener('click', this.#handleAnchorClick);
    next?.setAttribute('aria-haspopup', 'dialog');
    next?.setAttribute('aria-expanded', String(this.open));
    return true;
  }

  #detachAnchor(): void {
    const anchor = this.#anchorEl;
    if (!anchor) return;
    anchor.removeEventListener('click', this.#handleAnchorClick);
    anchor.removeAttribute('aria-haspopup');
    anchor.removeAttribute('aria-expanded');
    this.#anchorEl = null;
  }

  #handleAnchorSlotChange = (): void => {
    if (this.#syncAnchor()) this.requestUpdate();
  };

  #handleAnchorClick = (): void => {
    if (this.open) this.hide('anchor');
    else this.show();
  };

  #addDocumentListeners(): void {
    document.addEventListener(
      'pointerdown',
      this.#handleDocumentPointerDown,
      true,
    );
    document.addEventListener('keydown', this.#handleDocumentKeydown);
  }

  #removeDocumentListeners(): void {
    document.removeEventListener(
      'pointerdown',
      this.#handleDocumentPointerDown,
      true,
    );
    document.removeEventListener('keydown', this.#handleDocumentKeydown);
  }

  #handleDocumentPointerDown = (event: PointerEvent): void => {
    const path = event.composedPath();
    const popup = this.shadowRoot?.querySelector('bx-popup');
    if (popup && path.includes(popup)) return;
    if (this.#anchorEl && path.includes(this.#anchorEl)) return; // anchor click toggles
    this.hide('light-dismiss');
  };

  #handleDocumentKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape') return;
    const restoreFocus = this.#focusIsInside();
    this.hide('keyboard');
    if (restoreFocus) (this.#anchorEl as HTMLElement | null)?.focus?.();
  };

  #focusIsInside(): boolean {
    const active = document.activeElement;
    return !!active && this.contains(active);
  }

  /** FR-POPOVER-02: focus moves in on open only when there is something interactive to land on. */
  #focusIn(): void {
    // The slotted anchor is a light-DOM child too, but it is the trigger, not content.
    for (const child of Array.from(this.children)) {
      if (child.getAttribute('slot') === 'anchor') continue;
      const target = child.matches(FOCUSABLE)
        ? (child as HTMLElement)
        : child.querySelector<HTMLElement>(FOCUSABLE);
      if (target) {
        target.focus();
        return;
      }
    }
  }

  /** Opens the popover. No-op if already open. */
  show(): void {
    if (this.open) return;
    this.open = true;
  }

  /** Closes the popover. No-op if already closed. */
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

  protected override render() {
    return html`
      <slot name="anchor" @slotchange=${this.#handleAnchorSlotChange}></slot>
      <bx-popup
        class="base"
        part="dialog"
        exportparts="arrow"
        .anchor=${this.#anchorEl ?? undefined}
        ?active=${this.open}
        placement=${this.placement}
        distance=${this.distance}
        skidding=${this.skidding}
        ?arrow=${!this.withoutArrow}
        flip
        shift
        role="dialog"
        aria-label=${this.label || nothing}
      >
        <div class="body" part="body"><slot></slot></div>
      </bx-popup>
    `;
  }
}
