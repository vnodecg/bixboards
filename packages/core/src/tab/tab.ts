import { css, html, nothing } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';
import { textStyle, textFamily } from '../internal/text-style.ts';

// Vendored from packages/core/src/icon/default-library.ts (Phosphor Icons, regular, MIT).
const X_PATH =
  'M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z';

/**
 * `<bx-tab>` — a tab button.
 *
 * `panel` (docs/features/core/tab.md §2's "Panel name") is *not* rendered as a plain
 * `aria-controls="<panel>"` string attribute: `role="tab"` lives on an element inside this
 * component's own shadow root, and a plain IDREF attribute only resolves within the referencing
 * element's own root — it can never reach a `bx-tab-panel` host out in the light DOM, and shipping
 * one anyway is an `aria-valid-attr-value` violation waiting to happen (a real one surfaced in
 * `bx-tab-group`'s own tests). `controlsElement` below sets the real relationship across that
 * boundary via `ariaControlsElements` (the cross-root-capable ARIA element-reference reflection),
 * which `bx-tab-group` drives; standalone, nothing sets it, so a lone tab simply has no
 * `aria-controls` relationship, which is correct — there is nothing to control.
 *
 * Roving tabindex across a set of tabs (only the active or, once one has focus, the most recently
 * focused tab is a tab stop) is driven through `tab-stop` below, which `bx-tab-group` sets per
 * APG's roving-tabindex pattern; standalone, a tab defaults to `tab-stop`, so it's still
 * independently keyboard-testable without a group.
 *
 * @fires bx-close - The close button (present when `closable`) was activated, by click or by
 *   Backspace/Delete on the focused tab. Not fired when `disabled`.
 *
 * @slot (default) - Label.
 *
 * @csspart base - The tab's interactive row (`role="tab"`).
 * @csspart close-button - The close glyph, present when `closable` (not in the spec's own CSS
 *   parts table — added the same way `bx-badge`'s `remove-button` part exists for its own
 *   removable-chip case). It's a plain `aria-hidden` span, not its own focusable control: a
 *   focusable descendant of a `role="tab"` element is an ARIA nested-interactive violation (axe:
 *   nested-interactive) no matter its `tabindex`, since `tab` is itself an interactive widget role.
 *   Mouse users click it directly; keyboard users close via Backspace/Delete on the tab itself, the
 *   same pattern `bx-badge`'s removable chip uses for the same reason.
 * @cssprop --bx-tab-gap - Gap of the root surface. Default `var(--bx-space-2xs)`.
 * @cssprop --bx-tab-min-height - Minimum height of the root surface. Default `var(--bx-target-min)`.
 * @cssprop --bx-tab-padding-inline - Padding inline of the root surface. Default `var(--bx-space-m)`.
 * @cssprop --bx-tab-radius - Corner radius of the root surface. Default `var(--bx-radius-s) var(--bx-radius-s) 0 0`.
 * @cssprop --bx-tab-fg - Text/icon color of the root surface. Default `var(--bx-text-secondary)`.
 * @cssprop --bx-tab-hover-fg - Text/icon color of the root surface (hover state). Default `var(--bx-text-primary)`.
 * @cssprop --bx-tab-focus-ring-width - Focus ring width of the root surface (focus state). Default `var(--bx-border-width-strong)`.
 * @cssprop --bx-tab-focus-ring-color - Focus ring color of the root surface (focus state). Default `var(--bx-focus-ring)`.
 * @cssprop --bx-tab-focus-ring-offset - Focus ring offset of the root surface (focus state). Default `calc(var(--bx-focus-ring-offset) * -1)`.
 * @cssprop --bx-tab-disabled-fg - Text/icon color of the root surface (disabled state). Default `var(--bx-text-disabled)`.
 * @cssprop --bx-tab-close-button-size - Size (width and height) of the `close-button` part. Default `1em`.
 * @cssprop --bx-tab-close-button-min-width - Minimum width of the `close-button` part. Default `var(--bx-target-min)`.
 * @cssprop --bx-tab-close-button-min-height - Minimum height of the `close-button` part. Default `var(--bx-target-min)`.
 * @cssprop --bx-tab-close-button-radius - Corner radius of the `close-button` part. Default `var(--bx-radius-pill)`.
 * @cssprop --bx-tab-close-button-hover-bg - Background of the `close-button` part (hover state). Default `color-mix(in srgb, currentColor 16%, transparent)`.
 * @cssprop --bx-tab-close-button-focus-ring-width - Focus ring width of the `close-button` part (focus state). Default `var(--bx-border-width-strong)`.
 * @cssprop --bx-tab-close-button-focus-ring-color - Focus ring color of the `close-button` part (focus state). Default `var(--bx-focus-ring)`.
 * @cssprop --bx-tab-close-button-focus-ring-offset - Focus ring offset of the `close-button` part (focus state). Default `var(--bx-focus-ring-offset)`.
 * @cssprop --bx-tab-close-button-icon-size - Size (width and height) of the icon inside the `close-button` element. Default `0.65em`.
 * @cssprop --bx-tab-font-family - Font family of the root surface. Default `var(--bx-type-body-family)`.
 * @cssprop --bx-tab-font-family - Font family of the root surface (text style `label-m`). Default `var(--bx-type-label-family)`.
 * @cssprop --bx-tab-font-size - Font size of the root surface (text style `label-m`). Default `var(--bx-type-label-m-size)`.
 * @cssprop --bx-tab-font-weight - Font weight of the root surface (text style `label-m`). Default `var(--bx-type-label-m-weight)`.
 * @cssprop --bx-tab-line-height - Line height of the root surface (text style `label-m`). Default `var(--bx-type-label-m-leading)`.
 * @cssprop --bx-tab-letter-spacing - Letter spacing of the root surface (text style `label-m`). Default `var(--bx-type-label-m-tracking)`.
 * @cssprop --bx-tab-hover-bg - Background while hovered. Default `var(--bx-surface-subtle)`.
 * @cssprop --bx-tab-pressed-bg - Background while pressed. Default `var(--bx-surface-muted)`.
 * @cssprop --bx-tab-selected-fg - Text color of the selected tab. Default `var(--bx-text-primary)`.
 * @cssprop --bx-tab-selected-hover-bg - Background of the selected tab while hovered. Default `transparent`.
 */
