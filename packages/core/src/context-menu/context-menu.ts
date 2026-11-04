import { css, html, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';
import type { BxDropdown } from '../dropdown/dropdown.ts';

const LONG_PRESS_MS = 500;

/**
 * `<bx-context-menu>` — right-click / long-press menu anchored at the pointer
 * (docs/features/core/context-menu.md).
 *
 * Composes `bx-dropdown`: its positioning (flip/shift at viewport edges, FR-CONTEXTMENU-02) and its
 * whole keyboard model, typeahead and submenus (FR-CONTEXTMENU-04) are reused as-is; this element
 * only supplies a zero-size virtual trigger placed at the pointer. Opens on `contextmenu`, on a
 * touch long-press, and on Shift+F10 / the Menu key at the focused target (FR-CONTEXTMENU-01). The
 * native menu is suppressed only while enabled for that target (FR-CONTEXTMENU-03). The target is
 * the element named by `for`, else the parent element (the host when in a shadow root).
 *
 * @fires bx-select - An item was activated; `detail.item`.
 * @fires bx-show - The menu is opening. Cancelable.
 * @fires bx-after-show - The menu opened.
 * @fires bx-hide - The menu is closing.
 * @fires bx-after-hide - The menu closed.
 *
 * @slot (default) - `bx-dropdown-item` children, dividers, submenus.
 *
 * @csspart menu - The menu part.
 * @csspart panel - The panel part.
 *
 * @cssprop --bx-context-menu-min-width - Min width.
 */
export class BxContextMenu extends BixElement {
  static override tagName = 'bx-context-menu';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: contents;
      }
      .anchor {
        position: fixed;
        inline-size: 0;
        block-size: 0;
        pointer-events: none;
      }
      bx-dropdown {
        --bx-dropdown-menu-min-width: var(--bx-context-menu-min-width, 12rem);
        min-inline-size: var(--bx-context-menu-min-width);
      }
      bx-dropdown::part(menu) {
        min-inline-size: var(--bx-context-menu-min-width, 12rem);
      }
    `,
  ];

  static override properties = {
    for: { type: String },
    disabled: { type: Boolean, reflect: true },
    open: { type: Boolean, reflect: true },
  };

  declare for: string;
  declare disabled: boolean;
  declare open: boolean;

  #target?: EventTarget;
  #x = 0;
  #y = 0;
  #pressTimer?: ReturnType<typeof setTimeout>;
  #pressOrigin?: { x: number; y: number };

  constructor() {
    super();
    this.for = '';
    this.disabled = false;
    this.open = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#attach();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#detach();
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('for') && changed.get('for') !== undefined) {
      this.#detach();
      this.#attach();
    }
  }

  get #dropdown(): BxDropdown | null {
    return this.shadowRoot?.querySelector('bx-dropdown') ?? null;
  }

  #resolveTarget(): EventTarget | null {
    if (this.for) {
      const root = this.getRootNode() as Document | ShadowRoot;
      return (
        root.getElementById?.(this.for) ?? document.getElementById(this.for)
      );
    }
    const parent = this.parentElement;
    if (parent) return parent;
    const root = this.getRootNode();
    return root instanceof ShadowRoot ? root.host : null;
  }

  #attach(): void {
    const target = this.#resolveTarget();
    if (!target) return;
    this.#target = target;
    target.addEventListener(
      'contextmenu',
      this.#onContextMenu as EventListener,
    );
    target.addEventListener('keydown', this.#onKeydown as EventListener);
    target.addEventListener(
      'pointerdown',
      this.#onPointerDown as EventListener,
    );
    target.addEventListener(
      'pointermove',
      this.#onPointerMove as EventListener,
    );
    target.addEventListener('pointerup', this.#cancelPress);
    target.addEventListener('pointercancel', this.#cancelPress);
  }

  #detach(): void {
    const target = this.#target;
    if (!target) return;
    target.removeEventListener(
      'contextmenu',
      this.#onContextMenu as EventListener,
    );
    target.removeEventListener('keydown', this.#onKeydown as EventListener);
    target.removeEventListener(
      'pointerdown',
      this.#onPointerDown as EventListener,
    );
    target.removeEventListener(
      'pointermove',
      this.#onPointerMove as EventListener,
    );
    target.removeEventListener('pointerup', this.#cancelPress);
    target.removeEventListener('pointercancel', this.#cancelPress);
    this.#cancelPress();
    this.#target = undefined;
  }

  #onContextMenu = (event: MouseEvent): void => {
    if (this.disabled) return;
    // A nested context-menu on a deeper target already handled this event.
    if (event.defaultPrevented) return;
    event.preventDefault();
    this.show(event.clientX, event.clientY);
  };

  #onKeydown = (event: KeyboardEvent): void => {
    if (this.disabled) return;
    if (!(
      event.key === 'ContextMenu' ||
      (event.key === 'F10' && event.shiftKey)
    ))
      return;
    event.preventDefault();
    const el = (event.target as Element) ?? (this.#target as Element);
    const rect = el.getBoundingClientRect?.();
    this.show(rect ? rect.left + 8 : 0, rect ? rect.top + rect.height / 2 : 0);
  };

  #onPointerDown = (event: PointerEvent): void => {
    if (this.disabled || event.pointerType !== 'touch') return;
    this.#pressOrigin = { x: event.clientX, y: event.clientY };
    this.#pressTimer = setTimeout(
      () => this.show(this.#pressOrigin!.x, this.#pressOrigin!.y),
      LONG_PRESS_MS,
    );
  };

  #onPointerMove = (event: PointerEvent): void => {
    const o = this.#pressOrigin;
    if (o && Math.hypot(event.clientX - o.x, event.clientY - o.y) > 10)
      this.#cancelPress();
  };

  #cancelPress = (): void => {
    clearTimeout(this.#pressTimer);
    this.#pressTimer = undefined;
    this.#pressOrigin = undefined;
  };

  /** Opens the menu at viewport coordinates. */
  show(x: number, y: number): void {
    if (this.disabled) return;
    this.#x = x;
    this.#y = y;
    const anchor = this.shadowRoot?.querySelector<HTMLElement>('.anchor');
    if (anchor) {
      anchor.style.left = `${x}px`;
      anchor.style.top = `${y}px`;
    }
    const dropdown = this.#dropdown;
    if (!dropdown) return;
    if (dropdown.open) dropdown.hide();
    dropdown.show();
  }

  /** Closes the menu. */
  hide(): void {
    this.#dropdown?.hide();
  }

  protected override render() {
    return html`<bx-dropdown
      part="menu"
      placement="bottom-start"
      distance="0"
      @bx-after-show=${() => (this.open = true)}
      @bx-after-hide=${() => (this.open = false)}
    >
      <span
        class="anchor"
        slot="trigger"
        role="button"
        aria-hidden="true"
        style="left:${this.#x}px;top:${this.#y}px"
      ></span>
      <slot></slot>
    </bx-dropdown>`;
  }
}
