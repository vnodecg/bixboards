import { css, html, nothing, svg, type PropertyValues } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';
import { observeResize } from '../internal/shared-observers.ts';
import type { BxCarouselItem } from '../carousel-item/carousel-item.ts';

type Orientation = 'horizontal' | 'vertical';

// Vendored from packages/core/src/icon/default-library.ts (Phosphor Icons, regular, MIT).
const CHEVRON_LEFT_PATH =
  'M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z';
const CHEVRON_RIGHT_PATH =
  'M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z';
const CHEVRON_UP_PATH =
  'M213.66,165.66a8,8,0,0,1-11.32,0L128,91.31,53.66,165.66a8,8,0,0,1-11.32-11.32l80-80a8,8,0,0,1,11.32,0l80,80A8,8,0,0,1,213.66,165.66Z';
const CHEVRON_DOWN_PATH =
  'M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Parses `slides-per-page` values like `"1"` or `"1 480px:2 800px:3"` against a container width. */
function resolveSlidesPerPage(raw: string, containerWidth: number): number {
  const tokens = raw.trim().split(/\s+/).filter(Boolean);
  let base = 1;
  const breakpoints: Array<[number, number]> = [];

  for (const token of tokens) {
    const colon = token.indexOf(':');
    if (colon === -1) {
      const n = Number(token);
      if (Number.isFinite(n) && n > 0) base = n;
      continue;
    }
    const width = Number(token.slice(0, colon).replace('px', ''));
    const value = Number(token.slice(colon + 1));
    if (Number.isFinite(width) && Number.isFinite(value) && value > 0)
      breakpoints.push([width, value]);
  }

  breakpoints.sort((a, b) => a[0] - b[0]);
  let resolved = base;
  for (const [width, value] of breakpoints)
    if (containerWidth >= width) resolved = value;
  return Math.max(1, Math.round(resolved));
}

/**
 * `<bx-carousel>` — scroll-snap carousel with pagination, navigation, autoplay and drag.
 *
 * CSS scroll-snap does the actual layout and momentum (FR-CAROUSEL-01): the scroll container is a
 * plain `overflow: auto` flexbox with `scroll-snap-type`, so touch/trackpad scrolling, momentum and
 * accessibility all come from the platform for free. JS only tracks which slide is current (via a
 * shared `IntersectionObserver` on each slide), drives `next()`/`previous()`/`goToSlide()` through
 * `scrollIntoView()`, and wires up navigation buttons, pagination dots and autoplay.
 *
 * Slides are `<bx-carousel-item>` children; this component sets each one's `label` ("n of m") and
 * `--bx-carousel-item-snap-align` per that component's contract — it is deliberately stateless on
 * its own (see its own docstring).
 *
 * Autoplay pauses on hover, focus-within, a hidden tab and `prefers-reduced-motion`
 * (FR-CAROUSEL-02); a pause/play control lives next to the navigation for keyboard/AT users
 * regardless of hover/focus state (docs/features/core/carousel.md §6).
 *
 * `slides-per-page` accepts a single number or a container-width-keyed map
 * (`"1 480px:2 800px:3"`, FR-CAROUSEL-04); the count is re-resolved on host resize.
 *
 * @fires bx-slide-change - The active slide changed. `detail: { index, slide } `.
 *
 * @slot (default) - `bx-carousel-item` elements.
 * @slot next-icon - Overrides the default "next" chevron.
 * @slot previous-icon - Overrides the default "previous" chevron.
 *
 * @csspart base - The outer wrapper.
 * @csspart scroll-container - The scrollable, scroll-snapping element.
 * @csspart pagination - The pagination dots wrapper.
 * @csspart pagination-item - One pagination dot.
 * @csspart navigation - The wrapper around the navigation buttons.
 * @csspart navigation-button - A navigation button (previous, next, or the autoplay toggle).
 * @csspart navigation-button--previous - The previous button specifically.
 * @csspart navigation-button--next - The next button specifically.
 *
 * @cssprop --slide-gap - Gap between slides. Default `--bx-space-m`.
 * @cssprop --aspect-ratio - Forwarded to each slide's `--aspect-ratio`.
 * @cssprop --scroll-hint - Extra scroll padding so adjacent slides peek at the edges. Default `0`.
 */
