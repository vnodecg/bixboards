import { css, html, nothing, type PropertyValues } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';

type Variant = 'primary' | 'secondary' | 'tertiary' | 'warning' | 'error';
type Appearance = 'filled' | 'outlined' | 'plain';
type Size = 's' | 'm' | 'l';

const VARIANT_MAP: Record<Variant, string> = {
  primary: 'default',
  secondary: 'secondary',
  tertiary: 'tertiary',
  warning: 'warning',
  error: 'error',
};
const SIZE_MAP: Record<Size, string> = {
  s: 'small',
  m: 'medium',
  l: 'large',
};

/**
 * `<bx-icon-button>` — a square or round button that shows only an icon
 * (docs/features/core/icon-button.md).
 *
 * Composes `bx-button` (FR-ICONBUTTON-01): state, link mode, loading and form submission all come
 * from it; this element only fixes the geometry (equal width and height) and renders the icon from
 * `name`/`src` or the default slot. The required `label` becomes the inner control's `aria-label`
 * (FR-ICONBUTTON-02): a missing one logs a dev warning. The hit area never drops below
 * `--bx-target-min` (FR-ICONBUTTON-03) because the inner `bx-button` already floors its height.
 *
 * @fires click - Native; not emitted when `disabled`/`loading`.
 *
 * @slot (default) - Icon content when not using `name`/`src`.
 *
 * @csspart base - The interactive surface (the inner `bx-button`).
 * @csspart icon - The `bx-icon`, present when `name`/`src` is set.
 *
 * @cssprop --bx-icon-button-size - Width and height. Default derived from `size`.
 * @cssprop --bx-icon-button-bg - Background. Default role/appearance combination.
 * @cssprop --bx-icon-button-icon-size - Icon size. Default `1.25em`.
 */
export class BxIconButton extends BixElement {
  static override tagName = 'bx-icon-button';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-block;
        vertical-align: middle;
        --bx-icon-button-computed-size: max(
          var(--bx-control-height-m),
          var(--bx-target-min)
        );
      }
      :host([size='s']) {
        --bx-icon-button-computed-size: max(
          var(--bx-control-height-s),
          var(--bx-target-min)
        );
      }
      :host([size='l']) {
        --bx-icon-button-computed-size: max(
          var(--bx-control-height-l),
          var(--bx-target-min)
        );
      }

      .base {
        --bx-button-padding-inline: 0;
        --bx-button-min-height: var(
          --bx-icon-button-size,
          var(--bx-icon-button-computed-size)
        );
        --bx-button-icon-size: var(--bx-icon-button-icon-size, 1.25em);
        --bx-icon-size: var(--bx-icon-button-icon-size, 1.25em);
        inline-size: var(
          --bx-icon-button-size,
          var(--bx-icon-button-computed-size)
        );
      }

      .base[appearance='filled'],
      .base[appearance='outlined'],
      .base[appearance='plain'] {
        --bx-button-bg: var(--bx-icon-button-bg);
      }
      /* Unset hook falls through to bx-button's own role/appearance background. */
      .base[appearance='plain'] {
        --bx-button-bg: var(--bx-icon-button-bg, transparent);
      }

      :host([shape='circle']) .base {
        --bx-button-radius: var(--bx-radius-pill);
      }

      :host([disabled]) {
        cursor: not-allowed;
      }
    `,
  ];

  static override properties = {
    label: { type: String },
    name: { type: String },
    src: { type: String },
    variant: { type: String, reflect: true },
    appearance: { type: String, reflect: true },
    size: { type: String, reflect: true },
    shape: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    loading: { type: Boolean, reflect: true },
    href: { type: String },
    target: { type: String },
    rel: { type: String },
    download: { type: String },
    type: { type: String },
    form: { type: String },
  };

  declare label: string;
  declare name: string;
  declare src: string;
  declare variant: Variant;
  declare appearance: Appearance;
  declare size: Size;
  declare shape: 'square' | 'circle';
  declare disabled: boolean;
  declare loading: boolean;
  declare href: string;
  declare target: string;
  declare rel: string;
  declare download: string;
  declare type: 'button' | 'submit' | 'reset';
  declare form: string;

  #baseRef = createRef<HTMLElement & { focus(): void }>();

  constructor() {
    super();
    this.label = '';
    this.name = '';
    this.src = '';
    this.variant = 'secondary';
    this.appearance = 'plain';
    this.size = 'm';
    this.shape = 'square';
    this.disabled = false;
    this.loading = false;
    this.href = '';
    this.target = '';
    this.rel = '';
    this.download = '';
    this.type = 'button';
    this.form = '';
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (
      changed.has('label') &&
      !this.label &&
      !this.getAttribute('aria-label') &&
      !this.hasAttribute('aria-labelledby')
    )
      console.warn(
        '<bx-icon-button> needs a `label` (its accessible name); an icon alone is not announced.',
        this,
      );
  }

  /** Focuses the inner control. */
  override focus(options?: FocusOptions): void {
    (this.#baseRef.value as HTMLElement | undefined)?.focus(options);
  }

  /** Blurs the inner control. */
  override blur(): void {
    (this.#baseRef.value as HTMLElement | undefined)?.blur();
  }

  /** Activates the inner control. */
  override click(): void {
    (this.#baseRef.value as HTMLElement | undefined)?.click();
  }

  protected override render() {
    const hasIcon = this.name || this.src;
    return html`<bx-button
      ${ref(this.#baseRef)}
      class="base"
      part="base"
      variant=${VARIANT_MAP[this.variant] ?? 'secondary'}
      appearance=${
        this.appearance === 'filled'
          ? 'filled'
          : this.appearance === 'outlined'
            ? 'outlined'
            : 'plain'
      }
      size=${SIZE_MAP[this.size] ?? 'medium'}
      aria-label=${this.label || nothing}
      ?disabled=${this.disabled}
      ?loading=${this.loading}
      href=${this.href || nothing}
      target=${this.target || nothing}
      rel=${this.rel || nothing}
      download=${this.download || nothing}
      type=${this.type}
      form=${this.form || nothing}
    >
      ${
        hasIcon
          ? html`<bx-icon
              part="icon"
              name=${this.name || nothing}
              src=${this.src || nothing}
            ></bx-icon>`
          : nothing
      }
      <slot></slot>
    </bx-button>`;
  }
}
