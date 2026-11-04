import { css, html, nothing, type PropertyValues } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';
import { textFamily } from '../internal/text-style.ts';

const NARROW = '(max-width: 48rem)';
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * `<bx-sidebar>` — application navigation rail (docs/features/core/sidebar.md).
 *
 * A `<nav>` landmark holding `bx-sidebar-group`s and `bx-sidebar-item`s between `header` and
 * `footer` slots. `collapsed` shrinks it to an icon-only rail (items then show a tooltip);
 * `persist-key` remembers that in `localStorage` (guarded, so private modes still work). In `overlay`
 * mode — chosen with `mode`, or automatically when the viewport is under 48rem — it becomes an
 * off-canvas panel controlled by `open`, with a backdrop, Escape to close, initial focus inside and
 * a Tab loop (FR-SIDEBAR-04), returning focus to where it came from. Inside `bx-page`'s navigation
 * slot (FR-SIDEBAR-01) use `mode="inline"` so `bx-page`'s own drawer handles narrow widths, rather
 * than nesting two overlays. Collapsed parents do not open a flyout menu: activating one expands
 * the sidebar.
 *
 * @fires bx-collapse-change - `collapsed` changed. `detail.collapsed`.
 * @fires bx-show - Overlay is opening. Cancelable.
 * @fires bx-hide - Overlay is closing. Cancelable.
 * @fires bx-navigate - From `bx-sidebar-item`. `detail.href`, cancelable.
 *
 * @slot header - Brand / workspace switcher.
 * @slot (default) - `bx-sidebar-group` / `bx-sidebar-item`.
 * @slot footer - User menu.
 *
 * @csspart base - The base part.
 * @csspart header - The header part.
 * @csspart content - The content part.
 * @csspart footer - The footer part.
 * @csspart toggle - Collapse button.
 *
 * @cssprop --bx-sidebar-width - Expanded width.
 * @cssprop --bx-sidebar-width-collapsed - Rail width.
 * @cssprop --bx-sidebar-bg - Background.
 */
