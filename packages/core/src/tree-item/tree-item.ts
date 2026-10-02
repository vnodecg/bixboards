import { css, html, nothing, svg, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';
import { textFamily } from '../internal/text-style.ts';

// Vendored from packages/core/src/icon/default-library.ts (Phosphor Icons, regular/fill, MIT).
const CHEVRON_RIGHT_PATH =
  'M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z';
// This glyph's own ink isn't centered in the usual 256x256 canvas (bbox roughly x:72-228,
// y:100-207) — rendered below with viewBox="48 76 204 155" (centered on that bbox) instead of
// "0 0 256 256", so preserveAspectRatio's default centers it in the icon's square box. See
// packages/core/src/checkbox/checkbox.ts's own copy of this constant for the full note.
const CHECK_PATH =
  'M225.86,102.82c-3.77-3.94-10-4.1-13.94-.34l-83.6,80.13-38.86-40.14a10,10,0,0,0-14.34,13.94l45.7,47.24a10,10,0,0,0,7.17,3.05,10,10,0,0,0,6.94-2.79l90.6-86.85C229.46,113,229.63,106.75,225.86,102.82Z';
// Vendored from packages/core/src/checkbox/checkbox.ts's own MINUS_PATH.
const MINUS_PATH =
  'M208,128a12,12,0,0,1-12,12H60a12,12,0,0,1,0-24H196A12,12,0,0,1,208,128Z';

/**
 * `<bx-tree-item>` — a node in `bx-tree`, with lazy children.
 *
 * ARIA tree semantics (`role="treeitem"`, `aria-level`, `aria-selected`, roving tabindex across
 * siblings) are explicitly the future `bx-tree` parent's job per docs/features/core/tree-item.md
 * §6, so none of that is set here. What *is* implemented standalone, so the item is independently
 * usable and keyboard-testable before that parent exists: the expand/collapse button and the
 * optional selection checkbox are each real, individually focusable controls, and indentation is
 * computed from actual DOM nesting depth (counting `bx-tree-item` ancestors at connect time) rather
 * than waiting on a level number a parent would otherwise have to compute and push down.
 *
 * Nested items go in a `children` slot — not in the spec's own slots table, added the same way
 * `bx-breadcrumb-item`'s `current` property was: the default slot is the label only, and a
 * separate slot is what lets the `children` CSS part wrap and hide exactly that content without
 * text-sniffing the default slot's assigned nodes.
 *
 * FR-TREE-ITEM-01's lazy loading is a three-event contract mirroring the shape (not the tag name)
 * of Shoelace's `sl-tree-item`: expanding a `lazy` item that hasn't loaded yet sets `loading` and
 * fires cancelable `bx-lazy-load`; the consumer does its async work, populates the `children` slot,
 * and sets `loading = false` (also setting `lazy-error` first if it failed) — this component reacts
 * to that transition by firing `bx-lazy-change` and, on success, actually expanding. A failed load
 * leaves `hasLoadedOnce` false, so clicking expand again simply retries.
 *
 * `indeterminate` and the checkbox's own `change` event exist for `bx-tree`'s tri-state parent
 * selection (FR-TREE-01): the expand-button and checkbox clicks both already `stopPropagation()`
 * on the originating `click`, so a bubbled `change` — dispatched separately, unaffected by that —
 * is `bx-tree`'s only signal that the checkbox (as opposed to the row, which it delegates itself)
 * changed this item's `selected`.
 *
 * @fires bx-expand - The item is expanding (fires before `expanded` takes visual effect).
 * @fires bx-after-expand - The item finished expanding.
 * @fires bx-collapse - The item is collapsing.
 * @fires bx-after-collapse - The item finished collapsing.
 * @fires bx-lazy-load - A `lazy` item that hasn't loaded is expanding for the first time.
 *   Cancelable: call `preventDefault()` to keep it collapsed. `detail: {}`.
 * @fires bx-lazy-change - `loading` finished. `detail: { loading: false, error: boolean }`.
 * @fires change - The checkbox (when `with-checkbox`) toggled `selected` (bubbles, composed).
 *
 * @slot (default) - Label content.
 * @slot expand-icon - Overrides the default chevron shown while collapsed.
 * @slot collapse-icon - Overrides the default chevron shown while expanded.
 * @slot children - Nested `bx-tree-item` elements.
 *
 * @csspart item - The row (indentation + controls + label).
 * @csspart indentation - The depth-based spacer before the row's controls.
 * @csspart expand-button - The expand/collapse control. Present when the item has children or is `lazy`.
 * @csspart spinner - The loading spinner shown in place of the chevron while `loading`.
 * @csspart checkbox - The selection checkbox. Present when `with-checkbox` is set.
 * @csspart label - The wrapper around the default slot.
 * @csspart children - The wrapper around the children slot; `hidden` while collapsed.
 * @cssprop --bx-tree-item-item-gap - Gap of the `item` part. Default `var(--bx-space-2xs)`.
 * @cssprop --bx-tree-item-item-min-height - Minimum height of the `item` part. Default `var(--bx-target-min)`.
 * @cssprop --bx-tree-item-item-padding-inline-end - Padding inline end of the `item` part. Default `var(--bx-space-xs)`.
 * @cssprop --bx-tree-item-item-radius - Corner radius of the `item` part. Default `var(--bx-radius-s)`.
 * @cssprop --bx-tree-item-item-fg - Text/icon color of the `item` part. Default `var(--bx-text-primary)`.
 * @cssprop --bx-tree-item-item-hover-bg - Background of the `item` part (hover state). Default `var(--bx-surface-subtle)`.
 * @cssprop --bx-tree-item-item-selected-bg - Background of the `item` part (selected state). Default `var(--bx-role-accent-subtle, var(--bx-surface-subtle))`.
 * @cssprop --bx-tree-item-item-selected-fg - Text/icon color of the `item` part (selected state). Default `var(--bx-role-accent-fg, var(--bx-text-primary))`.
 * @cssprop --bx-tree-item-item-disabled-fg - Text/icon color of the `item` part (disabled state). Default `var(--bx-text-disabled)`.
 * @cssprop --bx-tree-item-expand-button-size - Size (width and height) of the `expand-button` part. Default `var(--bx-target-min)`.
 * @cssprop --bx-tree-item-expand-button-fg - Text/icon color of the `expand-button` part. Default `var(--bx-text-secondary)`.
 * @cssprop --bx-tree-item-expand-button-focus-ring-width - Focus ring width of the `expand-button` part (focus state). Default `var(--bx-border-width-strong)`.
 * @cssprop --bx-tree-item-expand-button-focus-ring-color - Focus ring color of the `expand-button` part (focus state). Default `var(--bx-focus-ring)`.
 * @cssprop --bx-tree-item-expand-button-focus-ring-offset - Focus ring offset of the `expand-button` part (focus state). Default `calc(var(--bx-focus-ring-offset) * -1)`.
 * @cssprop --bx-tree-item-spinner-size - Size (width and height) of the `spinner` part. Default `0.9em`.
 * @cssprop --bx-tree-item-checkbox-size - Size (width and height) of the `checkbox` part. Default `calc(var(--bx-unit) * 1.25)`.
 * @cssprop --bx-tree-item-checkbox-border-width - Border width of the `checkbox` part. Default `var(--bx-border-width-strong)`.
 * @cssprop --bx-tree-item-checkbox-border-color - Border color of the `checkbox` part. Default `var(--bx-border-strong)`.
 * @cssprop --bx-tree-item-checkbox-radius - Corner radius of the `checkbox` part. Default `var(--bx-radius-s)`.
 * @cssprop --bx-tree-item-checkbox-bg - Background of the `checkbox` part. Default `var(--bx-surface-base)`.
 * @cssprop --bx-tree-item-checkbox-selected-border-color - Border color of the `checkbox` part (selected state). Default `var(--bx-role-accent)`.
 * @cssprop --bx-tree-item-checkbox-selected-bg - Background of the `checkbox` part (selected state). Default `var(--bx-role-accent)`.
 * @cssprop --bx-tree-item-checkbox-focus-ring-width - Focus ring width of the `checkbox` part (focus state). Default `var(--bx-border-width-strong)`.
 * @cssprop --bx-tree-item-checkbox-focus-ring-color - Focus ring color of the `checkbox` part (focus state). Default `var(--bx-focus-ring)`.
 * @cssprop --bx-tree-item-checkbox-focus-ring-offset - Focus ring offset of the `checkbox` part (focus state). Default `var(--bx-focus-ring-offset)`.
 * @cssprop --bx-tree-item-expand-button-icon-size - Size (width and height) of the icon inside the `expand-button` element. Default `0.75em`.
 * @cssprop --bx-tree-item-expand-button-error-fg - Color of the expand button after a lazy load failed. Default `var(--bx-role-danger-fg)`.
 * @cssprop --bx-tree-item-font-family - Font family of the root surface. Default `var(--bx-type-body-family)`.
 */
export class BxTreeItem extends BixElement {
  static override tagName = 'bx-tree-item';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        ${textFamily('--bx-tree-item', 'body')}
      }

      .item {
        display: flex;
        align-items: center;
        gap: var(--bx-tree-item-item-gap, var(--bx-space-2xs));
        min-block-size: var(
          --bx-tree-item-item-min-height,
          var(--bx-target-min)
        );
        padding-inline-end: var(
          --bx-tree-item-item-padding-inline-end,
          var(--bx-space-xs)
        );
        border-radius: var(--bx-tree-item-item-radius, var(--bx-radius-s));
        color: var(--bx-tree-item-item-fg, var(--bx-text-primary));
        cursor: pointer;
      }

      .item:hover {
        background: var(--bx-tree-item-item-hover-bg, var(--bx-surface-subtle));
      }

      :host([selected]) .item {
        background: var(
          --bx-tree-item-item-selected-bg,
          var(--bx-role-accent-subtle, var(--bx-surface-subtle))
        );
        color: var(
          --bx-tree-item-item-selected-fg,
          var(--bx-role-accent-fg, var(--bx-text-primary))
        );
      }

      :host([disabled]) .item {
        cursor: not-allowed;
        color: var(--bx-tree-item-item-disabled-fg, var(--bx-text-disabled));
      }

      .indentation {
        flex-shrink: 0;
        inline-size: calc(var(--bx-space-l) * var(--_level, 0));
      }

      .expand-button {
        all: unset;
        box-sizing: border-box;
        display: inline-flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        inline-size: var(
          --bx-tree-item-expand-button-size,
          var(--bx-target-min)
        );
        block-size: var(
          --bx-tree-item-expand-button-size,
          var(--bx-target-min)
        );
        margin-inline: calc((var(--bx-target-min) - 1.5em) / -2);
        color: var(--bx-tree-item-expand-button-fg, var(--bx-text-secondary));
        cursor: pointer;
      }

      .expand-button.placeholder {
        visibility: hidden;
        pointer-events: none;
      }

      .expand-button svg {
        inline-size: var(--bx-tree-item-expand-button-icon-size, 0.75em);
        block-size: var(--bx-tree-item-expand-button-icon-size, 0.75em);
        fill: currentColor;
        transition: rotate var(--bx-motion-duration-fast)
          var(--bx-motion-easing-standard);
      }

      :host([expanded]) .expand-button svg {
        rotate: 90deg;
      }

      :host(:dir(rtl)) .expand-button svg {
        rotate: 180deg;
      }
      :host(:dir(rtl)[expanded]) .expand-button svg {
        rotate: 90deg;
      }

      :host([lazy-error]) .expand-button {
        color: var(
          --bx-tree-item-expand-button-error-fg,
          var(--bx-role-danger-fg)
        );
      }

      .expand-button:focus-visible {
        outline: var(
            --bx-tree-item-expand-button-focus-ring-width,
            var(--bx-border-width-strong)
          )
          solid
          var(
            --bx-tree-item-expand-button-focus-ring-color,
            var(--bx-focus-ring)
          );
        outline-offset: var(
          --bx-tree-item-expand-button-focus-ring-offset,
          calc(var(--bx-focus-ring-offset) * -1)
        );
      }

      .spinner {
        display: inline-flex;
        inline-size: var(--bx-tree-item-spinner-size, 0.9em);
        block-size: var(--bx-tree-item-spinner-size, 0.9em);
        animation: bx-tree-item-spin var(--bx-motion-duration-spin) linear
          infinite;
      }

      .spinner circle {
        fill: none;
        stroke: currentColor;
        stroke-width: 3;
        stroke-linecap: round;
        stroke-dasharray: 60 200;
      }

      @keyframes bx-tree-item-spin {
        to {
          transform: rotate(360deg);
        }
      }

      .checkbox {
        box-sizing: border-box;
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: var(
          --bx-tree-item-checkbox-size,
          calc(var(--bx-unit) * 1.25)
        );
        block-size: var(
          --bx-tree-item-checkbox-size,
          calc(var(--bx-unit) * 1.25)
        );
        border: var(
            --bx-tree-item-checkbox-border-width,
            var(--bx-border-width-strong)
          )
          solid
          var(--bx-tree-item-checkbox-border-color, var(--bx-border-strong));
        border-radius: var(--bx-tree-item-checkbox-radius, var(--bx-radius-s));
        background: var(--bx-tree-item-checkbox-bg, var(--bx-surface-base));
        cursor: pointer;
      }

      :host([selected]) .checkbox,
      :host([indeterminate]) .checkbox {
        border-color: var(
          --bx-tree-item-checkbox-selected-border-color,
          var(--bx-role-accent)
        );
        background: var(
          --bx-tree-item-checkbox-selected-bg,
          var(--bx-role-accent)
        );
      }

      .checkbox svg {
        inline-size: 85%;
        block-size: 85%;
        fill: var(--bx-on-accent);
      }

      .checkbox:focus-visible {
        outline: var(
            --bx-tree-item-checkbox-focus-ring-width,
            var(--bx-border-width-strong)
          )
          solid
          var(--bx-tree-item-checkbox-focus-ring-color, var(--bx-focus-ring));
        outline-offset: var(
          --bx-tree-item-checkbox-focus-ring-offset,
          var(--bx-focus-ring-offset)
        );
      }

      .label {
        flex: 1;
        min-inline-size: 0;
      }

      .children[hidden] {
        display: none;
      }

      @media (prefers-reduced-motion: reduce) {
        .expand-button svg {
          transition: none;
        }
        .spinner {
          animation-duration: var(--bx-motion-duration-loop);
        }
      }

      @media (forced-colors: active) {
        :host([selected]) .item {
          forced-color-adjust: none;
          background: Highlight;
          color: HighlightText;
        }
        .checkbox {
          forced-color-adjust: none;
          border-color: CanvasText;
        }
        :host([selected]) .checkbox,
        :host([indeterminate]) .checkbox {
          background: Highlight;
          border-color: Highlight;
        }
      }
    `,
  ];

  static override properties = {
    expanded: { type: Boolean, reflect: true },
    selected: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    lazy: { type: Boolean, reflect: true },
    loading: { type: Boolean, reflect: true },
    lazyError: { type: Boolean, reflect: true, attribute: 'lazy-error' },
    withCheckbox: { type: Boolean, reflect: true, attribute: 'with-checkbox' },
    indeterminate: { type: Boolean, reflect: true },
    roving: { type: Boolean, reflect: true },
    _hasChildren: { state: true },
  };

  declare expanded: boolean;
  declare selected: boolean;
  declare disabled: boolean;
  declare lazy: boolean;
  declare loading: boolean;
  declare lazyError: boolean;
  declare withCheckbox: boolean;
  /** Tri-state selection visual, driven by `bx-tree` in multiple-selection mode (FR-TREE-01) —
   *  not in the spec's own properties table, the same kind of parent-owned addition `tab-stop`
   *  is on `bx-tab` for `bx-tab-group`. */
  declare indeterminate: boolean;
  /** Set by `bx-tree`: the expand-button and checkbox stop being their own tab stop, so the
   *  host's own roving `tabIndex` (which `bx-tree` manages directly, not through a property here)
   *  is the row's only tab stop, per APG's tree pattern. Standalone, both stay individually
   *  focusable — this class's doc comment explains why. */
  declare roving: boolean;
  /** @internal */
  declare _hasChildren: boolean;

  #hasLoadedOnce = false;

  constructor() {
    super();
    this.expanded = false;
    this.selected = false;
    this.disabled = false;
    this.lazy = false;
    this.loading = false;
    this.lazyError = false;
    this.withCheckbox = false;
    this.indeterminate = false;
    this.roving = false;
    this._hasChildren = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    let depth = 0;
    let ancestor = this.parentElement;
    while (ancestor) {
      if (ancestor.tagName === this.tagName) depth++;
      ancestor = ancestor.parentElement;
    }
    this.style.setProperty('--_level', String(depth));
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    // `hasUpdated` guards against the initial constructor assignment (`this.loading = false`)
    // showing up as a "change" on the very first update, which would otherwise auto-expand every
    // freshly-connected item.
    if (!this.hasUpdated || !changed.has('loading') || this.loading) return;
    // `loading` just finished (true -> false): report it, and on success (no `lazy-error`) proceed
    // to actually expand — a failed load leaves `#hasLoadedOnce` false so the next click retries.
    this.dispatchEvent(
      new CustomEvent('bx-lazy-change', {
        bubbles: true,
        composed: true,
        detail: { loading: false, error: this.lazyError },
      }),
    );
    if (!this.lazyError) {
      this.#hasLoadedOnce = true;
      this.#doExpand();
    }
  }

  get #hasExpandAffordance(): boolean {
    return this._hasChildren || this.lazy;
  }

  #handleChildrenSlotChange = (event: Event): void => {
    this._hasChildren =
      (event.target as HTMLSlotElement).assignedElements().length > 0;
  };

  #doExpand(): void {
    this.dispatchEvent(
      new CustomEvent('bx-expand', { bubbles: true, composed: true }),
    );
    this.expanded = true;
    this.dispatchEvent(
      new CustomEvent('bx-after-expand', { bubbles: true, composed: true }),
    );
  }

  #doCollapse(): void {
    this.dispatchEvent(
      new CustomEvent('bx-collapse', { bubbles: true, composed: true }),
    );
    this.expanded = false;
    this.dispatchEvent(
      new CustomEvent('bx-after-collapse', { bubbles: true, composed: true }),
    );
  }

  #toggleExpanded(): void {
    if (this.disabled || this.loading) return;

    if (this.expanded) {
      this.#doCollapse();
      return;
    }

    if (this.lazy && !this.#hasLoadedOnce) {
      this.lazyError = false;
      this.loading = true;
      const cancelled = !this.dispatchEvent(
        new CustomEvent('bx-lazy-load', {
          bubbles: true,
          composed: true,
          cancelable: true,
        }),
      );
      if (cancelled) this.loading = false;
      return;
    }

    this.#doExpand();
  }

  #handleExpandClick = (event: MouseEvent): void => {
    event.stopPropagation();
    this.#toggleExpanded();
  };

  #handleExpandKeydown = (event: KeyboardEvent): void => {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    event.stopPropagation();
    this.#toggleExpanded();
  };

  #toggleSelected(): void {
    this.selected = !this.selected;
    this.indeterminate = false;
    // The click/keydown that triggered this is `stopPropagation`-ed below (so `bx-tree`'s
    // delegated row-click handling doesn't also see it), so this is dispatched separately —
    // mirroring `bx-checkbox`'s own `change` event — as the only signal `bx-tree` gets that
    // selection changed via the checkbox rather than the row.
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  #handleCheckboxClick = (event: MouseEvent): void => {
    event.stopPropagation();
    if (this.disabled) return;
    this.#toggleSelected();
  };

  #handleCheckboxKeydown = (event: KeyboardEvent): void => {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    event.stopPropagation();
    if (this.disabled) return;
    this.#toggleSelected();
  };

  protected override render() {
    const showSpinner = this.loading;
    const showExpandButton = this.#hasExpandAffordance || showSpinner;

    return html`
      <div class="item" part="item">
        <span class="indentation" part="indentation"></span>
        <button
          type="button"
          class="expand-button ${showExpandButton ? '' : 'placeholder'}"
          part="expand-button"
          tabindex=${this.roving ? -1 : showExpandButton && !this.disabled ? 0 : -1}
          aria-hidden=${showExpandButton ? nothing : 'true'}
          aria-label=${this.expanded ? 'Collapse' : 'Expand'}
          aria-expanded=${showExpandButton ? this.expanded : nothing}
          aria-busy=${showSpinner}
          ?disabled=${this.disabled}
          @click=${this.#handleExpandClick}
          @keydown=${this.#handleExpandKeydown}
        >
          ${
            showSpinner
              ? html`<svg
                  class="spinner"
                  part="spinner"
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                >
                  <circle cx="16" cy="16" r="14"></circle>
                </svg>`
              : this.expanded
                ? html`<slot name="collapse-icon"
                    >${svg`<svg viewBox="0 0 256 256"><path d=${CHEVRON_RIGHT_PATH}></path></svg>`}</slot
                  >`
                : html`<slot name="expand-icon"
                    >${svg`<svg viewBox="0 0 256 256"><path d=${CHEVRON_RIGHT_PATH}></path></svg>`}</slot
                  >`
          }
        </button>
        ${
          this.withCheckbox
            ? html`<span
                class="checkbox"
                part="checkbox"
                role="checkbox"
                tabindex=${this.roving ? -1 : this.disabled ? -1 : 0}
                aria-checked=${this.indeterminate ? 'mixed' : this.selected}
                aria-disabled=${this.disabled}
                aria-label="Select"
                @click=${this.#handleCheckboxClick}
                @keydown=${this.#handleCheckboxKeydown}
              >
                ${
                  this.indeterminate
                    ? svg`<svg viewBox="0 0 256 256"><path d=${MINUS_PATH}></path></svg>`
                    : this.selected
                      ? svg`<svg viewBox="48 76 204 155"><path d=${CHECK_PATH}></path></svg>`
                      : nothing
                }
              </span>`
            : nothing
        }
        <span class="label" part="label"><slot></slot></span>
      </div>
      <div class="children" part="children" ?hidden=${!this.expanded}>
        <slot
          name="children"
          @slotchange=${this.#handleChildrenSlotChange}
        ></slot>
      </div>
    `;
  }
}
