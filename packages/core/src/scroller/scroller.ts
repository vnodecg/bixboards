import { css, html, nothing } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';
import { observeResize } from '../internal/shared-observers.ts';

type Orientation = 'horizontal' | 'vertical';

/**
 * `<bx-scroller>` — scroll region with edge shadows and keyboard access.
 *
 * The scrollable element lives in the shadow root (`part="content"`) and is the thing that
 * actually receives focus/`tabindex`, not the host — a focused `overflow: auto` element already
 * scrolls with arrow/space/page keys natively, so no custom key handling is needed
 * (FR-SCROLLER-02). It only becomes a tab stop once its content actually overflows.
 *
 * Edge shadows are driven by a passive, rAF-throttled `scroll` listener plus a shared
 * `ResizeObserver` (docs/features/core/scroller.md FR-SCROLLER-01's documented JS fallback path).
 * The scroll-driven-animation alternative the spec also allows is not implemented: browser
 * support for timelining an animation off a shadow-DOM-internal scrollport is still inconsistent
 * enough that the JS path is the more reliable default — noted here per
 * docs/features/_conventions.md's "say so inline" rule for partially-implemented FRs.
 *
 * `role="region"` is only added once the content is scrollable *and* the host has an accessible
 * name (`aria-label`/`aria-labelledby`) — an unnamed region is worse for assistive tech than no
 * region at all, so the keyboard tab stop still applies without one, but the landmark role waits
 * for a name (docs/features/core/scroller.md §6).
 *
 * @slot (default) - Scrollable content.
 *
 * @csspart content - The scrollable element.
 *
 * @cssprop --bx-scroller-shadow-color - Edge shadow color. Default a translucent neutral.
 * @cssprop --bx-scroller-shadow-size - Edge shadow extent. Default `--bx-space-l`.
 * @cssprop --bx-scroller-content-focus-ring-width - Focus ring width of the `content` part (focus state). Default `var(--bx-border-width-strong)`.
 * @cssprop --bx-scroller-content-focus-ring-color - Focus ring color of the `content` part (focus state). Default `var(--bx-focus-ring)`.
 * @cssprop --bx-scroller-content-focus-ring-offset - Focus ring offset of the `content` part (focus state). Default `calc(var(--bx-focus-ring-offset) * -1)`.
 * @cssprop --bx-scroller-shadow-opacity - Opacity of the `shadow` element. Default `1`.
 * @cssprop --bx-scroller-shadow-start-bg - Background of the `shadow-start` element. Default `linear-gradient( to right, var(--_shadow-color), transparent )`.
 * @cssprop --bx-scroller-shadow-end-bg - Background of the `shadow-end` element. Default `linear-gradient( to left, var(--_shadow-color), transparent )`.
 */
