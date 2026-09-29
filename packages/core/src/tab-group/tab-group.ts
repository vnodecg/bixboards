import { css, html, nothing, type PropertyValues } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';
import { observeResize } from '../internal/shared-observers.ts';
import type { BxTab } from '../tab/tab.ts';
import type { BxTabPanel } from '../tab-panel/tab-panel.ts';

type Placement = 'top' | 'bottom' | 'start' | 'end';
type Activation = 'auto' | 'manual';

// Vendored from packages/core/src/icon/default-library.ts (Phosphor Icons, regular, MIT). Same
// paths as packages/core/src/carousel/carousel.ts's prev/next controls.
const CHEVRON_LEFT_PATH =
  'M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z';
const CHEVRON_RIGHT_PATH =
  'M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z';
const CHEVRON_UP_PATH =
  'M213.66,165.66a8,8,0,0,1-11.32,0L128,91.31,53.66,165.66a8,8,0,0,1-11.32-11.32l80-80a8,8,0,0,1,11.32,0l80,80A8,8,0,0,1,213.66,165.66Z';
const CHEVRON_DOWN_PATH =
  'M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z';

/**
 * `<bx-tab-group>` — tabbed interface owning a `nav`-slotted set of `bx-tab` and a default-slotted
 * set of `bx-tab-panel` (docs/features/core/tab-group.md).
 *
 * Wires the two: matches each tab's `panel` to a panel's `name`, drives `active` on both from this
 * element's own `active`, and drives roving tabindex through `bx-tab`'s `tab-stop` property (APG
 * tabs pattern — only the active tab, or the most recently focused one once focus has moved off
 * it, is a tab stop). `aria-controls`/`aria-labelledby` cross the tab's and panel's separate shadow
 * roots via `bx-tab`'s `controlsElement`/`tabElement` and the platform's `ariaLabelledByElements`
 * (`bx-tab`'s own doc comment explains why a plain ID-string attribute can't do this), not a plain
 * attribute string.
 *
 * FR-TAB-GROUP-02 ("inactive panels are not rendered until first shown when `lazy`") is not
 * implemented: panels are ordinary slotted light-DOM content, so genuine deferred instantiation
 * would need a `<template>`-based content model this spec doesn't define yet. `bx-tab-panel`'s
 * existing `hidden` attribute (docs/features/core/tab-panel.md FR-TAB-PANEL-01) already keeps an
 * inactive panel out of layout/paint/the accessibility tree, which covers the FR's practical
 * performance intent; a `lazy` attribute is deliberately omitted rather than added as a no-op, per
 * docs/features/_conventions.md's "say so inline instead of leaving it silent" rule for genuine
 * gaps.
 *
 * Overflow scrolling (FR-TAB-GROUP-01) reuses the shared `ResizeObserver` pool, the same
 * measure-on-resize-and-scroll approach as `bx-scroller`.
 *
 * @fires bx-tab-show - A panel became active. `detail: { name: string }`.
 * @fires bx-tab-hide - A panel became inactive. `detail: { name: string }`.
 *
 * @slot (default) - `bx-tab-panel` elements.
 * @slot nav - `bx-tab` elements.
 * @slot scroll-to-start - Overrides the default "scroll to start" button icon.
 * @slot scroll-to-end - Overrides the default "scroll to end" button icon.
 *
 * @csspart base - The outer wrapper.
 * @csspart nav - The wrapper around the scroll buttons and tab list.
 * @csspart tabs - The `role="tablist"` scrollable element (the `nav` slot).
 * @csspart body - The wrapper around the default slot (panels).
 * @csspart scroll-button - Either scroll button.
 * @csspart scroll-button--start - The "scroll to start" button.
 * @csspart scroll-button--end - The "scroll to end" button.
 *
 * @cssprop --indicator-color - Active tab's indicator/text color. Forwarded to slotted `bx-tab`
 *   via custom-property inheritance. Default `--bx-role-accent`.
 * @cssprop --track-color - Baseline track color under the tab list. Default `--bx-border-subtle`.
 * @cssprop --track-width - Baseline track thickness. Default the hairline border width.
 */
