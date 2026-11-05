import { css, html, nothing, svg, type PropertyValues } from 'lit';
import { live } from 'lit/directives/live.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { repeat } from 'lit/directives/repeat.js';
import { BixElement } from '../bix-element.ts';
import { FormAssociatedMixin } from '../internal/form-associated.ts';
import { observeResize } from '../internal/shared-observers.ts';
import { BxOption } from '../option/option.ts';
import type { BxPopup } from '../popup/popup.ts';
import { VirtualizerController } from '../virtualizer/virtualizer-controller.ts';
import {
  RowIndex,
  findByPrefix,
  optionKey,
  ordinalsOf,
  rowsFromOptions,
  type OptionRow,
  type SelectOption,
  type SelectRow,
} from './select-model.ts';
import { textStyle, textFamily } from '../internal/text-style.ts';

type Size = 'small' | 'medium' | 'large';
type Appearance = 'outlined' | 'filled' | 'filled outlined';
type Virtual = boolean | 'auto';

const CARET_DOWN_PATH =
  'M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z';
const CLEAR_PATH =
  'M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20Zm37.66,130.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,22.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32L139.31,128Z';

/** Past this many options `virtual="auto"` switches to a windowed list. */
const AUTO_VIRTUAL_THRESHOLD = 200;
const SEARCH_DEBOUNCE_MS = 250;
const TYPEAHEAD_RESET_MS = 700;
const PAGE_STEP = 10;
const OVERSCAN = 6;
/** Distance from the end of the list, in rows, at which `bx-load-more` fires. */
const LOAD_MORE_ROWS = 5;
const VALUE_MISSING_MESSAGE = 'Please select an item in the list.';

let nextId = 0;