export class BxCarousel extends BixElement {
  static override tagName = 'bx-carousel';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        position: relative;
      }

      .base {
        position: relative;
        block-size: 100%;
      }

      .scroll-container {
        display: flex;
        gap: var(--slide-gap, var(--bx-space-m));
        scroll-behavior: smooth;
        overscroll-behavior: contain;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .scroll-container::-webkit-scrollbar {
        display: none;
      }

      :host(:not([orientation='vertical'])) .scroll-container {
        flex-direction: row;
        overflow-x: auto;
        overflow-y: hidden;
        scroll-snap-type: x mandatory;
        scroll-padding-inline: var(--scroll-hint, 0px);
      }

      :host([orientation='vertical']) .scroll-container {
        flex-direction: column;
        overflow-y: auto;
        overflow-x: hidden;
        scroll-snap-type: y mandatory;
        scroll-padding-block: var(--scroll-hint, 0px);
        block-size: 100%;
      }

      :host([mouse-dragging]) .scroll-container {
        cursor: grab;
      }
      :host([mouse-dragging]) .scroll-container.dragging {
        cursor: grabbing;
        scroll-snap-type: none;
        scroll-behavior: auto;
      }

      ::slotted(bx-carousel-item) {
        flex: 0 0
          calc(
            (
                100% - (var(--bx-carousel-per-page, 1) - 1) *
                  var(--slide-gap, var(--bx-space-m))
              ) / var(--bx-carousel-per-page, 1)
          );
      }

      .navigation-button {
        all: unset;
        box-sizing: border-box;
        position: absolute;
        z-index: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: var(--bx-carousel-nav-size, calc(var(--bx-unit) * 2.25));
        block-size: var(--bx-carousel-nav-size, calc(var(--bx-unit) * 2.25));
        border-radius: var(--bx-radius-pill);
        background: var(--bx-surface-base);
        color: var(--bx-text-primary);
        border: var(--bx-border-width) solid var(--bx-border-subtle);
        box-shadow: var(--bx-shadow-s, 0 1px 3px rgba(0, 0, 0, 0.24));
        cursor: pointer;
      }

      .navigation-button:focus-visible {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: var(--bx-focus-ring-offset);
      }

      .navigation-button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        pointer-events: none;
      }

      .navigation-button svg {
        inline-size: 1em;
        block-size: 1em;
        fill: currentColor;
      }

      :host(:not([orientation='vertical'])) .navigation-button--previous {
        inset-inline-start: var(--bx-space-s);
        inset-block-start: 50%;
        translate: 0 -50%;
      }
      :host(:not([orientation='vertical'])) .navigation-button--next {
        inset-inline-end: var(--bx-space-s);
        inset-block-start: 50%;
        translate: 0 -50%;
      }
      :host([orientation='vertical']) .navigation-button--previous {
        inset-block-start: var(--bx-space-s);
        inset-inline-start: 50%;
        translate: -50% 0;
      }
      :host([orientation='vertical']) .navigation-button--next {
        inset-block-end: var(--bx-space-s);
        inset-inline-start: 50%;
        translate: -50% 0;
      }

      .controls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--bx-space-s);
        margin-block-start: var(--bx-space-s);
      }

      .play-toggle {
        all: unset;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: var(--bx-target-min, 2.75rem);
        block-size: var(--bx-target-min, 2.75rem);
        border-radius: var(--bx-radius-pill);
        color: var(--bx-text-secondary);
        cursor: pointer;
      }

      .play-toggle:focus-visible {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: var(--bx-focus-ring-offset);
      }

      .play-toggle .bar {
        inline-size: 0.2em;
        block-size: 0.8em;
        background: currentColor;
      }
      .play-toggle .bars {
        display: inline-flex;
        gap: 0.2em;
      }
      .play-toggle .triangle {
        inline-size: 0;
        block-size: 0;
        border-block-start: 0.45em solid transparent;
        border-block-end: 0.45em solid transparent;
        border-inline-start: 0.7em solid currentColor;
      }

      .pagination {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--bx-space-2xs);
      }

      .pagination-item {
        all: unset;
        box-sizing: border-box;
        inline-size: 0.5rem;
        block-size: 0.5rem;
        border-radius: var(--bx-radius-pill);
        background: var(--bx-border-strong);
        cursor: pointer;
        transition: inline-size var(--bx-motion-duration-fast, 0.12s)
          var(--bx-motion-easing-standard, ease);
      }

      .pagination-item[aria-current='true'] {
        inline-size: 1.25rem;
        background: var(--bx-role-brand-solid, var(--bx-role-accent));
      }

      .pagination-item:focus-visible {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: var(--bx-focus-ring-offset);
      }

      @media (prefers-reduced-motion: reduce) {
        .scroll-container {
          scroll-behavior: auto;
        }
        .pagination-item {
          transition: none;
        }
      }

      @media (forced-colors: active) {
        .navigation-button {
          forced-color-adjust: none;
          border-color: CanvasText;
        }
        .pagination-item {
          forced-color-adjust: none;
          background: CanvasText;
        }
        .pagination-item[aria-current='true'] {
          background: Highlight;
        }
      }
    `,
  ];

  static override properties = {
    loop: { type: Boolean, reflect: true },
    navigation: { type: Boolean, reflect: true },
    pagination: { type: Boolean, reflect: true },
    autoplay: { type: Boolean, reflect: true },
    autoplayInterval: {
      type: Number,
      attribute: 'autoplay-interval',
    },
    slidesPerPage: { type: String, attribute: 'slides-per-page' },
    slidesPerMove: { type: Number, attribute: 'slides-per-move' },
    orientation: { type: String, reflect: true },
    mouseDragging: {
      type: Boolean,
      reflect: true,
      attribute: 'mouse-dragging',
    },
    _activeIndex: { state: true },
    _slideCount: { state: true },
    _perPage: { state: true },
    _playing: { state: true },
    _dragging: { state: true },
  };

  declare loop: boolean;
  declare navigation: boolean;
  declare pagination: boolean;
  declare autoplay: boolean;
  declare autoplayInterval: number;
  declare slidesPerPage: string;
  declare slidesPerMove: number;
  declare orientation: Orientation;
  declare mouseDragging: boolean;
  /** @internal */
  declare _activeIndex: number;
  /** @internal */
  declare _slideCount: number;
  /** @internal */
  declare _perPage: number;
  /** @internal */
  declare _playing: boolean;
  /** @internal */
  declare _dragging: boolean;

  #scrollRef = createRef<HTMLDivElement>();
  #unobserveResize?: () => void;
  #intersectionObserver?: IntersectionObserver;
  #visibility = new Map<Element, number>();
  #autoplayTimer?: ReturnType<typeof setInterval>;
  #hovering = false;
  #focused = false;
  #userPaused = false;
  #dragStart = { x: 0, y: 0, scroll: 0, pointerId: -1 };

  constructor() {
    super();
    this.loop = false;
    this.navigation = false;
    this.pagination = false;
    this.autoplay = false;
    this.autoplayInterval = 3000;
    this.slidesPerPage = '1';
    this.slidesPerMove = 1;
    this.orientation = 'horizontal';
    this.mouseDragging = false;
    this._activeIndex = 0;
    this._slideCount = 0;
    this._perPage = 1;
    this._playing = false;
    this._dragging = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('pointerenter', this.#handlePointerEnter);
    this.addEventListener('pointerleave', this.#handlePointerLeave);
    this.addEventListener('focusin', this.#handleFocusIn);
    this.addEventListener('focusout', this.#handleFocusOut);
    document.addEventListener('visibilitychange', this.#handleVisibilityChange);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('pointerenter', this.#handlePointerEnter);
    this.removeEventListener('pointerleave', this.#handlePointerLeave);
    this.removeEventListener('focusin', this.#handleFocusIn);
    this.removeEventListener('focusout', this.#handleFocusOut);
    document.removeEventListener('visibilitychange', this.#handleVisibilityChange);
    this.#unobserveResize?.();
    this.#unobserveResize = undefined;
    this.#intersectionObserver?.disconnect();
    this.#intersectionObserver = undefined;
    this.#stopAutoplay();
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('autoplay')) {
      this._playing = this.autoplay && !this.prefersReducedMotion;
      this.#userPaused = false;
    }
  }

  protected override firstUpdated(): void {
    this.setAttribute('role', 'region');
    this.setAttribute('aria-roledescription', 'carousel');

    const scroll = this.#scrollRef.value;
    if (!scroll) return;

    this.#unobserveResize = observeResize(this, () => this.#measurePerPage());
    this.#measurePerPage();

    this.#intersectionObserver = new IntersectionObserver(
      (entries) => this.#handleIntersect(entries),
      { root: scroll, threshold: [0, 0.25, 0.5, 0.6, 0.75, 1] },
    );
    this.#syncSlides();
    this.#syncAutoplay();
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('_playing')) this.#syncAutoplay();
  }

  #slides(): BxCarouselItem[] {
    const scroll = this.#scrollRef.value;
    if (!scroll) return [];
    const slot = scroll.querySelector('slot');
    if (!slot) return [];
    return (slot as HTMLSlotElement)
      .assignedElements({ flatten: true })
      .filter(
        (el): el is BxCarouselItem => el.tagName.toLowerCase() === 'bx-carousel-item',
      );
  }

  #handleSlotChange = (): void => this.#syncSlides();

  #syncSlides(): void {
    const slides = this.#slides();
    this._slideCount = slides.length;
    this.#intersectionObserver?.disconnect();
    this.#visibility.clear();

    slides.forEach((slide, index) => {
      slide.label = `${index + 1} of ${slides.length}`;
      slide.style.setProperty(
        '--bx-carousel-item-snap-align',
        this.pagination || this.navigation ? 'start' : 'center',
      );
      this.#intersectionObserver?.observe(slide);
    });

    if (this._activeIndex > slides.length - 1)
      this._activeIndex = Math.max(0, slides.length - 1);
  }

  #handleIntersect(entries: IntersectionObserverEntry[]): void {
    for (const entry of entries)
      this.#visibility.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);

    const slides = this.#slides();
    let bestIndex = this._activeIndex;
    let bestRatio = -1;
    slides.forEach((slide, index) => {
      const ratio = this.#visibility.get(slide) ?? 0;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestIndex = index;
      }
    });

    if (bestRatio > 0 && bestIndex !== this._activeIndex) {
      this._activeIndex = bestIndex;
      this.dispatchEvent(
        new CustomEvent('bx-slide-change', {
          bubbles: true,
          composed: true,
          detail: { index: bestIndex, slide: slides[bestIndex] },
        }),
      );
    }
  }

  #measurePerPage(): void {
    const width = this.getBoundingClientRect().width;
    this._perPage = resolveSlidesPerPage(this.slidesPerPage, width);
    this.style.setProperty('--bx-carousel-per-page', String(this._perPage));
  }

  #canGoPrevious(): boolean {
    return this.loop || this._activeIndex > 0;
  }

  #canGoNext(): boolean {
    return this.loop || this._activeIndex + this.slidesPerMove < this._slideCount;
  }

  /** Scrolls to `index` (clamped to the slide range), honouring `prefers-reduced-motion`. */
  goToSlide(index: number, behavior: ScrollBehavior = 'smooth'): void {
    const slides = this.#slides();
    if (slides.length === 0) return;
    const target = clamp(index, 0, slides.length - 1);
    const effectiveBehavior = this.prefersReducedMotion ? 'auto' : behavior;
    const horizontal = this.orientation !== 'vertical';
    slides[target]!.scrollIntoView({
      behavior: effectiveBehavior,
      inline: horizontal ? 'start' : 'nearest',
      block: horizontal ? 'nearest' : 'start',
    });
  }

  /** Advances by `slides-per-move`, wrapping to the start when `loop` is set. */
  next(): void {
    const target = this._activeIndex + this.slidesPerMove;
    if (target < this._slideCount) {
      this.goToSlide(target);
    } else if (this.loop) {
      this.goToSlide(0);
    }
  }

  /** Moves back by `slides-per-move`, wrapping to the end when `loop` is set. */
  previous(): void {
    const target = this._activeIndex - this.slidesPerMove;
    if (target >= 0) {
      this.goToSlide(target);
    } else if (this.loop) {
      this.goToSlide(Math.max(0, this._slideCount - this.slidesPerMove));
    }
  }

  #handlePointerEnter = (): void => {
    this.#hovering = true;
    this.#syncAutoplay();
  };
  #handlePointerLeave = (): void => {
    this.#hovering = false;
    this.#syncAutoplay();
  };
  #handleFocusIn = (): void => {
    this.#focused = true;
    this.#syncAutoplay();
  };
  #handleFocusOut = (): void => {
    this.#focused = false;
    this.#syncAutoplay();
  };
  #handleVisibilityChange = (): void => this.#syncAutoplay();

  #shouldAutoplay(): boolean {
    return (
      this._playing &&
      !this.#userPaused &&
      !this.#hovering &&
      !this.#focused &&
      !document.hidden &&
      !this.prefersReducedMotion &&
      this._slideCount > 1
    );
  }

  #syncAutoplay(): void {
    const should = this.#shouldAutoplay();
    if (should && !this.#autoplayTimer) {
      this.#autoplayTimer = setInterval(() => this.next(), this.autoplayInterval);
    } else if (!should && this.#autoplayTimer) {
      this.#stopAutoplay();
    }
  }

  #stopAutoplay(): void {
    if (this.#autoplayTimer) {
      clearInterval(this.#autoplayTimer);
      this.#autoplayTimer = undefined;
    }
  }

  #handleTogglePlay = (): void => {
    this.#userPaused = this._playing;
    this._playing = !this._playing;
  };

  #handlePointerDown = (event: PointerEvent): void => {
    if (!this.mouseDragging || event.pointerType !== 'mouse') return;
    const scroll = this.#scrollRef.value;
    if (!scroll) return;
    this._dragging = true;
    this.#dragStart = {
      x: event.clientX,
      y: event.clientY,
      scroll: this.orientation === 'vertical' ? scroll.scrollTop : scroll.scrollLeft,
      pointerId: event.pointerId,
    };
    scroll.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  #handlePointerMove = (event: PointerEvent): void => {
    if (!this._dragging || event.pointerId !== this.#dragStart.pointerId) return;
    const scroll = this.#scrollRef.value;
    if (!scroll) return;
    if (this.orientation === 'vertical') {
      const delta = event.clientY - this.#dragStart.y;
      scroll.scrollTop = this.#dragStart.scroll - delta;
    } else {
      const delta = event.clientX - this.#dragStart.x;
      scroll.scrollLeft = this.#dragStart.scroll - delta;
    }
  };

  #handlePointerUp = (event: PointerEvent): void => {
    if (event.pointerId !== this.#dragStart.pointerId) return;
    this._dragging = false;
    this.#scrollRef.value?.releasePointerCapture(event.pointerId);
  };

  #handleKeydown = (event: KeyboardEvent): void => {
    const horizontal = this.orientation !== 'vertical';
    const nextKey = horizontal ? 'ArrowRight' : 'ArrowDown';
    const previousKey = horizontal ? 'ArrowLeft' : 'ArrowUp';
    if (event.key === nextKey) {
      event.preventDefault();
      this.next();
    } else if (event.key === previousKey) {
      event.preventDefault();
      this.previous();
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.goToSlide(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      this.goToSlide(this._slideCount - 1);
    }
  };

  protected override render() {
    const pageCount = Math.max(1, Math.ceil(this._slideCount / this._perPage));
    const activePage = Math.floor(this._activeIndex / this._perPage);

    return html`
      <div class="base" part="base">
        <div
          ${ref(this.#scrollRef)}
          class="scroll-container ${this._dragging ? 'dragging' : ''}"
          part="scroll-container"
          tabindex="0"
          @keydown=${this.#handleKeydown}
          @pointerdown=${this.#handlePointerDown}
          @pointermove=${this.#handlePointerMove}
          @pointerup=${this.#handlePointerUp}
          @pointercancel=${this.#handlePointerUp}
        >
          <slot @slotchange=${this.#handleSlotChange}></slot>
        </div>
        ${
          this.navigation
            ? html`
                <div class="navigation" part="navigation">
                  <button
                    type="button"
                    class="navigation-button navigation-button--previous"
                    part="navigation-button navigation-button--previous"
                    aria-label="Previous slide"
                    ?disabled=${!this.#canGoPrevious()}
                    @click=${() => this.previous()}
                  >
                    <slot name="previous-icon">
                      ${svg`<svg viewBox="0 0 256 256" aria-hidden="true"><path d=${
                        this.orientation === 'vertical' ? CHEVRON_UP_PATH : CHEVRON_LEFT_PATH
                      }></path></svg>`}
                    </slot>
                  </button>
                  <button
                    type="button"
                    class="navigation-button navigation-button--next"
                    part="navigation-button navigation-button--next"
                    aria-label="Next slide"
                    ?disabled=${!this.#canGoNext()}
                    @click=${() => this.next()}
                  >
                    <slot name="next-icon">
                      ${svg`<svg viewBox="0 0 256 256" aria-hidden="true"><path d=${
                        this.orientation === 'vertical' ? CHEVRON_DOWN_PATH : CHEVRON_RIGHT_PATH
                      }></path></svg>`}
                    </slot>
                  </button>
                </div>
              `
            : nothing
        }
        ${
          this.pagination || this.autoplay
            ? html`
                <div class="controls">
                  ${this.autoplay
                    ? html`
                        <button
                          type="button"
                          class="play-toggle"
                          aria-label=${this._playing ? 'Pause autoplay' : 'Play autoplay'}
                          aria-pressed=${this._playing}
                          @click=${this.#handleTogglePlay}
                        >
                          ${this._playing
                            ? html`<span class="bars"
                                ><span class="bar"></span><span class="bar"></span
                              ></span>`
                            : html`<span class="triangle"></span>`}
                        </button>
                      `
                    : nothing}
                  ${this.pagination
                    ? html`
                        <div class="pagination" part="pagination" role="tablist">
                          ${Array.from({ length: pageCount }, (_, page) => {
                            const current = page === activePage;
                            return html`
                              <button
                                type="button"
                                class="pagination-item"
                                part="pagination-item"
                                role="tab"
                                aria-label="Go to slide ${page + 1} of ${pageCount}"
                                aria-current=${current}
                                aria-selected=${current}
                                @click=${() => this.goToSlide(page * this._perPage)}
                              ></button>
                            `;
                          })}
                        </div>
                      `
                    : nothing}
                </div>
              `
            : nothing
        }
      </div>
    `;
  }
}
