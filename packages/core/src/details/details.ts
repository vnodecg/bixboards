import { css, html, nothing, svg, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';

type Appearance = 'filled' | 'outlined' | 'filled outlined' | 'plain';
type IconPlacement = 'start' | 'end';

// Vendored from packages/core/src/icon/default-library.ts (Phosphor Icons, regular, MIT).
const CHEVRON_DOWN_PATH =
  'M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z';
const CHEVRON_UP_PATH =
  'M213.66,165.66a8,8,0,0,1-11.32,0L128,91.31,53.66,165.66a8,8,0,0,1-11.32-11.32l80-80a8,8,0,0,1,11.32,0l80,80A8,8,0,0,1,213.66,165.66Z';

let nextContentId = 0;

// Page-wide accordion groups keyed by `name`, mirroring native `<details name>` exclusivity
// (docs/features/core/details.md's `name` attribute) since this custom element can't rely on the
// browser's own implementation of it.
const groups = new Map<string, Set<BxDetails>>();

/**
 * `<bx-details>` — disclosure widget; supports grouping into an accordion via `name`.
 *
 * The header is a real `<button>` (native keyboard/focus semantics for free) with
 * `aria-expanded`/`aria-controls` on it, per the disclosure pattern (docs/features/core/details.md
 * §6). The body's open/close animation (FR-DETAILS-01) measures the content's natural height in
 * JS and transitions `block-size` to/from it explicitly (see `updated()`), rather than the
 * "grid-template-rows: minmax(0, Nfr)" auto-height trick this used to use: that technique
 * requires the browser to compute an intrinsic max-content contribution through a `<slot>` for
 * the `fr` track, and empirically, in this project's pinned Chromium, the close direction
 * (1fr -> 0fr) would sometimes never transition at all — the row just stayed at its open size,
 * no animation running, only the open direction reliably worked. Independent show/hide durations
 * still come from the same place (the base rule and the `[open]` rule each carry their own
 * `transition-duration`); only the *value* being transitioned changed.
 *
 * With `lazy`, the default slot's content is not rendered until the details is opened for the
 * first time, deferring heavy children (FR-DETAILS-02) — note this needs an actual `lazy`
 * attribute even though it isn't listed in the spec's own properties table; see §10's "confirm
 * final property names during implementation".
 *
 * @fires bx-show - The details is opening.
 * @fires bx-after-show - The open transition finished.
 * @fires bx-hide - The details is closing.
 * @fires bx-after-hide - The close transition finished.
 *
 * @slot (default) - Body content.
 * @slot summary - Overrides the `summary` attribute's text.
 * @slot expand-icon - Overrides the default chevron shown while closed.
 * @slot collapse-icon - Overrides the default chevron shown while open.
 *
 * @csspart base - The outer wrapper.
 * @csspart header - The header `<button>`.
 * @csspart summary - The wrapper around the summary slot.
 * @csspart icon - The wrapper around the expand/collapse icon.
 * @csspart content - The wrapper around the default slot.
 *
 * @cssprop --bx-details-spacing - Header/body padding. Default `--bx-space-m`.
 * @cssprop --bx-details-show-duration - Open-transition duration. Default `--bx-motion-duration-base`.
 * @cssprop --bx-details-hide-duration - Close-transition duration. Default `--bx-motion-duration-fast`.
 */
export class BxDetails extends BixElement {
  static override tagName = 'bx-details';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        font-family: var(--bx-font-family-sans);
      }

      .base {
        border-radius: var(--bx-radius-m);
        border: var(--bx-border-width) solid transparent;
      }

      :host([appearance~='filled']) .base {
        background: var(--bx-surface-subtle);
      }
      :host([appearance~='outlined']) .base {
        border-color: var(--bx-border-subtle);
      }
      :host([appearance='plain']) .base {
        border-color: transparent;
        background: transparent;
      }

      .header {
        all: unset;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--bx-space-s);
        inline-size: 100%;
        min-block-size: var(--bx-target-min);
        padding: var(--bx-details-spacing, var(--bx-space-m));
        color: var(--bx-text-primary);
        font-weight: var(--bx-font-weight-medium);
        cursor: pointer;
      }

      :host([icon-placement='start']) .header {
        flex-direction: row-reverse;
        justify-content: flex-end;
      }

      .header:focus-visible {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: calc(var(--bx-focus-ring-offset) * -1);
      }

      :host([disabled]) .header {
        cursor: not-allowed;
        color: var(--bx-text-disabled);
      }

      .summary {
        flex: 1;
        min-inline-size: 0;
      }

      .icon {
        display: inline-flex;
        flex-shrink: 0;
        inline-size: 1em;
        block-size: 1em;
      }

      .icon svg,
      .icon ::slotted(*) {
        inline-size: 100%;
        block-size: 100%;
        fill: currentColor;
      }

      .body-wrapper {
        /* Explicit, JS-measured block-size transition (see #animateTo in the class body) rather
           than the "grid-template-rows: minmax(0, Nfr)" auto-height trick: that technique
           depends on the browser correctly computing an intrinsic max-content contribution
           through a <slot> for the fr track, and empirically (this project's pinned Chromium)
           the close direction (1fr -> 0fr) sometimes never transitions at all — the row just
           stays at its open size with no animation running. Measuring the pixel height in JS and
           transitioning block-size directly has no such dependency. */
        overflow: hidden;
        block-size: 0;
        transition: block-size
          var(--bx-details-hide-duration, var(--bx-motion-duration-fast, 0.12s))
          var(--bx-motion-easing-standard, ease);
      }

      :host([open]) .body-wrapper {
        transition: block-size
          var(--bx-details-show-duration, var(--bx-motion-duration-base, 0.2s))
          var(--bx-motion-easing-standard, ease);
      }

      .content {
        min-block-size: 0;
      }

      .content-inner {
        padding: 0 var(--bx-details-spacing, var(--bx-space-m))
          var(--bx-details-spacing, var(--bx-space-m));
      }

      @media (prefers-reduced-motion: reduce) {
        .body-wrapper,
        :host([open]) .body-wrapper {
          transition: none;
        }
      }

      @media (forced-colors: active) {
        .base {
          forced-color-adjust: none;
          border-color: CanvasText;
        }
      }
    `,
  ];

  static override properties = {
    open: { type: Boolean, reflect: true },
    summary: { type: String },
    name: { type: String },
    disabled: { type: Boolean, reflect: true },
    appearance: { type: String, reflect: true },
    iconPlacement: {
      type: String,
      reflect: true,
      attribute: 'icon-placement',
    },
    lazy: { type: Boolean, reflect: true },
  };

  declare open: boolean;
  declare summary: string;
  declare name: string;
  declare disabled: boolean;
  declare appearance: Appearance;
  declare iconPlacement: IconPlacement;
  declare lazy: boolean;

  #contentId = `bx-details-content-${nextContentId++}`;
  #hasOpenedOnce: boolean;
  #isFirstUpdate = true;

  constructor() {
    super();
    this.open = false;
    this.summary = '';
    this.name = '';
    this.disabled = false;
    this.appearance = 'outlined';
    this.iconPlacement = 'end';
    this.lazy = false;
    this.#hasOpenedOnce = this.open;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.name) this.#joinGroup(this.name);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.name) this.#leaveGroup(this.name);
  }

  #joinGroup(name: string): void {
    let set = groups.get(name);
    if (!set) {
      set = new Set();
      groups.set(name, set);
    }
    set.add(this);
  }

  #leaveGroup(name: string): void {
    const set = groups.get(name);
    if (!set) return;
    set.delete(this);
    if (set.size === 0) groups.delete(name);
  }

  #closeGroupSiblings(): void {
    if (!this.name) return;
    for (const other of groups.get(this.name) ?? [])
      if (other !== this && other.open) other.hide();
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('name')) {
      const previous = changed.get('name');
      if (previous) this.#leaveGroup(previous);
      if (this.name) this.#joinGroup(this.name);
    }
    if (changed.has('open') && this.open) this.#hasOpenedOnce = true;
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (!changed.has('open')) return;

    if (this.open) {
      this.#closeGroupSiblings();
      this.dispatchEvent(
        new CustomEvent('bx-show', { bubbles: true, composed: true }),
      );
    } else {
      this.dispatchEvent(
        new CustomEvent('bx-hide', { bubbles: true, composed: true }),
      );
    }

    const afterEventName = this.open ? 'bx-after-show' : 'bx-after-hide';
    const dispatchAfter = (): void =>
      void this.dispatchEvent(
        new CustomEvent(afterEventName, { bubbles: true, composed: true }),
      );

    const wrapper =
      this.shadowRoot!.querySelector<HTMLElement>('.body-wrapper')!;

    // An initially-`open` details shouldn't visibly grow from 0 on page load — snap straight to
    // its resting state instead of animating into it.
    if (this.#isFirstUpdate) {
      this.#isFirstUpdate = false;
      wrapper.style.blockSize = this.open ? 'auto' : '0px';
      dispatchAfter();
      return;
    }

    if (this.prefersReducedMotion) {
      wrapper.style.blockSize = this.open ? 'auto' : '0px';
      dispatchAfter();
      return;
    }

    const cleanup = (event: Event): void => {
      if (
        event.target !== wrapper ||
        (event as TransitionEvent).propertyName !== 'block-size'
      )
        return;
      wrapper.removeEventListener('transitionend', cleanup);
      // Opening ends at an explicit pixel height (set below) so it has something definite to
      // transition from/to; once settled, release it back to `auto` so the content can still
      // reflow naturally (e.g. a container resize) without needing to be re-measured.
      if (this.open) wrapper.style.blockSize = 'auto';
      dispatchAfter();
    };
    wrapper.addEventListener('transitionend', cleanup);

    // Both branches force a synchronous layout (`getBoundingClientRect()`) between writing the
    // starting value and the target value, rather than deferring the second write to a
    // `requestAnimationFrame` callback: rAF callbacks are suspended entirely on a
    // hidden/backgrounded tab, which would silently strand the animation there, and a forced
    // reflow between the two writes is already enough for the browser to treat them as separate
    // style states to transition between.
    if (this.open) {
      const content = this.shadowRoot!.querySelector<HTMLElement>('.content')!;
      const target = content.scrollHeight;
      wrapper.style.blockSize = '0px';
      wrapper.getBoundingClientRect();
      wrapper.style.blockSize = `${target}px`;
    } else {
      // `block-size` can't transition *from* `auto` (only discrete values interpolate) — pin it
      // to its current rendered height first so the 0px write below has something to animate
      // from.
      const current = wrapper.getBoundingClientRect().height;
      wrapper.style.blockSize = `${current}px`;
      wrapper.getBoundingClientRect();
      wrapper.style.blockSize = '0px';
    }
  }

  /** Opens the details. No-op if already open or disabled. */
  show(): void {
    if (this.disabled || this.open) return;
    this.open = true;
  }

  /** Closes the details. No-op if already closed or disabled. */
  hide(): void {
    if (this.disabled || !this.open) return;
    this.open = false;
  }

  #handleHeaderClick = (): void => {
    if (this.disabled) return;
    if (this.open) this.hide();
    else this.show();
  };

  protected override render() {
    return html`
      <div class="base" part="base">
        <button
          type="button"
          class="header"
          part="header"
          aria-expanded=${this.open}
          aria-controls=${this.#contentId}
          ?disabled=${this.disabled}
          @click=${this.#handleHeaderClick}
        >
          <span class="summary" part="summary">
            <slot name="summary">${this.summary}</slot>
          </span>
          <span class="icon" part="icon">
            ${
              this.open
                ? html`<slot name="collapse-icon"
                    >${svg`<svg viewBox="0 0 256 256"><path d=${CHEVRON_UP_PATH}></path></svg>`}</slot
                  >`
                : html`<slot name="expand-icon"
                    >${svg`<svg viewBox="0 0 256 256"><path d=${CHEVRON_DOWN_PATH}></path></svg>`}</slot
                  >`
            }
          </span>
        </button>
        <div class="body-wrapper">
          <div class="content" part="content" id=${this.#contentId}>
            <div class="content-inner">
              ${this.lazy && !this.#hasOpenedOnce ? nothing : html`<slot></slot>`}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
