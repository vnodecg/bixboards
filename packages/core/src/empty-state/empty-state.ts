import { css, html } from 'lit';
import { BixElement } from '../bix-element.ts';
import { textFamily, textStyle } from '../internal/text-style.ts';

type Variant = 'empty' | 'no-results' | 'error' | 'offline' | 'forbidden';

/** Default copy and icon per variant; overridable for localisation (FR-EMPTYSTATE-02). */
export const emptyStateCopy: Record<
  Variant,
  { heading: string; description: string; icon: string }
> = {
  empty: {
    heading: 'Nothing here yet',
    description: 'Items you add will show up here.',
    icon: 'info',
  },
  'no-results': {
    heading: 'No results found',
    description: 'Try adjusting your search or filters.',
    icon: 'info',
  },
  error: {
    heading: 'Something went wrong',
    description: 'Please try again in a moment.',
    icon: 'warning',
  },
  offline: {
    heading: "You're offline",
    description: 'Check your connection and try again.',
    icon: 'warning',
  },
  forbidden: {
    heading: 'Access denied',
    description: "You don't have permission to view this.",
    icon: 'warning',
  },
};

/**
 * `<bx-empty-state>` — placeholder for empty lists, no-result searches and errors
 * (docs/features/core/empty-state.md).
 *
 * Presentational (FR-EMPTYSTATE-01). `variant` selects a default icon and copy from
 * {@link emptyStateCopy}; `heading`/`description` and the `media` slot override them. The heading is
 * `role="heading"` at a configurable `heading-level` (FR-EMPTYSTATE-03, default 3) so it never
 * breaks the document outline. Not yet wired into `bx-data-table`/`bx-data-list`.
 *
 * @slot media - Illustration or icon.
 * @slot (default) - Extra content.
 * @slot actions - Buttons.
 *
 * @csspart base - The base part.
 * @csspart media - The media part.
 * @csspart heading - The heading part.
 * @csspart description - The description part.
 * @csspart actions - The actions part.
 *
 * @cssprop --bx-empty-state-max-width - Content width.
 * @cssprop --bx-empty-state-media-size - Illustration size.
 * @cssprop --bx-empty-state-font-family - Font family of the root surface. Default `var(--bx-type-body-family)`.
 * @cssprop --bx-empty-state-description-font-family - Font family of the `description` text (text style `body-m`). Default `var(--bx-type-body-family)`.
 * @cssprop --bx-empty-state-description-font-size - Font size of the `description` text (text style `body-m`). Default `var(--bx-type-body-m-size)`.
 * @cssprop --bx-empty-state-description-font-weight - Font weight of the `description` text (text style `body-m`). Default `var(--bx-type-body-m-weight)`.
 * @cssprop --bx-empty-state-description-line-height - Line height of the `description` text (text style `body-m`). Default `var(--bx-type-body-m-leading)`.
 * @cssprop --bx-empty-state-description-letter-spacing - Letter spacing of the `description` text (text style `body-m`). Default `var(--bx-type-body-m-tracking)`.
 * @cssprop --bx-empty-state-heading-font-family - Font family of the `heading` text (text style `heading-s`). Default `var(--bx-type-heading-family)`.
 * @cssprop --bx-empty-state-heading-font-size - Font size of the `heading` text (text style `heading-s`). Default `var(--bx-type-heading-s-size)`.
 * @cssprop --bx-empty-state-heading-font-weight - Font weight of the `heading` text (text style `heading-s`). Default `var(--bx-type-heading-s-weight)`.
 * @cssprop --bx-empty-state-heading-line-height - Line height of the `heading` text (text style `heading-s`). Default `var(--bx-type-heading-s-leading)`.
 * @cssprop --bx-empty-state-heading-letter-spacing - Letter spacing of the `heading` text (text style `heading-s`). Default `var(--bx-type-heading-s-tracking)`.
 */
export class BxEmptyState extends BixElement {
  static override tagName = 'bx-empty-state';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        ${textFamily('--bx-empty-state', 'body')}
        --_media: calc(var(--bx-unit) * 4);
      }
      :host([size='s']) {
        --_media: calc(var(--bx-unit) * 2.5);
      }
      :host([size='l']) {
        --_media: calc(var(--bx-unit) * 6);
      }
      .base {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--bx-space-s);
        margin-inline: auto;
        max-inline-size: var(
          --bx-empty-state-max-width,
          calc(var(--bx-unit) * 28)
        );
        padding: var(--bx-space-l);
        text-align: center;
      }
      .media {
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: var(--bx-empty-state-media-size, var(--_media));
        block-size: var(--bx-empty-state-media-size, var(--_media));
        color: var(--bx-text-secondary);
        --bx-icon-size: 100%;
      }
      .heading {
        margin: 0;
        color: var(--bx-text-primary);
        ${textStyle('--bx-empty-state-heading', 'heading-s')}
      }
      .description {
        margin: 0;
        color: var(--bx-text-secondary);
        ${textStyle('--bx-empty-state-description', 'body-m')}
      }
      .description:empty {
        display: none;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: var(--bx-space-xs);
      }
      .actions:not(:has(::slotted(*))) {
        display: none;
      }
    `,
  ];

  static override properties = {
    heading: { type: String },
    description: { type: String },
    variant: { type: String, reflect: true },
    size: { type: String, reflect: true },
    headingLevel: { type: Number, attribute: 'heading-level' },
  };

  declare heading: string;
  declare description: string;
  declare variant: Variant;
  declare size: 's' | 'm' | 'l';
  declare headingLevel: number;

  constructor() {
    super();
    this.heading = '';
    this.description = '';
    this.variant = 'empty';
    this.size = 'm';
    this.headingLevel = 3;
  }

  protected override render() {
    const copy = emptyStateCopy[this.variant] ?? emptyStateCopy.empty;
    const level = Math.min(Math.max(Math.round(this.headingLevel) || 3, 1), 6);
    return html`<div class="base" part="base">
      <div class="media" part="media">
        <slot name="media"
          ><bx-icon name=${copy.icon} aria-hidden="true"></bx-icon
        ></slot>
      </div>
      <p class="heading" part="heading" role="heading" aria-level=${level}>
        ${this.heading || copy.heading}
      </p>
      <p class="description" part="description">
        ${this.description || copy.description}
      </p>
      <slot></slot>
      <div class="actions" part="actions"><slot name="actions"></slot></div>
    </div>`;
  }
}
