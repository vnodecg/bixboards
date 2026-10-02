import { css, html, nothing, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';
import { textStyle } from '../internal/text-style.ts';

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
 * @cssprop --bx-avatar-bg - Background of the root surface. Default `var(--bx-surface-muted)`.
 * @cssprop --bx-avatar-fg - Text/icon color of the root surface. Default `var(--bx-text-secondary)`.
 * @cssprop --bx-avatar-border-width - Border width of the root surface. Default `var(--bx-border-width)`.
 * @cssprop --bx-avatar-border-color - Border color of the root surface. Default `var(--bx-border-subtle)`.
 * @cssprop --bx-avatar-radius - Corner radius of the root surface. Default `var(--bx-radius-pill)`.
 * @cssprop --bx-avatar-font-family - Font family of the root surface (text style `heading-xs`). Default `var(--bx-type-heading-family)`.
 * @cssprop --bx-avatar-font-size - Font size of the root surface (text style `heading-xs`). Default `var(--bx-type-heading-xs-size)`.
 * @cssprop --bx-avatar-font-weight - Font weight of the root surface (text style `heading-xs`). Default `var(--bx-type-heading-xs-weight)`.
 * @cssprop --bx-avatar-line-height - Line height of the root surface (text style `heading-xs`). Default `var(--bx-type-heading-xs-leading)`.
 * @cssprop --bx-avatar-letter-spacing - Letter spacing of the root surface (text style `heading-xs`). Default `var(--bx-type-heading-xs-tracking)`.
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
        background: var(--bx-avatar-bg, var(--bx-surface-muted));
        color: var(--bx-avatar-fg, var(--bx-text-secondary));

        ${textStyle('--bx-avatar', 'heading-xs', { size: '40cqi', leading: '1' })}

        text-transform: uppercase;
        container-type: inline-size;
        border: var(--bx-avatar-border-width, var(--bx-border-width)) solid
          var(--bx-avatar-border-color, var(--bx-border-subtle));
      }

      :host([shape='circle']) .base,
      :host(:not([shape])) .base {
        border-radius: var(--bx-avatar-radius, var(--bx-radius-pill));
      }
      :host([shape='square']) .base {
        border-radius: 0;
      }
      :host([shape='rounded']) .base {
        border-radius: var(--bx-avatar-radius, var(--bx-radius-m));
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