/**
 * `<bx-select>` — single or multiple choice with a searchable, virtualized listbox and
 * removable-badge display for selections (docs/features/core/select.md).
 *
 * **ARIA.** The focus target is a native `<input role="combobox">` in the shadow root (readonly
 * unless `searchable`), so the browser supplies caret, IME and selection behavior. DOM focus
 * never leaves it: the highlighted option is exposed through `aria-activedescendant`, which is
 * what keeps FR-SELECT-06 true when option nodes are recycled by the virtualizer. The ID
 * reference crosses from this shadow root to a slotted light-DOM `bx-option`, so it is set through
 * the `ariaActiveDescendantElement` element-reflection property (`bx-option` carries `role="option"`
 * on its host for exactly that reason). Browsers without element reflection fall back to the
 * `aria-activedescendant` attribute, which only resolves for options rendered in this shadow root
 * (data-driven / virtual lists).
 *
 * **Options.** Either slotted `bx-option`/`bx-divider` children or the `options` data array
 * (`{ value, label?, disabled?, group? }`; required for 10k+ items since it creates no elements).
 * Both are normalized into one row model, so search, typeahead, selected-label lookup and
 * `aria-setsize`/`aria-posinset` always run over the *full* data set, never the rendered window.
 * When the list is windowed (`virtual`, or `auto` at 200+ options) the slotted options are used as
 * data only and rows are rendered by this component, so a slotted option's `start`/`end` slot
 * content is not shown in that mode. Slotted `label`/`value` are read from attributes and text;
 * changing them through properties alone is not observed.
 *
 * **Deviations / gaps, per docs/features/_conventions.md's "say so inline" rule:**
 * - FR-SELECT-04's "index built off-thread" is not implemented: filtering and typeahead run on the
 *   main thread over lazily-built, pre-lowered search keys (a few ms at 100k rows).
 * - `readonly` and `open` are added (neither is in the spec's property table). `form` is the
 *   native `form` content attribute, which the browser already honors for form-associated
 *   elements, so it is not re-declared as a property.
 * - `value` is a `string` when single and a `string[]` when `multiple`; as an attribute, multiple
 *   values are whitespace-separated. A multiple select submits one `FormData` entry per value.
 * - `bx-search` is emitted only when `remote` is set (it replaces local filtering); `detail.signal`
 *   is aborted when a newer query supersedes it (FR-SELECT-07).
 * - Group headers are visual rows (`role="presentation"`), not `role="group"`: a flat, windowed
 *   list cannot nest options inside a group element.
 * - `max-options-visible="auto"` fits tags to the measured width using the shared
 *   `ResizeObserver`.
 * - `required` has no visual asterisk of its own; style it from the label.
 *
 * @fires input - The user changed the value (bubbles, composed).
 * @fires change - The user committed a change (bubbles, composed).
 * @fires bx-invalid - Constraint validation failed.
 * @fires bx-clear - The clear button was activated.
 * @fires bx-show - The listbox is opening. Cancelable.
 * @fires bx-after-show - The listbox opened.
 * @fires bx-hide - The listbox is closing via `hide()`. Cancelable.
 * @fires bx-after-hide - The listbox closed.
 * @fires bx-search - `remote` mode: the query changed. `detail: { query, signal }`, debounced.
 * @fires bx-load-more - The list scrolled near its end; load the next page.
 *
 * @slot - `bx-option` and `bx-divider` elements.
 * @slot label - Overrides the `label` attribute's text.
 * @slot hint - Overrides the `hint` attribute's text.
 * @slot start - Content before the value (icon, prefix).
 * @slot end - Content after the value (icon, suffix).
 * @slot clear-icon - Overrides the default clear-button icon.
 * @slot expand-icon - Overrides the default caret.
 *
 * @csspart form-control - The outer wrapper (label + combobox + hint).
 * @csspart label - The label element.
 * @csspart hint - The wrapper around the hint slot.
 * @csspart combobox - The bordered control that opens the listbox.
 * @csspart display-input - The native `<input role="combobox">`.
 * @csspart listbox - The scrollable `role="listbox"` element.
 * @csspart tags - The wrapper around selected-value badges (`multiple`).
 * @csspart tag - A selected-value badge, including the `+N` overflow badge.
 * @csspart clear-button - The clear button.
 * @csspart expand-icon - The caret.
 *
 * @cssprop --bx-select-max-height - Max height of the listbox. Default `20rem`, further bounded by
 *   the space available in the viewport.
 * @cssprop --bx-select-form-control-gap - Gap of the `form-control` part. Default `var(--bx-space-xs)`.
 * @cssprop --bx-select-label-fg - Text/icon color of the `label` part. Default `var(--bx-text-primary)`.
 * @cssprop --bx-select-combobox-gap - Gap of the `combobox` part. Default `var(--bx-space-xs)`.
 * @cssprop --bx-select-combobox-padding-inline - Padding inline of the `combobox` part. Default `var(--bx-space-s)`.
 * @cssprop --bx-select-combobox-radius - Corner radius of the `combobox` part. Default `var(--bx-radius-m)`.
 * @cssprop --bx-select-combobox-border-width - Border width of the `combobox` part. Default `var(--bx-border-width)`.
 * @cssprop --bx-select-combobox-border-color - Border color of the `combobox` part. Default `var(--bx-border-subtle)`.
 * @cssprop --bx-select-combobox-bg - Background of the `combobox` part. Default `var(--bx-surface-base)`.
 * @cssprop --bx-select-combobox-hover-border-color - Border color of the `combobox` part (hover state). Default `var(--bx-border-strong)`.
 * @cssprop --bx-select-combobox-focus-border-color - Border color of the `combobox` part (focus state). Default `var(--bx-focus-ring)`.
 * @cssprop --bx-select-combobox-focus-shadow - Box shadow of the `combobox` part (focus state). Default `0 0 0 calc(var(--bx-border-width-strong) * 1.5) color-mix(in srgb, var(--bx-focus-ring) 22%, transparent)`.
 * @cssprop --bx-select-combobox-focus-ring-width - Focus ring width of the `combobox` part (focus state). Default `var(--bx-border-width-strong)`.
 * @cssprop --bx-select-combobox-hover-bg - Background of the `combobox` part (hover state). Default `var(--bx-surface-muted)`.
 * @cssprop --bx-select-combobox-focus-bg - Background of the `combobox` part (focus state). Default `var(--bx-surface-base)`.
 * @cssprop --bx-select-combobox-disabled-bg - Background of the `combobox` part (disabled state). Default `var(--bx-surface-subtle)`.
 * @cssprop --bx-select-combobox-disabled-border-color - Border color of the `combobox` part (disabled state). Default `var(--bx-border-subtle)`.
 * @cssprop --bx-select-combobox-disabled-fg - Text/icon color of the `combobox` part (disabled state). Default `var(--bx-text-disabled)`.
 * @cssprop --bx-select-combobox-invalid-border-color - Border color of the `combobox` part (invalid state). Default `var(--bx-role-danger-border)`.
 * @cssprop --bx-select-combobox-invalid-focus-shadow - Box shadow of the `combobox` part (invalid + focus state). Default `0 0 0 calc(var(--bx-border-width-strong) * 1.5) color-mix(in srgb, var(--bx-role-danger-border) 22%, transparent)`.
 * @cssprop --bx-select-value-area-gap - Gap of the `value-area` element. Default `var(--bx-space-xs)`.
 * @cssprop --bx-select-value-area-padding-block - Padding block of the `value-area` element. Default `var(--bx-space-xs)`.
 * @cssprop --bx-select-display-input-min-width - Minimum width of the `display-input` part. Default `4ch`.
 * @cssprop --bx-select-display-input-fg - Text/icon color of the `display-input` part. Default `var(--bx-text-primary)`.
 * @cssprop --bx-select-display-input-disabled-fg - Text/icon color of the `display-input` part (disabled state). Default `var(--bx-text-disabled)`.
 * @cssprop --bx-select-display-input-placeholder-fg - Text/icon color of the `display-input` part's `::placeholder`. Default `var(--bx-text-hint)`.
 * @cssprop --bx-select-display-input-placeholder-opacity - Opacity of the `display-input` part's `::placeholder`. Default `1`.
 * @cssprop --bx-select-start-fg - Text/icon color of the `start` element. Default `var(--bx-text-hint)`.
 * @cssprop --bx-select-clear-button-size - Size (width and height) of the `clear-button` part. Default `1.5em`.
 * @cssprop --bx-select-clear-button-radius - Corner radius of the `clear-button` part. Default `var(--bx-radius-pill)`.
 * @cssprop --bx-select-clear-button-fg - Text/icon color of the `clear-button` part. Default `var(--bx-text-hint)`.
 * @cssprop --bx-select-clear-button-hover-fg - Text/icon color of the `clear-button` part (hover state). Default `var(--bx-text-primary)`.
 * @cssprop --bx-select-clear-button-focus-ring-width - Focus ring width of the `clear-button` part (focus state). Default `var(--bx-border-width-strong)`.
 * @cssprop --bx-select-clear-button-focus-ring-color - Focus ring color of the `clear-button` part (focus state). Default `var(--bx-focus-ring)`.
 * @cssprop --bx-select-clear-button-focus-ring-offset - Focus ring offset of the `clear-button` part (focus state). Default `var(--bx-focus-ring-offset)`.
 * @cssprop --bx-select-expand-icon-fg - Text/icon color of the `expand-icon` part. Default `var(--bx-text-hint)`.
 * @cssprop --bx-select-hint-fg - Text/icon color of the `hint` part. Default `var(--bx-text-secondary)`.
 * @cssprop --bx-select-hint-invalid-fg - Text/icon color of the `hint` part (invalid state). Default `var(--bx-role-danger-fg)`.
 * @cssprop --bx-select-panel-border-width - Border width of the `panel` element. Default `var(--bx-border-width)`.
 * @cssprop --bx-select-panel-border-color - Border color of the `panel` element. Default `var(--bx-border-subtle)`.
 * @cssprop --bx-select-panel-radius - Corner radius of the `panel` element. Default `var(--bx-radius-m)`.
 * @cssprop --bx-select-panel-shadow - Box shadow of the `panel` element. Default `var(--bx-shadow-m)`.
 * @cssprop --bx-select-panel-bg - Background of the `panel` element. Default `var(--bx-surface-base)`.
 * @cssprop --bx-select-panel-fg - Text/icon color of the `panel` element. Default `var(--bx-text-primary)`.
 * @cssprop --bx-select-hr-block-start-border-width - Block start border width of the `hr` element. Default `var(--bx-border-width)`.
 * @cssprop --bx-select-hr-block-start-border-color - Block start border color of the `hr` element. Default `var(--bx-border-subtle)`.
 * @cssprop --bx-select-group-label-padding-block - Padding block of the `group-label` element. Default `var(--bx-space-xs)`.
 * @cssprop --bx-select-group-label-padding-inline - Padding inline of the `group-label` element. Default `var(--bx-space-s)`.
 * @cssprop --bx-select-group-label-fg - Text/icon color of the `group-label` element. Default `var(--bx-text-secondary)`.
 * @cssprop --bx-select-status-gap - Gap of the `status` element. Default `var(--bx-space-xs)`.
 * @cssprop --bx-select-status-padding - Padding of the `status` element. Default `var(--bx-space-s)`.
 * @cssprop --bx-select-status-fg - Text/icon color of the `status` element. Default `var(--bx-text-secondary)`.
 * @cssprop --bx-select-clear-button-icon-size - Size (width and height) of the icon inside the `clear-button` element. Default `1em`.
 * @cssprop --bx-select-height - Combobox minimum height. Default derived from `size`.
 * @cssprop --bx-select-font-family - Font family of the root surface. Default `var(--bx-type-body-family)`.
 * @cssprop --bx-select-label-font-family - Font family of the `label` part (text style `label-s`). Default `var(--bx-type-label-family)`.
 * @cssprop --bx-select-label-font-size - Font size of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-size)`.
 * @cssprop --bx-select-label-font-weight - Font weight of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-weight)`.
 * @cssprop --bx-select-label-line-height - Line height of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-leading)`.
 * @cssprop --bx-select-label-letter-spacing - Letter spacing of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-tracking)`.
 * @cssprop --bx-select-display-input-font-family - Font family of the `display-input` part (text style `field-m`). Default `var(--bx-type-field-family)`.
 * @cssprop --bx-select-display-input-font-size - Font size of the `display-input` part (text style `field-m`). Default `var(--bx-type-field-m-size)`.
 * @cssprop --bx-select-display-input-font-weight - Font weight of the `display-input` part (text style `field-m`). Default `var(--bx-type-field-m-weight)`.
 * @cssprop --bx-select-display-input-line-height - Line height of the `display-input` part (text style `field-m`). Default `var(--bx-type-field-m-leading)`.
 * @cssprop --bx-select-display-input-letter-spacing - Letter spacing of the `display-input` part (text style `field-m`). Default `var(--bx-type-field-m-tracking)`.
 * @cssprop --bx-select-hint-font-family - Font family of the `hint` part (text style `body-s`). Default `var(--bx-type-body-family)`.
 * @cssprop --bx-select-hint-font-size - Font size of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-size)`.
 * @cssprop --bx-select-hint-font-weight - Font weight of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-weight)`.
 * @cssprop --bx-select-hint-line-height - Line height of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-leading)`.
 * @cssprop --bx-select-hint-letter-spacing - Letter spacing of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-tracking)`.
 * @cssprop --bx-select-panel-font-family - Font family of the `panel` element (text style `body-m`). Default `var(--bx-type-body-family)`.
 * @cssprop --bx-select-panel-font-size - Font size of the `panel` element (text style `body-m`). Default `var(--bx-type-body-m-size)`.
 * @cssprop --bx-select-panel-font-weight - Font weight of the `panel` element (text style `body-m`). Default `var(--bx-type-body-m-weight)`.
 * @cssprop --bx-select-panel-line-height - Line height of the `panel` element (text style `body-m`). Default `var(--bx-type-body-m-leading)`.
 * @cssprop --bx-select-panel-letter-spacing - Letter spacing of the `panel` element (text style `body-m`). Default `var(--bx-type-body-m-tracking)`.
 * @cssprop --bx-select-group-label-font-family - Font family of the `group-label` element (text style `label-s`). Default `var(--bx-type-label-family)`.
 * @cssprop --bx-select-group-label-font-size - Font size of the `group-label` element (text style `label-s`). Default `var(--bx-type-label-s-size)`.
 * @cssprop --bx-select-group-label-font-weight - Font weight of the `group-label` element (text style `label-s`). Default `var(--bx-type-label-s-weight)`.
 * @cssprop --bx-select-group-label-line-height - Line height of the `group-label` element (text style `label-s`). Default `var(--bx-type-label-s-leading)`.
 * @cssprop --bx-select-group-label-letter-spacing - Letter spacing of the `group-label` element (text style `label-s`). Default `var(--bx-type-label-s-tracking)`.
 * @cssprop --bx-select-status-font-family - Font family of the `status` element (text style `body-s`). Default `var(--bx-type-body-family)`.
 * @cssprop --bx-select-status-font-size - Font size of the `status` element (text style `body-s`). Default `var(--bx-type-body-s-size)`.
 * @cssprop --bx-select-status-font-weight - Font weight of the `status` element (text style `body-s`). Default `var(--bx-type-body-s-weight)`.
 * @cssprop --bx-select-status-line-height - Line height of the `status` element (text style `body-s`). Default `var(--bx-type-body-s-leading)`.
 * @cssprop --bx-select-status-letter-spacing - Letter spacing of the `status` element (text style `body-s`). Default `var(--bx-type-body-s-tracking)`.
 */
