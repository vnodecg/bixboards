import { css, html, nothing, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';
import { observeResize } from '../internal/shared-observers.ts';

export type Placement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

type Strategy = 'absolute' | 'fixed';
type ArrowPlacement = 'start' | 'end' | 'center' | 'anchor';
type AutoSize = 'horizontal' | 'vertical' | 'both';
type Sync = 'width' | 'height' | 'both';

const ARROW_SIZE_FALLBACK = 'calc(var(--bx-unit) * 0.75)';

function base(placement: Placement): 'top' | 'bottom' | 'left' | 'right' {
  return placement.split('-')[0] as 'top' | 'bottom' | 'left' | 'right';
}

function alignment(placement: Placement): 'start' | 'end' | undefined {
  return placement.split('-')[1] as 'start' | 'end' | undefined;
}

function opposite(side: 'top' | 'bottom' | 'left' | 'right'): typeof side {
  return { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }[
    side
  ] as typeof side;
}

interface Coords {
  left: number;
  top: number;
}

interface ComputedPlacement extends Coords {
  placement: Placement;
  fits: boolean;
}

/**
 * `<bx-popup>` — low-level positioning primitive (anchor, flip, shift, size, arrow) used by
 * dropdown, select, tooltip, popover.
 *
 * FR-POPUP-01 implements the Floating-UI-style JS computation path only: `getBoundingClientRect`
 * already returns viewport coordinates regardless of shadow-root nesting or transformed ancestors
 * (FR-POPUP-03), so positioning off it is correct in both cases without extra work. The native CSS
 * Anchor Positioning fast path the spec also allows is not implemented — browser support is not
 * yet broad enough to be the primary path, and shipping only the JS path keeps this component's
 * behavior identical everywhere rather than branching per browser — noted here per
 * docs/features/_conventions.md's "say so inline" rule for partially-implemented FRs (see
 * `bx-scroller` for the same pattern). `strategy="absolute"` adds `scrollX`/`scrollY` to
 * viewport-relative coordinates, which assumes the popup's containing block is the initial
 * containing block (no transformed ancestor between the popup and the document) — `strategy="fixed"`
 * has no such assumption and is the more robust choice when that isn't guaranteed.
 *
 * The `anchor` slot fallback (used when the `anchor` property/attribute is unset) has a real
 * layout limitation worth knowing before reaching for it: `reposition()` makes the *host itself*
 * `position: absolute`/`fixed` (not an internal wrapper), so anything slotted into `anchor` is
 * inside that same moving box and gets dragged along with the popup instead of staying at its
 * original document position — visually, the "anchor" ends up glued above the popup content
 * rather than acting as a separate, fixed trigger. Every consumer in this package (`bx-tooltip`,
 * `bx-dialog`'s reuse of `bx-button`, `bx-color-picker`) sidesteps this by always resolving a real
 * external element themselves and passing it through the `anchor` *property*, which has none of
 * this problem — prefer that over the slot fallback. Restructuring `reposition()` to position an
 * inner wrapper instead of the host would fix this properly, but changes this component's public
 * geometry contract (`popup.getBoundingClientRect()` is relied on directly, including by this
 * component's own tests) enough that it's being left as a known gap rather than risked here.
 *
 * @fires bx-reposition - The popup finished (re)computing its position.
 *
 * @slot (default) - Popup content.
 * @slot anchor - An anchor element, used when the `anchor` property/attribute is unset.
 *
 * @csspart arrow - The arrow element, present when `arrow` is set.
 * @csspart popup - The positioned wrapper around the default slot.
 * @csspart hover-bridge - The invisible bridge between anchor and popup, present when
 *   `hover-bridge` is set.
 *
 * @cssprop --bx-popup-arrow-size - Arrow diameter. Default `calc(var(--bx-unit) * 0.75)`.
 * @cssprop --bx-popup-arrow-color - Arrow color. Default `--bx-surface`.
 * @cssprop --bx-popup-auto-size-available-width - Set while `auto-size` includes `horizontal`; the space
 *   available before hitting the viewport edge, for consumers to cap their own content width.
 * @cssprop --bx-popup-auto-size-available-height - Set while `auto-size` includes `vertical`; same, for height.
 */
export class BxPopup extends BixElement {
  static override tagName = 'bx-popup';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: none;
        z-index: var(--bx-z-dropdown);
        inline-size: max-content;
      }

      :host([active]) {
        display: block;
      }

      .popup {
        position: relative;
      }

      .arrow {
        position: absolute;
        inline-size: var(--bx-popup-arrow-size, calc(var(--bx-unit) * 0.75));
        block-size: var(--bx-popup-arrow-size, calc(var(--bx-unit) * 0.75));
        background: var(--bx-popup-arrow-color, var(--bx-surface-base));
        rotate: 45deg;
        z-index: -1;
      }

      .hover-bridge {
        position: fixed;
        background: transparent;
        pointer-events: auto;
      }

      @media (forced-colors: active) {
        .arrow {
          forced-color-adjust: none;
          background: Canvas;
          border: var(--bx-border-width) solid CanvasText;
        }
      }
    `,
  ];

  static override properties = {
    anchor: { type: String },
    active: { type: Boolean, reflect: true },
    placement: { type: String },
    strategy: { type: String },
    distance: { type: Number },
    skidding: { type: Number },
    arrow: { type: Boolean, reflect: true },
    arrowPlacement: { type: String, attribute: 'arrow-placement' },
    arrowPadding: { type: Number, attribute: 'arrow-padding' },
    flip: { type: Boolean },
    flipFallbackPlacements: {
      type: String,
      attribute: 'flip-fallback-placements',
    },
    flipPadding: { type: Number, attribute: 'flip-padding' },
    shift: { type: Boolean },
    shiftPadding: { type: Number, attribute: 'shift-padding' },
    autoSize: { type: String, attribute: 'auto-size' },
    sync: { type: String },
    hoverBridge: { type: Boolean, attribute: 'hover-bridge' },
  };

  declare anchor?: Element | string;
  declare active: boolean;
  declare placement: Placement;
  declare strategy: Strategy;
  declare distance: number;
  declare skidding: number;
  declare arrow: boolean;
  declare arrowPlacement: ArrowPlacement;
  declare arrowPadding: number;
  declare flip: boolean;
  declare flipFallbackPlacements: string;
  declare flipPadding: number;
  declare shift: boolean;
  declare shiftPadding: number;
  declare autoSize?: AutoSize;
  declare sync?: Sync;
  declare hoverBridge: boolean;

  #unobserveAnchorResize?: () => void;
  #unobservePopupResize?: () => void;
  #rafId = 0;
  #lastArrowOffset = 0;
  #lastHoverBridgeRect?: Coords & { width: number; height: number };

  constructor() {
    super();
    this.active = false;
    this.placement = 'top';
    this.strategy = 'absolute';
    this.distance = 0;
    this.skidding = 0;
    this.arrow = false;
    this.arrowPlacement = 'anchor';
    this.arrowPadding = 10;
    this.flip = false;
    this.flipFallbackPlacements = '';
    this.flipPadding = 0;
    this.shift = false;
    this.shiftPadding = 0;
    this.hoverBridge = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('scroll', this.#handleViewportChange, {
      capture: true,
      passive: true,
    });
    window.addEventListener('resize', this.#handleViewportChange, {
      passive: true,
    });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('scroll', this.#handleViewportChange, {
      capture: true,
    });
    window.removeEventListener('resize', this.#handleViewportChange);
    this.#teardownObservers();
    if (this.#rafId) cancelAnimationFrame(this.#rafId);
    this.#rafId = 0;
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('active') || changed.has('anchor')) {
      this.#teardownObservers();
      if (this.active) this.#setupObservers();
    }
    if (this.active) this.reposition();
  }

  #teardownObservers(): void {
    this.#unobserveAnchorResize?.();
    this.#unobserveAnchorResize = undefined;
    this.#unobservePopupResize?.();
    this.#unobservePopupResize = undefined;
  }

  #setupObservers(): void {
    const anchorEl = this.#resolveAnchor();
    if (anchorEl)
      this.#unobserveAnchorResize = observeResize(
        anchorEl,
        this.#handleViewportChange,
      );
    this.#unobservePopupResize = observeResize(
      this,
      this.#handleViewportChange,
    );
  }

  #handleViewportChange = (): void => {
    if (!this.active || this.#rafId) return;
    this.#rafId = requestAnimationFrame(() => {
      this.#rafId = 0;
      this.reposition();
    });
  };

  #resolveAnchor(): Element | null {
    if (this.anchor instanceof Element) return this.anchor;
    if (typeof this.anchor === 'string')
      return (this.getRootNode() as Document | ShadowRoot).getElementById(
        this.anchor,
      );
    return this.querySelector('[slot="anchor"]');
  }

  #fallbackPlacements(): Placement[] {
    if (this.flipFallbackPlacements)
      return this.flipFallbackPlacements
        .split(',')
        .map((p) => p.trim()) as Placement[];
    const side = base(this.placement);
    const align = alignment(this.placement);
    const opp = opposite(side);
    return [align ? (`${opp}-${align}` as Placement) : opp];
  }

  #computeForPlacement(
    placement: Placement,
    anchorRect: DOMRect,
    popupWidth: number,
    popupHeight: number,
  ): ComputedPlacement {
    const side = base(placement);
    const align = alignment(placement);
    let left: number;
    let top: number;

    if (side === 'top' || side === 'bottom') {
      top =
        side === 'top'
          ? anchorRect.top - popupHeight - this.distance
          : anchorRect.bottom + this.distance;
      left =
        align === 'start'
          ? anchorRect.left + this.skidding
          : align === 'end'
            ? anchorRect.right - popupWidth - this.skidding
            : anchorRect.left +
              anchorRect.width / 2 -
              popupWidth / 2 +
              this.skidding;
    } else {
      left =
        side === 'left'
          ? anchorRect.left - popupWidth - this.distance
          : anchorRect.right + this.distance;
      top =
        align === 'start'
          ? anchorRect.top + this.skidding
          : align === 'end'
            ? anchorRect.bottom - popupHeight - this.skidding
            : anchorRect.top +
              anchorRect.height / 2 -
              popupHeight / 2 +
              this.skidding;
    }

    const padding = this.flipPadding;
    const fits =
      top >= padding &&
      left >= padding &&
      top + popupHeight <= innerHeight - padding &&
      left + popupWidth <= innerWidth - padding;

    return { placement, left, top, fits };
  }

  #applyShift(
    coords: Coords,
    popupWidth: number,
    popupHeight: number,
    placement: Placement,
  ): Coords {
    if (!this.shift) return coords;
    const isVertical =
      base(placement) === 'top' || base(placement) === 'bottom';
    const padding = this.shiftPadding;
    if (isVertical) {
      const maxLeft = innerWidth - popupWidth - padding;
      return {
        ...coords,
        left: Math.min(
          Math.max(coords.left, padding),
          Math.max(padding, maxLeft),
        ),
      };
    }
    const maxTop = innerHeight - popupHeight - padding;
    return {
      ...coords,
      top: Math.min(Math.max(coords.top, padding), Math.max(padding, maxTop)),
    };
  }

  #applyAutoSize(anchorRect: DOMRect, placement: Placement): void {
    if (!this.autoSize) return;
    const side = base(placement);
    const availableWidth =
      side === 'left'
        ? anchorRect.left - this.distance
        : innerWidth - anchorRect.right - this.distance;
    const availableHeight =
      side === 'top'
        ? anchorRect.top - this.distance
        : innerHeight - anchorRect.bottom - this.distance;

    if (this.autoSize === 'horizontal' || this.autoSize === 'both')
      this.style.setProperty(
        '--bx-popup-auto-size-available-width',
        `${Math.max(0, availableWidth)}px`,
      );
    if (this.autoSize === 'vertical' || this.autoSize === 'both')
      this.style.setProperty(
        '--bx-popup-auto-size-available-height',
        `${Math.max(0, availableHeight)}px`,
      );
  }

  #applyArrow(
    anchorRect: DOMRect,
    coords: Coords,
    popupWidth: number,
    popupHeight: number,
    placement: Placement,
  ): void {
    if (!this.arrow) return;
    const side = base(placement);
    const isVertical = side === 'top' || side === 'bottom';
    const popupSize = isVertical ? popupWidth : popupHeight;
    const anchorCenter = isVertical
      ? anchorRect.left + anchorRect.width / 2 - coords.left
      : anchorRect.top + anchorRect.height / 2 - coords.top;

    let offset: number;
    switch (this.arrowPlacement) {
      case 'start':
        offset = this.arrowPadding;
        break;
      case 'end':
        offset = popupSize - this.arrowPadding;
        break;
      case 'center':
        offset = popupSize / 2;
        break;
      default:
        offset = anchorCenter;
    }
    offset = Math.min(
      Math.max(offset, this.arrowPadding),
      Math.max(this.arrowPadding, popupSize - this.arrowPadding),
    );
    // `updated()` calls `reposition()` on every update while `active` (below), and this render's
    // arrow position off `#lastArrowOffset` — an unconditional `requestUpdate()` here would
    // re-trigger `updated()` -> `reposition()` -> here, forever. Only schedule a re-render when
    // the offset actually changed.
    if (offset === this.#lastArrowOffset) return;
    this.#lastArrowOffset = offset;
    this.requestUpdate();
  }

  #applySync(anchorRect: DOMRect): void {
    if (!this.sync) return;
    if (this.sync === 'width' || this.sync === 'both')
      this.style.width = `${anchorRect.width}px`;
    if (this.sync === 'height' || this.sync === 'both')
      this.style.height = `${anchorRect.height}px`;
  }

  #applyHoverBridge(
    anchorRect: DOMRect,
    coords: Coords,
    popupWidth: number,
    popupHeight: number,
  ): void {
    if (!this.hoverBridge) {
      this.#lastHoverBridgeRect = undefined;
      return;
    }
    const left = Math.min(anchorRect.left, coords.left);
    const top = Math.min(anchorRect.top, coords.top);
    const right = Math.max(anchorRect.right, coords.left + popupWidth);
    const bottom = Math.max(anchorRect.bottom, coords.top + popupHeight);
    this.#lastHoverBridgeRect = {
      left,
      top,
      width: right - left,
      height: bottom - top,
    };
  }

  /** Forces an immediate recomputation of the popup's position. */
  reposition(): void {
    const anchorEl = this.#resolveAnchor();
    if (!this.active || !anchorEl) return;

    const anchorRect = anchorEl.getBoundingClientRect();
    const wasHidden = getComputedStyle(this).display === 'none';
    const priorVisibility = this.style.visibility;
    if (wasHidden) {
      this.style.visibility = 'hidden';
      this.style.display = 'block';
    }
    const popupRect = this.getBoundingClientRect();
    if (wasHidden) {
      this.style.display = '';
      this.style.visibility = priorVisibility;
    }
    const popupWidth = popupRect.width;
    const popupHeight = popupRect.height;

    const candidates = this.flip
      ? [this.placement, ...this.#fallbackPlacements()]
      : [this.placement];
    let computed = this.#computeForPlacement(
      candidates[0]!,
      anchorRect,
      popupWidth,
      popupHeight,
    );
    for (const placement of candidates.slice(1)) {
      if (computed.fits) break;
      computed = this.#computeForPlacement(
        placement,
        anchorRect,
        popupWidth,
        popupHeight,
      );
    }

    const shifted = this.#applyShift(
      computed,
      popupWidth,
      popupHeight,
      computed.placement,
    );

    if (this.strategy === 'fixed') {
      this.style.position = 'fixed';
      this.style.left = `${shifted.left}px`;
      this.style.top = `${shifted.top}px`;
    } else {
      this.style.position = 'absolute';
      this.style.left = `${shifted.left + scrollX}px`;
      this.style.top = `${shifted.top + scrollY}px`;
    }

    this.#applySync(anchorRect);
    this.#applyAutoSize(anchorRect, computed.placement);
    this.#applyArrow(
      anchorRect,
      shifted,
      popupWidth,
      popupHeight,
      computed.placement,
    );
    this.#applyHoverBridge(anchorRect, shifted, popupWidth, popupHeight);

    if (computed.placement !== this.placement)
      this.setAttribute('data-placement', computed.placement);
    else this.removeAttribute('data-placement');

    this.dispatchEvent(
      new Event('bx-reposition', { bubbles: true, composed: true }),
    );
  }

  #renderHoverBridge() {
    if (!this.hoverBridge || !this.#lastHoverBridgeRect) return nothing;
    const rect = this.#lastHoverBridgeRect;
    return html`<div
      class="hover-bridge"
      part="hover-bridge"
      style="left: ${rect.left}px; top: ${rect.top}px; inline-size: ${rect.width}px; block-size: ${rect.height}px"
    ></div>`;
  }

  protected override render() {
    const side = base(this.placement);
    const isVertical = side === 'top' || side === 'bottom';
    const arrowStyle = isVertical
      ? `inset-inline-start: ${this.#lastArrowOffset}px; inset-block-${side === 'top' ? 'end' : 'start'}: calc(var(--bx-popup-arrow-size, ${ARROW_SIZE_FALLBACK}) / -2)`
      : `inset-block-start: ${this.#lastArrowOffset}px; inset-inline-${side === 'left' ? 'end' : 'start'}: calc(var(--bx-popup-arrow-size, ${ARROW_SIZE_FALLBACK}) / -2)`;

    return html`
      ${this.#renderHoverBridge()}
      <div class="popup" part="popup">
        <slot name="anchor"></slot>
        <slot></slot>
        ${this.arrow ? html`<div class="arrow" part="arrow" style=${arrowStyle}></div>` : nothing}
      </div>
    `;
  }
}
