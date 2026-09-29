import { css, html } from 'lit';
import { BixElement } from '../bix-element.ts';
import { observeResize } from '../internal/shared-observers.ts';

/**
 * `<bx-resize-observer>` — declaratively observes its own box size, firing `bx-resize` on change.
 *
 * Wraps the page-wide shared `ResizeObserver` (`internal/shared-observers.ts`,
 * FR-RESIZE-OBSERVER-02) rather than creating its own, and coalesces the native callback's
 * delivery to one `requestAnimationFrame` per instance (FR-RESIZE-OBSERVER-01) so listeners that
 * themselves trigger layout (common with resize-driven code) run outside the observer's own
 * callback turn, avoiding "ResizeObserver loop" warnings.
 *
 * @fires bx-resize - The observed box size changed. `detail: { entries: ResizeObserverEntry[] }`.
 *
 * @slot (default) - Content whose size is tracked.
 */
export class BxResizeObserver extends BixElement {
  static override tagName = 'bx-resize-observer';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: contents;
      }
    `,
  ];

  static override properties = {
    disabled: { type: Boolean },
  };

  declare disabled: boolean;

  #unobserve?: () => void;
  #rafId?: number;
  #pendingEntry?: ResizeObserverEntry;

  constructor() {
    super();
    this.disabled = false;
  }

  #teardown(): void {
    this.#unobserve?.();
    this.#unobserve = undefined;
    if (this.#rafId !== undefined) cancelAnimationFrame(this.#rafId);
    this.#rafId = undefined;
    this.#pendingEntry = undefined;
  }

  #setup(): void {
    this.#teardown();
    if (this.disabled) return;

    this.#unobserve = observeResize(this, (entry) => {
      this.#pendingEntry = entry;
      if (this.#rafId !== undefined) return;
      this.#rafId = requestAnimationFrame(() => {
        this.#rafId = undefined;
        const pending = this.#pendingEntry;
        this.#pendingEntry = undefined;
        if (!pending) return;
        this.dispatchEvent(
          new CustomEvent('bx-resize', {
            bubbles: true,
            composed: true,
            detail: { entries: [pending] },
          }),
        );
      });
    });
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#setup();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#teardown();
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has('disabled')) this.#setup();
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}
