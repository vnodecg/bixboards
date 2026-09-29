import { css, html, nothing } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';

type Variant = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';
type Appearance = 'accent' | 'filled' | 'outlined' | 'plain' | 'filled outlined';
type Size = 'small' | 'medium' | 'large';
type ButtonType = 'button' | 'submit' | 'reset';

// Vendored from packages/core/src/icon/default-library.ts (Phosphor Icons, regular, MIT).
const CARET_DOWN_PATH =
  'M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z';

/**
 * `<bx-button>` — triggers an action, navigates (link mode), or submits/resets a form
 * (docs/features/core/button.md).
 *
 * Renders a real inner `<button>` or, when `href` is set, a real inner `<a>` — native
 * activation, focus and (for links) Ctrl/Cmd-click/middle-click/`download` semantics come free
 * (FR-BUTTON-02), no reimplementation needed. The spec's own header table says
 * "Form-associated: No" while FR-BUTTON-01 asks for submit/reset to "act on the associated form
 * via ElementInternals" — those two lines don't actually agree. This resolves the tension the
 * simpler way: a trigger button carries no value, so it doesn't need `FormAssociatedMixin`'s
 * `setFormValue`/validity plumbing (matching "No"); it only needs to find the right `<form>`
 * (`form` attribute → `getElementById`, else the nearest ancestor `<form>`) and call
 * `requestSubmit()`/`reset()` on it directly (satisfying FR-01's actual functional ask).
 *
 * FR-BUTTON-06 ("disabled must not swallow events silently in a way that breaks tooltips") is why
 * `disabled` is never rendered as the inner control's native `disabled` attribute — a native
 * `disabled` control suppresses pointer events entirely, which would make a future `bx-tooltip`
 * anchored to a disabled button impossible to show on hover. Instead the inner control stays
 * focusable and hoverable, gets `aria-disabled`, and every activation path
 * (click/Enter/Space/`requestSubmit`) is guarded in script.
 *
 * `--bx-button-truncate` (FR-BUTTON-05) is the literal `white-space` value applied to the label:
 * unset, it falls back to `normal` (wraps, the spec's default); set it to `nowrap` to truncate
 * with an ellipsis instead.
 *
 * `target`/`rel`/`download` aren't in the spec's own properties table but are required for
 * FR-BUTTON-02's link-mode behavior — added the same way `bx-radio`'s `name`/`checked` fill an
 * analogous gap in that component's own spec.
 *
 * @fires click - Native; suppressed when `disabled`/`loading`.
 * @fires bx-invalid - The associated form failed constraint validation on a `submit`-type click.
 *
 * @slot (default) - Label.
 * @slot start - Leading icon/content.
 * @slot end - Trailing icon/content.
 *
 * @csspart base - The inner `<button>`/`<a>`.
 * @csspart start - The wrapper around the start slot.
 * @csspart label - The wrapper around the default slot.
 * @csspart end - The wrapper around the end slot.
 * @csspart caret - The dropdown caret, present when `with-caret` is set.
 * @csspart spinner - The loading spinner, present when `loading`.
 *
 * @cssprop --bx-button-bg - Background color. Defaults to a role/appearance combination.
 * @cssprop --bx-button-fg - Text/icon color. Defaults to a role/appearance combination.
 * @cssprop --bx-button-border - Border color. Defaults to a role/appearance combination.
 * @cssprop --bx-button-min-height - Control height. Default derived from `size`.
 * @cssprop --bx-button-padding-inline - Horizontal padding. Default derived from `size`.
 * @cssprop --bx-button-truncate - Label `white-space` value; set to `nowrap` to truncate.
 */