export class BxSelect extends FormAssociatedMixin(BixElement) {
  static override tagName = 'bx-select';

  static override shadowRootOptions: ShadowRootInit = {
    ...BixElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        ${textFamily('--bx-select', 'body')}
      }

      :host([hidden]) {
        display: none;
      }

      .form-control {
        display: flex;
        flex-direction: column;
        gap: var(--bx-select-form-control-gap, var(--bx-space-xs));
      }

      .label {
        color: var(--bx-select-label-fg, var(--bx-text-primary));

        ${textStyle('--bx-select-label', 'label-s')}
      }

      .label:empty {
        display: none;
      }

      .combobox {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: var(--bx-select-combobox-gap, var(--bx-space-xs));
        --_height: max(var(--bx-control-height-m), var(--bx-target-min));
        min-block-size: var(--bx-select-height, var(--_height));
        padding-inline: var(
          --bx-select-combobox-padding-inline,
          var(--bx-space-s)
        );
        border-radius: var(--bx-select-combobox-radius, var(--bx-radius-m));
        border: var(--bx-select-combobox-border-width, var(--bx-border-width))
          solid var(--bx-select-combobox-border-color, var(--bx-border-subtle));
        background: var(--bx-select-combobox-bg, var(--bx-surface-base));
        cursor: pointer;
        transition:
          border-color var(--bx-motion-duration-fast)
            var(--bx-motion-easing-standard),
          box-shadow var(--bx-motion-duration-fast)
            var(--bx-motion-easing-standard),
          background-color var(--bx-motion-duration-fast)
            var(--bx-motion-easing-standard);
      }

      .combobox:hover {
        border-color: var(
          --bx-select-combobox-hover-border-color,
          var(--bx-border-strong)
        );
      }

      .combobox:focus-within {
        border-color: var(
          --bx-select-combobox-focus-border-color,
          var(--bx-focus-ring)
        );
        box-shadow: var(
          --bx-select-combobox-focus-shadow,
          0 0 0 calc(var(--bx-border-width-strong) * 1.5)
            color-mix(in srgb, var(--bx-focus-ring) 22%, transparent)
        );
        outline: var(
            --bx-select-combobox-focus-ring-width,
            var(--bx-border-width-strong)
          )
          solid transparent;
      }

      :host([size='small']) .combobox {
        --_height: max(var(--bx-control-height-s), var(--bx-target-min));
      }
      :host([size='large']) .combobox {
        --_height: max(var(--bx-control-height-l), var(--bx-target-min));
      }

      :host([appearance~='filled']) .combobox {
        background: var(--bx-select-combobox-bg, var(--bx-surface-subtle));
        border-color: transparent;
      }
      :host([appearance='filled']) .combobox:hover {
        background: var(--bx-select-combobox-hover-bg, var(--bx-surface-muted));
      }
      :host([appearance~='filled']) .combobox:focus-within {
        background: var(--bx-select-combobox-focus-bg, var(--bx-surface-base));
        border-color: var(
          --bx-select-combobox-focus-border-color,
          var(--bx-focus-ring)
        );
      }

      :host([pill]) .combobox {
        border-radius: var(--bx-select-combobox-radius, var(--bx-radius-pill));
      }

      :host([disabled]) .combobox {
        background: var(
          --bx-select-combobox-disabled-bg,
          var(--bx-surface-subtle)
        );
        border-color: var(
          --bx-select-combobox-disabled-border-color,
          var(--bx-border-subtle)
        );
        color: var(--bx-select-combobox-disabled-fg, var(--bx-text-disabled));
        cursor: not-allowed;
      }

      .combobox[data-user-invalid] {
        border-color: var(
          --bx-select-combobox-invalid-border-color,
          var(--bx-role-danger-border)
        );
      }
      .combobox[data-user-invalid]:focus-within {
        box-shadow: var(
          --bx-select-combobox-invalid-focus-shadow,
          0 0 0 calc(var(--bx-border-width-strong) * 1.5)
            color-mix(in srgb, var(--bx-role-danger-border) 22%, transparent)
        );
      }