export class BxTabGroup extends BixElement {
  static override tagName = 'bx-tab-group';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        container-type: inline-size;
        font-family: var(--bx-font-family-sans);
      }

      .base {
        display: flex;
        flex-direction: column;
      }

      :host([placement='bottom']) .base {
        flex-direction: column-reverse;
      }

      :host([placement='start']) .base,
      :host([placement='end']) .base {
        flex-direction: row;
      }
      :host([placement='end']) .base {
        flex-direction: row-reverse;
      }

      .nav {
        position: relative;
        display: flex;
        align-items: center;
        background-position: 0 100%;
        background-size: 100% var(--track-width, var(--bx-border-width));
        background-repeat: no-repeat;
        background-image: linear-gradient(
          var(--track-color, var(--bx-border-subtle)),
          var(--track-color, var(--bx-border-subtle))
        );
      }

      :host([placement='start']) .nav,
      :host([placement='end']) .nav {
        flex-direction: column;
        align-items: stretch;
        background-position: 100% 0;
        background-size: var(--track-width, var(--bx-border-width)) 100%;
      }
      :host([placement='start']) .nav {
        background-position: 100% 0;
      }
      :host([placement='end']) .nav {
        background-position: 0 0;
      }

      .tabs {
        display: flex;
        flex: 1;
        overflow: auto;
        scrollbar-width: none;
      }
      .tabs::-webkit-scrollbar {
        display: none;
      }

      :host([placement='start']) .tabs,
      :host([placement='end']) .tabs {
        flex-direction: column;
      }

      .scroll-button {
        all: unset;
        box-sizing: border-box;
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: var(--bx-target-min, 2.75rem);
        block-size: var(--bx-target-min, 2.75rem);
        color: var(--bx-text-secondary);
        cursor: pointer;
      }

      .scroll-button:hover {
        background: var(--bx-surface-subtle);
        color: var(--bx-text-primary);
      }

      .scroll-button:focus-visible {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: calc(var(--bx-focus-ring-offset) * -1);
      }

      .scroll-button svg {
        inline-size: 1em;
        block-size: 1em;
        fill: currentColor;
      }

      .body {
        flex: 1;
        min-inline-size: 0;
      }

      @media (forced-colors: active) {
        .nav {
          background-image: linear-gradient(CanvasText, CanvasText);
        }
      }
    `,
  ];

  static override properties = {
    active: { type: String },
    placement: { type: String, reflect: true },
    activation: { type: String },
    withoutScrollControls: {
      type: Boolean,
      reflect: true,
      attribute: 'without-scroll-controls',
    },
    _scrollable: { state: true },
    _atStart: { state: true },
    _atEnd: { state: true },
  };

  declare active: string;
  declare placement: Placement;
  declare activation: Activation;
  declare withoutScrollControls: boolean;
  /** @internal */
  declare _scrollable: boolean;
  /** @internal */
  declare _atStart: boolean;
  /** @internal */
  declare _atEnd: boolean;

  #tabsRef = createRef<HTMLDivElement>();
  #unobserveResize?: () => void;
  #rafId = 0;

  constructor() {
    super();
    this.active = '';
    this.placement = 'top';
    this.activation = 'auto';
    this.withoutScrollControls = false;
    this._scrollable = false;
    this._atStart = true;
    this._atEnd = false;

    this.addEventListener('keydown', this.#handleKeydown);
    this.addEventListener('click', this.#handleClick);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#unobserveResize?.();
    this.#unobserveResize = undefined;
    if (this.#rafId) cancelAnimationFrame(this.#rafId);
    this.#rafId = 0;
  }

  protected override firstUpdated(): void {
    const tabs = this.#tabsRef.value;
    if (tabs) {
      this.#unobserveResize = observeResize(tabs, () => this.#measure());
      this.#measure();
    }
  }

  #tabs(): BxTab[] {
    return [...this.querySelectorAll('bx-tab')] as unknown as BxTab[];
  }

  #panels(): BxTabPanel[] {
    return [...this.querySelectorAll('bx-tab-panel')] as unknown as BxTabPanel[];
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('active'))
      this.#applyActive((changed.get('active') as string | undefined) ?? '');
  }

  #applyActive(previous: string): void {
    const panels = this.#panels();
    for (const tab of this.#tabs()) {
      tab.active = tab.panel === this.active;
      // Wires the tab/panel relationship across their separate shadow roots via the
      // cross-root-capable ARIA element-reference reflection (`bx-tab`'s own doc comment) rather
      // than a plain `aria-controls`/`aria-labelledby` ID string, which can't resolve here.
      const panel = panels.find((candidate) => candidate.name === tab.panel);
      tab.controlsElement = panel ?? null;
      if (panel) panel.ariaLabelledByElements = tab.tabElement ? [tab.tabElement] : null;
    }
    for (const panel of panels) panel.active = panel.name === this.active;
    this.#syncRovingTabindex();

    if (previous && previous !== this.active)
      this.dispatchEvent(
        new CustomEvent('bx-tab-hide', {
          bubbles: true,
          composed: true,
          detail: { name: previous },
        }),
      );
    if (this.active)
      this.dispatchEvent(
        new CustomEvent('bx-tab-show', {
          bubbles: true,
          composed: true,
          detail: { name: this.active },
        }),
      );
  }

  // APG roving tabindex: only the active tab (or, once keyboard focus has moved, the most
  // recently focused one) is a tab stop.
  #syncRovingTabindex(focused?: BxTab): void {
    const tabs = this.#tabs();
    const target = focused ?? tabs.find((tab) => tab.active) ?? tabs[0];
    for (const tab of tabs) tab.tabStop = tab === target;
  }

  #handleSlotChange = (): void => {
    if (!this.active) {
      const first = this.#tabs().find((tab) => !tab.disabled);
      if (first) this.active = first.panel;
    } else {
      this.#applyActive(this.active);
    }
    this.#measure();
  };

  #handleClick = (event: MouseEvent): void => {
    const tab = (event.target as Element)?.closest?.('bx-tab') as BxTab | null;
    if (!tab || tab.disabled || !this.#tabs().includes(tab)) return;
    this.show(tab.panel);
  };

  #handleKeydown = (event: KeyboardEvent): void => {
    const tab = (event.target as Element)?.closest?.('bx-tab') as BxTab | null;
    if (!tab || !this.#tabs().includes(tab)) return;

    const vertical = this.placement === 'start' || this.placement === 'end';
    const forwardKey = vertical ? 'ArrowDown' : 'ArrowRight';
    const backwardKey = vertical ? 'ArrowUp' : 'ArrowLeft';

    const members = this.#tabs().filter((member) => !member.disabled);
    const index = members.indexOf(tab);
    if (index === -1) return;

    let next: BxTab | undefined;
    if (event.key === forwardKey) next = members[(index + 1) % members.length];
    else if (event.key === backwardKey)
      next = members[(index - 1 + members.length) % members.length];
    else if (event.key === 'Home') next = members[0];
    else if (event.key === 'End') next = members[members.length - 1];
    else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.show(tab.panel);
      return;
    }

    if (!next) return;
    event.preventDefault();
    next.focus();
    this.#syncRovingTabindex(next);
    if (this.activation === 'auto') this.show(next.panel);
  };

  #handleScroll = (): void => {
    if (this.#rafId) return;
    this.#rafId = requestAnimationFrame(() => {
      this.#rafId = 0;
      this.#measure();
    });
  };

  #measure(): void {
    const tabs = this.#tabsRef.value;
    if (!tabs) return;

    const vertical = this.placement === 'start' || this.placement === 'end';
    const scrollSize = vertical ? tabs.scrollHeight : tabs.scrollWidth;
    const clientSize = vertical ? tabs.clientHeight : tabs.clientWidth;
    const scrollPos = vertical ? tabs.scrollTop : tabs.scrollLeft;

    this._scrollable = scrollSize - clientSize > 1;
    this._atStart = scrollPos <= 0;
    this._atEnd = scrollPos + clientSize >= scrollSize - 1;
  }

  #scrollBy(direction: 1 | -1): void {
    const tabs = this.#tabsRef.value;
    if (!tabs) return;
    const vertical = this.placement === 'start' || this.placement === 'end';
    const amount = (vertical ? tabs.clientHeight : tabs.clientWidth) * 0.75;
    tabs.scrollBy(
      vertical ? { top: direction * amount } : { left: direction * amount },
    );
  }

  /** Activates the panel (and its matching tab) named `panel`. */
  show(panel: string): void {
    if (panel === this.active) return;
    this.active = panel; // `willUpdate` applies it to the tab/panel members and fires the events.

    const tab = this.#tabs().find((member) => member.panel === panel);
    tab?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  protected override render() {
    const vertical = this.placement === 'start' || this.placement === 'end';
    const startIcon = vertical ? CHEVRON_UP_PATH : CHEVRON_LEFT_PATH;
    const endIcon = vertical ? CHEVRON_DOWN_PATH : CHEVRON_RIGHT_PATH;
    const showControls = !this.withoutScrollControls && this._scrollable;

    return html`
      <div class="base" part="base">
        <div class="nav" part="nav">
          ${
            showControls
              ? html`<button
                  type="button"
                  class="scroll-button"
                  part="scroll-button scroll-button--start"
                  aria-label="Scroll to start"
                  ?disabled=${this._atStart}
                  @click=${() => this.#scrollBy(-1)}
                >
                  <slot name="scroll-to-start"
                    ><svg viewBox="0 0 256 256">
                      <path d=${startIcon}></path></svg
                  ></slot>
                </button>`
              : nothing
          }
          <div
            ${ref(this.#tabsRef)}
            class="tabs"
            part="tabs"
            role="tablist"
            aria-orientation=${vertical ? 'vertical' : 'horizontal'}
            @scroll=${this.#handleScroll}
          >
            <slot name="nav" @slotchange=${this.#handleSlotChange}></slot>
          </div>
          ${
            showControls
              ? html`<button
                  type="button"
                  class="scroll-button"
                  part="scroll-button scroll-button--end"
                  aria-label="Scroll to end"
                  ?disabled=${this._atEnd}
                  @click=${() => this.#scrollBy(1)}
                >
                  <slot name="scroll-to-end"
                    ><svg viewBox="0 0 256 256">
                      <path d=${endIcon}></path></svg
                  ></slot>
                </button>`
              : nothing
          }
        </div>
        <div class="body" part="body">
          <slot @slotchange=${this.#handleSlotChange}></slot>
        </div>
      </div>
    `;
  }
}