export class BxTab extends BixElement {
  static override tagName = 'bx-tab';

  static override shadowRootOptions: ShadowRootInit = {
    ...BixElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-block;
        ${textFamily('--bx-tab', 'body')}
      }

      .base {
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        gap: var(--bx-tab-gap, var(--bx-space-xs));
        min-block-size: var(
          --bx-tab-min-height,
          max(var(--bx-control-height-m), var(--bx-target-min))
        );
        padding-inline: var(--bx-tab-padding-inline, var(--bx-space-m));
        border-radius: var(
          --bx-tab-radius,
          var(--bx-radius-m) var(--bx-radius-m) 0 0
        );
        color: var(--bx-tab-fg, var(--bx-text-secondary));
        font: inherit;

        ${textStyle('--bx-tab', 'label-m')}

        white-space: nowrap;
        cursor: pointer;
        user-select: none;
        outline: none;
        transition:
          color var(--bx-motion-duration-fast) var(--bx-motion-easing-standard),
          background-color var(--bx-motion-duration-fast)
            var(--bx-motion-easing-standard);
      }

      .base:hover {
        color: var(--bx-tab-hover-fg, var(--bx-text-primary));
        background: var(--bx-tab-hover-bg, var(--bx-surface-subtle));
      }

      .base:active {
        background: var(--bx-tab-pressed-bg, var(--bx-surface-muted));
      }

      /* The selected tab is marked by the group's sliding indicator plus stronger text, so the
         state never relies on color alone. */
      :host([active]) .base {
        color: var(--bx-tab-selected-fg, var(--bx-text-primary));
      }

      :host([active]) .base:hover {
        background: var(--bx-tab-selected-hover-bg, transparent);
      }

      .base:focus-visible {
        outline: var(--bx-tab-focus-ring-width, var(--bx-border-width-strong))
          solid var(--bx-tab-focus-ring-color, var(--bx-focus-ring));
        outline-offset: var(
          --bx-tab-focus-ring-offset,
          calc(var(--bx-focus-ring-offset) * -1)
        );
      }

      :host([disabled]) .base {
        cursor: not-allowed;
        color: var(--bx-tab-disabled-fg, var(--bx-text-disabled));
        background: transparent;
      }

      @media (prefers-reduced-motion: reduce) {
        .base {
          transition: none;
        }
      }

