import { css, html, nothing, svg } from 'lit';
import { BixElement } from '../bix-element.ts';

// Vendored from packages/core/src/icon/default-library.ts (Phosphor Icons, regular/fill, MIT).
// This glyph's own ink isn't centered in the usual 256x256 canvas (bbox roughly x:72-228,
// y:100-207) — rendered below with viewBox="48 76 204 155" (centered on that bbox) instead of
// "0 0 256 256", so preserveAspectRatio's default centers it in the icon's square box. See
// packages/core/src/checkbox/checkbox.ts's own copy of this constant for the full note.
const CHECK_PATH =
  'M225.86,102.82c-3.77-3.94-10-4.1-13.94-.34l-83.6,80.13-38.86-40.14a10,10,0,0,0-14.34,13.94l45.7,47.24a10,10,0,0,0,7.17,3.05,10,10,0,0,0,6.94-2.79l90.6-86.85C229.46,113,229.63,106.75,225.86,102.82Z';

/**
 * `<bx-option>` — a single item inside `bx-select` (not yet built).
 *
 * Deliberately inert (FR-OPTION-01): it owns no selection logic and attaches no listeners of its
 * own — `value`/`label`/`selected`/`disabled` are plain reflected properties that a parent list
 * (the future `bx-select`) reads and writes directly, the same way native `<option>` is a dumb
 * data holder for `<select>`. That parent is also responsible for focus management (roving
 * tabindex or `aria-activedescendant`) per the APG listbox pattern; this element does not set
 * `tabindex` itself.
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
 */
export class BxOption extends BixElement {
  static override tagName = 'bx-option';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        font-family: var(--bx-font-family-sans);
      }

      .base {
        display: flex;
        align-items: center;
        gap: var(--bx-space-xs);
        min-block-size: var(--bx-target-min, 2.75rem);
        padding-inline: var(--bx-space-s);
        color: var(--bx-text-primary);
        cursor: pointer;
      }

      :host([disabled]) .base {
        cursor: not-allowed;
        color: var(--bx-text-disabled);
      }

      .checked-icon {
        display: inline-flex;
        flex-shrink: 0;
        inline-size: 1em;
        block-size: 1em;
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
        inline-size: 1em;
        block-size: 1em;
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

  protected override render() {
    return html`
      <div
        class="base"
        part="base"
        role="option"
        aria-selected=${this.selected}
        aria-disabled=${this.disabled}
      >
        <span class="checked-icon" part="checked-icon">
          ${this.selected
            ? svg`<svg viewBox="48 76 204 155"><path d=${CHECK_PATH}></path></svg>`
            : nothing}
        </span>
        <span class="start" part="start"><slot name="start"></slot></span>
        <span class="label" part="label"><slot></slot></span>
        <span class="end" part="end"><slot name="end"></slot></span>
      </div>
    `;
  }
}
