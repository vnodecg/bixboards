import { css, html } from 'lit';
import { BixElement } from '../bix-element.ts';
import { observeIntersection } from '../internal/shared-observers.ts';

/**
 * `<bx-intersection-observer>` — declaratively observes its own intersection with a root (default
 * the viewport), toggling `intersect-class` on the host and firing `bx-intersect` on change.
 *
 * Wraps the shared, options-keyed `IntersectionObserver` pool
 * (`internal/shared-observers.ts`, FR-INTERSECTION-OBSERVER-01) rather than creating its own
 * observer, so many instances sharing a `(root, root-margin, threshold)` triple share one native
 * observer.
 *
 * @fires bx-intersect - The intersection state changed. `detail: { entries: IntersectionObserverEntry[] }`.
 *
 * @slot (default) - Content whose visibility is tracked.
 */
export class BxIntersectionObserver extends BixElement {
  static override tagName = 'bx-intersection-observer';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: contents;
      }
    `,
  ];

  static override properties = {
    root: { type: String },
    rootMargin: { type: String, attribute: 'root-margin' },
    threshold: { type: String },
    intersectClass: { type: String, attribute: 'intersect-class' },
    once: { type: Boolean },
    disabled: { type: Boolean },
  };

  declare root?: string;
  declare rootMargin: string;
  declare threshold: string;
  declare intersectClass: string;
  declare once: boolean;
  declare disabled: boolean;

  #unobserve?: () => void;
  #hasIntersected = false;

  constructor() {
    super();
    this.rootMargin = '0px';
    this.threshold = '0';
    this.intersectClass = 'intersect';
    this.once = false;
    this.disabled = false;
  }

  #teardown(): void {
    this.#unobserve?.();
    this.#unobserve = undefined;
  }

  #setup(): void {
    this.#teardown();
    if (this.disabled) return;
    if (this.once && this.#hasIntersected) return;

    const rootEl = this.root
      ? (document.querySelector(this.root) ?? undefined)
      : undefined;
    const threshold = this.threshold
      .split(',')
      .map((value) => Number.parseFloat(value.trim()))
      .filter((value) => !Number.isNaN(value));

    this.#unobserve = observeIntersection(
      this,
      (entry) => {
        this.classList.toggle(this.intersectClass, entry.isIntersecting);
        if (entry.isIntersecting) this.#hasIntersected = true;

        this.dispatchEvent(
          new CustomEvent('bx-intersect', {
            bubbles: true,
            composed: true,
            detail: { entries: [entry] },
          }),
        );

        if (this.once && entry.isIntersecting) this.#teardown();
      },
      { root: rootEl, rootMargin: this.rootMargin, threshold },
    );
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
    if (
      changed.has('root') ||
      changed.has('rootMargin') ||
      changed.has('threshold') ||
      changed.has('disabled')
    )
      this.#setup();
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}
