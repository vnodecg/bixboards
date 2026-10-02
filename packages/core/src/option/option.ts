import { css, html, nothing, svg, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';
import { textFamily } from '../internal/text-style.ts';

// Vendored from packages/core/src/icon/default-library.ts (Phosphor Icons, regular/fill, MIT).
// This glyph's own ink isn't centered in the usual 256x256 canvas (bbox roughly x:72-228,
// y:100-207) — rendered below with viewBox="48 76 204 155" (centered on that bbox) instead of
// "0 0 256 256", so preserveAspectRatio's default centers it in the icon's square box. See
// packages/core/src/checkbox/checkbox.ts's own copy of this constant for the full note.
const CHECK_PATH =
  'M225.86,102.82c-3.77-3.94-10-4.1-13.94-.34l-83.6,80.13-38.86-40.14a10,10,0,0,0-14.34,13.94l45.7,47.24a10,10,0,0,0,7.17,3.05,10,10,0,0,0,6.94-2.79l90.6-86.85C229.46,113,229.63,106.75,225.86,102.82Z';

/**
 * `<bx-option>` — a single item inside `bx-select`.
 *
 * Deliberately inert (FR-OPTION-01): it owns no selection logic and attaches no listeners of its
 * own — `value`/`label`/`selected`/`disabled` are plain reflected properties that a parent list
 * (`bx-select`) reads and writes directly, the same way native `<option>` is a dumb data holder
 * for `<select>`. That parent is also responsible for focus management (`aria-activedescendant`)
 * per the APG listbox pattern; this element does not set `tabindex` itself.
 *
 * `role="option"`, `aria-selected` and `aria-disabled` live on the *host*, not on an element in
 * the shadow root: a combobox's `aria-activedescendant` has to point at the element that carries
 * the role, and an ID reference cannot reach into another element's shadow tree. The host
 * attributes are only written when the consumer has not set them, so an explicit `role` wins.
 * A parent that virtualizes sets `aria-setsize`/`aria-posinset` on the host directly. `data-active`
 * (set by the parent) paints the keyboard/hover highlight.
 *
 * @slot (default) - Label.
 * @slot start - Leading icon/adornment.
 * @slot end - Trailing icon/adornment.
 *
 * @csspart base - The host's inner wrapper.
 * @csspart checked-icon - The selection checkmark (or its reserved gutter space).
 * @csspart label - The wrapper around the default slot.
 * @csspart start - The wrapper around the `start` slot.
 * @csspart end - The wrapper around the `end` slot.
 * @cssprop --bx-option-gap - Gap of the root surface. Default `var(--bx-space-xs)`.
 * @cssprop --bx-option-min-height - Minimum height of the root surface. Default `var(--bx-target-min)`.
 * @cssprop --bx-option-padding-inline - Padding inline of the root surface. Default `var(--bx-space-s)`.
 * @cssprop --bx-option-fg - Text/icon color of the root surface. Default `var(--bx-text-primary)`.
 * @cssprop --bx-option-disabled-bg - Background of the root surface (disabled state). Default `var(--bx-surface-subtle)`.
 * @cssprop --bx-option-disabled-fg - Text/icon color of the root surface (disabled state). Default `var(--bx-text-disabled)`.
 * @cssprop --bx-option-checked-icon-size - Size (width and height) of the `checked-icon` part. Default `1em`.
 * @cssprop --bx-option-start-size - Size (width and height) of the `start` part. Default `1em`.
 * @cssprop --bx-option-font-family - Font family of the root surface. Default `var(--bx-type-body-family)`.
 */
export class BxOption extends BixElement {
  static override tagName = 'bx-option';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        ${textFamily('--bx-option', 'body')}
      }

      :host([hidden]) {
        display: none;
      }

      .base {
        display: flex;
        align-items: center;
        gap: var(--bx-option-gap, var(--bx-space-xs));
        min-block-size: var(--bx-option-min-height, var(--bx-target-min));
        padding-inline: var(--bx-option-padding-inline, var(--bx-space-s));
        color: var(--bx-option-fg, var(--bx-text-primary));
        cursor: pointer;
      }

      :host(:hover:not([disabled])) .base,
      :host([data-active]:not([disabled])) .base {
        background: var(--bx-option-disabled-bg, var(--bx-surface-subtle));
      }

      :host([disabled]) .base {
        cursor: not-allowed;
        color: var(--bx-option-disabled-fg, var(--bx-text-disabled));
      }

      .checked-icon {
        display: inline-flex;
        flex-shrink: 0;
        inline-size: var(--bx-option-checked-icon-size, 1em);
        block-size: var(--bx-option-checked-icon-size, 1em);
      }

      .checked-icon svg {
        inline-size: 100%;
        block-size: 100%;
        fill: var(--bx-role-accent);
      }

      .start,
      .end {
        display: inline-flex;
        flex-shrink: 0;
        inline-size: var(--bx-option-start-size, 1em);
        block-size: var(--bx-option-start-size, 1em);
      }

      .start ::slotted(*),
      .end ::slotted(*) {
        inline-size: 100%;
        block-size: 100%;
      }

      .label {
        flex: 1;
        min-inline-size: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      @media (forced-colors: active) {
        :host([data-active]) .base {
          forced-color-adjust: none;
          outline: var(--bx-border-width-strong) solid Highlight;
          outline-offset: calc(var(--bx-border-width-strong) * -1);
        }

        :host([selected]) .base {
          forced-color-adjust: none;
          background: Highlight;
          color: HighlightText;
        }
      }
    `,
  ];

  static override properties = {
    value: { type: String },
    label: { type: String },
    disabled: { type: Boolean, reflect: true },
    selected: { type: Boolean, reflect: true },
  };

  declare value: string;
  declare label: string;
  declare disabled: boolean;
  declare selected: boolean;

  constructor() {
    super();
    this.value = '';
    this.label = '';
    this.disabled = false;
    this.selected = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'option');
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('selected'))
      this.setAttribute('aria-selected', String(this.selected));
    if (changed.has('disabled'))
      this.setAttribute('aria-disabled', String(this.disabled));
  }

  protected override render() {
    return html`
      <div class="base" part="base">
        <span class="checked-icon" part="checked-icon">
          ${
            this.selected
              ? svg`<svg viewBox="48 76 204 155"><path d=${CHECK_PATH}></path></svg>`
              : nothing
          }
        </span>
        <span class="start" part="start"><slot name="start"></slot></span>
        <span class="label" part="label"><slot></slot></span>
        <span class="end" part="end"><slot name="end"></slot></span>
      </div>
    `;
  }
}
