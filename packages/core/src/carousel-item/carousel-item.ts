import { css, html } from 'lit';
import { BixElement } from '../bix-element.ts';

/**
 * `<bx-carousel-item>` — a single slide.
 *
 * Deliberately stateless (FR-CAROUSEL-ITEM-01): no index/position tracking, no snap logic of its
 * own. Scroll-snap alignment is declared by the parent `bx-carousel` through the
 * `--bx-carousel-item-snap-align` custom property rather than a hardcoded `scroll-snap-align` — an
 * item with no carousel parent (e.g. rendered standalone in a test or story) still lays out
 * correctly, it just doesn't snap.
 *
 * `role="group"` and its position label (docs/features/core/carousel-item.md §6) go on the host
 * itself, the same host-attribute pattern `bx-divider` uses — there are no interactive parts or
 * slots to hang them on, and the spec lists no CSS parts for this component.
 *
 * @slot (default) - Slide content.
 *
 * @cssprop --aspect-ratio - Slide aspect ratio. Unset by default (sizes to content/container).
 * @cssprop --bx-carousel-item-snap-align - Scroll-snap alignment set by the parent carousel.
 *   Default `start`.
 */
export class BxCarouselItem extends BixElement {
  static override tagName = 'bx-carousel-item';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        position: relative;
        flex: none;
        inline-size: 100%;
        aspect-ratio: var(--aspect-ratio, auto);
        scroll-snap-align: var(--bx-carousel-item-snap-align, start);
      }

      ::slotted(*) {
        display: block;
        inline-size: 100%;
        block-size: 100%;
        object-fit: cover;
      }
    `,
  ];

  static override properties = {
    label: { type: String },
  };

  /** Accessible position label (e.g. "2 of 5"); set by the parent carousel. */
  declare label?: string;

  protected override updated(): void {
    this.setAttribute('role', 'group');
    if (this.label) this.setAttribute('aria-label', this.label);
    else this.removeAttribute('aria-label');
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}