      .value-area {
        display: flex;
        flex: 1;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--bx-select-value-area-gap, var(--bx-space-xs));
        min-inline-size: 0;
        padding-block: var(
          --bx-select-value-area-padding-block,
          var(--bx-space-xs)
        );
      }

      :host([data-fit]) .value-area {
        flex-wrap: nowrap;
        overflow: hidden;
      }

      .tags {
        display: contents;
      }

      .tag {
        flex-shrink: 0;
      }

      .tag[hidden] {
        display: none;
      }

      .display-input {
        all: unset;
        box-sizing: border-box;
        flex: 1 1 4ch;
        min-inline-size: var(--bx-select-display-input-min-width, 4ch);
        font: inherit;

        ${textStyle('--bx-select-display-input', 'field-m')}

        color: var(--bx-select-display-input-fg, var(--bx-text-primary));
        cursor: inherit;
        text-overflow: ellipsis;
      }

      :host([disabled]) .display-input {
        color: var(
          --bx-select-display-input-disabled-fg,
          var(--bx-text-disabled)
        );
      }

      @media (pointer: coarse) {
        .display-input {
          font-size: var(
            --bx-select-display-input-font-size,
            max(var(--bx-font-floor), var(--bx-type-body-m-size))
          );
        }
      }

      .display-input::placeholder {
        color: var(
          --bx-select-display-input-placeholder-fg,
          var(--bx-text-hint)
        );
        opacity: var(--bx-select-display-input-placeholder-opacity, 1);
      }

      .start,
      .end {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
        color: var(--bx-select-start-fg, var(--bx-text-hint));
      }

      .start[hidden],
      .end[hidden] {
        display: none;
      }

      .clear-button {
        all: unset;
        box-sizing: border-box;
        display: inline-flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        inline-size: var(--bx-select-clear-button-size, 1.5em);
        block-size: var(--bx-select-clear-button-size, 1.5em);
        border-radius: var(
          --bx-select-clear-button-radius,
          var(--bx-radius-pill)
        );
        color: var(--bx-select-clear-button-fg, var(--bx-text-hint));
        cursor: pointer;
      }

      .clear-button:hover {
        color: var(--bx-select-clear-button-hover-fg, var(--bx-text-primary));
      }

      .clear-button:focus-visible {
        outline: var(
            --bx-select-clear-button-focus-ring-width,
            var(--bx-border-width-strong)
          )
          solid
          var(--bx-select-clear-button-focus-ring-color, var(--bx-focus-ring));
        outline-offset: var(
          --bx-select-clear-button-focus-ring-offset,
          var(--bx-focus-ring-offset)
        );
      }

      .clear-button svg,
      .expand-icon svg {
        inline-size: var(--bx-select-clear-button-icon-size, 1em);
        block-size: var(--bx-select-clear-button-icon-size, 1em);
        fill: currentColor;
      }

      .expand-icon {
        display: inline-flex;
        flex-shrink: 0;
        color: var(--bx-select-expand-icon-fg, var(--bx-text-hint));
        transition: rotate var(--bx-motion-duration-fast)
          var(--bx-motion-easing-standard);
      }

      :host([open]) .expand-icon {
        rotate: 180deg;
      }

      .hint {
        color: var(--bx-select-hint-fg, var(--bx-text-secondary));

        ${textStyle('--bx-select-hint', 'body-s')}
      }

      .hint:empty {
        display: none;
      }

      .hint[data-user-invalid] {
        color: var(--bx-select-hint-invalid-fg, var(--bx-role-danger-fg));
      }

      .panel {
        box-sizing: border-box;
        border: var(--bx-select-panel-border-width, var(--bx-border-width))
          solid var(--bx-select-panel-border-color, var(--bx-border-subtle));
        border-radius: var(--bx-select-panel-radius, var(--bx-radius-m));
        box-shadow: var(--bx-select-panel-shadow, var(--bx-shadow-m));
        background: var(--bx-select-panel-bg, var(--bx-surface-base));
        color: var(--bx-select-panel-fg, var(--bx-text-primary));

        ${textStyle('--bx-select-panel', 'body-m')}

        overflow: hidden;
      }

      .listbox {
        box-sizing: border-box;
        max-block-size: min(
          var(--bx-select-max-height, calc(var(--bx-unit) * 20)),
          var(--bx-popup-auto-size-available-height, 100vh)
        );
        overflow-y: auto;
        overscroll-behavior: contain;
        outline: none;
      }

      .listbox[hidden],
      .status[hidden] {
        display: none;
      }

      .slotted[hidden] {
        display: none;
      }

      .rows {
        position: relative;
      }

      .row-abs {
        position: absolute;
        inset-inline: 0;
        inset-block-start: 0;
      }

      /* Small lists render every row; skipping off-screen layout is the cheap fallback (§4). */
      .rows:not([data-windowed]) .row {
        content-visibility: auto;
        contain-intrinsic-block-size: auto var(--bx-target-min);
      }

      .row hr {
        margin-block: var(--bx-space-xs);
        border: 0;
        border-block-start: var(
            --bx-select-hr-block-start-border-width,
            var(--bx-border-width)
          )
          solid
          var(--bx-select-hr-block-start-border-color, var(--bx-border-subtle));
      }

      .group-label {
        padding-block: var(
          --bx-select-group-label-padding-block,
          var(--bx-space-xs)
        );
        padding-inline: var(
          --bx-select-group-label-padding-inline,
          var(--bx-space-s)
        );
        color: var(--bx-select-group-label-fg, var(--bx-text-secondary));

        ${textStyle('--bx-select-group-label', 'label-s')}
      }

      .status {
        display: flex;
        align-items: center;
        gap: var(--bx-select-status-gap, var(--bx-space-xs));
        padding: var(--bx-select-status-padding, var(--bx-space-s));
        color: var(--bx-select-status-fg, var(--bx-text-secondary));

        ${textStyle('--bx-select-status', 'body-s')}
      }

      @media (prefers-reduced-motion: reduce) {
        .combobox,
        .expand-icon {
          transition: none;
        }
      }

      @media (forced-colors: active) {
        .combobox,
        .panel {
          forced-color-adjust: none;
          border-color: CanvasText;
          background: Canvas;
          color: CanvasText;
        }
      }
    `,
  ];

  static override properties = {
    name: { type: String },
    value: { noAccessor: true, attribute: 'value' },
    disabled: { type: Boolean, reflect: true },
    readonly: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    hint: { type: String },
    label: { type: String },
    withLabel: { type: Boolean, reflect: true, attribute: 'with-label' },
    withHint: { type: Boolean, reflect: true, attribute: 'with-hint' },
    size: { type: String, reflect: true },
    multiple: { type: Boolean, reflect: true },
    maxOptionsVisible: {
      attribute: 'max-options-visible',
      converter: {
        fromAttribute: (value: string | null) =>
          value === 'auto' ? 'auto' : value === null ? 3 : Number(value),
      },
    },
    clearable: { type: Boolean, reflect: true },
    placeholder: { type: String },
    placement: { type: String },
    appearance: { type: String, reflect: true },
    pill: { type: Boolean, reflect: true },
    searchable: { type: Boolean, reflect: true },
    virtual: {
      converter: {
        fromAttribute: (value: string | null): Virtual =>
          value === null || value === 'auto' ? 'auto' : value !== 'false',
      },
    },
    options: { attribute: false },
    loading: { type: Boolean, reflect: true },
    remote: { type: Boolean, reflect: true },
    open: { type: Boolean, reflect: true },
    _query: { state: true },
    _activeIndex: { state: true },
    _visibleCount: { state: true },
    _hasStart: { state: true },
    _hasEnd: { state: true },
  };

  declare name: string;
  declare disabled: boolean;
  declare readonly: boolean;
  declare required: boolean;
  declare hint: string;
  declare label: string;
  declare withLabel: boolean;
  declare withHint: boolean;
  declare size: Size;
  declare multiple: boolean;
  declare maxOptionsVisible: number | 'auto';
  declare clearable: boolean;
  declare placeholder: string;
  declare placement: 'top' | 'bottom';
  declare appearance: Appearance;
  declare pill: boolean;
  declare searchable: boolean;
  declare virtual: Virtual;
  /** Data-driven options. When set (even to `[]`) it replaces any slotted `bx-option`s. */
  declare options?: readonly SelectOption[];
  declare loading: boolean;
  declare remote: boolean;
  declare open: boolean;
  /** @internal */
  declare _query: string;
  /** @internal */
  declare _activeIndex: number;
  /** @internal */
  declare _visibleCount: number;
  /** @internal */
  declare _hasStart: boolean;
  /** @internal */
  declare _hasEnd: boolean;

  // --- Selection state -------------------------------------------------------------------------
  #selected: string[] = [];
  #rawValue: string | readonly string[] | null | undefined;
  #defaultValue: string[] = [];
  /** Labels seen for selected values, so they survive options that are not (yet) loaded. */
  #labels = new Map<string, string>();

  // --- Row model -------------------------------------------------------------------------------
  #index = new RowIndex([]);
  #visible: readonly SelectRow[] = [];
  #ordinals: ArrayLike<number> = new Int32Array(0);
  #optionTotal = 0;
  #rowsDirty = true;
  #visibleDirty = true;
  #activeKey: string | null = null;
  #slottedObserver?: MutationObserver;
  #slottedInitialized = false;

  // --- Interaction state -----------------------------------------------------------------------
  #hasInteracted = false;
  #customMessage = '';
  #typeahead = '';
  #typeaheadTimer?: ReturnType<typeof setTimeout>;
  #searchTimer?: ReturnType<typeof setTimeout>;
  #searchAbort?: AbortController;
  #loadMoreFor = -1;
  #searching = false;
  #elementIndex = new Map<Element, number>();
  #scrollActive = false;
  #unobserveCombobox?: () => void;

  #uid = `bx-select-${nextId++}`;
  #inputId = `${this.#uid}-input`;
  #listboxId = `${this.#uid}-listbox`;
  #hintId = `${this.#uid}-hint`;
  #labelId = `${this.#uid}-label`;
  #popupRef = createRef<BxPopup>();

  #virtualizer = new VirtualizerController(this, {
    count: 0,
    getScrollElement: () => this.#listboxEl,
    dynamic: true,
    overscan: OVERSCAN,
  });

  get #inputEl(): HTMLInputElement | null {
    return this.shadowRoot?.querySelector('.display-input') ?? null;
  }

  get #comboboxEl(): HTMLElement | null {
    return this.shadowRoot?.querySelector('.combobox') ?? null;
  }

  get #listboxEl(): HTMLElement | null {
    return this.shadowRoot?.querySelector('.listbox') ?? null;
  }

  constructor() {
    super();
    this.name = '';
    this.disabled = false;
    this.readonly = false;
    this.required = false;
    this.hint = '';
    this.label = '';
    this.withLabel = false;
    this.withHint = false;
    this.size = 'medium';
    this.multiple = false;
    this.maxOptionsVisible = 3;
    this.clearable = false;
    this.placeholder = '';
    this.placement = 'bottom';
    this.appearance = 'outlined';
    this.pill = false;
    this.searchable = false;
    this.virtual = 'auto';
    this.loading = false;
    this.remote = false;
    this.open = false;
    this._query = '';
    this._activeIndex = -1;
    this._visibleCount = Infinity;
    this._hasStart = false;
    this._hasEnd = false;

    this.addEventListener('invalid', this.#handleInvalid);
  }

  // --- Public value API ------------------------------------------------------------------------

  get value(): string | string[] {
    return this.multiple ? [...this.#selected] : (this.#selected[0] ?? '');
  }

  set value(next: string | readonly string[] | null | undefined) {
    const previous = this.value;
    this.#rawValue = next;
    this.#selected = this.#normalize(next);
    this.requestUpdate('value', previous);
  }

  #normalize(next: string | readonly string[] | null | undefined): string[] {
    if (next === null || next === undefined || next === '') return [];
    if (Array.isArray(next)) {
      const values = [...new Set(next.map(String))];
      return this.multiple ? values : values.slice(0, 1);
    }
    const text = String(next);
    return this.multiple ? text.split(/\s+/).filter(Boolean) : [text];
  }

  // --- Lifecycle -------------------------------------------------------------------------------

  override connectedCallback(): void {
    super.connectedCallback();
    this.#observeSlotted();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#slottedObserver?.disconnect();
    this.#slottedObserver = undefined;
    this.#unobserveCombobox?.();
    this.#unobserveCombobox = undefined;
    clearTimeout(this.#typeaheadTimer);
    clearTimeout(this.#searchTimer);
    this.#searchAbort?.abort();
    this.#searchAbort = undefined;
  }

  protected override firstUpdated(): void {
    // The initial `value` attribute is applied after the constructor but before this point.
    this.#defaultValue = [...this.#selected];
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('multiple'))
      this.#selected = this.#normalize(this.#rawValue ?? this.#selected);
    if (changed.has('options')) {
      this.#rowsDirty = true;
      this.#loadMoreFor = -1;
      this.#observeSlotted();
    }
    if (changed.has('searchable') || changed.has('remote'))
      this.#visibleDirty = true;

    if (changed.has('open') && !this.open && changed.get('open') === true) {
      this._query = '';
      this.#searching = false;
      this._activeIndex = -1;
      this.#activeKey = null;
      this.#visibleDirty = true;
      clearTimeout(this.#searchTimer);
      this.#searchAbort?.abort();
    }

    this.#syncRows();
    this.#syncVisible();

    if (changed.has('open') && this.open) {
      const blocked = this.disabled || this.readonly;
      const cancelled =
        blocked ||
        !this.dispatchEvent(
          new CustomEvent('bx-show', {
            bubbles: true,
            composed: true,
            cancelable: true,
          }),
        );
      if (cancelled) {
        this.open = false;
        return;
      }
      this.#initActive();
      this.#scrollActive = true;
      this.#loadMoreFor = -1;
    }

    this.#virtualizer.setOptions({
      count: this.#visible.length,
      getScrollElement: this.#getListbox,
      dynamic: true,
      overscan: OVERSCAN,
      enabled: this.#windowed,
      getItemKey: this.#getRowKey,
      pinnedIndexes: this._activeIndex >= 0 ? [this._activeIndex] : [],
    });
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (
      changed.has('value') ||
      changed.has('multiple') ||
      changed.has('name')
    ) {
      this.#syncFormValue();
    }
    if (
      changed.has('value') ||
      changed.has('required') ||
      changed.has('multiple')
    )
      this.#syncValidity();

    this.#pushStateToOptions();
    this.#syncActiveDescendant();
    this.#measureRows();
    this.#syncAutoFit(changed);

    if (changed.has('open')) {
      if (this.open) void this.#afterOpen();
      else if (changed.get('open') === true)
        this.dispatchEvent(
          new CustomEvent('bx-after-hide', { bubbles: true, composed: true }),
        );
    }

    if (this.#scrollActive && this.open) {
      this.#scrollActive = false;
      this.#scrollActiveIntoView();
    }
    if (
      this.#windowed ||
      changed.has('options') ||
      changed.has('loading') ||
      changed.has('open')
    )
      this.#maybeLoadMore();
  }

  async #afterOpen(): Promise<void> {
    // The popup turns `display: none` -> `block` in its own update; the list can only be measured
    // after that, so the first frame already shows a full window instead of an empty one.
    await this.#popupRef.value?.updateComplete;
    if (!this.open) return;
    this.#virtualizer.sync();
    this.#scrollActiveIntoView(true);
    this.#popupRef.value?.reposition();
    this.dispatchEvent(
      new CustomEvent('bx-after-show', { bubbles: true, composed: true }),
    );
    this.#maybeLoadMore();
  }

  #getListbox = (): Element | null => this.#listboxEl;

  #getRowKey = (index: number): string | number =>
    this.#visible[index]?.key ?? index;

  // --- Row model -------------------------------------------------------------------------------

  get #dataMode(): boolean {
    return this.options !== undefined && this.options !== null;
  }

  get #windowed(): boolean {
    if (this.virtual === true) return true;
    if (this.virtual === false) return false;
    return this.#index.optionCount >= AUTO_VIRTUAL_THRESHOLD;
  }

  /** True when rows are rendered by this component rather than slotted through. */
  get #ownsRows(): boolean {
    return this.#dataMode || this.#windowed;
  }

  #syncRows(): void {
    if (!this.#rowsDirty) return;
    this.#rowsDirty = false;
    const rows = this.#dataMode
      ? rowsFromOptions(this.options!)
      : this.#readSlotted();
    this.#index = new RowIndex(rows);
    this.#visibleDirty = true;
    for (const row of rows)
      if (row.kind === 'option' && this.#selected.includes(row.value))
        this.#labels.set(row.value, row.label);
  }

  #syncVisible(): void {
    if (!this.#visibleDirty) return;
    this.#visibleDirty = false;
    // Remote search replaces local filtering; the consumer swaps `options` instead.
    const filtering = this.searchable && !this.remote && this._query !== '';
    this.#visible = filtering
      ? this.#index.filter(this._query)
      : this.#index.rows;
    const { ordinals, total } = ordinalsOf(this.#visible);
    this.#ordinals = ordinals;
    this.#optionTotal = total;
    this.#virtualizer.invalidate();
    this.#elementIndex.clear();
    if (!this.#ownsRows)
      this.#visible.forEach((row, index) => {
        if (row.kind === 'option' && row.element)
          this.#elementIndex.set(row.element, index);
      });

    // Keep the highlighted option when it survives the filter, otherwise fall back to the first.
    if (this.open) {
      const kept = this.#activeKey
        ? this.#visible.findIndex((row) => row.key === this.#activeKey)
        : -1;
      this.#setActive(kept >= 0 ? kept : this.#firstNavigable(), false);
    }
  }

  #readSlotted(): SelectRow[] {
    const rows: SelectRow[] = [];
    const seen = new Map<string, number>();
    for (const child of Array.from(this.children)) {
      if (child.getAttribute('slot')) continue;
      if (child instanceof BxOption) {
        const label = child.label || textOf(child);
        const value =
          child.value !== '' || child.hasAttribute('value')
            ? child.value
            : label;
        const duplicates = seen.get(value) ?? 0;
        seen.set(value, duplicates + 1);
        rows.push({
          kind: 'option',
          key: optionKey(value, duplicates),
          value,
          label,
          disabled: child.disabled,
          element: child,
        });
      } else if (child.matches('bx-divider, [role="separator"]')) {
        rows.push({ kind: 'divider', key: `\u0001d${rows.length}` });
      }
    }

    // Native `<option selected>`: adopt it once, as the initial value.
    if (!this.#slottedInitialized && rows.length > 0) {
      this.#slottedInitialized = true;
      if (this.#selected.length === 0) {
        const initial = rows.filter(
          (row): row is OptionRow =>
            row.kind === 'option' && !!row.element?.hasAttribute('selected'),
        );
        if (initial.length > 0) {
          const previous = this.value;
          const picked = this.multiple ? initial : initial.slice(0, 1);
          this.#selected = picked.map((row) => row.value);
          this.#defaultValue = [...this.#selected];
          this.requestUpdate('value', previous);
        }
      }
    }
    return rows;
  }

  #observeSlotted(): void {
    if (this.#dataMode) {
      this.#slottedObserver?.disconnect();
      this.#slottedObserver = undefined;
      return;
    }
    if (this.#slottedObserver || !this.isConnected) return;
    this.#slottedObserver = new MutationObserver(() => {
      this.#rowsDirty = true;
      this.requestUpdate();
    });
    this.#slottedObserver.observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['value', 'label', 'disabled', 'slot'],
    });
  }

  #handleSlotChange = (): void => {
    if (this.#dataMode) return;
    this.#rowsDirty = true;
    this.requestUpdate();
  };

  #labelFor(value: string): string {
    return this.#index.find(value)?.label ?? this.#labels.get(value) ?? value;
  }

  // --- Active option ---------------------------------------------------------------------------

  #isNavigable(index: number): boolean {
    const row = this.#visible[index];
    return row?.kind === 'option' && !row.disabled;
  }

  #firstNavigable(): number {
    for (let i = 0; i < this.#visible.length; i++)
      if (this.#isNavigable(i)) return i;
    return -1;
  }

  #lastNavigable(): number {
    for (let i = this.#visible.length - 1; i >= 0; i--)
      if (this.#isNavigable(i)) return i;
    return -1;
  }

  #setActive(index: number, scroll = true): void {
    this._activeIndex = index;
    this.#activeKey = this.#visible[index]?.key ?? null;
    if (scroll) this.#scrollActive = true;
  }

  /** On open: the first selected option, else the first enabled one. */
  #initActive(): void {
    let index = -1;
    for (const value of this.#selected) {
      const row = this.#index.find(value);
      if (row) {
        index = this.#visible.indexOf(row);
        if (index >= 0) break;
      }
    }
    this.#setActive(index >= 0 ? index : this.#firstNavigable(), false);
  }

  #moveActive(delta: number): void {
    const step = Math.sign(delta);
    let remaining = Math.abs(delta);
    let index = this._activeIndex;
    let landed = index;
    while (remaining > 0) {
      let next = index + step;
      while (
        next >= 0 &&
        next < this.#visible.length &&
        !this.#isNavigable(next)
      )
        next += step;
      if (next < 0 || next >= this.#visible.length) break;
      index = landed = next;
      remaining--;
    }
    if (landed === -1)
      landed = step > 0 ? this.#firstNavigable() : this.#lastNavigable();
    if (landed !== this._activeIndex) this.#setActive(landed);
  }

  #activeElement(): HTMLElement | null {
    const row = this.#visible[this._activeIndex];
    if (!row || row.kind !== 'option') return null;
    if (this.#ownsRows)
      return (
        this.shadowRoot?.querySelector<HTMLElement>(
          `.row[data-index="${this._activeIndex}"]`,
        ) ?? null
      );
    return row.element ?? null;
  }

  #syncActiveDescendant(): void {
    const input = this.#inputEl;
    if (!input) return;
    const active = this.open ? this.#activeElement() : null;
    const reflective = input as HTMLInputElement & {
      ariaActiveDescendantElement?: Element | null;
    };
    if (reflective.ariaActiveDescendantElement !== undefined) {
      reflective.ariaActiveDescendantElement = active;
    } else if (active?.id) {
      input.setAttribute('aria-activedescendant', active.id);
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  }

  #scrollActiveIntoView(center = false): void {
    if (this._activeIndex < 0) return;
    if (this.#ownsRows && this.#windowed) {
      this.#virtualizer.scrollToIndex(this._activeIndex, {
        align: center ? 'center' : 'auto',
      });
      return;
    }
    const element = this.#activeElement();
    const listbox = this.#listboxEl;
    if (!element || !listbox) return;
    const list = listbox.getBoundingClientRect();
    const item = element.getBoundingClientRect();
    if (item.top < list.top) listbox.scrollTop -= list.top - item.top;
    else if (item.bottom > list.bottom)
      listbox.scrollTop += item.bottom - list.bottom;
  }

  // --- Rendered state --------------------------------------------------------------------------

  /** Pushes selection/highlight/filter state onto slotted `bx-option` elements (not data rows). */
  #pushStateToOptions(): void {
    if (this.#ownsRows) return;
    const selected = new Set(this.#selected);
    const visible =
      this._query !== '' && this.searchable && !this.remote
        ? new Set(this.#visible)
        : null;
    const active = this.open ? this.#visible[this._activeIndex] : undefined;
    for (const row of this.#index.rows) {
      if (row.kind === 'option' && row.element) {
        row.element.selected = selected.has(row.value);
        row.element.toggleAttribute('data-active', row === active);
        row.element.toggleAttribute('hidden', !!visible && !visible.has(row));
      }
    }
  }

  #measureRows(): void {
    if (!this.#ownsRows || !this.#windowed) return;
    for (const row of this.shadowRoot!.querySelectorAll('.row-abs'))
      this.#virtualizer.measureElement(row);
  }

  #maybeLoadMore(): void {
    if (!this.open || this.loading || this.#visible.length === 0) return;
    if (this.#loadMoreFor === this.#visible.length) return;
    const listbox = this.#listboxEl;
    if (!listbox) return;
    let near: boolean;
    if (this.#ownsRows && this.#windowed)
      near =
        this.#virtualizer.visibleRange.end >=
        this.#visible.length - LOAD_MORE_ROWS;
    else
      near =
        listbox.scrollTop + listbox.clientHeight >=
        listbox.scrollHeight - LOAD_MORE_ROWS * 16;
    if (!near) return;
    this.#loadMoreFor = this.#visible.length;
    this.dispatchEvent(
      new CustomEvent('bx-load-more', { bubbles: true, composed: true }),
    );
  }

  #handleListboxScroll = (): void => this.#maybeLoadMore();

  // --- Form participation ----------------------------------------------------------------------

  #syncFormValue(): void {
    if (this.multiple) {
      const data = new FormData();
      if (this.name)
        for (const value of this.#selected) data.append(this.name, value);
      this.internals.setFormValue(data, this.#selected.join(' '));
    } else {
      this.internals.setFormValue(this.#selected[0] ?? '');
    }
  }

  #syncValidity(): void {
    const missing = this.required && this.#selected.length === 0;
    const custom = this.#customMessage;
    const anchor = this.#inputEl ?? undefined;
    if (missing || custom)
      this.internals.setValidity(
        { valueMissing: missing, customError: !!custom },
        custom || VALUE_MISSING_MESSAGE,
        anchor,
      );
    else this.internals.setValidity({});
    if (this.#hasInteracted) this.#applyUserValidity();
  }

  #applyUserValidity(): void {
    const valid = this.internals.validity.valid;
    this.toggleAttribute('data-user-valid', valid);
    this.toggleAttribute('data-user-invalid', !valid);
    this.#comboboxEl?.toggleAttribute('data-user-invalid', !valid);
    this.shadowRoot
      ?.querySelector('.hint')
      ?.toggleAttribute('data-user-invalid', !valid);
  }

  override setCustomValidity(message: string): void {
    this.#customMessage = message;
    this.#syncValidity();
  }

  formResetCallback(): void {
    this.value = this.#defaultValue.length ? [...this.#defaultValue] : '';
    this.#hasInteracted = false;
    this._query = '';
    this.removeAttribute('data-user-valid');
    this.removeAttribute('data-user-invalid');
    this.#comboboxEl?.removeAttribute('data-user-invalid');
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    if (state instanceof FormData)
      this.value = state.getAll(this.name) as string[];
    else if (typeof state === 'string') {
      // `multiple` state is saved space-joined.
      this.value = this.multiple ? state.split(/\s+/).filter(Boolean) : state;
    }
  }

  #handleInvalid = (): void => {
    this.#hasInteracted = true;
    this.#applyUserValidity();
    this.dispatchEvent(
      new CustomEvent('bx-invalid', { bubbles: true, composed: true }),
    );
  };

  // --- Commit ----------------------------------------------------------------------------------

  #commit(next: string[]): void {
    const unchanged =
      next.length === this.#selected.length &&
      next.every((value, i) => value === this.#selected[i]);
    if (unchanged) return;
    this.value = this.multiple ? next : (next[0] ?? '');
    this.#hasInteracted = true;
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    if (!this.internals.checkValidity())
      this.dispatchEvent(
        new CustomEvent('bx-invalid', { bubbles: true, composed: true }),
      );
  }

  #selectRow(row: SelectRow | undefined): void {
    if (row?.kind !== 'option' || row.disabled) return;
    this.#labels.set(row.value, row.label);
    if (this.multiple) {
      const next = this.#selected.includes(row.value)
        ? this.#selected.filter((value) => value !== row.value)
        : [...this.#selected, row.value];
      this.#commit(next);
      // The query is kept so several matches can be picked in a row; a fresh type replaces it.
    } else {
      this.#commit([row.value]);
      this.#searching = false;
      this.hide();
      this.#resetQuery();
    }
  }

  #removeValue(value: string): void {
    this.#commit(this.#selected.filter((current) => current !== value));
  }

  #resetQuery(): void {
    if (this._query === '') return;
    this._query = '';
    this.#visibleDirty = true;
  }

  #handleClear = (event: Event): void => {
    event.stopPropagation();
    this.#commit([]);
    this.#resetQuery();
    this.#inputEl?.focus();
    this.dispatchEvent(
      new CustomEvent('bx-clear', { bubbles: true, composed: true }),
    );
  };

  // --- Open / close ----------------------------------------------------------------------------

  /** Opens the listbox. No-op when disabled, readonly or already open. */
  show(): void {
    if (this.open || this.disabled || this.readonly) return;
    this.open = true;
  }

  /** Closes the listbox. No-op when already closed. */
  hide(): void {
    if (!this.open) return;
    const cancelled = !this.dispatchEvent(
      new CustomEvent('bx-hide', {
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    if (cancelled) return;
    this.open = false;
  }

  override focus(options?: FocusOptions): void {
    this.#inputEl?.focus(options);
  }

  override blur(): void {
    this.#inputEl?.blur();
  }

  // --- Search ----------------------------------------------------------------------------------

  /**
   * A single searchable select shows the selected label in the input. The first edit after
   * opening starts a fresh query rather than editing the label text, so the label is selected just
   * before the browser applies the keystroke, paste or composition, which then replaces it.
   */
  #handleBeforeInput = (event: InputEvent): void => {
    if (!this.searchable || this.multiple || this.#searching) return;
    this.#searching = true;
    // Select the label so this keystroke, paste or composition replaces it. Clearing `value`
    // here instead loses the keystroke in WebKit.
    (event.target as HTMLInputElement).select();
  };

  /** Focusing a single searchable select selects its label, so typing replaces it (all engines). */
  #handleInputFocus = (event: FocusEvent): void => {
    if (!this.searchable || this.multiple || this.#searching) return;
    (event.target as HTMLInputElement).select();
  };

  #handleSearchInput = (event: Event): void => {
    event.stopPropagation(); // The native `input` is composed; ours is `#commit`'s.
    const query = (event.target as HTMLInputElement).value;
    if (!this.searchable) return;
    this.#searching = true;
    this._query = query;
    this.#visibleDirty = true;
    this.show();
    if (this.remote) {
      clearTimeout(this.#searchTimer);
      this.#searchAbort?.abort();
      this.#searchTimer = setTimeout(() => {
        this.#searchAbort = new AbortController();
        this.dispatchEvent(
          new CustomEvent('bx-search', {
            bubbles: true,
            composed: true,
            detail: { query, signal: this.#searchAbort.signal },
          }),
        );
      }, SEARCH_DEBOUNCE_MS);
    } else if (this.open) {
      // Highlight the first match as the user types.
      this.#scrollActive = true;
    }
  };

  // --- Keyboard --------------------------------------------------------------------------------

  #handleKeydown = (event: KeyboardEvent): void => {
    if (this.disabled) return;
    const { key } = event;
    const printable =
      key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;

    switch (key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        if (!this.open) {
          this.show();
        } else if (!event.altKey) {
          this.#moveActive(key === 'ArrowDown' ? 1 : -1);
        } else if (key === 'ArrowUp') {
          this.#selectRow(this.#visible[this._activeIndex]);
        }
        return;
      }
      case 'Home':
      case 'End':
        // In an editable combobox these move the caret.
        if (this.searchable) return;
        event.preventDefault();
        if (!this.open) this.show();
        else
          this.#setActive(
            key === 'Home' ? this.#firstNavigable() : this.#lastNavigable(),
          );
        return;
      case 'PageUp':
      case 'PageDown':
        if (!this.open) return;
        event.preventDefault();
        this.#moveActive(key === 'PageDown' ? PAGE_STEP : -PAGE_STEP);
        return;
      case 'Enter':
        event.preventDefault(); // Never submit a surrounding form from the listbox.
        if (this.open) this.#selectRow(this.#visible[this._activeIndex]);
        else this.show();
        return;
      case ' ':
        if (this.#typeahead && !this.searchable) {
          event.preventDefault(); // A space inside a typeahead buffer ("Item 9").
          this.#handleTypeahead(key);
          return;
        }
        if (this.searchable && this._query !== '') return; // A space inside a query.
        if (this.searchable && !this.open) return;
        event.preventDefault();
        if (this.open && !this.searchable)
          this.#selectRow(this.#visible[this._activeIndex]);
        else if (!this.open) this.show();
        return;
      case 'Escape':
        if (!this.open) return;
        event.preventDefault();
        event.stopPropagation(); // Don't also close a surrounding dialog.
        this.hide();
        return;
      case 'Tab':
        if (this.open) this.hide();
        return;
      case 'Backspace':
        if (
          this.multiple &&
          this._query === '' &&
          this.#selected.length > 0 &&
          !this.readonly
        ) {
          event.preventDefault();
          this.#commit(this.#selected.slice(0, -1));
        }
        return;
      default:
        if (printable && !this.searchable) {
          event.preventDefault();
          this.#handleTypeahead(key);
        }
    }
  };

  #handleTypeahead(character: string): void {
    if (this.readonly) return;
    clearTimeout(this.#typeaheadTimer);
    this.#typeahead += character;
    this.#typeaheadTimer = setTimeout(() => {
      this.#typeahead = '';
    }, TYPEAHEAD_RESET_MS);

    if (this.open) {
      const match = findByPrefix(
        this.#visible,
        this.#typeahead,
        this._activeIndex,
      );
      if (match >= 0) this.#setActive(match);
      return;
    }
    // Closed single select behaves like native `<select>`: typing changes the value directly.
    if (this.multiple) {
      this.show();
      return;
    }
    const current = this.#selected[0]
      ? this.#visible.indexOf(this.#index.find(this.#selected[0])!)
      : -1;
    const match = findByPrefix(this.#index.rows, this.#typeahead, current);
    if (match >= 0) this.#selectRow(this.#index.rows[match]);
  }

  // --- Pointer ---------------------------------------------------------------------------------

  #handleComboboxPointerDown = (event: PointerEvent): void => {
    if (this.disabled || event.button !== 0) return;
    const path = event.composedPath();
    // Buttons and tag controls handle themselves; the input keeps its own caret/selection.
    if (
      path.some(
        (node) =>
          node instanceof HTMLElement &&
          (node.localName === 'button' ||
            node.classList.contains('tag') ||
            node.localName === 'bx-badge'),
      )
    )
      return;
    const onInput = path.includes(this.#inputEl as EventTarget);
    if (!onInput) {
      event.preventDefault(); // Keep focus on the input instead of blurring it.
      this.#inputEl?.focus();
    }
    if (this.open && (!onInput || !this.searchable)) this.hide();
    else this.show();
  };

  #hitTest(event: Event): { row: SelectRow; index: number } | null {
    for (const node of event.composedPath()) {
      if (
        !(node instanceof HTMLElement) ||
        node.getAttribute('role') !== 'option'
      )
        continue;
      const dataIndex = node.dataset['index'];
      const index =
        dataIndex !== undefined
          ? Number(dataIndex)
          : (this.#elementIndex.get(node) ?? -1);
      const row = this.#visible[index];
      return row ? { row, index } : null;
    }
    return null;
  }

  #handleListboxClick = (event: MouseEvent): void => {
    this.#selectRow(this.#hitTest(event)?.row);
    this.#inputEl?.focus();
  };

  #handleListboxPointerMove = (event: PointerEvent): void => {
    const hit = this.#hitTest(event);
    if (!hit || hit.row.kind !== 'option' || hit.row.disabled) return;
    if (hit.index !== this._activeIndex) this.#setActive(hit.index, false);
  };

  /** A mousedown inside the listbox must not move focus off the input. */
  #handleListboxMouseDown = (event: MouseEvent): void => event.preventDefault();

  #handleFocusOut = (event: FocusEvent): void => {
    const next = event.relatedTarget as Node | null;
    if (next && (this.contains(next) || this.shadowRoot?.contains(next)))
      return;
    this.hide();
    this.#hasInteracted = true;
    this.#syncValidity();
  };

  // --- Tag fitting (max-options-visible="auto") -------------------------------------------------

  get #autoFit(): boolean {
    return this.multiple && this.maxOptionsVisible === 'auto';
  }

  #syncAutoFit(changed: PropertyValues<this>): void {
    this.toggleAttribute('data-fit', this.#autoFit);
    if (!this.#autoFit) {
      this.#unobserveCombobox?.();
      this.#unobserveCombobox = undefined;
      return;
    }
    const area = this.shadowRoot?.querySelector<HTMLElement>('.value-area');
    if (area && !this.#unobserveCombobox)
      this.#unobserveCombobox = observeResize(area, () => {
        this._visibleCount = Infinity; // Re-measure with every tag laid out.
      });

    if (changed.has('value') || changed.has('maxOptionsVisible'))
      if (this._visibleCount !== Infinity) {
        this._visibleCount = Infinity;
        return;
      }
    if (this._visibleCount !== Infinity || !area) return;

    const tags = [
      ...area.querySelectorAll<HTMLElement>('.tag:not([data-overflow])'),
    ];
    const gap = parseFloat(getComputedStyle(area).columnGap) || 0;
    const reserve = (this.searchable ? 64 : 0) + 56; // Input minimum + the "+N" badge.
    let used = 0;
    let fit = 0;
    for (const tag of tags) {
      used += tag.offsetWidth + gap;
      // The overflow badge only needs room when some tag is left out.
      const needed = fit + 1 < tags.length ? used + reserve : used;
      if (needed > area.clientWidth) break;
      fit++;
    }
    // All tags fit: a finite count, so `Infinity` keeps meaning "needs a measuring pass".
    this._visibleCount = fit;
  }

  // --- Render ----------------------------------------------------------------------------------

  #handleAdornmentSlotChange = (event: Event): void => {
    const slot = event.target as HTMLSlotElement;
    const has = slot.assignedNodes({ flatten: true }).length > 0;
    if (slot.name === 'start') this._hasStart = has;
    else this._hasEnd = has;
  };

  get #displayValue(): string {
    if (this.multiple) return '';
    const value = this.#selected[0];
    return value === undefined ? '' : this.#labelFor(value);
  }

  #renderTags() {
    if (!this.multiple || this.#selected.length === 0) return nothing;
    const limit =
      this.maxOptionsVisible === 'auto'
        ? this._visibleCount
        : this.maxOptionsVisible;
    const shown = this.#selected.slice(0, limit);
    const rest = this.#selected.slice(shown.length);
    const badgeSize = this.size === 'large' ? 'medium' : 'small';
    return html`<span class="tags" part="tags"
      >${repeat(
        shown,
        (value) => value,
        (value) =>
          html`<bx-badge
            class="tag"
            part="tag"
            size=${badgeSize}
            ?with-remove=${!this.disabled && !this.readonly}
            title=${this.#labelFor(value)}
            @bx-remove=${(event: Event) => {
              event.preventDefault();
              event.stopPropagation();
              this.#removeValue(value);
              this.#inputEl?.focus();
            }}
            >${this.#labelFor(value)}</bx-badge
          >`,
      )}${
        rest.length > 0
          ? html`<bx-badge
              class="tag"
              part="tag"
              data-overflow
              size=${badgeSize}
              title=${rest.map((value) => this.#labelFor(value)).join(', ')}
              >+${rest.length}</bx-badge
            >`
          : nothing
      }</span
    >`;
  }

  #renderRow(row: SelectRow, index: number, start?: number) {
    const style =
      start === undefined ? nothing : `transform: translateY(${start}px)`;
    const classes = start === undefined ? 'row' : 'row row-abs';
    if (row.kind === 'group')
      return html`<div
        class="${classes} group-label"
        role="presentation"
        data-index=${index}
        style=${style}
      >
        ${row.label}
      </div>`;
    if (row.kind === 'divider')
      return html`<div
        class="${classes}"
        role="separator"
        data-index=${index}
        style=${style}
      >
        <hr />
      </div>`;
    return html`<bx-option
      class=${classes}
      id="${this.#uid}-o${index}"
      data-index=${index}
      value=${row.value}
      label=${row.label}
      ?selected=${this.#selected.includes(row.value)}
      ?disabled=${row.disabled}
      ?data-active=${index === this._activeIndex}
      aria-setsize=${this.#optionTotal}
      aria-posinset=${this.#ordinals[index] ?? 0}
      style=${style}
      >${row.label}</bx-option
    >`;
  }

  #renderRowList() {
    if (!this.#ownsRows) return nothing;
    if (this.#windowed) {
      const items = this.#virtualizer.items;
      return html`<div
        class="rows"
        data-windowed
        style="block-size: ${this.#virtualizer.totalSize}px"
      >
        ${repeat(
          items,
          (item) => item.key,
          (item) =>
            this.#visible[item.index]
              ? this.#renderRow(
                  this.#visible[item.index]!,
                  item.index,
                  item.start,
                )
              : nothing,
        )}
      </div>`;
    }
    return html`<div class="rows">
      ${repeat(
        this.#visible,
        (row) => row.key,
        (row, index) => this.#renderRow(row, index),
      )}
    </div>`;
  }

  #renderStatus() {
    if (this.loading)
      return html`<div class="status" role="status">
        <bx-spinner></bx-spinner>Loading…
      </div>`;
    if (this.#optionTotal === 0)
      return html`<div class="status" role="status">
        ${this._query !== '' ? 'No results' : 'No options'}
      </div>`;
    return nothing;
  }

  protected override render() {
    const showLabel = this.withLabel || this.label.length > 0;
    const showHint = this.withHint || this.hint.length > 0;
    const hasValue = this.#selected.length > 0;
    const showClear =
      this.clearable && hasValue && !this.disabled && !this.readonly;
    const editing = this.searchable && (this.multiple || this.#searching);
    const inputValue = editing ? this._query : this.#displayValue;
    const placeholder = hasValue ? '' : this.placeholder;
    const ariaLabel = this.ariaLabel;

    return html`
      <div class="form-control" part="form-control">
        ${
          showLabel
            ? html`<label
                class="label"
                part="label"
                id=${this.#labelId}
                for=${this.#inputId}
                ><slot name="label">${this.label}</slot></label
              >`
            : nothing
        }
        <div
          class="combobox"
          id="${this.#uid}-combobox"
          part="combobox"
          @pointerdown=${this.#handleComboboxPointerDown}
          @focusout=${this.#handleFocusOut}
        >
          <span class="start" ?hidden=${!this._hasStart}
            ><slot
              name="start"
              @slotchange=${this.#handleAdornmentSlotChange}
            ></slot
          ></span>
          <div class="value-area">
            ${this.#renderTags()}
            <input
              class="display-input"
              part="display-input"
              id=${this.#inputId}
              type="text"
              role="combobox"
              autocomplete="off"
              spellcheck="false"
              .value=${live(inputValue)}
              placeholder=${placeholder || nothing}
              ?readonly=${!this.searchable || this.readonly}
              ?disabled=${this.disabled}
              aria-expanded=${this.open}
              aria-haspopup="listbox"
              aria-controls=${this.#listboxId}
              aria-autocomplete=${this.searchable ? 'list' : 'none'}
              aria-required=${this.required ? 'true' : nothing}
              aria-describedby=${showHint ? this.#hintId : nothing}
              aria-label=${!showLabel && ariaLabel ? ariaLabel : nothing}
              @beforeinput=${this.#handleBeforeInput}
              @focus=${this.#handleInputFocus}
              @input=${this.#handleSearchInput}
              @change=${(event: Event) => event.stopPropagation()}
              @keydown=${this.#handleKeydown}
            />
          </div>
          ${
            showClear
              ? html`<button
                  type="button"
                  class="clear-button"
                  part="clear-button"
                  aria-label="Clear"
                  tabindex="-1"
                  @click=${this.#handleClear}
                >
                  <slot name="clear-icon"
                    ><svg viewBox="0 0 256 256" aria-hidden="true">
                      <path d=${CLEAR_PATH}></path></svg
                  ></slot>
                </button>`
              : nothing
          }
          <span class="end" ?hidden=${!this._hasEnd}
            ><slot
              name="end"
              @slotchange=${this.#handleAdornmentSlotChange}
            ></slot
          ></span>
          <span class="expand-icon" part="expand-icon" aria-hidden="true"
            ><slot name="expand-icon"
              >${svg`<svg viewBox="0 0 256 256"><path d=${CARET_DOWN_PATH}></path></svg>`}</slot
            ></span
          >
        </div>
        ${
          showHint
            ? html`<div class="hint" part="hint" id=${this.#hintId}>
                <slot name="hint">${this.hint}</slot>
              </div>`
            : nothing
        }
      </div>
      <bx-popup
        ${ref(this.#popupRef)}
        anchor="${this.#uid}-combobox"
        ?active=${this.open}
        placement=${this.placement === 'top' ? 'top-start' : 'bottom-start'}
        strategy="fixed"
        distance="4"
        sync="width"
        auto-size="vertical"
        flip
        shift
      >
        <div class="panel">
          <div
            class="listbox"
            part="listbox"
            id=${this.#listboxId}
            role="listbox"
            tabindex="-1"
            aria-multiselectable=${this.multiple ? 'true' : nothing}
            aria-busy=${this.loading ? 'true' : nothing}
            aria-labelledby=${showLabel ? this.#labelId : nothing}
            aria-label=${!showLabel && ariaLabel ? ariaLabel : nothing}
            @mousedown=${this.#handleListboxMouseDown}
            @click=${this.#handleListboxClick}
            @pointermove=${this.#handleListboxPointerMove}
            @scroll=${this.#handleListboxScroll}
          >
            <div class="slotted" ?hidden=${this.#ownsRows}>
              <slot @slotchange=${this.#handleSlotChange}></slot>
            </div>
            ${this.#renderRowList()}
          </div>
          ${this.#renderStatus()}
        </div>
      </bx-popup>
    `;
  }
}

/** Text of an element excluding anything slotted into a named slot (`start`/`end` adornments). */
function textOf(element: Element): string {
  let text = '';
  for (const node of Array.from(element.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) text += node.textContent ?? '';
    else if (node instanceof Element && !node.getAttribute('slot'))
      text += textOf(node);
  }
  return text.replace(/\s+/g, ' ').trim();
}
