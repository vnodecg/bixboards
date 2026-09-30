import { css, html, nothing, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';

/**
 * `<bx-button-group>` — groups related buttons into a single segmented control with shared borders
 * (docs/features/core/button-group.md).
 *
 * Children keep their own identity and behavior — the group only lays them out and squares their
 * inner corners. The corners are shaped through `bx-button`'s public `--bx-button-radius` custom
 * property (set on each slotted item via `::slotted`, and inherited on into wrappers such as
 * `bx-copy-button`), not by reaching into any child's shadow root, so any component that ends in a
 * `bx-button` composes (FR-BUTTON-GROUP-01). A `bx-tooltip` wrapped item is made a real box
 * (`display: inline-flex`, overriding its `display: contents`) so it can take part in the seams and
 * the hover/focus raise. RTL flips the outer-corner rounding via `:dir(rtl)`.
 *
 * Seams collapse by pulling every item after the first back by one border width; `--bx-button-group-gap`
 * overrides that offset (set a positive length for a spaced-out group). A hovered or focused item is
 * raised above its neighbors (FR-BUTTON-GROUP-03) so its border and focus ring are not clipped.
 *
 * `variant` and `size`, when set, are applied to every descendant `bx-button` and `bx-copy-button` (FR-BUTTON-GROUP
 * property table: "optionally forces variant/size on children"). Unset, each button keeps its own.
 *
 * Not implemented from the spec, flagged inline per docs/features/_conventions.md: FR-BUTTON-GROUP-04's
 * `overflow="menu"` (needs `bx-dropdown`, Tier 4), the `stack-narrow` container-query stacking and
 * the `toolbar` roving-arrow-key mode. Each button stays in the tab order, which is the default
 * behavior §6 asks for.
 *
 * @slot (default) - `bx-button`, `bx-copy-button` or `bx-tooltip`-wrapped items.
 *
 * @csspart base - The `role="group"` wrapper.
 *
 * @cssprop --bx-button-group-gap - Offset between items. Default `-1 * --bx-border-width` (shared seam).
 * @cssprop --bx-button-group-radius - Outer corner radius. Default `--bx-radius-m`.
 */
export class BxButtonGroup extends BixElement {
  static override tagName = 'bx-button-group';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-flex;
        vertical-align: middle;
      }

      .base {
        --_r: var(--bx-button-group-radius, var(--bx-radius-m, 0.5rem));
        --_gap: var(
          --bx-button-group-gap,
          calc(-1 * var(--bx-border-width, 1px))
        );
        display: flex;
        flex-direction: row;
        align-items: stretch;
      }

      :host([orientation='vertical']) .base {
        flex-direction: column;
      }

      ::slotted(bx-tooltip) {
        display: inline-flex;
      }

      /* Square every inner corner, then round only the outer edges. */
      ::slotted(*) {
        --bx-button-radius: 0;
      }
      ::slotted(:first-child) {
        --bx-button-radius: var(--_r) 0 0 var(--_r);
      }
      ::slotted(:last-child) {
        --bx-button-radius: 0 var(--_r) var(--_r) 0;
      }
      .base:dir(rtl) ::slotted(:first-child) {
        --bx-button-radius: 0 var(--_r) var(--_r) 0;
      }
      .base:dir(rtl) ::slotted(:last-child) {
        --bx-button-radius: var(--_r) 0 0 var(--_r);
      }
      :host([orientation='vertical']) ::slotted(:first-child) {
        --bx-button-radius: var(--_r) var(--_r) 0 0;
      }
      :host([orientation='vertical']) ::slotted(:last-child) {
        --bx-button-radius: 0 0 var(--_r) var(--_r);
      }
      ::slotted(:only-child),
      .base:dir(rtl) ::slotted(:only-child),
      :host([orientation='vertical']) ::slotted(:only-child) {
        --bx-button-radius: var(--_r);
      }

      /* Shared seam. */
      ::slotted(:not(:first-child)) {
        margin-inline-start: var(--_gap);
      }
      :host([orientation='vertical']) ::slotted(:not(:first-child)) {
        margin-inline-start: 0;
        margin-block-start: var(--_gap);
      }

      /* FR-BUTTON-GROUP-03: keep the active item's border and focus ring on top. Flex items honor
         z-index without being positioned — deliberately not \`position: relative\`, which would make
         the item the containing block for a descendant tooltip's absolutely positioned popup. */
      ::slotted(:hover),
      ::slotted(:focus-within) {
        z-index: 1;
      }
    `,
  ];

  static override properties = {
    label: { type: String },
    orientation: { type: String, reflect: true },
    variant: { type: String },
    size: { type: String },
  };

  declare label: string;
  declare orientation: 'horizontal' | 'vertical';
  declare variant: string;
  declare size: string;

  constructor() {
    super();
    this.label = '';
    this.orientation = 'horizontal';
    this.variant = '';
    this.size = '';
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('variant') || changed.has('size')) this.#applyForced();
  }

  #applyForced(): void {
    if (!this.variant && !this.size) return;
    for (const child of Array.from(this.children)) {
      const buttons = child.matches('bx-button, bx-copy-button')
        ? [child]
        : Array.from(child.querySelectorAll('bx-button, bx-copy-button'));
      for (const button of buttons) {
        if (this.variant) button.setAttribute('variant', this.variant);
        if (this.size) button.setAttribute('size', this.size);
      }
    }
  }

  protected override render() {
    return html`
      <div
        class="base"
        part="base"
        role="group"
        aria-label=${this.label || nothing}
      >
        <slot @slotchange=${this.#applyForced}></slot>
      </div>
    `;
  }
}