export class BxSidebar extends BixElement {
  static override tagName = 'bx-sidebar';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        block-size: 100%;
        ${textFamily('--bx-sidebar', 'label')}
        --_w: var(--bx-sidebar-width, calc(var(--bx-unit) * 16));
        --_wc: var(
          --bx-sidebar-width-collapsed,
          max(calc(var(--bx-unit) * 4), var(--bx-target-min))
        );
      }
      .base {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        inline-size: var(--_w);
        block-size: 100%;
        background: var(--bx-sidebar-bg, var(--bx-surface-base));
        border-inline-end: var(--bx-border-width) solid var(--bx-border-subtle);
        color: var(--bx-text-primary);
        transition: inline-size var(--bx-motion-duration-base)
          var(--bx-motion-easing-standard);
      }
      :host([collapsed]) .base {
        inline-size: var(--_wc);
      }
      .header,
      .footer {
        flex: none;
        padding: var(--bx-space-xs);
      }
      .content {
        flex: 1 1 auto;
        overflow-x: hidden;
        overflow-y: auto;
        padding: var(--bx-space-xs);
      }
      .footer {
        border-block-start: var(--bx-border-width) solid var(--bx-border-subtle);
      }
      .toggle-row {
        flex: none;
        display: flex;
        justify-content: flex-end;
        padding: var(--bx-space-2xs) var(--bx-space-xs);
      }
      :host([collapsed]) .toggle-row {
        justify-content: center;
      }
      :host([collapsed]) .header,
      :host([collapsed]) .footer {
        padding-inline: var(--bx-space-3xs);
        overflow: hidden;
      }

      /* Overlay mode: off-canvas, above the page. */
      :host([data-overlay]) {
        position: fixed;
        inset-block: 0;
        inset-inline-start: 0;
        z-index: var(--bx-z-drawer, 1000);
        pointer-events: none;
      }
      :host([data-overlay]) .base {
        position: relative;
        z-index: 1;
        inline-size: min(var(--_w), 85vw);
        pointer-events: auto;
        box-shadow: var(--bx-shadow-l);
        translate: -100% 0;
        visibility: hidden;
        transition:
          translate var(--bx-motion-duration-base)
            var(--bx-motion-easing-standard),
          visibility 0s linear var(--bx-motion-duration-base);
      }
      :host([data-overlay]:dir(rtl)) .base {
        translate: 100% 0;
      }
      :host([data-overlay][open]) .base {
        translate: 0 0;
        visibility: visible;
        transition-delay: 0s;
      }
      .backdrop {
        position: fixed;
        inset: 0;
        background: color-mix(in srgb, black 45%, transparent);
        pointer-events: auto;
      }
      @media (prefers-reduced-motion: reduce) {
        .base {
          transition: none !important;
        }
      }
    `,
  ];

  static override properties = {
    collapsed: { type: Boolean, reflect: true },
    collapsible: { type: Boolean },
    mode: { type: String },
    open: { type: Boolean, reflect: true },
    width: { type: String },
    persistKey: { type: String, attribute: 'persist-key' },
    label: { type: String },
    _narrow: { state: true },
  };

  declare collapsed: boolean;
  declare collapsible: boolean;
  declare mode?: 'inline' | 'overlay';
  declare open: boolean;
  declare width: string;
  declare persistKey: string;
  declare label: string;
  /** @internal */
  declare _narrow: boolean;

  #baseRef = createRef<HTMLElement>();
  #mq?: MediaQueryList;
  #returnFocus?: Element | null;

  constructor() {
    super();
    this.collapsed = false;
    this.collapsible = true;
    this.open = false;
    this.width = '';
    this.persistKey = '';
    this.label = 'Main navigation';
    this._narrow = false;
  }

  get #overlay(): boolean {
    return this.mode === 'overlay' || (this.mode === undefined && this._narrow);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#restore();
    this.#mq =
      typeof matchMedia === 'function' ? matchMedia(NARROW) : undefined;
    this._narrow = this.#mq?.matches ?? false;
    this.#mq?.addEventListener('change', this.#onMq);
    this.addEventListener('keydown', this.#onKeydown);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#mq?.removeEventListener('change', this.#onMq);
    this.removeEventListener('keydown', this.#onKeydown);
  }

  #onMq = (e: MediaQueryListEvent): void => {
    this._narrow = e.matches;
  };

  #restore(): void {
    if (!this.persistKey) return;
    try {
      const saved = localStorage.getItem(this.persistKey);
      if (saved === 'true' || saved === 'false')
        this.collapsed = saved === 'true';
    } catch {
      /* storage unavailable */
    }
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('width')) {
      if (this.width) this.style.setProperty('--bx-sidebar-width', this.width);
      else this.style.removeProperty('--bx-sidebar-width');
    }
  }

  protected override updated(changed: PropertyValues<this>): void {
    this.toggleAttribute('data-overlay', this.#overlay);
    if (changed.has('collapsed')) {
      for (const el of this.querySelectorAll<
        HTMLElement & { collapsed: boolean }
      >('bx-sidebar-item, bx-sidebar-group'))
        el.collapsed = this.collapsed && !this.#overlay;
      if (changed.get('collapsed') !== undefined) {
        this.dispatchEvent(
          new CustomEvent('bx-collapse-change', {
            bubbles: true,
            composed: true,
            detail: { collapsed: this.collapsed },
          }),
        );
        if (this.persistKey) {
          try {
            localStorage.setItem(this.persistKey, String(this.collapsed));
          } catch {
            /* storage unavailable */
          }
        }
      }
    }
    if (
      changed.has('open') &&
      changed.get('open') !== undefined &&
      this.#overlay
    ) {
      if (this.open) {
        this.#returnFocus = document.activeElement;
        this.updateComplete.then(() => this.#focusables()[0]?.focus());
      } else {
        (this.#returnFocus as HTMLElement | null)?.focus?.();
      }
    }
  }

  // --- API -------------------------------------------------------------------------------------

  toggle(): void {
    this.collapsed ? this.expand() : this.collapse();
  }

  collapse(): void {
    if (this.collapsible) this.collapsed = true;
  }

  expand(): void {
    this.collapsed = false;
  }

  show(): void {
    if (this.open) return;
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
  }

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
  }

  // --- focus loop ------------------------------------------------------------------------------

  #focusables(): HTMLElement[] {
    const found: HTMLElement[] = [];
    const walk = (root: ParentNode) => {
      for (const el of root.querySelectorAll<HTMLElement>('*')) {
        if (
          el.matches(FOCUSABLE) &&
          !el.hasAttribute('disabled') &&
          el.offsetParent !== null
        )
          found.push(el);
        if (el.shadowRoot) walk(el.shadowRoot);
      }
    };
    walk(this.shadowRoot!);
    walk(this);
    return found.filter((el, i, all) => all.indexOf(el) === i);
  }

  #onKeydown = (event: KeyboardEvent): void => {
    if (!this.#overlay || !this.open) return;
    if (event.key === 'Escape') {
      event.stopPropagation();
      this.hide();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = this.#focusables();
    if (!items.length) return;
    const active = deepActive();
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last!.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first!.focus();
    }
  };

  protected override render() {
    const overlay = this.#overlay;
    const collapsed = this.collapsed && !overlay;
    return html`
      ${
        overlay && this.open
          ? html`<div class="backdrop" @click=${() => this.hide()}></div>`
          : nothing
      }
      <nav
        ${ref(this.#baseRef)}
        class="base"
        part="base"
        aria-label=${this.label}
        ?inert=${overlay && !this.open}
      >
        <div class="header" part="header"><slot name="header"></slot></div>
        <div class="content" part="content">
          <slot @slotchange=${this.#propagate}></slot>
        </div>
        ${
          this.collapsible && !overlay
            ? html`<div class="toggle-row">
                <bx-icon-button
                  part="toggle"
                  size="s"
                  name=${collapsed ? 'chevron-right' : 'chevron-left'}
                  label=${collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  aria-expanded=${collapsed ? 'false' : 'true'}
                  @click=${() => this.toggle()}
                ></bx-icon-button>
              </div>`
            : nothing
        }
        <div class="footer" part="footer"><slot name="footer"></slot></div>
      </nav>
    `;
  }

  #propagate = (): void => {
    const collapsed = this.collapsed && !this.#overlay;
    for (const el of this.querySelectorAll<
      HTMLElement & { collapsed: boolean }
    >('bx-sidebar-item, bx-sidebar-group'))
      el.collapsed = collapsed;
  };
}

function deepActive(): Element | null {
  let el = document.activeElement;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
  return el;
}