export class BxButton extends BixElement {
  static override tagName = 'bx-button';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-block;
        vertical-align: middle;
        font-family: var(--bx-font-family-sans);
        --bx-button-computed-bg: transparent;
        --bx-button-computed-fg: var(--bx-button-variant-fg);
        --bx-button-computed-border: transparent;
      }

      /* Variant → role tokens. */
      :host([variant='neutral']),
      :host(:not([variant])) {
        --bx-button-variant-solid: var(--bx-role-neutral-solid);
        --bx-button-variant-on-solid: var(--bx-role-neutral-on-solid);
        --bx-button-variant-subtle: var(--bx-role-neutral-subtle);
        --bx-button-variant-fg: var(--bx-role-neutral-fg);
        --bx-button-variant-border: var(--bx-role-neutral-border);
      }
      :host([variant='brand']) {
        --bx-button-variant-solid: var(--bx-role-brand-solid);
        --bx-button-variant-on-solid: var(--bx-role-brand-on-solid);
        --bx-button-variant-subtle: var(--bx-role-brand-subtle);
        --bx-button-variant-fg: var(--bx-role-brand-fg);
        --bx-button-variant-border: var(--bx-role-brand-border);
      }
      :host([variant='success']) {
        --bx-button-variant-solid: var(--bx-role-success-solid);
        --bx-button-variant-on-solid: var(--bx-role-success-on-solid);
        --bx-button-variant-subtle: var(--bx-role-success-subtle);
        --bx-button-variant-fg: var(--bx-role-success-fg);
        --bx-button-variant-border: var(--bx-role-success-border);
      }
      :host([variant='warning']) {
        --bx-button-variant-solid: var(--bx-role-warning-solid);
        --bx-button-variant-on-solid: var(--bx-role-warning-on-solid);
        --bx-button-variant-subtle: var(--bx-role-warning-subtle);
        --bx-button-variant-fg: var(--bx-role-warning-fg);
        --bx-button-variant-border: var(--bx-role-warning-border);
      }
      :host([variant='danger']) {
        --bx-button-variant-solid: var(--bx-role-danger-solid);
        --bx-button-variant-on-solid: var(--bx-role-danger-on-solid);
        --bx-button-variant-subtle: var(--bx-role-danger-subtle);
        --bx-button-variant-fg: var(--bx-role-danger-fg);
        --bx-button-variant-border: var(--bx-role-danger-border);
      }

      /* Appearance → computed bg/fg/border, using ~= so "filled outlined" applies both. */
      :host([appearance~='filled']) {
        --bx-button-computed-bg: var(--bx-button-variant-subtle);
      }
      :host([appearance~='outlined']) {
        --bx-button-computed-border: var(--bx-button-variant-border);
      }
      :host([appearance='accent']),
      :host(:not([appearance])) {
        --bx-button-computed-bg: var(--bx-button-variant-solid);
        --bx-button-computed-fg: var(--bx-button-variant-on-solid);
        --bx-button-computed-border: var(--bx-button-variant-solid);
      }
      :host([appearance='plain']) {
        --bx-button-computed-bg: transparent;
        --bx-button-computed-border: transparent;
      }

      /* Size steps. */
      :host([size='small']) {
        --bx-button-computed-min-height: calc(var(--bx-target-min, 2.75rem) * 0.8);
        --bx-button-computed-padding-inline: var(--bx-space-s);
        --bx-button-computed-font-size: var(--bx-font-s);
      }
      :host([size='medium']),
      :host(:not([size])) {
        --bx-button-computed-min-height: var(--bx-target-min, 2.75rem);
        --bx-button-computed-padding-inline: var(--bx-space-m);
        --bx-button-computed-font-size: var(--bx-font-m);
      }
      :host([size='large']) {
        --bx-button-computed-min-height: calc(var(--bx-target-min, 2.75rem) * 1.2);
        --bx-button-computed-padding-inline: var(--bx-space-l);
        --bx-button-computed-font-size: var(--bx-font-l);
      }

      .base {
        box-sizing: border-box;
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--bx-space-2xs);
        min-block-size: var(--bx-button-min-height, var(--bx-button-computed-min-height));
        padding-inline: var(--bx-button-padding-inline, var(--bx-button-computed-padding-inline));
        border: var(--bx-border-width) solid var(--bx-button-border, var(--bx-button-computed-border));
        border-radius: var(--bx-radius-m);
        background: var(--bx-button-bg, var(--bx-button-computed-bg));
        color: var(--bx-button-fg, var(--bx-button-computed-fg));
        font: inherit;
        font-size: var(--bx-button-computed-font-size);
        font-weight: var(--bx-font-weight-medium);
        text-decoration: none;
        cursor: pointer;
      }

      :host([pill]) .base {
        border-radius: var(--bx-radius-full, 999px);
      }

      .base:hover {
        filter: brightness(0.95);
      }

      .base:focus-visible {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: var(--bx-focus-ring-offset);
      }

      .base[aria-disabled='true'] {
        cursor: not-allowed;
        opacity: 0.5;
      }

      .start,
      .end {
        display: inline-flex;
        align-items: center;
      }

      .start:empty,
      .end:empty {
        display: none;
      }

      .label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: var(--bx-button-truncate, normal);
      }

      :host([loading]) .label {
        visibility: hidden;
      }

      .caret svg,
      .start svg,
      .end svg {
        inline-size: 1em;
        block-size: 1em;
        fill: currentColor;
      }

      .caret {
        display: inline-flex;
      }

      .spinner {
        position: absolute;
        inset: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1em;
      }

      @media (forced-colors: active) {
        .base {
          forced-color-adjust: none;
          border-color: ButtonText;
          background: ButtonFace;
          color: ButtonText;
        }
        .base[aria-disabled='true'] {
          opacity: 1;
          border-color: GrayText;
          color: GrayText;
        }
      }
    `,
  ];

  static override properties = {
    variant: { type: String, reflect: true },
    appearance: { type: String, reflect: true },
    size: { type: String, reflect: true },
    pill: { type: Boolean, reflect: true },
    loading: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    href: { type: String },
    target: { type: String },
    rel: { type: String },
    download: { type: String },
    type: { type: String },
    name: { type: String },
    value: { type: String },
    form: { type: String },
    withCaret: { type: Boolean, reflect: true, attribute: 'with-caret' },
  };

  declare variant: Variant;
  declare appearance: Appearance;
  declare size: Size;
  declare pill: boolean;
  declare loading: boolean;
  declare disabled: boolean;
  declare href: string;
  declare target: string;
  declare rel: string;
  declare download: string;
  declare type: ButtonType;
  declare name: string;
  declare value: string;
  declare form: string;
  declare withCaret: boolean;

  #baseRef = createRef<HTMLElement>();

  constructor() {
    super();
    this.variant = 'neutral';
    this.appearance = 'accent';
    this.size = 'medium';
    this.pill = false;
    this.loading = false;
    this.disabled = false;
    this.href = '';
    this.target = '';
    this.rel = '';
    this.download = '';
    this.type = 'button';
    this.name = '';
    this.value = '';
    this.form = '';
    this.withCaret = false;
  }

  protected override updated(): void {
    // FR-BUTTON-04: an icon-only button (no visible text and no accessible name of its own) is
    // invisible to assistive tech — warn rather than fail silently, the same convention
    // `bx-format-date` uses for bad input.
    if (
      this.textContent?.trim() === '' &&
      !this.hasAttribute('aria-label') &&
      !this.hasAttribute('aria-labelledby')
    )
      console.warn(
        '<bx-button>: icon-only buttons need an aria-label (or aria-labelledby) for an accessible name.',
      );
  }

  get #associatedForm(): HTMLFormElement | null {
    if (this.form) return document.getElementById(this.form) as HTMLFormElement | null;
    return this.closest('form');
  }

  #handleClick = (event: MouseEvent): void => {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (this.href) return; // Native <a> activation; nothing more to do.

    if (this.type === 'submit') {
      const form = this.#associatedForm;
      if (form && !form.reportValidity()) {
        this.dispatchEvent(new CustomEvent('bx-invalid', { bubbles: true, composed: true }));
        return;
      }
      form?.requestSubmit();
    } else if (this.type === 'reset') {
      this.#associatedForm?.reset();
    }
  };

  /** Focuses the inner control. */
  override focus(options?: FocusOptions): void {
    this.#baseRef.value?.focus(options);
  }

  /** Blurs the inner control. */
  override blur(): void {
    this.#baseRef.value?.blur();
  }

  /** Activates the inner control. */
  override click(): void {
    this.#baseRef.value?.click();
  }

  protected override render() {
    const busy = this.disabled || this.loading;
    const content = html`
      <span class="start" part="start"><slot name="start"></slot></span>
      <span class="label" part="label"><slot></slot></span>
      <span class="end" part="end"><slot name="end"></slot></span>
      ${this.withCaret
        ? html`<span class="caret" part="caret" aria-hidden="true">
            <svg viewBox="0 0 256 256"><path d=${CARET_DOWN_PATH}></path></svg>
          </span>`
        : nothing}
      ${this.loading
        ? html`<bx-spinner class="spinner" part="spinner" aria-hidden="true"></bx-spinner>`
        : nothing}
    `;

    return this.href
      ? html`<a
          ${ref(this.#baseRef)}
          class="base"
          part="base"
          href=${this.href}
          target=${this.target || nothing}
          rel=${this.rel || nothing}
          download=${this.download || nothing}
          role=${busy ? 'link' : nothing}
          aria-disabled=${busy}
          aria-busy=${this.loading}
          @click=${this.#handleClick}
          >${content}</a
        >`
      : html`<button
          ${ref(this.#baseRef)}
          class="base"
          part="base"
          type="button"
          aria-disabled=${busy}
          aria-busy=${this.loading}
          @click=${this.#handleClick}
        >
          ${content}
        </button>`;
  }
}
