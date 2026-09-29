import { css, html, nothing, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';

/**
 * `<bx-avatar-group>` — overlapping stack of `bx-avatar` with a "+N" overflow indicator.
 *
 * Overlap comes from a negative inline margin on slotted avatars; overflow beyond `max` is
 * collapsed into a trailing "+N" badge rather than measured from container width, so it stays
 * deterministic under SSR and in tests (docs/features/core/avatar.md FR-AVATAR-02).
 *
 * @slot (default) - `bx-avatar` elements.
 *
 * @csspart base - The host's inner wrapper.
 * @csspart overflow - The "+N" indicator, present when there are more than `max` avatars.
 *
 * @cssprop --bx-avatar-group-overlap - How much each avatar overlaps the previous one. Default `-0.5em`.
 */
export class BxAvatarGroup extends BixElement {
  static override tagName = 'bx-avatar-group';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-flex;
      }

      .base {
        display: inline-flex;
        align-items: center;
      }

      ::slotted(*) {
        border: var(--bx-border-width-strong) solid var(--bx-surface-base);
        margin-inline-start: var(--bx-avatar-group-overlap, -0.5em);
      }

      ::slotted(:first-child) {
        margin-inline-start: 0;
      }

      .overflow {
        display: grid;
        place-items: center;
        inline-size: var(--bx-avatar-size, calc(var(--bx-unit) * 2.5));
        block-size: var(--bx-avatar-size, calc(var(--bx-unit) * 2.5));
        border-radius: var(--bx-radius-pill);
        border: var(--bx-border-width-strong) solid var(--bx-surface-base);
        margin-inline-start: var(--bx-avatar-group-overlap, -0.5em);
        background: var(--bx-surface-muted);
        color: var(--bx-text-secondary);
        font-family: var(--bx-font-family-sans);
        font-size: var(--bx-font-xs);
        font-weight: var(--bx-font-weight-semibold);
      }
    `,
  ];

  static override properties = {
    max: { type: Number },
    _overflowCount: { state: true },
  };

  declare max?: number;
  /** @internal */
  declare _overflowCount: number;

  constructor() {
    super();
    this._overflowCount = 0;
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('max')) this.#applyMax();
  }

  #handleSlotChange = (): void => this.#applyMax();

  #applyMax(): void {
    const children = Array.from(this.children);
    if (!this.max || children.length <= this.max) {
      for (const child of children) child.removeAttribute('hidden');
      this._overflowCount = 0;
      return;
    }
    children.forEach((child, i) => {
      if (i < this.max!) child.removeAttribute('hidden');
      else child.setAttribute('hidden', '');
    });
    this._overflowCount = children.length - this.max;
  }

  protected override render() {
    return html`
      <span class="base" part="base">
        <slot @slotchange=${this.#handleSlotChange}></slot>
        ${
          this._overflowCount > 0
            ? html`<span class="overflow" part="overflow"
                >+${this._overflowCount}</span
              >`
            : nothing
        }
      </span>
    `;
  }
}
