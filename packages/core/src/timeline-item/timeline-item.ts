import { css, html, nothing } from 'lit';
import { BixElement } from '../bix-element.ts';
import { textFamily, textStyle } from '../internal/text-style.ts';

type Status = 'default' | 'secondary' | 'tertiary' | 'warning' | 'error';

const ROLE: Record<Status, string> = {
  default: 'brand',
  secondary: 'neutral',
  tertiary: 'tertiary',
  warning: 'warning',
  error: 'danger',
};

/**
 * `<bx-timeline-item>` — one event in a `bx-timeline` (docs/features/core/timeline.md).
 *
 * `time` (any `Date` string) renders through `bx-format-date`, or `bx-relative-time` with
 * `relative` (FR-TIMELINE-01). `bx-timeline` sets `position`, `orientation` and `last` on its
 * items; they are plain reflected properties, not for consumers to set.
 *
 * @slot (default) - Description content.
 * @slot icon - Marker content; overrides `icon`.
 * @slot time - Overrides the formatted `time`.
 *
 * @csspart item - The item surface.
 * @csspart marker - The marker part.
 * @csspart connector - The connector part.
 * @csspart time - The time part.
 * @csspart content - The content part.
 */
export class BxTimelineItem extends BixElement {
  static override tagName = 'bx-timeline-item';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        ${textFamily('--bx-timeline', 'body')}
        --_solid: var(--bx-role-neutral-solid);
        --_on-solid: var(--bx-role-neutral-on-solid);
        --_marker: var(--bx-timeline-marker-size, calc(var(--bx-unit) * 1.5));
      }
      :host([status='default']) {
        --_solid: var(--bx-role-brand-solid);
        --_on-solid: var(--bx-role-brand-on-solid);
      }
      :host([status='tertiary']) {
        --_solid: var(--bx-role-tertiary-solid);
        --_on-solid: var(--bx-role-tertiary-on-solid);
      }
      :host([status='warning']) {
        --_solid: var(--bx-role-warning-solid);
        --_on-solid: var(--bx-role-warning-on-solid);
      }
      :host([status='error']) {
        --_solid: var(--bx-role-danger-solid);
        --_on-solid: var(--bx-role-danger-on-solid);
      }

      .item {
        display: grid;
        grid-template-columns: var(--_marker) 1fr;
        column-gap: var(--bx-space-s);
      }
      .rail {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .marker {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        flex: none;
        inline-size: var(--_marker);
        block-size: var(--_marker);
        border-radius: 50%;
        background: var(--_solid);
        color: var(--_on-solid);
        font-size: 0.75em;
      }
      .connector {
        flex: 1 1 auto;
        inline-size: 2px;
        min-block-size: var(--bx-space-s);
        background: var(--bx-timeline-connector-color, var(--bx-border-subtle));
      }
      :host([last]) .connector {
        visibility: hidden;
      }
      .content {
        padding-block-end: var(--bx-space-l);
        min-inline-size: 0;
      }
      :host([last]) .content {
        padding-block-end: 0;
      }
      .time {
        color: var(--bx-text-secondary);
        ${textStyle('--bx-timeline-time', 'caption-m')}
      }
      .time:empty,
      .time:not(:has(*)):not(:has(::slotted(*))) {
        display: none;
      }
      .heading {
        margin: 0;
        color: var(--bx-text-primary);
        ${textStyle('--bx-timeline-heading', 'label-l')}
      }
      .description {
        color: var(--bx-text-secondary);
        ${textStyle('--bx-timeline-description', 'body-m')}
      }

      /* Alternate: content of start-positioned items hangs left of the rail. */
      :host([position='start']) .item {
        grid-template-columns: 1fr var(--_marker) 1fr;
      }
      :host([position='start']) .content {
        grid-column: 1;
        grid-row: 1;
        text-align: end;
      }
      :host([position='start']) .rail {
        grid-column: 2;
        grid-row: 1;
      }
      :host([position='end']) .item {
        grid-template-columns: 1fr var(--_marker) 1fr;
      }
      :host([position='end']) .rail {
        grid-column: 2;
      }
      :host([position='end']) .content {
        grid-column: 3;
      }
      /* FR-TIMELINE-02: collapse to one side in narrow containers. */
      @container (max-width: 32rem) {
        :host([position]) .item {
          grid-template-columns: var(--_marker) 1fr;
        }
        :host([position]) .content,
        :host([position]) .rail {
          grid-row: auto;
          text-align: start;
        }
        :host([position]) .rail {
          grid-column: 1;
        }
        :host([position]) .content {
          grid-column: 2;
        }
      }

      :host([orientation='horizontal']) {
        flex: 1 1 0;
        min-inline-size: 8rem;
      }
      :host([orientation='horizontal']) .item {
        grid-template-columns: 1fr;
        row-gap: var(--bx-space-xs);
      }
      :host([orientation='horizontal']) .rail {
        flex-direction: row;
        grid-row: 1;
        grid-column: 1;
      }
      :host([orientation='horizontal']) .connector {
        inline-size: auto;
        block-size: 2px;
        min-block-size: 0;
      }
      :host([orientation='horizontal']) .content {
        grid-row: 2;
        grid-column: 1;
        text-align: start;
        padding-block-end: 0;
      }

      @media (forced-colors: active) {
        .marker {
          forced-color-adjust: none;
          background: Highlight;
          color: HighlightText;
        }
        .connector {
          background: CanvasText;
        }
      }
    `,
  ];

  static override properties = {
    time: { type: String },
    relative: { type: Boolean },
    heading: { type: String },
    description: { type: String },
    status: { type: String, reflect: true },
    icon: { type: String },
    position: { type: String, reflect: true },
    orientation: { type: String, reflect: true },
    last: { type: Boolean, reflect: true },
  };

  declare time: string;
  declare relative: boolean;
  declare heading: string;
  declare description: string;
  declare status: Status;
  declare icon: string;
  /** @internal Set by `bx-timeline`. */
  declare position?: 'start' | 'end';
  /** @internal Set by `bx-timeline`. */
  declare orientation: 'vertical' | 'horizontal';
  /** @internal Set by `bx-timeline`. */
  declare last: boolean;

  constructor() {
    super();
    this.time = '';
    this.relative = false;
    this.heading = '';
    this.description = '';
    this.status = 'secondary';
    this.icon = '';
    this.orientation = 'vertical';
    this.last = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'listitem');
  }

  protected override render() {
    return html`<div class="item" part="item">
      <div class="rail">
        <span class="marker" part="marker" aria-hidden="true"
          ><slot name="icon"
            >${this.icon ? html`<bx-icon name=${this.icon}></bx-icon>` : nothing}</slot
          ></span
        >
        <span class="connector" part="connector"></span>
      </div>
      <div class="content" part="content">
        <div class="time" part="time">
          <slot name="time"
            >${
              this.time
                ? this.relative
                  ? html`<bx-relative-time
                      date=${this.time}
                    ></bx-relative-time>`
                  : html`<bx-format-date
                      date=${this.time}
                      year="numeric"
                      month="short"
                      day="numeric"
                      hour="numeric"
                      minute="2-digit"
                    ></bx-format-date>`
                : nothing
            }</slot
          >
        </div>
        ${this.heading ? html`<p class="heading">${this.heading}</p>` : nothing}
        <div class="description">${this.description}<slot></slot></div>
      </div>
    </div>`;
  }
}
