import { css, html, nothing, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';
import { textFamily, textStyle } from '../internal/text-style.ts';

export type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

/**
 * Pure page-range algorithm (FR-PAGINATION-01): at most `2*siblings + 2*boundary + 3` slots, and a
 * constant number of slots once `count` exceeds that, so the control never changes width while
 * paging. Ellipses collapse to a single page when they would hide only one.
 */
export function pageRange(
  page: number,
  count: number,
  siblings = 1,
  boundary = 1,
): PageItem[] {
  const range = (a: number, b: number) =>
    Array.from({ length: Math.max(b - a + 1, 0) }, (_, i) => a + i);
  if (count <= 0) return [];
  page = Math.min(Math.max(page, 1), count);
  const slots = 2 * siblings + 2 * boundary + 3;
  if (count <= slots) return range(1, count);

  const start = range(1, boundary);
  const end = range(count - boundary + 1, count);
  const sibStart = Math.max(
    Math.min(page - siblings, count - boundary - siblings * 2 - 1),
    boundary + 2,
  );
  const sibEnd = Math.min(
    Math.max(page + siblings, boundary + siblings * 2 + 2),
    end.length ? end[0] - 2 : count - 1,
  );
  return [
    ...start,
    ...(sibStart > boundary + 2
      ? (['ellipsis-start'] as const)
      : boundary + 1 < count - boundary
        ? [boundary + 1]
        : []),
    ...range(sibStart, sibEnd),
    ...(sibEnd < count - boundary - 1
      ? (['ellipsis-end'] as const)
      : count - boundary > boundary
        ? [count - boundary]
        : []),
    ...end,
  ];
}

const CHEVRON_LEFT =
  'M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z';
const CHEVRON_RIGHT =
  'M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z';

/**
 * `<bx-pagination>` — page navigation (docs/features/core/pagination.md).
 *
 * A `<nav aria-label="Pagination">` of numbered pages with ellipsis collapsing, a compact
 * "3 of 20" mode and an optional page-size selector. With `href-template` (e.g. `?page={page}`)
 * every page is a real anchor, so it works without JS and for crawlers (FR-PAGINATION-02); the
 * click is still intercepted to emit `change` and update `page` unless modified (Ctrl/Cmd/middle).
 * `total` + `page-size` derive `page-count`. The size selector is a native `<select>` rather than
 * `bx-select`, to keep the control light. Pairing with `bx-data-table` is left to the app: listen
 * to `change` and feed the table (FR-PAGINATION-03).
 *
 * @fires change - Page changed by the user. `detail.page`.
 * @fires bx-page-size-change - Page size changed by the user. `detail.pageSize`.
 *
 * @slot summary - "Showing 1–10 of 200".
 * @slot prev - Previous label/icon.
 * @slot next - Next label/icon.
 *
 * @csspart base - `nav` element.
 * @csspart page - A page button.
 * @csspart page-current - The current page button.
 * @csspart ellipsis - The ellipsis part.
 * @csspart prev - The previous button.
 * @csspart next - The next button.
 * @csspart size-select - The page-size select.
 *
 * @cssprop --bx-pagination-gap - Gap between controls. Default `var(--bx-space-2xs)`.
 * @cssprop --bx-pagination-current-bg - Current page background.
 * @cssprop --bx-pagination-current-fg - Current page text color.
 */
export class BxPagination extends BixElement {
  static override tagName = 'bx-pagination';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        ${textFamily('--bx-pagination', 'label')}
      }
      .base {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--bx-space-s);
      }
      .summary {
        color: var(--bx-text-secondary);
        ${textStyle('--bx-pagination-summary', 'body-s')}
      }
      .summary:not(:has(::slotted(*))) {
        display: none;
      }
      ul {
        display: flex;
        align-items: center;
        gap: var(--bx-pagination-gap, var(--bx-space-2xs));
        margin: 0;
        padding: 0;
        list-style: none;
      }
      li {
        display: contents;
      }
      .page,
      .nav {
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-inline-size: max(var(--bx-control-height-m), var(--bx-target-min));
        min-block-size: max(var(--bx-control-height-m), var(--bx-target-min));
        padding-inline: var(--bx-space-xs);
        border: var(--bx-border-width) solid transparent;
        border-radius: var(--bx-radius-m);
        background: transparent;
        color: var(--bx-text-primary);
        font: inherit;
        ${textStyle('--bx-pagination', 'label-m')}
        text-decoration: none;
        cursor: pointer;
        font-variant-numeric: tabular-nums;
      }
      .page:hover,
      .nav:hover {
        background: var(--bx-surface-subtle);
      }
      .page[aria-current='page'] {
        background: var(--bx-pagination-current-bg, var(--bx-role-brand-solid));
        color: var(--bx-pagination-current-fg, var(--bx-role-brand-on-solid));
        cursor: default;
      }
      .page:focus-visible,
      .nav:focus-visible,
      select:focus-visible {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: var(--bx-focus-ring-offset);
      }
      .nav[aria-disabled='true'] {
        opacity: 0.4;
        cursor: not-allowed;
        pointer-events: none;
      }
      :host([disabled]) {
        opacity: 0.6;
        pointer-events: none;
      }
      .ellipsis {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-inline-size: var(--bx-target-min);
        color: var(--bx-text-secondary);
      }
      .nav svg {
        inline-size: 1em;
        block-size: 1em;
        fill: currentColor;
      }
      :host(:dir(rtl)) .nav svg {
        transform: scaleX(-1);
      }
      .compact {
        color: var(--bx-text-primary);
        ${textStyle('--bx-pagination', 'label-m')}
        padding-inline: var(--bx-space-xs);
      }
      select {
        min-block-size: max(var(--bx-control-height-m), var(--bx-target-min));
        padding-inline: var(--bx-space-xs);
        border: var(--bx-border-width) solid var(--bx-border-subtle);
        border-radius: var(--bx-radius-m);
        background: var(--bx-surface-base);
        color: var(--bx-text-primary);
        font: inherit;
      }
      .size {
        display: inline-flex;
        align-items: center;
        gap: var(--bx-space-2xs);
        color: var(--bx-text-secondary);
        ${textStyle('--bx-pagination-size', 'body-s')}
      }
      @media (forced-colors: active) {
        .page[aria-current='page'] {
          forced-color-adjust: none;
          background: Highlight;
          color: HighlightText;
        }
      }
    `,
  ];

  static override properties = {
    page: { type: Number, reflect: true },
    pageCount: { type: Number, attribute: 'page-count' },
    total: { type: Number },
    pageSize: { type: Number, attribute: 'page-size' },
    pageSizes: { attribute: false },
    siblingCount: { type: Number, attribute: 'sibling-count' },
    boundaryCount: { type: Number, attribute: 'boundary-count' },
    compact: { type: Boolean, reflect: true },
    hrefTemplate: { type: String, attribute: 'href-template' },
    disabled: { type: Boolean, reflect: true },
  };

  declare page: number;
  declare pageCount: number;
  declare total: number;
  declare pageSize: number;
  declare pageSizes: number[];
  declare siblingCount: number;
  declare boundaryCount: number;
  declare compact: boolean;
  declare hrefTemplate: string;
  declare disabled: boolean;

  constructor() {
    super();
    this.page = 1;
    this.pageCount = 1;
    this.total = 0;
    this.pageSize = 10;
    this.pageSizes = [];
    this.siblingCount = 1;
    this.boundaryCount = 1;
    this.compact = false;
    this.hrefTemplate = '';
    this.disabled = false;
  }

  /** The effective number of pages: from `total`/`page-size` when `total` is set. */
  get totalPages(): number {
    return this.total > 0
      ? Math.max(Math.ceil(this.total / Math.max(this.pageSize, 1)), 1)
      : Math.max(this.pageCount, 1);
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (
      changed.has('page') ||
      changed.has('total') ||
      changed.has('pageSize') ||
      changed.has('pageCount')
    )
      this.page = Math.min(
        Math.max(Math.round(this.page) || 1, 1),
        this.totalPages,
      );
  }

  #go(page: number, event?: Event): void {
    if (
      this.disabled ||
      page < 1 ||
      page > this.totalPages ||
      page === this.page
    )
      return;
    event?.preventDefault();
    this.page = page;
    this.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: { page },
      }),
    );
  }

  #link(page: number): string | undefined {
    return this.hrefTemplate
      ? this.hrefTemplate.replace('{page}', String(page))
      : undefined;
  }

  #click = (page: number) => (event: MouseEvent) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0)
      return;
    this.#go(page, event);
  };

  #control(
    page: number,
    content: unknown,
    part: string,
    label?: string,
    cls = 'nav',
  ) {
    const disabled = page < 1 || page > this.totalPages;
    const href = disabled ? undefined : this.#link(page);
    return href
      ? html`<a
          class=${cls}
          part=${part}
          href=${href}
          aria-label=${label ?? nothing}
          @click=${this.#click(page)}
          >${content}</a
        >`
      : html`<button
          class=${cls}
          part=${part}
          type="button"
          aria-label=${label ?? nothing}
          aria-disabled=${disabled ? 'true' : nothing}
          @click=${this.#click(page)}
        >
          ${content}
        </button>`;
  }

  #arrow(path: string) {
    return html`<svg viewBox="0 0 256 256" aria-hidden="true">
      <path d=${path} />
    </svg>`;
  }

  protected override render() {
    const count = this.totalPages;
    const prev = this.#control(
      this.page - 1,
      html`<slot name="prev">${this.#arrow(CHEVRON_LEFT)}</slot>`,
      'prev',
      'Previous page',
    );
    const next = this.#control(
      this.page + 1,
      html`<slot name="next">${this.#arrow(CHEVRON_RIGHT)}</slot>`,
      'next',
      'Next page',
    );
    const size = this.pageSizes?.length
      ? html`<label class="size"
          >Rows per page
          <select
            part="size-select"
            ?disabled=${this.disabled}
            @change=${(e: Event) => {
              const pageSize = Number((e.target as HTMLSelectElement).value);
              this.pageSize = pageSize;
              this.dispatchEvent(
                new CustomEvent('bx-page-size-change', {
                  bubbles: true,
                  composed: true,
                  detail: { pageSize },
                }),
              );
            }}
          >
            ${this.pageSizes.map(
              (n) =>
                html`<option value=${n} ?selected=${n === this.pageSize}>
                  ${n}
                </option>`,
            )}
          </select></label
        >`
      : nothing;
    return html`<nav class="base" part="base" aria-label="Pagination">
      <span class="summary"><slot name="summary"></slot></span>
      ${
        this.compact
          ? html`<ul>
              <li>${prev}</li>
              <li class="compact" aria-live="polite">
                ${this.page} of ${count}
              </li>
              <li>${next}</li>
            </ul>`
          : html`<ul>
              <li>${prev}</li>
              ${pageRange(
                this.page,
                count,
                this.siblingCount,
                this.boundaryCount,
              ).map((item) =>
                typeof item === 'string'
                  ? html`<li>
                      <span class="ellipsis" part="ellipsis" aria-hidden="true"
                        >…</span
                      >
                    </li>`
                  : html`<li>
                      ${this.#control(
                        item,
                        item,
                        item === this.page ? 'page page-current' : 'page',
                        `Page ${item}`,
                        'page',
                      )}
                    </li>`,
              )}
              <li>${next}</li>
            </ul>`
      }
      ${size}
    </nav>`;
  }

  protected override updated(): void {
    for (const el of this.shadowRoot!.querySelectorAll<HTMLElement>('.page')) {
      const current = el.getAttribute('aria-label') === `Page ${this.page}`;
      if (current) el.setAttribute('aria-current', 'page');
      else el.removeAttribute('aria-current');
    }
  }
}
