import { css, html } from 'lit';
import { BixElement } from '../bix-element.ts';
import type { BxTimelineItem } from '../timeline-item/timeline-item.ts';

/**
 * `<bx-timeline>` — chronological list of events (docs/features/core/timeline.md).
 *
 * `role="list"` of `bx-timeline-item` children (FR-TIMELINE-01). It stamps each item with its
 * `position` (`alternate` layout), `orientation` and `last`, re-running on slot changes. In
 * `alternate` layout the items collapse to one side below 32rem of container width
 * (FR-TIMELINE-02, handled by each item's container query against this element). For very long
 * timelines compose `bx-data-list` instead (FR-TIMELINE-03); this element renders every item.
 *
 * @slot (default) - `bx-timeline-item` children.
 *
 * @csspart base - The base part.
 *
 * @cssprop --bx-timeline-marker-size - Marker size.
 * @cssprop --bx-timeline-connector-color - Line color.
 * @cssprop --bx-timeline-font-family - Font family of the item text. Default `var(--bx-type-body-family)`.
 * @cssprop --bx-timeline-time-font-family - Font family of the `time` text (text style `caption-m`). Default `var(--bx-type-caption-family)`.
 * @cssprop --bx-timeline-time-font-size - Font size of the `time` text (text style `caption-m`). Default `var(--bx-type-caption-m-size)`.
 * @cssprop --bx-timeline-time-font-weight - Font weight of the `time` text (text style `caption-m`). Default `var(--bx-type-caption-m-weight)`.
 * @cssprop --bx-timeline-time-line-height - Line height of the `time` text (text style `caption-m`). Default `var(--bx-type-caption-m-leading)`.
 * @cssprop --bx-timeline-time-letter-spacing - Letter spacing of the `time` text (text style `caption-m`). Default `var(--bx-type-caption-m-tracking)`.
 * @cssprop --bx-timeline-heading-font-family - Font family of the `heading` text (text style `label-l`). Default `var(--bx-type-label-family)`.
 * @cssprop --bx-timeline-heading-font-size - Font size of the `heading` text (text style `label-l`). Default `var(--bx-type-label-l-size)`.
 * @cssprop --bx-timeline-heading-font-weight - Font weight of the `heading` text (text style `label-l`). Default `var(--bx-type-label-l-weight)`.
 * @cssprop --bx-timeline-heading-line-height - Line height of the `heading` text (text style `label-l`). Default `var(--bx-type-label-l-leading)`.
 * @cssprop --bx-timeline-heading-letter-spacing - Letter spacing of the `heading` text (text style `label-l`). Default `var(--bx-type-label-l-tracking)`.
 * @cssprop --bx-timeline-description-font-family - Font family of the `description` text (text style `body-m`). Default `var(--bx-type-body-family)`.
 * @cssprop --bx-timeline-description-font-size - Font size of the `description` text (text style `body-m`). Default `var(--bx-type-body-m-size)`.
 * @cssprop --bx-timeline-description-font-weight - Font weight of the `description` text (text style `body-m`). Default `var(--bx-type-body-m-weight)`.
 * @cssprop --bx-timeline-description-line-height - Line height of the `description` text (text style `body-m`). Default `var(--bx-type-body-m-leading)`.
 * @cssprop --bx-timeline-description-letter-spacing - Letter spacing of the `description` text (text style `body-m`). Default `var(--bx-type-body-m-tracking)`.
 */
export class BxTimeline extends BixElement {
  static override tagName = 'bx-timeline';

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
      }
      :host([orientation='horizontal']) .base {
        flex-direction: row;
        gap: var(--bx-space-s);
      }
    `,
  ];

  static override properties = {
    layout: { type: String, reflect: true },
    orientation: { type: String, reflect: true },
    size: { type: String, reflect: true },
  };

  declare layout: 'start' | 'alternate';
  declare orientation: 'vertical' | 'horizontal';
  declare size: 's' | 'm' | 'l';

  constructor() {
    super();
    this.layout = 'start';
    this.orientation = 'vertical';
    this.size = 'm';
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'list');
  }

  protected override updated(): void {
    this.#stamp();
  }

  #stamp = (): void => {
    const items = [...this.children].filter(
      (c) => c.localName === 'bx-timeline-item',
    ) as BxTimelineItem[];
    items.forEach((item, i) => {
      item.orientation = this.orientation;
      item.last = i === items.length - 1;
      item.position =
        this.layout === 'alternate' && this.orientation === 'vertical'
          ? i % 2 === 0
            ? 'end'
            : 'start'
          : undefined;
      if (item.position === undefined) item.removeAttribute('position');
    });
  };

  protected override render() {
    return html`<div class="base" part="base">
      <slot @slotchange=${this.#stamp}></slot>
    </div>`;
  }
}
