import { css, html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';
import { observeResize } from '../internal/shared-observers.ts';
import type { BxBreadcrumbItem } from '../breadcrumb-item/breadcrumb-item.ts';

/**
 * `<bx-breadcrumb>` — navigation trail owning a default-slotted set of `bx-breadcrumb-item`
 * (docs/features/core/breadcrumb.md).
 *
 * Sets `role="listitem"` on each slotted item (the spec's §6 "ordered list semantics" — items
 * themselves don't render as `<li>`, so this element supplies that role rather than requiring
 * every item author to remember it) and drives `current` on the last one (FR-BREADCRUMB-02);
 * `bx-breadcrumb-item`'s own `:host(:last-child)` CSS already hides a trailing separator on
 * whichever item ends up last in DOM order, so hiding items for overflow (below) doesn't need any
 * extra separator bookkeeping.
 *
 * FR-BREADCRUMB-01's "ellipsis dropdown" is implemented as an inline expand rather than a floating
 * popover menu: clicking "…" un-hides the collapsed items in place. A `bx-popup`-anchored menu
 * would need a lightweight menu-list primitive this package doesn't have yet (`bx-dropdown` is
 * Tier 4, `VirtualizerController`-gated) — noted here per docs/features/_conventions.md's "say so
 * inline" rule rather than pulled in over-scope for a Tier 2 component. Collapse math measures
 * each item's natural (unhidden) width once per resize/slot-change and hides from the earliest
 * middle item outward until the remainder fits, the same single-measurement-pass approach
 * `bx-scroller`'s edge shadows and `bx-tab-group`'s scroll buttons already use.
 *
 * @slot (default) - `bx-breadcrumb-item` elements.
 *
 * @cssprop --bx-breadcrumb-gap - Gap between items. Default `--bx-space-2xs`.
 */
export class BxBreadcrumb extends BixElement {
  static override tagName = 'bx-breadcrumb';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        container-type: inline-size;
        font-family: var(--bx-font-family-sans);
      }

      .list {
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        gap: var(--bx-breadcrumb-gap, var(--bx-space-2xs));
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .list ::slotted(.bx-breadcrumb-ellipsis) {
        all: unset;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-inline-size: var(--bx-target-min, 2.75rem);
        min-block-size: var(--bx-target-min, 2.75rem);
        color: var(--bx-role-accent);
        cursor: pointer;
        font: inherit;
      }

      .list ::slotted(.bx-breadcrumb-ellipsis:hover) {
        text-decoration: underline;
      }

      .list ::slotted(.bx-breadcrumb-ellipsis:focus-visible) {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: var(--bx-focus-ring-offset);
        border-radius: var(--bx-radius-s);
      }

      .list ::slotted([hidden]) {
        display: none;
      }
    `,
  ];

  static override properties = {
    label: { type: String },
  };

  declare label: string;

  #listRef = createRef<HTMLOListElement>();
  #ellipsis: HTMLButtonElement | null = null;
  #unobserveResize?: () => void;
  // Set once the user clicks "…" to reveal everything; cleared on the next real container
  // resize, not on the next `slotchange` — inserting/removing the ellipsis button is itself a
  // light-DOM child mutation of the default slot's assigned nodes, so it fires its own
  // `slotchange`. Reacting to that the same way as a real resize would immediately re-collapse
  // (the container is still just as narrow) and, worse, loop forever: collapse → insert ellipsis
  // → slotchange → collapse decision unchanged → remove+reinsert ellipsis → slotchange → ... The
  // guard below breaks that by only re-running the actual collapse math from a genuine resize.
  #userExpanded = false;

  constructor() {
    super();
    this.label = 'Breadcrumb';
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#unobserveResize?.();
    this.#unobserveResize = undefined;
  }

  protected override firstUpdated(): void {
    const list = this.#listRef.value;
    if (!list) return;
    this.#unobserveResize = observeResize(list, () => this.#handleResize());
    this.#reflow();
  }

  #items(): BxBreadcrumbItem[] {
    return [...this.querySelectorAll('bx-breadcrumb-item')] as unknown as BxBreadcrumbItem[];
  }

  #ensureEllipsis(): HTMLButtonElement {
    if (this.#ellipsis) return this.#ellipsis;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'bx-breadcrumb-ellipsis';
    button.setAttribute('aria-label', 'Show all breadcrumbs');
    button.textContent = '…';
    button.addEventListener('click', this.#handleEllipsisClick);
    this.#ellipsis = button;
    return button;
  }

  #handleResize = (): void => {
    this.#userExpanded = false;
    this.#reflow();
  };

  #handleEllipsisClick = (): void => {
    this.#userExpanded = true;
    for (const item of this.#items()) item.hidden = false;
    this.#ellipsis?.remove();
  };

  #handleSlotChange = (): void => this.#reflow();

  #reflow(): void {
    const list = this.#listRef.value;
    if (!list) return;

    const items = this.#items();
    for (const item of items) item.setAttribute('role', 'listitem');
    for (const [index, item] of items.entries())
      item.current = index === items.length - 1;

    if (this.#userExpanded || items.length < 3) {
      if (this.#ellipsis?.isConnected) this.#ellipsis.remove();
      for (const item of items) item.hidden = false;
      return;
    }

    // Read phase: measure natural widths with everything visible. Toggling `hidden` is an
    // attribute change, not a slotted-node change, so it never triggers `slotchange` itself.
    for (const item of items) item.hidden = false;
    const available = list.clientWidth;
    const gap = Number.parseFloat(getComputedStyle(list).gap) || 0;
    const widths = items.map((item) => item.getBoundingClientRect().width);
    const total = widths.reduce((sum, width) => sum + width, 0) + gap * (items.length - 1);

    if (total <= available) {
      if (this.#ellipsis?.isConnected) this.#ellipsis.remove();
      return;
    }

    // Inserted into the host's own light DOM (not the shadow `<ol>` — `items` aren't its real
    // DOM children, only slot-projected into it) so it visually lands between the first item and
    // whichever items get hidden below, via ordinary DOM/slot order. Only inserted when not
    // already connected, so a reflow that reaches the same conclusion as last time doesn't touch
    // the slot's assigned nodes at all (see `#userExpanded`'s doc comment above).
    const ellipsis = this.#ensureEllipsis();
    if (!ellipsis.isConnected) this.insertBefore(ellipsis, items[1] ?? null);
    const ellipsisWidth = ellipsis.getBoundingClientRect().width;

    // Write phase: hide middle items (index 1..n-2) from the start of the middle outward until
    // the remainder (first + ellipsis + surviving middle + last) fits.
    let hiddenCount = 0;
    const middleCount = items.length - 2;
    while (hiddenCount < middleCount) {
      const visibleWidth =
        widths[0]! +
        ellipsisWidth +
        widths.slice(1 + hiddenCount, items.length - 1).reduce((sum, w) => sum + w, 0) +
        widths[items.length - 1]! +
        gap * (items.length - hiddenCount);
      if (visibleWidth <= available) break;
      items[1 + hiddenCount]!.hidden = true;
      hiddenCount++;
    }

    if (hiddenCount === 0 && ellipsis.isConnected) ellipsis.remove();
  }

  protected override render() {
    return html`
      <nav aria-label=${this.label}>
        <ol ${ref(this.#listRef)} class="list">
          <slot @slotchange=${this.#handleSlotChange}></slot>
        </ol>
      </nav>
    `;
  }
}