export class BxScroller extends BixElement {
  static override tagName = 'bx-scroller';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        position: relative;
        --_shadow-color: var(
          --bx-scroller-shadow-color,
          color-mix(in srgb, var(--bx-text-primary) 12%, transparent)
        );
      }

      .content {
        position: relative;
        overscroll-behavior: contain;
      }

      :host(:not([orientation='vertical'])) .content {
        display: flex;
        overflow-x: auto;
        overflow-y: hidden;
      }

      /* A flex column so a height constraint on the host (max-block-size, or being a flex item)
         reaches the inner scrollport; unconstrained, .content simply grows with its content. */
      :host([orientation='vertical']) {
        display: flex;
        flex-direction: column;
      }

      :host([orientation='vertical']) .content {
        flex: 1 1 auto;
        min-block-size: 0;
        overflow-y: auto;
        overflow-x: hidden;
      }

      :host([without-scrollbar]) .content {
        scrollbar-width: none;
      }
      :host([without-scrollbar]) .content::-webkit-scrollbar {
        display: none;
      }

      .content:focus-visible {
        outline: var(
            --bx-scroller-content-focus-ring-width,
            var(--bx-border-width-strong)
          )
          solid
          var(--bx-scroller-content-focus-ring-color, var(--bx-focus-ring));
        outline-offset: var(
          --bx-scroller-content-focus-ring-offset,
          calc(var(--bx-focus-ring-offset) * -1)
        );
      }

      .shadow {
        position: absolute;
        pointer-events: none;
        opacity: 0;
        transition: opacity var(--bx-motion-duration-fast)
          var(--bx-motion-easing-standard);
      }

      .shadow.visible {
        opacity: var(--bx-scroller-shadow-opacity, 1);
      }

      :host(:not([orientation='vertical'])) .shadow {
        inset-block: 0;
        inline-size: var(--bx-scroller-shadow-size, var(--bx-space-l));
      }
      :host(:not([orientation='vertical'])) .shadow-start {
        inset-inline-start: 0;
        background: var(
          --bx-scroller-shadow-start-bg,
          linear-gradient(to right, var(--_shadow-color), transparent)
        );
      }
      :host(:not([orientation='vertical'])) .shadow-end {
        inset-inline-end: 0;
        background: var(
          --bx-scroller-shadow-end-bg,
          linear-gradient(to left, var(--_shadow-color), transparent)
        );
      }

      :host([orientation='vertical']) .shadow {
        inset-inline: 0;
        block-size: var(--bx-scroller-shadow-size, var(--bx-space-l));
      }
      :host([orientation='vertical']) .shadow-start {
        inset-block-start: 0;
        background: var(
          --bx-scroller-shadow-start-bg,
          linear-gradient(to bottom, var(--_shadow-color), transparent)
        );
      }
      :host([orientation='vertical']) .shadow-end {
        inset-block-end: 0;
        background: var(
          --bx-scroller-shadow-end-bg,
          linear-gradient(to top, var(--_shadow-color), transparent)
        );
      }

      @media (prefers-reduced-motion: reduce) {
        .shadow {
          transition: none;
        }
      }

      @media (forced-colors: active) {
        .shadow {
          display: none;
        }
      }
    `,
  ];

  static override properties = {
    orientation: { type: String, reflect: true },
    withoutScrollbar: {
      type: Boolean,
      reflect: true,
      attribute: 'without-scrollbar',
    },
    withoutShadow: {
      type: Boolean,
      reflect: true,
      attribute: 'without-shadow',
    },
    _scrollable: { state: true },
    _atStart: { state: true },
    _atEnd: { state: true },
  };

  declare orientation: Orientation;
  declare withoutScrollbar: boolean;
  declare withoutShadow: boolean;
  /** @internal */
  declare _scrollable: boolean;
  /** @internal */
  declare _atStart: boolean;
  /** @internal */
  declare _atEnd: boolean;

  #contentRef = createRef<HTMLDivElement>();
  #unobserveResize?: () => void;
  #rafId = 0;

  constructor() {
    super();
    this.orientation = 'horizontal';
    this.withoutScrollbar = false;
    this.withoutShadow = false;
    this._scrollable = false;
    this._atStart = true;
    this._atEnd = false;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#unobserveResize?.();
    this.#unobserveResize = undefined;
    if (this.#rafId) cancelAnimationFrame(this.#rafId);
    this.#rafId = 0;
  }

  protected override firstUpdated(): void {
    const content = this.#contentRef.value;
    if (!content) return;
    this.#unobserveResize = observeResize(content, () => this.#measure());
    this.#measure();
  }

  #handleScroll = (): void => {
    if (this.#rafId) return;
    this.#rafId = requestAnimationFrame(() => {
      this.#rafId = 0;
      this.#measure();
    });
  };

  #handleSlotChange = (): void => this.#measure();

  #measure(): void {
    const content = this.#contentRef.value;
    if (!content) return;

    const horizontal = this.orientation !== 'vertical';
    const scrollSize = horizontal ? content.scrollWidth : content.scrollHeight;
    const clientSize = horizontal ? content.clientWidth : content.clientHeight;
    const scrollPos = horizontal ? content.scrollLeft : content.scrollTop;

    this._scrollable = scrollSize - clientSize > 1;
    this._atStart = scrollPos <= 0;
    this._atEnd = scrollPos + clientSize >= scrollSize - 1;
  }

  protected override render() {
    const hasAccessibleName =
      this.hasAttribute('aria-label') || this.hasAttribute('aria-labelledby');

    return html`
      <div
        ${ref(this.#contentRef)}
        class="content"
        part="content"
        tabindex=${this._scrollable ? '0' : nothing}
        role=${this._scrollable && hasAccessibleName ? 'region' : nothing}
        @scroll=${this.#handleScroll}
      >
        <slot @slotchange=${this.#handleSlotChange}></slot>
      </div>
      ${
        this.withoutShadow
          ? nothing
          : html`
              <div
                class="shadow shadow-start ${
                  this._scrollable && !this._atStart ? 'visible' : ''
                }"
                aria-hidden="true"
              ></div>
              <div
                class="shadow shadow-end ${
                  this._scrollable && !this._atEnd ? 'visible' : ''
                }"
                aria-hidden="true"
              ></div>
            `
      }
    `;
  }
}
