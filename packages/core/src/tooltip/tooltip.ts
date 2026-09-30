import { css, html, type PropertyValues } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';
import type { BxPopup, Placement } from '../popup/popup.ts';

type Trigger = 'hover focus' | 'click' | 'manual';

// FR-TOOLTIP-02: a shared "was a tooltip open a moment ago" window across every instance, so
// moving the pointer from one tooltip's trigger straight to another's skips the second one's own
// `show-delay` — the same "skip delay group" behavior most tooltip libraries (Shoelace, Radix)
// implement, module-scoped rather than per-instance since it has to coordinate across instances.
let openTooltipCount = 0;
let recentlyOpenTimer: ReturnType<typeof setTimeout> | undefined;
let recentlyOpen = false;
const RECENTLY_OPEN_GRACE_MS = 200;

/**
 * `<bx-tooltip>` — short hover/focus hint anchored to any element, positioned by an internal
 * `bx-popup` (docs/features/core/tooltip.md).
 *
 * Anchoring is `for` (an id, resolved with a plain `document.getElementById` rather than
 * `bx-popup`'s own root-scoped resolution — the spec's own "works across shadow roots" note for
 * `for`, docs/features/core/tooltip.md §2) or, when `for` is unset, a slotted anchor element. The
 * spec's own slots table lists only `(default)` (the tooltip's body content, forwarded to the
 * inner `bx-popup`'s default slot) — no `anchor` slot — but "anchored to any element via for OR
 * slot" (§1) needs one; added the same way `bx-tree-item`'s `children` slot fills an analogous gap
 * in that component's own spec.
 *
 * FR-TOOLTIP-01's "hover-to-persist over tooltip body" (WCAG 1.4.13) reuses `bx-popup`'s own
 * `hover-bridge` (an invisible bridge over the anchor-to-popup gap) rather than reimplementing it,
 * plus this element's own `mouseenter`/`mouseleave` on the popup body itself.
 *
 * FR-TOOLTIP-03 ("works on disabled controls via wrapper detection") is not implemented for
 * arbitrary native-`disabled` elements: a genuinely `disabled` native control suppresses pointer
 * events in a way no listener placement fully works around cross-browser without a dedicated
 * non-interactive wrapper element this spec doesn't define. It already works for every control in
 * this package, though — `bx-button`'s own doc comment explains why `disabled` there is never the
 * inner native `disabled` attribute (so hover/focus keep firing) precisely so a `bx-tooltip`
 * anchored to a disabled `bx-button` works without any extra effort. Flagged here per
 * docs/features/_conventions.md's "say so inline" rule rather than silently assumed to cover
 * plain native elements too.
 *
 * §6's "anchor gets aria-describedby" is also not implemented, and this one needed hands-on
 * checking rather than assuming either way: `bx-tab-group` gets a cross-shadow-root ARIA
 * relationship working with `ariaControlsElements`/`ariaLabelledByElements` (that component's own
 * doc comment) because the *referencing* element there is the shadow-internal one, pointing out to
 * a light-DOM target. Here the direction is reversed — the anchor (light DOM, often not even a
 * Bixant component) would need to reference *into* this element's own shadow root (the popup body)
 * — and verified against this package's actual pinned Chromium, `ariaDescribedByElements` set that
 * way reads back as an empty list; the reflected `aria-describedby` content attribute it also
 * writes comes back empty too. Shadow DOM encapsulation seems to allow a shadow tree reaching out
 * to reference public light-DOM elements, not the reverse. Left unimplemented rather than shipping
 * something that silently sets a property with no effect, per docs/features/_conventions.md's "say
 * so inline" rule.
 *
 * @fires bx-show - Cancelable: call `preventDefault()` to keep the tooltip closed.
 * @fires bx-after-show - The tooltip finished showing.
 * @fires bx-hide - Cancelable: call `preventDefault()` to keep the tooltip open.
 * @fires bx-after-hide - The tooltip finished hiding.
 *
 * @slot (default) - Tooltip content.
 * @slot anchor - The anchor element, used when `for` is unset.
 *
 * @csspart base - The inner `bx-popup`.
 * @csspart body - The wrapper around the default slot.
 *
 * @cssprop --bx-tooltip-max-width - Max width of the tooltip body. Default `20rem`.
 */
