import { css, html, nothing, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';
import { observeResize } from '../internal/shared-observers.ts';
import { textFamily } from '../internal/text-style.ts';
import '../scroller/index.ts';

type View = 'mobile' | 'desktop';
type NavPlacement = 'start' | 'end';

const DEFAULT_BREAKPOINT = '768px';
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let nextId = 0;

/**
 * `<bx-page>` — application shell: banner, header, subheader, navigation, main, aside and footer
 * regions with a responsive collapse (docs/features/core/page.md).
 *
 * **View switching (FR-PAGE-01).** `view` is derived from the *page element's own inline size*
 * (shared `ResizeObserver`), not the viewport, so the shell works when embedded in a
 * micro-frontend. A CSS container query cannot take a configurable threshold, so the measured
 * value is reflected as `view="mobile|desktop"` and the stylesheet keys off that attribute.
 * `mobile-breakpoint` accepts any CSS length (`48rem`, `60em`, `600px`); it is resolved to pixels
 * through a probe element so relative units follow the root font size.
 *
 * **Off-canvas navigation (FR-PAGE-02).** In the mobile view the navigation is a drawer inside
 * the page (absolutely positioned, so it stays within the embedding container). Opening it moves
 * focus into the navigation and makes everything else `inert`; Escape, the scrim or the hide
 * button close it and focus returns to the menu button. In the desktop view it is a permanent
 * column and `nav-open` has no effect.
 *
 * **Landmarks (FR-PAGE-03).** `header` (banner), `nav`, `main`, `aside` (complementary) and
 * `footer` (contentinfo) are real landmark elements in the shadow root; the skip link is first in
 * tab order and moves focus to `main`. Fragment links cannot target an id inside a shadow root,
 * so the skip link is handled with a click listener.
 *
 * The navigation body scrolls inside a `bx-scroller` (edge shadows, keyboard tab stop once it
 * overflows) while the navigation header/footer slots stay pinned.
 *
 * Gaps, per docs/features/_conventions.md's "say so inline" rule: `--bx-page-main-width` only caps the
 * main column's max inline size; the open drawer contains focus through `inert` on everything
 * else rather than a keydown Tab trap, which lets Tab reach the browser chrome (equivalent for
 * assistive tech).
 *
 * @fires bx-page-view-change - The view changed. `detail: { view }`.
 * @fires bx-page-nav-toggle - The mobile navigation opened or closed. `detail: { open }`.
 *
 * @slot skip-to-content - Replaces the default skip link.
 * @slot banner - Full-width strip above the header.
 * @slot header - Application header.
 * @slot subheader - Strip below the header.
 * @slot navigation-header - Top of the navigation.
 * @slot navigation - Navigation content.
 * @slot navigation-footer - Bottom of the navigation.
 * @slot main-header - Above the main content.
 * @slot - Main content.
 * @slot main-footer - Below the main content.
 * @slot aside - Complementary content; drops below main in the mobile view.
 * @slot footer - Application footer.
 * @slot menu-button - Replaces the default button that opens the mobile navigation.
 * @slot hide-menu-button - Replaces the default button that closes the mobile navigation.
 *
 * @csspart base - The outer layout container.
 * @csspart banner - The banner region.
 * @csspart header - The header region.
 * @csspart subheader - The subheader region.
 * @csspart main - The `main` landmark.
 * @csspart navigation - The `nav` landmark.
 * @csspart aside - The `aside` landmark.
 * @csspart footer - The footer region.
 *
 * @cssprop --bx-page-menu-width - Navigation width.
 * @cssprop --bx-page-aside-width - Aside width.
 * @cssprop --bx-page-main-width - Max inline size of the main column.
 * @cssprop --bx-page-banner-height - Min height of the banner.
 * @cssprop --bx-page-header-height - Min height of the header.
 * @cssprop --bx-page-subheader-height - Min height of the subheader.
 * @cssprop --bx-page-nav-transition - Drawer transition. Disabled under reduced motion.
 * @cssprop --bx-page-fg - Text/icon color of the root surface. Default `var(--bx-text-primary)`.
 * @cssprop --bx-page-bg - Background of the root surface. Default `var(--bx-surface-base)`.
 * @cssprop --bx-page-a-fg - Text/icon color of the `a` element. Default `var(--bx-text-primary)`.
 * @cssprop --bx-page-header-gap - Gap of the `header` part. Default `var(--bx-space-s)`.
 * @cssprop --bx-page-header-padding-inline - Padding inline of the `header` part. Default `var(--bx-space-m)`.
 * @cssprop --bx-page-header-block-end-border-width - Block end border width of the `header` part. Default `var(--bx-border-width)`.
 * @cssprop --bx-page-header-block-end-border-color - Block end border color of the `header` part. Default `var(--bx-border-subtle)`.
 * @cssprop --bx-page-menu-button-min-width - Minimum width of the `menu-button` element. Default `var(--bx-target-min)`.
 * @cssprop --bx-page-menu-button-min-height - Minimum height of the `menu-button` element. Default `var(--bx-target-min)`.
 * @cssprop --bx-page-menu-button-radius - Corner radius of the `menu-button` element. Default `var(--bx-radius-m)`.
 * @cssprop --bx-page-menu-button-focus-ring-width - Focus ring width of the `menu-button` element (focus state). Default `var(--bx-border-width-strong)`.
 * @cssprop --bx-page-menu-button-focus-ring-color - Focus ring color of the `menu-button` element (focus state). Default `var(--bx-focus-ring)`.
 * @cssprop --bx-page-menu-button-focus-ring-offset - Focus ring offset of the `menu-button` element (focus state). Default `var(--bx-focus-ring-offset)`.
 * @cssprop --bx-page-navigation-bg - Background of the `navigation` part. Default `var(--bx-surface-base)`.
 * @cssprop --bx-page-navigation-inline-end-border-width - Inline end border width of the `navigation` part. Default `var(--bx-border-width)`.
 * @cssprop --bx-page-navigation-inline-end-border-color - Inline end border color of the `navigation` part. Default `var(--bx-border-subtle)`.
 * @cssprop --bx-page-navigation-inline-start-border-width - Inline start border width of the `navigation` part. Default `var(--bx-border-width)`.
 * @cssprop --bx-page-navigation-inline-start-border-color - Inline start border color of the `navigation` part. Default `var(--bx-border-subtle)`.
 * @cssprop --bx-page-main-padding - Padding of the `main` part. Default `var(--bx-space-m)`.
 * @cssprop --bx-page-aside-padding - Padding of the `aside` part. Default `var(--bx-space-m)`.
 * @cssprop --bx-page-aside-inline-start-border-width - Inline start border width of the `aside` part. Default `var(--bx-border-width)`.
 * @cssprop --bx-page-aside-inline-start-border-color - Inline start border color of the `aside` part. Default `var(--bx-border-subtle)`.
 * @cssprop --bx-page-footer-block-start-border-width - Block start border width of the `footer` part. Default `var(--bx-border-width)`.
 * @cssprop --bx-page-footer-block-start-border-color - Block start border color of the `footer` part. Default `var(--bx-border-subtle)`.
 * @cssprop --bx-page-aside-block-start-border-width - Block start border width of the `aside` part. Default `var(--bx-border-width)`.
 * @cssprop --bx-page-aside-block-start-border-color - Block start border color of the `aside` part. Default `var(--bx-border-subtle)`.
 * @cssprop --bx-page-navigation-shadow - Box shadow of the `navigation` part. Default `var(--bx-shadow-m)`.
 * @cssprop --bx-page-scrim-bg - Background of the `scrim` element. Default `color-mix(in srgb, CanvasText 40%, transparent)`.
 * @cssprop --bx-page-menu-button-icon-size - Size (width and height) of the icon inside the `menu-button` element. Default `1.25em`.
 * @cssprop --bx-page-font-family - Font family of the root surface. Default `var(--bx-type-body-family)`.
 */
export class BxPage extends BixElement {
  static override tagName = 'bx-page';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        position: relative;
        ${textFamily('--bx-page', 'body')}
        color: var(--bx-page-fg, var(--bx-text-primary));
        background: var(--bx-page-bg, var(--bx-surface-base));
        isolation: isolate;
      }

      .base {
        position: relative;
        display: flex;
        flex-direction: column;
        block-size: 100%;
        min-block-size: inherit;
        overflow: clip;
      }

      .skip {
        position: absolute;
        inset-block-start: var(--bx-space-xs);
        inset-inline-start: var(--bx-space-xs);
        z-index: 3;
        padding: var(--bx-space-xs) var(--bx-space-s);
        background: var(--bx-surface-base);
        border: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        border-radius: var(--bx-radius-m);
        transform: translateY(-300%);
      }

      .skip:focus-within {
        transform: none;
      }

      .skip a {
        color: var(--bx-page-a-fg, var(--bx-text-primary));
      }

      .banner {
        min-block-size: var(--bx-page-banner-height, 0);
      }

      .header,
      .subheader {
        display: flex;
        align-items: center;
        gap: var(--bx-page-header-gap, var(--bx-space-s));
        padding-inline: var(--bx-page-header-padding-inline, var(--bx-space-m));
      }

      .header {
        min-block-size: var(--bx-page-header-height, 0);
        border-block-end: var(
            --bx-page-header-block-end-border-width,
            var(--bx-border-width)
          )
          solid
          var(--bx-page-header-block-end-border-color, var(--bx-border-subtle));
      }

      .subheader {
        min-block-size: var(--bx-page-subheader-height, 0);
      }

      .header-content,
      .subheader-content {
        flex: 1;
        min-inline-size: 0;
      }

      .menu-button,
      .hide-menu-button {
        all: unset;
        box-sizing: border-box;
        display: none;
        align-items: center;
        justify-content: center;
        min-inline-size: var(
          --bx-page-menu-button-min-width,
          var(--bx-target-min)
        );
        min-block-size: var(
          --bx-page-menu-button-min-height,
          var(--bx-target-min)
        );
        cursor: pointer;
        border-radius: var(--bx-page-menu-button-radius, var(--bx-radius-m));
      }

      .menu-button:focus-visible,
      .hide-menu-button:focus-visible,
      .skip a:focus-visible {
        outline: var(
            --bx-page-menu-button-focus-ring-width,
            var(--bx-border-width-strong)
          )
          solid
          var(--bx-page-menu-button-focus-ring-color, var(--bx-focus-ring));
        outline-offset: var(
          --bx-page-menu-button-focus-ring-offset,
          var(--bx-focus-ring-offset)
        );
      }

      :host([view='mobile']) .menu-button,
      :host([view='mobile']) .hide-menu-button {
        display: inline-flex;
      }

      .menu-button svg,
      .hide-menu-button svg {
        inline-size: var(--bx-page-menu-button-icon-size, 1.25em);
        block-size: var(--bx-page-menu-button-icon-size, 1.25em);
        fill: currentColor;
      }

      .body {
        position: relative;
        display: flex;
        flex: 1;
        min-block-size: 0;
      }

      .navigation {
        flex: 0 0
          var(
            --bx-page-menu-width,
            clamp(calc(var(--bx-unit) * 12), 20vi, calc(var(--bx-unit) * 18))
          );
        display: flex;
        flex-direction: column;
        min-inline-size: 0;
        overflow: hidden;
        background: var(--bx-page-navigation-bg, var(--bx-surface-base));
        border-inline-end: var(
            --bx-page-navigation-inline-end-border-width,
            var(--bx-border-width)
          )
          solid
          var(
            --bx-page-navigation-inline-end-border-color,
            var(--bx-border-subtle)
          );
        outline: none;
      }

      :host([nav-placement='end']) .navigation {
        order: 3;
        border-inline-end: 0;
        border-inline-start: var(
            --bx-page-navigation-inline-start-border-width,
            var(--bx-border-width)
          )
          solid
          var(
            --bx-page-navigation-inline-start-border-color,
            var(--bx-border-subtle)
          );
      }

      .navigation-body {
        flex: 1;
        min-block-size: 0;
      }

      .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-inline-size: 0;
      }

      .main {
        flex: 1;
        max-inline-size: var(--bx-page-main-width, none);
        outline: none;
        padding: var(--bx-page-main-padding, var(--bx-space-m));
      }

      .aside {
        flex: 0 0
          var(
            --bx-page-aside-width,
            clamp(calc(var(--bx-unit) * 12), 18vi, calc(var(--bx-unit) * 16))
          );
        min-inline-size: 0;
        overflow-y: auto;
        padding: var(--bx-page-aside-padding, var(--bx-space-m));
        border-inline-start: var(
            --bx-page-aside-inline-start-border-width,
            var(--bx-border-width)
          )
          solid
          var(
            --bx-page-aside-inline-start-border-color,
            var(--bx-border-subtle)
          );
      }

      .footer {
        border-block-start: var(
            --bx-page-footer-block-start-border-width,
            var(--bx-border-width)
          )
          solid
          var(
            --bx-page-footer-block-start-border-color,
            var(--bx-border-subtle)
          );
      }

      .scrim {
        display: none;
      }

      /* Mobile: aside drops below main, navigation becomes an off-canvas drawer. */
      :host([view='mobile']) .body {
        flex-direction: column;
      }

      :host([view='mobile']) .aside {
        flex-basis: auto;
        border-inline-start: 0;
        border-block-start: var(
            --bx-page-aside-block-start-border-width,
            var(--bx-border-width)
          )
          solid
          var(--bx-page-aside-block-start-border-color, var(--bx-border-subtle));
      }

      :host([view='mobile']) .navigation {
        position: absolute;
        inset-block: 0;
        inset-inline-start: 0;
        z-index: 2;
        inline-size: min(
          var(--bx-page-menu-width, calc(var(--bx-unit) * 18)),
          85%
        );
        box-shadow: var(--bx-page-navigation-shadow, var(--bx-shadow-m));
        transform: translateX(-100%);
        visibility: hidden;
        transition:
          transform var(--bx-page-nav-transition, 200ms ease),
          visibility 0s linear 200ms;
      }

      :host([view='mobile'][nav-placement='end']) .navigation {
        inset-inline-start: auto;
        inset-inline-end: 0;
        transform: translateX(100%);
      }

      :host([view='mobile']:dir(rtl)) .navigation {
        transform: translateX(100%);
      }

      :host([view='mobile']:dir(rtl)[nav-placement='end']) .navigation {
        transform: translateX(-100%);
      }

      :host([view='mobile'][nav-open]) .navigation {
        transform: none;
        visibility: visible;
        transition:
          transform var(--bx-page-nav-transition, 200ms ease),
          visibility 0s;
      }

      :host([view='mobile'][nav-open]) .scrim {
        display: block;
        position: absolute;
        inset: 0;
        z-index: 1;
        background: var(
          --bx-page-scrim-bg,
          color-mix(in srgb, CanvasText 40%, transparent)
        );
      }

      .hide-menu-button {
        align-self: flex-end;
      }

      @media (prefers-reduced-motion: reduce) {
        .navigation {
          transition: none !important;
        }
      }

      @media (forced-colors: active) {
        .navigation,
        .header,
        .footer,
        .aside {
          border-color: CanvasText;
        }
      }
    `,
  ];

  static override properties = {
    view: { type: String, reflect: true },
    navOpen: { type: Boolean, reflect: true, attribute: 'nav-open' },
    navPlacement: { type: String, reflect: true, attribute: 'nav-placement' },
    disableNavigationToggle: {
      type: Boolean,
      reflect: true,
      attribute: 'disable-navigation-toggle',
    },
    mobileBreakpoint: { type: String, attribute: 'mobile-breakpoint' },
  };

  declare view: View;
  declare navOpen: boolean;
  declare navPlacement: NavPlacement;
  declare disableNavigationToggle: boolean;
  declare mobileBreakpoint: string;

  #uid = `bx-page-${nextId++}`;
  #unobserve?: () => void;
  #opener: HTMLElement | null = null;
  #width = -1;
  #raf = 0;

  constructor() {
    super();
    this.view = 'desktop';
    this.navOpen = false;
    this.navPlacement = 'start';
    this.disableNavigationToggle = false;
    this.mobileBreakpoint = DEFAULT_BREAKPOINT;
    this.addEventListener('keydown', this.#handleKeydown);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#unobserve = observeResize(this, (entry) => {
      this.#width = entry.contentRect.width;
      // Not synchronously: a view change reflows the page, which would resize observed nodes
      // inside this very callback ("ResizeObserver loop" error).
      cancelAnimationFrame(this.#raf);
      this.#raf = requestAnimationFrame(() => this.#updateView());
    });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#unobserve?.();
    this.#unobserve = undefined;
    cancelAnimationFrame(this.#raf);
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('mobileBreakpoint')) this.#updateView();
    if (changed.has('view') || changed.has('navOpen')) this.#applyInert();
    if (changed.has('navOpen') && changed.get('navOpen') !== undefined) {
      if (this.navOpen) {
        this.#opener =
          this.shadowRoot?.querySelector<HTMLElement>('.menu-button') ?? null;
        this.#focusNavigation();
      } else {
        this.#opener?.focus();
      }
      this.dispatchEvent(
        new CustomEvent('bx-page-nav-toggle', {
          bubbles: true,
          composed: true,
          detail: { open: this.navOpen },
        }),
      );
    }
  }

  /** Resolves any CSS length to px by laying out a probe, so rem/em follow the live root size. */
  #breakpointPx(): number {
    const probe = document.createElement('div');
    probe.style.cssText = `position:absolute;visibility:hidden;inline-size:${this.mobileBreakpoint || DEFAULT_BREAKPOINT}`;
    this.shadowRoot!.appendChild(probe);
    const px = probe.getBoundingClientRect().width;
    probe.remove();
    return px || 768;
  }

  #updateView(): void {
    if (this.#width < 0 || !this.shadowRoot) return;
    const next: View =
      this.#width < this.#breakpointPx() ? 'mobile' : 'desktop';
    if (next === this.view) return;
    this.view = next;
    if (next === 'desktop' && this.navOpen) this.navOpen = false;
    this.dispatchEvent(
      new CustomEvent('bx-page-view-change', {
        bubbles: true,
        composed: true,
        detail: { view: next },
      }),
    );
  }

  /** While the drawer is open everything but the navigation is inert; a closed drawer is too. */
  #applyInert(): void {
    const root = this.shadowRoot;
    if (!root) return;
    const mobile = this.view === 'mobile';
    const drawerOpen = mobile && this.navOpen;
    for (const el of root.querySelectorAll<HTMLElement>(
      '.banner, .header, .subheader, .content, .aside, .footer',
    ))
      el.inert = drawerOpen;
    const nav = root.querySelector<HTMLElement>('.navigation');
    if (nav) nav.inert = mobile && !this.navOpen;
  }

  #focusNavigation(): void {
    const nav = this.shadowRoot?.querySelector<HTMLElement>('.navigation');
    if (!nav) return;
    requestAnimationFrame(() => {
      const slotted = nav
        .querySelector<HTMLSlotElement>('slot[name="navigation"]')
        ?.assignedElements({ flatten: true })
        .flatMap((el) => [el, ...el.querySelectorAll<HTMLElement>('*')])
        .find((el) => el.matches(FOCUSABLE));
      const hide = nav.querySelector<HTMLElement>('.hide-menu-button');
      ((slotted ?? hide ?? nav) as HTMLElement).focus();
    });
  }

  #handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.view === 'mobile' && this.navOpen) {
      event.stopPropagation();
      this.hideNavigation();
    }
  };

  #handleSkip = (event: Event): void => {
    event.preventDefault();
    this.shadowRoot?.querySelector<HTMLElement>('.main')?.focus();
  };

  /** Opens the mobile navigation drawer. */
  showNavigation(): void {
    this.navOpen = true;
  }

  /** Closes the mobile navigation drawer. */
  hideNavigation(): void {
    this.navOpen = false;
  }

  toggleNavigation(): void {
    this.navOpen = !this.navOpen;
  }

  protected override render() {
    const mobile = this.view === 'mobile';
    return html`
      <div class="base" part="base">
        <span class="skip"
          ><slot name="skip-to-content"
            ><a href="#" @click=${this.#handleSkip}>Skip to content</a></slot
          ></span
        >
        <div class="banner" part="banner"><slot name="banner"></slot></div>
        <header class="header" part="header">
          ${
            this.disableNavigationToggle
              ? nothing
              : html`<slot name="menu-button"
                  ><button
                    type="button"
                    class="menu-button"
                    aria-label="Open navigation"
                    aria-expanded=${mobile && this.navOpen}
                    aria-controls="${this.#uid}-nav"
                    @click=${this.showNavigation}
                  >
                    <svg viewBox="0 0 256 256" aria-hidden="true">
                      <path
                        d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"
                      ></path>
                    </svg></button
                ></slot>`
          }
          <div class="header-content"><slot name="header"></slot></div>
        </header>
        <div class="subheader" part="subheader">
          <div class="subheader-content"><slot name="subheader"></slot></div>
        </div>
        <div class="body">
          <nav
            class="navigation"
            part="navigation"
            id="${this.#uid}-nav"
            aria-label="Main"
            tabindex="-1"
          >
            ${
              mobile
                ? html`<slot name="hide-menu-button"
                    ><button
                      type="button"
                      class="hide-menu-button"
                      aria-label="Close navigation"
                      @click=${this.hideNavigation}
                    >
                      <svg viewBox="0 0 256 256" aria-hidden="true">
                        <path
                          d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"
                        ></path>
                      </svg></button
                  ></slot>`
                : nothing
            }
            <slot name="navigation-header"></slot>
            <bx-scroller class="navigation-body" orientation="vertical"
              ><slot name="navigation"></slot
            ></bx-scroller>
            <slot name="navigation-footer"></slot>
          </nav>
          <div class="scrim" @click=${this.hideNavigation}></div>
          <div class="content">
            <slot name="main-header"></slot>
            <main class="main" part="main" id="${this.#uid}-main" tabindex="-1">
              <slot></slot>
            </main>
            <slot name="main-footer"></slot>
          </div>
          <aside class="aside" part="aside" aria-label="Complementary">
            <slot name="aside"></slot>
          </aside>
        </div>
        <footer class="footer" part="footer">
          <slot name="footer"></slot>
        </footer>
      </div>
    `;
  }
}
