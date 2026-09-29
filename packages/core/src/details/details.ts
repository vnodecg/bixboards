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
 * §6). The body's open/close animation uses the `grid-template-rows` technique — no measurement
 * loop, no layout jump (FR-DETAILS-01) — with independent show/hide durations, since the base
 * (closed) rule and the `[open]` rule can each carry their own `transition-duration`.
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
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows
          var(--bx-details-hide-duration, var(--bx-motion-duration-fast, 0.12s))
          var(--bx-motion-easing-standard, ease);
      }

      :host([open]) .body-wrapper {
        grid-template-rows: 1fr;
        transition: grid-template-rows
          var(--bx-details-show-duration, var(--bx-motion-duration-base, 0.2s))
          var(--bx-motion-easing-standard, ease);
      }

      .content {
        overflow: hidden;
        min-block-size: 0;
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
      this.dispatchEvent(new CustomEvent('bx-show', { bubbles: true, composed: true }));
    } else {
      this.dispatchEvent(new CustomEvent('bx-hide', { bubbles: true, composed: true }));
    }

    const afterEventName = this.open ? 'bx-after-show' : 'bx-after-hide';
    const dispatchAfter = (): void =>
      void this.dispatchEvent(
        new CustomEvent(afterEventName, { bubbles: true, composed: true }),
      );

    if (this.prefersReducedMotion) {
      dispatchAfter();
      return;
    }

    const wrapper = this.shadowRoot!.querySelector<HTMLElement>('.body-wrapper')!;
    const cleanup = (event: Event): void => {
      if (
        event.target !== wrapper ||
        (event as TransitionEvent).propertyName !== 'grid-template-rows'
      )
        return;
      wrapper.removeEventListener('transitionend', cleanup);
      dispatchAfter();
    };
    wrapper.addEventListener('transitionend', cleanup);
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
            ${this.open
              ? html`<slot name="collapse-icon"
                  >${svg`<svg viewBox="0 0 256 256"><path d=${CHEVRON_UP_PATH}></path></svg>`}</slot
                >`
              : html`<slot name="expand-icon"
                  >${svg`<svg viewBox="0 0 256 256"><path d=${CHEVRON_DOWN_PATH}></path></svg>`}</slot
                >`}
          </span>
        </button>
        <div class="body-wrapper">
          <div class="content" part="content" id=${this.#contentId}>
            ${this.lazy && !this.#hasOpenedOnce ? nothing : html`<slot></slot>`}
          </div>
        </div>
      </div>
    `;
  }
}
