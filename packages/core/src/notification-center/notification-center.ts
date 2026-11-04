import { css, html, nothing, type PropertyValues } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';
import { getDateTimeFormatter } from '../internal/intl-cache.ts';
import { textFamily, textStyle } from '../internal/text-style.ts';

export interface NotificationAction {
  id: string;
  label: string;
}
export interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  /** ISO date-time. */
  time?: string;
  read?: boolean;
  href?: string;
  /** Image URL for a leading `bx-avatar`. */
  avatar?: string;
  actions?: NotificationAction[];
}

const BELL_PATH =
  'M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z';

/** Start-of-day key for grouping. */
const dayKey = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Heading for a day key: Today, Yesterday, or a long date in `locale`. */
export function dayLabel(key: string, now: Date, locale?: string): string {
  const startOf = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const [y, m, d] = key.split('-').map(Number);
  const day = new Date(y!, m! - 1, d!);
  const diff = Math.round((startOf(now).getTime() - day.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return getDateTimeFormatter(locale, { dateStyle: 'long' }).format(day);
}

let nextId = 0;

/**
 * `<bx-notification-center>` — bell trigger plus a panel of persistent notifications
 * (docs/features/core/notification-center.md).
 *
 * The trigger is a `bx-icon-button` bell with a `bx-badge` unread count (`unread-count`, derived
 * from `items` when unset). The panel is a non-modal `bx-popup` below the bell, or a full-width
 * sheet under 48rem (FR-NOTIFICATIONCENTER-03; the spec's drawer is a plain CSS sheet here).
 * Items are grouped by day (`group-by`), with times from `bx-relative-time`
 * (FR-NOTIFICATIONCENTER-02); an item can carry an avatar, a link and action buttons. The element is
 * **controlled**: it fires cancelable `bx-mark-read` / `bx-mark-all-read` / `bx-dismiss` and, unless
 * cancelled, applies the change to its own copy of `items`, so it also works unmanaged. Scrolling to
 * the end of the list (or opening a short list) fires `bx-load-more` once per list length. The unread count is announced
 * politely when it changes (FR-NOTIFICATIONCENTER-04). The list renders every item rather than using
 * `bx-data-list` (FR-NOTIFICATIONCENTER-01 is not implemented), so keep loaded history modest and
 * page with `bx-load-more`. The `item` slot template is not implemented.
 *
 * @fires bx-item-click - A notification was activated. `detail.item`.
 * @fires bx-mark-read - Cancelable. `detail.ids`.
 * @fires bx-mark-all-read - Cancelable.
 * @fires bx-dismiss - Cancelable. `detail.id`.
 * @fires bx-action - An item action was used. `detail.item`, `detail.action`.
 * @fires bx-load-more - Near the end of the list.
 * @fires bx-show - Panel opening. Cancelable.
 * @fires bx-hide - Panel closing. Cancelable.
 *
 * @slot trigger - Replaces the bell.
 * @slot empty - Shown when there are no notifications.
 * @slot footer - e.g. "View all".
 *
 * @csspart trigger - The trigger part.
 * @csspart badge - The badge part.
 * @csspart panel - The panel part.
 * @csspart group-heading - The group-heading part.
 * @csspart item - The item part.
 * @csspart empty - The empty part.
 *
 * @cssprop --bx-notification-center-width - Panel width.
 * @cssprop --bx-notification-center-max-height - Panel max height.
 */
export class BxNotificationCenter extends BixElement {
  static override tagName = 'bx-notification-center';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-block;
        ${textFamily('--bx-notification-center', 'body')}
      }
      .anchor {
        position: relative;
        display: inline-block;
      }
      bx-badge.count {
        position: absolute;
        inset-block-start: 0;
        inset-inline-end: 0;
        translate: 30% -30%;
        pointer-events: none;
      }
      .panel {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        inline-size: var(--bx-notification-center-width, 24rem);
        max-inline-size: calc(100vw - var(--bx-space-m) * 2);
        max-block-size: var(--bx-notification-center-max-height, 70vh);
        overflow: hidden;
        border: var(--bx-border-width) solid var(--bx-border-subtle);
        border-radius: var(--bx-radius-l);
        background: var(--bx-surface-base);
        color: var(--bx-text-primary);
        box-shadow: var(--bx-shadow-l);
      }
      .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--bx-space-s);
        padding: var(--bx-space-xs) var(--bx-space-s);
        border-block-end: var(--bx-border-width) solid var(--bx-border-subtle);
        ${textStyle('--bx-notification-center-head', 'heading-xs')}
      }
      .list {
        flex: 1 1 auto;
        overflow-y: auto;
        overscroll-behavior: contain;
        margin: 0;
        padding: 0;
        list-style: none;
      }
      .group-heading {
        position: sticky;
        inset-block-start: 0;
        z-index: 1;
        margin: 0;
        padding: var(--bx-space-2xs) var(--bx-space-s);
        background: var(--bx-surface-subtle);
        color: var(--bx-text-secondary);
        ${textStyle('--bx-notification-center-group', 'label-xs')}
        text-transform: uppercase;
      }
      .item {
        position: relative;
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: var(--bx-space-3xs) var(--bx-space-xs);
        padding: var(--bx-space-xs) var(--bx-space-s);
        border-block-end: var(--bx-border-width) solid var(--bx-border-subtle);
      }
      .item[data-unread]::before {
        content: '';
        position: absolute;
        inset-inline-start: var(--bx-space-3xs);
        inset-block-start: 50%;
        inline-size: 6px;
        block-size: 6px;
        border-radius: 50%;
        background: var(--bx-role-brand-solid);
        translate: 0 -50%;
      }
      .item:hover {
        background: var(--bx-surface-subtle);
      }
      .main {
        all: unset;
        grid-column: 2;
        display: block;
        min-inline-size: 0;
        cursor: pointer;
        border-radius: var(--bx-radius-s);
      }
      .main:focus-visible {
        outline: var(
            --bx-notification-center-focus-ring-width,
            var(--bx-border-width-strong)
          )
          solid
          var(--bx-notification-center-focus-ring-color, var(--bx-focus-ring));
        outline-offset: 2px;
      }
      .title {
        display: block;
        ${textStyle('--bx-notification-center-title', 'label-m')}
      }
      .item[data-unread] .title {
        font-weight: 700;
      }
      .body {
        display: block;
        color: var(--bx-text-secondary);
        ${textStyle('--bx-notification-center-body', 'body-s')}
      }
      .time {
        display: block;
        color: var(--bx-text-secondary);
        ${textStyle('--bx-notification-center-time', 'caption-s')}
      }
      bx-avatar {
        grid-column: 1;
        grid-row: 1 / span 2;
      }
      .dismiss {
        grid-column: 3;
        grid-row: 1;
      }
      .actions {
        grid-column: 2;
        display: flex;
        flex-wrap: wrap;
        gap: var(--bx-space-2xs);
        margin-block-start: var(--bx-space-2xs);
      }
      .empty {
        padding: var(--bx-space-l);
        color: var(--bx-text-secondary);
        text-align: center;
      }
      .footer:not(:has(::slotted(*))) {
        display: none;
      }
      .footer {
        padding: var(--bx-space-xs) var(--bx-space-s);
        border-block-start: var(--bx-border-width) solid var(--bx-border-subtle);
      }
      .loading {
        padding: var(--bx-space-s);
        text-align: center;
      }
      .sr {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        overflow: hidden;
        clip-path: inset(50%);
      }
      @media (max-width: 48rem) {
        .panel {
          inline-size: calc(100vw - var(--bx-space-m) * 2);
        }
      }
    `,
  ];

  static override properties = {
    items: { attribute: false },
    unreadCount: { type: Number, attribute: 'unread-count' },
    groupBy: { type: String, attribute: 'group-by' },
    open: { type: Boolean, reflect: true },
    emptyText: { type: String, attribute: 'empty-text' },
    loading: { type: Boolean, reflect: true },
    label: { type: String },
    _announce: { state: true },
  };

  declare items: NotificationItem[];
  declare unreadCount?: number;
  declare groupBy: 'none' | 'day';
  declare open: boolean;
  declare emptyText: string;
  declare loading: boolean;
  declare label: string;
  /** @internal */
  declare _announce: string;

  #id = `bx-nc-${nextId++}`;
  #listRef = createRef<HTMLElement>();
  /** `items.length` the last `bx-load-more` was fired for, so one page of history asks once. */
  #askedFor = -1;
  #lastCount = -1;

  constructor() {
    super();
    this.items = [];
    this.groupBy = 'day';
    this.open = false;
    this.emptyText = 'No notifications';
    this.loading = false;
    this.label = 'Notifications';
    this._announce = '';
  }

  /** The effective unread count. */
  get unread(): number {
    return this.unreadCount ?? (this.items ?? []).filter((i) => !i.read).length;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('pointerdown', this.#onOutside, true);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('pointerdown', this.#onOutside, true);
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    const count = this.unread;
    if (this.#lastCount !== -1 && count !== this.#lastCount)
      this._announce = `${count} unread notification${count === 1 ? '' : 's'}`;
    this.#lastCount = count;
    void changed;
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('open') || changed.has('items') || changed.has('loading'))
      if (this.open) requestAnimationFrame(() => this.#checkEnd());
  }

  /** Fires `bx-load-more` once per list length when the end is (nearly) in view. */
  #checkEnd = (): void => {
    const list = this.#listRef.value;
    if (!list || !this.open || this.loading || !this.items.length) return;
    const remaining = list.scrollHeight - list.scrollTop - list.clientHeight;
    if (remaining > 48 || this.#askedFor === this.items.length) return;
    this.#askedFor = this.items.length;
    this.dispatchEvent(
      new Event('bx-load-more', { bubbles: true, composed: true }),
    );
  };

  show(): void {
    if (this.open) return;
    if (
      !this.dispatchEvent(
        new Event('bx-show', {
          bubbles: true,
          composed: true,
          cancelable: true,
        }),
      )
    )
      return;
    this.open = true;
  }

  hide(refocus = true): void {
    if (!this.open) return;
    if (
      !this.dispatchEvent(
        new Event('bx-hide', {
          bubbles: true,
          composed: true,
          cancelable: true,
        }),
      )
    )
      return;
    this.open = false;
    if (refocus)
      this.shadowRoot?.querySelector<HTMLElement>('.trigger')?.focus();
  }

  #onOutside = (event: Event): void => {
    if (this.open && !event.composedPath().includes(this)) this.hide(false);
  };

  #patch(fn: (item: NotificationItem) => NotificationItem | undefined): void {
    this.items = this.items.map(fn).filter((i): i is NotificationItem => !!i);
  }

  #markRead(ids: string[]): void {
    const go = this.dispatchEvent(
      new CustomEvent('bx-mark-read', {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: { ids },
      }),
    );
    if (go) this.#patch((i) => (ids.includes(i.id) ? { ...i, read: true } : i));
  }

  #markAll(): void {
    const go = this.dispatchEvent(
      new Event('bx-mark-all-read', {
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    if (go) this.#patch((i) => ({ ...i, read: true }));
  }

  #dismiss(id: string): void {
    const go = this.dispatchEvent(
      new CustomEvent('bx-dismiss', {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: { id },
      }),
    );
    if (go) this.#patch((i) => (i.id === id ? undefined : i));
  }

  #click(item: NotificationItem): void {
    this.dispatchEvent(
      new CustomEvent('bx-item-click', {
        bubbles: true,
        composed: true,
        detail: { item },
      }),
    );
    if (!item.read) this.#markRead([item.id]);
    if (item.href) window.location.href = item.href;
  }

  #groups(): { heading?: string; items: NotificationItem[] }[] {
    const items = this.items ?? [];
    if (this.groupBy !== 'day') return items.length ? [{ items }] : [];
    const now = new Date();
    const map = new Map<string, NotificationItem[]>();
    for (const item of items) {
      const key = item.time ? dayKey(item.time) : '';
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return [...map].map(([key, list]) => ({
      heading: key ? dayLabel(key, now) : undefined,
      items: list,
    }));
  }

  #renderItem(item: NotificationItem) {
    const unread = !item.read;
    return html`<li class="item" part="item" ?data-unread=${unread}>
      ${
        item.avatar
          ? html`<bx-avatar
              size="small"
              image=${item.avatar}
              label=${item.title}
            ></bx-avatar>`
          : nothing
      }
      <button class="main" type="button" @click=${() => this.#click(item)}>
        <span class="title"
          >${item.title}${unread ? html`<span class="sr"> (unread)</span>` : nothing}</span
        >
        ${item.body ? html`<span class="body">${item.body}</span>` : nothing}
        ${
          item.time
            ? html`<span class="time"
                ><bx-relative-time date=${item.time}></bx-relative-time
              ></span>`
            : nothing
        }
      </button>
      <bx-icon-button
        class="dismiss"
        name="close"
        size="s"
        label="Dismiss ${item.title}"
        @click=${() => this.#dismiss(item.id)}
      ></bx-icon-button>
      ${
        item.actions?.length
          ? html`<div class="actions">
              ${item.actions.map(
                (action) =>
                  html`<bx-button
                    size="small"
                    variant="secondary"
                    appearance="outlined"
                    @click=${() =>
                      this.dispatchEvent(
                        new CustomEvent('bx-action', {
                          bubbles: true,
                          composed: true,
                          detail: { item, action },
                        }),
                      )}
                    >${action.label}</bx-button
                  >`,
              )}
            </div>`
          : nothing
      }
    </li>`;
  }

  protected override render() {
    const unread = this.unread;
    const groups = this.#groups();
    const hasItems = groups.some((g) => g.items.length);
    return html`
      <div class="anchor" id="${this.#id}-anchor">
        <slot
          name="trigger"
          @click=${() => (this.open ? this.hide() : this.show())}
        >
          <bx-icon-button
            class="trigger"
            part="trigger"
            label=${unread ? `${this.label}, ${unread} unread` : this.label}
            aria-haspopup="dialog"
            aria-expanded=${this.open ? 'true' : 'false'}
            @click=${() => (this.open ? this.hide() : this.show())}
          >
            <svg
              viewBox="0 0 256 256"
              width="1.25em"
              height="1.25em"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d=${BELL_PATH} />
            </svg>
          </bx-icon-button>
        </slot>
        ${
          unread
            ? html`<bx-badge
                class="count"
                part="badge"
                variant="error"
                size="small"
                pill
                aria-hidden="true"
                >${unread > 99 ? '99+' : unread}</bx-badge
              >`
            : nothing
        }
      </div>
      <bx-popup
        anchor="${this.#id}-anchor"
        ?active=${this.open}
        placement="bottom-end"
        strategy="fixed"
        distance="6"
        flip
        shift
      >
        <div
          class="panel"
          part="panel"
          role="dialog"
          aria-label=${this.label}
          @keydown=${(e: KeyboardEvent) => {
            if (e.key === 'Escape') {
              e.stopPropagation();
              this.hide();
            }
          }}
        >
          <div class="head">
            <span>${this.label}</span>
            <bx-button
              size="small"
              appearance="plain"
              ?disabled=${unread === 0}
              @click=${() => this.#markAll()}
              >Mark all as read</bx-button
            >
          </div>
          ${
            hasItems
              ? html`<ul
                  class="list"
                  ${ref(this.#listRef)}
                  aria-label=${this.label}
                  @scroll=${this.#checkEnd}
                >
                  ${groups.map(
                    (g) =>
                      html`${
                        g.heading
                          ? html`<li class="group-heading" part="group-heading">
                              ${g.heading}
                            </li>`
                          : nothing
                      }${g.items.map((i) => this.#renderItem(i))}`,
                  )}
                </ul>`
              : html`<div class="empty" part="empty">
                  <slot name="empty">${this.emptyText}</slot>
                </div>`
          }
          ${
            this.loading
              ? html`<div class="loading">
                  <bx-spinner aria-label="Loading"></bx-spinner>
                </div>`
              : nothing
          }
          <div class="footer"><slot name="footer"></slot></div>
        </div>
      </bx-popup>
      <div class="sr" role="status" aria-live="polite">${this._announce}</div>
    `;
  }
}