export class BxTooltip extends BixElement {
  static override tagName = 'bx-tooltip';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: contents;
      }

      bx-popup {
        --arrow-color: var(--bx-tooltip-bg, var(--bx-surface-inverse, #1a1a1a));
      }

      .body {
        box-sizing: border-box;
        max-inline-size: var(--bx-tooltip-max-width, 20rem);
        padding-block: var(--bx-space-xs);
        padding-inline: var(--bx-space-s);
        border-radius: var(--bx-radius-s);
        box-shadow: var(--bx-shadow-m);
        background: var(--bx-tooltip-bg, var(--bx-surface-inverse, #1a1a1a));
        color: var(--bx-tooltip-fg, var(--bx-text-inverse, #fff));
        font-family: var(--bx-font-family-sans);
        font-size: var(--bx-font-s);
        line-height: var(--bx-font-leading-tight, 1.25);
      }

      @media (forced-colors: active) {
        .body {
          forced-color-adjust: none;
          border: var(--bx-border-width) solid CanvasText;
          background: Canvas;
          color: CanvasText;
        }
      }
    `,
  ];

  static override properties = {
    for: { type: String },
    placement: { type: String },
    disabled: { type: Boolean, reflect: true },
    distance: { type: Number },
    skidding: { type: Number },
    open: { type: Boolean, reflect: true },
    showDelay: { type: Number, attribute: 'show-delay' },
    hideDelay: { type: Number, attribute: 'hide-delay' },
    trigger: { type: String },
    withoutArrow: { type: Boolean, reflect: true, attribute: 'without-arrow' },
  };

  declare for: string;
  declare placement: Placement;
  declare disabled: boolean;
  declare distance: number;
  declare skidding: number;
  declare open: boolean;
  declare showDelay: number;
  declare hideDelay: number;
  declare trigger: Trigger;
  declare withoutArrow: boolean;

  #popupRef = createRef<BxPopup>();
  #anchorEl: Element | null = null;
  #showTimer?: ReturnType<typeof setTimeout>;
  #hideTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    super();
    this.for = '';
    this.placement = 'top';
    this.disabled = false;
    this.distance = 8;
    this.skidding = 0;
    this.open = false;
    this.showDelay = 150;
    this.hideDelay = 0;
    this.trigger = 'hover focus';
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#syncAnchor();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#detachAnchorListeners();
    clearTimeout(this.#showTimer);
    clearTimeout(this.#hideTimer);
    if (this.open) this.#decrementOpenCount();
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('for')) this.#syncAnchor();
  }

  #handleAnchorSlotChange = (): void => this.#syncAnchor();

  #resolveAnchor(): Element | null {
    if (this.for) return document.getElementById(this.for);
    return this.querySelector('[slot="anchor"]');
  }

  #syncAnchor(): void {
    const next = this.#resolveAnchor();
    if (next === this.#anchorEl) return;
    this.#detachAnchorListeners();
    this.#anchorEl = next;
    this.#attachAnchorListeners();
  }

  #attachAnchorListeners(): void {
    const anchor = this.#anchorEl;
    if (!anchor) return;
    anchor.addEventListener(
      'keydown',
      this.#handleAnchorKeydown as EventListener,
    );
    if (this.trigger === 'click') {
      anchor.addEventListener('click', this.#handleAnchorClick);
    } else if (this.trigger === 'hover focus') {
      anchor.addEventListener('mouseenter', this.#handleTriggerEnter);
      anchor.addEventListener('mouseleave', this.#handleTriggerLeave);
      anchor.addEventListener('focus', this.#handleTriggerEnter);
      anchor.addEventListener('blur', this.#handleTriggerLeave);
    }
  }

  #detachAnchorListeners(): void {
    const anchor = this.#anchorEl;
    if (!anchor) return;
    anchor.removeEventListener(
      'keydown',
      this.#handleAnchorKeydown as EventListener,
    );
    anchor.removeEventListener('click', this.#handleAnchorClick);
    anchor.removeEventListener('mouseenter', this.#handleTriggerEnter);
    anchor.removeEventListener('mouseleave', this.#handleTriggerLeave);
    anchor.removeEventListener('focus', this.#handleTriggerEnter);
    anchor.removeEventListener('blur', this.#handleTriggerLeave);
  }

  #handleAnchorKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.open) this.hide();
  };

  #handleAnchorClick = (): void => (this.open ? this.hide() : this.show());

  #handleTriggerEnter = (): void => {
    clearTimeout(this.#hideTimer);
    if (this.open || this.disabled) return;
    const delay = recentlyOpen ? 0 : this.showDelay;
    clearTimeout(this.#showTimer);
    this.#showTimer = setTimeout(() => this.show(), delay);
  };

  #handleTriggerLeave = (): void => {
    clearTimeout(this.#showTimer);
    if (!this.open) return;
    clearTimeout(this.#hideTimer);
    this.#hideTimer = setTimeout(() => this.hide(), this.hideDelay);
  };

  #handlePopupMouseEnter = (): void => clearTimeout(this.#hideTimer);
  #handlePopupMouseLeave = (): void => {
    if (this.trigger !== 'hover focus' || !this.open) return;
    clearTimeout(this.#hideTimer);
    this.#hideTimer = setTimeout(() => this.hide(), this.hideDelay);
  };

  #incrementOpenCount(): void {
    openTooltipCount++;
    clearTimeout(recentlyOpenTimer);
    recentlyOpen = true;
  }

  #decrementOpenCount(): void {
    openTooltipCount = Math.max(0, openTooltipCount - 1);
    if (openTooltipCount === 0) {
      clearTimeout(recentlyOpenTimer);
      recentlyOpenTimer = setTimeout(
        () => (recentlyOpen = false),
        RECENTLY_OPEN_GRACE_MS,
      );
    }
  }

  /** Shows the tooltip immediately, ignoring `show-delay`. */
  show(): void {
    if (this.open || this.disabled) return;
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
    this.#incrementOpenCount();
    this.dispatchEvent(
      new Event('bx-after-show', { bubbles: true, composed: true }),
    );
  }

  /** Hides the tooltip immediately, ignoring `hide-delay`. */
  hide(): void {
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
    this.open = false;
    this.#decrementOpenCount();
    this.dispatchEvent(
      new Event('bx-after-hide', { bubbles: true, composed: true }),
    );
  }

  protected override render() {
    return html`
      <slot name="anchor" @slotchange=${this.#handleAnchorSlotChange}></slot>
      <bx-popup
        ${ref(this.#popupRef)}
        class="base"
        part="base"
        exportparts="arrow"
        .anchor=${this.#anchorEl ?? undefined}
        ?active=${this.open}
        placement=${this.placement}
        distance=${this.distance}
        skidding=${this.skidding}
        ?arrow=${!this.withoutArrow}
        flip
        shift
        hover-bridge
        role="tooltip"
        @mouseenter=${this.#handlePopupMouseEnter}
        @mouseleave=${this.#handlePopupMouseLeave}
      >
        <div class="body" part="body"><slot></slot></div>
      </bx-popup>
    `;
  }
}
