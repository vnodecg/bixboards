import { css, html, nothing, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';

type Shape = 'circle' | 'square' | 'rounded';
type Loading = 'eager' | 'lazy';

/**
 * `<bx-avatar>` — user image, initials or icon with shape variants.
 *
 * Falls back `image` → `initials` → `icon` slot on load error or when a property is unset, so a
 * consumer can pass all three and always get something sensible rendered.
 *
 * @fires bx-error - The `image` failed to load; the avatar has fallen back to initials/icon.
 *
 * @slot icon - Fallback glyph shown when there is no `image` (or it failed) and no `initials`.
 * @slot (default) - Custom content, rendered instead of image/initials/icon when present.
 *
 * @csspart base - The host's inner wrapper.
 * @csspart image - The `<img>` element, present while an image is loaded.
 * @csspart initials - The initials text, present as a fallback.
 * @csspart icon - The icon slot wrapper, present as the final fallback.
 *
 * @cssprop --bx-avatar-size - Diameter/side length. Default a fluid step (`calc(var(--bx-unit) * 2.5)`).
 */
export class BxAvatar extends BixElement {
  static override tagName = 'bx-avatar';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-block;
        inline-size: var(--bx-avatar-size, calc(var(--bx-unit) * 2.5));
        block-size: var(--bx-avatar-size, calc(var(--bx-unit) * 2.5));
        flex-shrink: 0;
      }

      .base {
        position: relative;
        inline-size: 100%;
        block-size: 100%;
        display: grid;
        place-items: center;
        overflow: hidden;
        background: var(--bx-surface-muted);
        color: var(--bx-text-secondary);
        font-family: var(--bx-font-family-sans);
        font-weight: var(--bx-font-weight-semibold);
        font-size: 40cqi;
        line-height: 1;
        text-transform: uppercase;
        container-type: inline-size;
        border: var(--bx-border-width) solid var(--bx-border-subtle);
      }

      :host([shape='circle']) .base,
      :host(:not([shape])) .base {
        border-radius: var(--bx-radius-pill);
      }
      :host([shape='square']) .base {
        border-radius: 0;
      }
      :host([shape='rounded']) .base {
        border-radius: var(--bx-radius-m);
      }

      img {
        inline-size: 100%;
        block-size: 100%;
        object-fit: cover;
        display: block;
      }

      ::slotted(*) {
        display: block;
        inline-size: 1em;
        block-size: 1em;
        font-size: 45cqi;
      }

      slot[hidden] {
        display: none;
      }

      @media (forced-colors: active) {
        .base {
          forced-color-adjust: none;
          background: Canvas;
          color: CanvasText;
          border-color: CanvasText;
        }
      }
    `,
  ];

  static override properties = {
    image: { type: String },
    label: { type: String },
    initials: { type: String },
    loading: { type: String },
    shape: { type: String, reflect: true },
    _imageFailed: { state: true },
    _hasCustomContent: { state: true },
  };

  declare image: string;
  declare label: string;
  declare initials: string;
  declare loading: Loading;
  declare shape: Shape;
  /** @internal */
  declare _imageFailed: boolean;
  /** @internal */
  declare _hasCustomContent: boolean;

  constructor() {
    super();
    this.image = '';
    this.label = '';
    this.initials = '';
    this.loading = 'eager';
    this.shape = 'circle';
    this._imageFailed = false;
    this._hasCustomContent = false;
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('image')) this._imageFailed = false;
  }

  #handleImageError = (): void => {
    this._imageFailed = true;
    this.dispatchEvent(
      new CustomEvent('bx-error', { bubbles: true, composed: true }),
    );
  };

  #handleDefaultSlotChange = (event: Event): void => {
    const slot = event.target as HTMLSlotElement;
    this._hasCustomContent = slot.assignedNodes({ flatten: true }).length > 0;
  };

  protected override render() {
    const showImage = !!this.image && !this._imageFailed;
    const showInitials = !showImage && !!this.initials;
    const label = this.label || this.initials || undefined;

    return html`
      <span class="base" part="base" role="img" aria-label=${label ?? nothing}>
        <slot
          @slotchange=${this.#handleDefaultSlotChange}
          ?hidden=${!this._hasCustomContent}
        ></slot>
        ${
          this._hasCustomContent
            ? nothing
            : showImage
              ? html`<img
                  part="image"
                  src=${this.image}
                  alt=""
                  loading=${this.loading}
                  @error=${this.#handleImageError}
                />`
              : showInitials
                ? html`<span part="initials">${this.initials}</span>`
                : html`<slot name="icon" part="icon"></slot>`
        }
      </span>
    `;
  }
}
