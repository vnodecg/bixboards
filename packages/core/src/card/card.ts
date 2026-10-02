import { css, html, nothing } from 'lit';
import { BixElement } from '../bix-element.ts';
import { textStyle, textFamily } from '../internal/text-style.ts';

type Appearance = 'accent' | 'filled' | 'outlined' | 'filled outlined';
type Orientation = 'horizontal' | 'vertical';

/**
 * `<bx-card>` — container with header, media, body, footer and actions.
 *
 * Each region (header/media/footer) is opt-in via its own boolean attribute rather than inferred
 * from slot content, so layout is correct on first paint (before hydration/slotchange can run) —
 * set `with-header`/`with-media`/`with-footer` alongside the matching named slot.
 *
 * `bx-card` does not imply a landmark role; add `role="article"` on the host when the card is a
 * standalone, independently-addressable piece of content (docs/features/core/card.md §6).
 *
 * @slot (default) - Body content.
 * @slot header - Header content, shown when `with-header`.
 * @slot header-actions - Trailing actions in the header, shown when `with-header`.
 * @slot media - Media content (image/video), shown when `with-media`.
 * @slot actions - Actions rendered after the body content.
 * @slot footer - Footer content, shown when `with-footer`.
 * @slot footer-actions - Trailing actions in the footer, shown when `with-footer`.
 *
 * @csspart base - The outer container.
 * @csspart media - The wrapper around the media slot.
 * @csspart header - The wrapper around the header slots.
 * @csspart body - The wrapper around the default and actions slots.
 * @csspart footer - The wrapper around the footer slots.
 *
 * @cssprop --bx-card-spacing - Padding and inter-region gap. Default `--bx-space-m`.
 * @cssprop --bx-card-radius - Corner radius. Default `--bx-radius-m`.
 * @cssprop --bx-card-fg - Text/icon color of the root surface. Default `var(--bx-text-primary)`.
 * @cssprop --bx-card-border-width - Border width of the root surface. Default `var(--bx-border-width)`.
 * @cssprop --bx-card-shadow - Box shadow of the root surface. Default `var(--bx-shadow-s)`.
 * @cssprop --bx-card-bg - Background of the root surface. Default `var(--bx-surface-subtle)`.
 * @cssprop --bx-card-border-color - Border color of the root surface. Default `var(--bx-border-subtle)`.
 * @cssprop --bx-card-font-family - Font family of the root surface. Default `var(--bx-type-body-family)`.
 * @cssprop --bx-card-header-font-family - Font family of the `header` part (text style `heading-xs`). Default `var(--bx-type-heading-family)`.
 * @cssprop --bx-card-header-font-size - Font size of the `header` part (text style `heading-xs`). Default `var(--bx-type-heading-xs-size)`.
 * @cssprop --bx-card-header-font-weight - Font weight of the `header` part (text style `heading-xs`). Default `var(--bx-type-heading-xs-weight)`.
 * @cssprop --bx-card-header-line-height - Line height of the `header` part (text style `heading-xs`). Default `var(--bx-type-heading-xs-leading)`.
 * @cssprop --bx-card-header-letter-spacing - Letter spacing of the `header` part (text style `heading-xs`). Default `var(--bx-type-heading-xs-tracking)`.
 */
export class BxCard extends BixElement {
  static override tagName = 'bx-card';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        container-type: inline-size;
      }

      .base {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-radius: var(--bx-card-radius, var(--bx-radius-m));
        ${textFamily('--bx-card', 'body')}
        color: var(--bx-card-fg, var(--bx-text-primary));
        background: transparent;
        border: var(--bx-card-border-width, var(--bx-border-width)) solid
          transparent;
      }

      :host([appearance~='outlined']) .base {
        box-shadow: var(--bx-card-shadow, var(--bx-shadow-s));
      }

      :host([appearance~='filled']) .base {
        background: var(--bx-card-bg, var(--bx-surface-subtle));
      }
      :host([appearance~='outlined']) .base {
        border-color: var(--bx-card-border-color, var(--bx-border-subtle));
      }
      :host([appearance='accent']) .base {
        background: var(--bx-card-bg, var(--bx-role-neutral-subtle));
      }

      :host([orientation='horizontal']) .base {
        flex-direction: row;
      }

      @container (max-width: 30rem) {
        :host([orientation='horizontal']) .base {
          flex-direction: column;
        }
      }

      .media ::slotted(*) {
        display: block;
        inline-size: 100%;
        block-size: 100%;
        object-fit: cover;
      }

      :host(:not([orientation='horizontal'])) .media {
        aspect-ratio: 16 / 9;
      }

      :host([orientation='horizontal']) .media {
        flex-shrink: 0;
        inline-size: 33%;
      }

      @container (max-width: 30rem) {
        :host([orientation='horizontal']) .media {
          inline-size: 100%;
          aspect-ratio: 16 / 9;
        }
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--bx-card-spacing, var(--bx-space-m));
        padding: var(--bx-card-spacing, var(--bx-space-m));
        padding-block-end: 0;

        ${textStyle('--bx-card-header', 'heading-xs')}
      }

      .body {
        flex: 1;
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: var(--bx-card-spacing, var(--bx-space-m));
        padding: var(--bx-card-spacing, var(--bx-space-m));
      }

      .footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--bx-card-spacing, var(--bx-space-m));
        padding: var(--bx-card-spacing, var(--bx-space-m));
        padding-block-start: 0;
      }

      :host([with-header]) .body {
        padding-block-start: 0;
      }

      :host([with-footer]) .body {
        padding-block-end: 0;
      }

      .actions:empty,
      .header:empty,
      .footer:empty {
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
    appearance: { type: String, reflect: true },
    withHeader: { type: Boolean, reflect: true, attribute: 'with-header' },
    withMedia: { type: Boolean, reflect: true, attribute: 'with-media' },
    withFooter: { type: Boolean, reflect: true, attribute: 'with-footer' },
    orientation: { type: String, reflect: true },
  };

  declare appearance: Appearance;
  declare withHeader: boolean;
  declare withMedia: boolean;
  declare withFooter: boolean;
  declare orientation: Orientation;

  constructor() {
    super();
    this.appearance = 'outlined';
    this.withHeader = false;
    this.withMedia = false;
    this.withFooter = false;
    this.orientation = 'vertical';
  }

  protected override render() {
    return html`
      <div class="base" part="base">
        ${
          this.withMedia
            ? html`
                <div class="media" part="media">
                  <slot name="media"></slot>
                </div>
              `
            : nothing
        }
        ${
          this.withHeader
            ? html`
                <div class="header" part="header">
                  <slot name="header"></slot>
                  <slot name="header-actions"></slot>
                </div>
              `
            : nothing
        }
        <div class="body" part="body">
          <slot></slot>
          <div class="actions"><slot name="actions"></slot></div>
        </div>
        ${
          this.withFooter
            ? html`
                <div class="footer" part="footer">
                  <slot name="footer"></slot>
                  <slot name="footer-actions"></slot>
                </div>
              `
            : nothing
        }
      </div>
    `;
  }
}