      .close-button {
        all: unset;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: var(--bx-tab-close-button-size, 1em);
        block-size: var(--bx-tab-close-button-size, 1em);
        min-inline-size: var(
          --bx-tab-close-button-min-width,
          var(--bx-target-min)
        );
        min-block-size: var(
          --bx-tab-close-button-min-height,
          var(--bx-target-min)
        );
        margin-inline-end: calc(var(--bx-space-2xs) * -1);
        border-radius: var(--bx-tab-close-button-radius, var(--bx-radius-pill));
        cursor: pointer;
      }

      .close-button:hover {
        background: var(
          --bx-tab-close-button-hover-bg,
          color-mix(in srgb, currentColor 16%, transparent)
        );
      }

      .close-button:focus-visible {
        outline: var(
            --bx-tab-close-button-focus-ring-width,
            var(--bx-border-width-strong)
          )
          solid
          var(--bx-tab-close-button-focus-ring-color, var(--bx-focus-ring));
        outline-offset: var(
          --bx-tab-close-button-focus-ring-offset,
          var(--bx-focus-ring-offset)
        );
      }

      .close-button svg {
        inline-size: var(--bx-tab-close-button-icon-size, 0.65em);
        block-size: var(--bx-tab-close-button-icon-size, 0.65em);
        fill: currentColor;
      }

      @media (forced-colors: active) {
        :host([active]) .base {
          forced-color-adjust: none;
          color: Highlight;
        }
      }
    `,
  ];

  static override properties = {
    panel: { type: String },
    active: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    closable: { type: Boolean, reflect: true },
    tabStop: { type: Boolean, attribute: 'tab-stop' },
  };

  declare panel: string;
  declare active: boolean;
  declare disabled: boolean;
  declare closable: boolean;
  /** Roving-tabindex hook, driven by `bx-tab-group`; not in the spec's own properties table (see
   *  this class's doc comment). Defaults to `true` so a standalone tab stays a tab stop. */
  declare tabStop: boolean;

  #baseRef = createRef<HTMLDivElement>();
  #controlsElement: Element | null = null;

  constructor() {
    super();
    this.panel = '';
    this.active = false;
    this.disabled = false;
    this.closable = false;
    this.tabStop = true;
  }

  /** The tab's own `role="tab"` element, for `bx-tab-group` to reference from the matching
   *  panel's `ariaLabelledByElements` (the other half of the `controlsElement` relationship). */
  get tabElement(): Element | null {
    return this.#baseRef.value ?? null;
  }

  /** The element this tab controls (its matching `bx-tab-panel`), wired via `ariaControlsElements`
   *  rather than a plain `aria-controls` string — see this class's doc comment. Not in the spec's
   *  own properties table: it's an element reference, not a serializable attribute. */
  get controlsElement(): Element | null {
    return this.#controlsElement;
  }

  set controlsElement(element: Element | null) {
    this.#controlsElement = element;
    this.#applyControlsElement();
  }

  #applyControlsElement(): void {
    const base = this.#baseRef.value;
    if (!base) return;
    base.ariaControlsElements = this.#controlsElement
      ? [this.#controlsElement]
      : null;
  }

  protected override firstUpdated(): void {
    this.#applyControlsElement();
  }

  #close(): void {
    if (this.disabled) return;
    this.dispatchEvent(
      new CustomEvent('bx-close', { bubbles: true, composed: true }),
    );
  }

  #handleCloseClick = (event: MouseEvent): void => {
    event.stopPropagation();
    this.#close();
  };

  // The close button is `tabindex="-1"` — a focusable descendant of a `role="tab"` element is an
  // ARIA nested-interactive violation (axe: nested-interactive) regardless of real keyboard
  // behavior, since `tab` is itself an interactive widget role. Keyboard users close via
  // Backspace/Delete on the focused tab instead, the same pattern `bx-badge`'s removable chip
  // uses; mouse users can still click the visible button.
  #handleBaseKeydown = (event: KeyboardEvent): void => {
    if (!this.closable) return;
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      this.#close();
    }
  };

  protected override render() {
    return html`
      <div
        ${ref(this.#baseRef)}
        class="base"
        part="base"
        role="tab"
        tabindex=${this.disabled || !this.tabStop ? -1 : 0}
        aria-selected=${this.active}
        aria-disabled=${this.disabled}
        @keydown=${this.#handleBaseKeydown}
      >
        <slot></slot>
        ${
          this.closable
            ? html`<span
                class="close-button"
                part="close-button"
                aria-hidden="true"
                @click=${this.#handleCloseClick}
              >
                <svg viewBox="0 0 256 256"><path d=${X_PATH}></path></svg>
              </span>`
            : nothing
        }
      </div>
    `;
  }
}
