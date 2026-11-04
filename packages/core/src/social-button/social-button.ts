import { css, html, nothing } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';

export interface SocialProvider {
  /** Display name used in the label, e.g. "Google". */
  label: string;
  /** Inline SVG markup for the mark (use the provider's own colours for multi-colour marks). */
  svg?: string;
  /** Brand colour used by `appearance="brand"`. */
  brandColor?: string;
  /** Text colour on `brandColor`. Default white. */
  onBrandColor?: string;
}

const providers = new Map<string, SocialProvider>();

/** Registers (or replaces) a provider; only providers an app registers are bundled (FR-SOCIALBUTTON-01). */
export function registerSocialProvider(
  name: string,
  provider: SocialProvider,
): void {
  providers.set(name.toLowerCase(), provider);
}

/** Label templates per `mode`, with a `{provider}` placeholder (FR-SOCIALBUTTON-02). Overridable. */
export const socialLabels: Record<string, string> = {
  continue: 'Continue with {provider}',
  signin: 'Sign in with {provider}',
  signup: 'Sign up with {provider}',
  share: 'Share on {provider}',
};

/**
 * `<bx-social-button>` — branded sign-in / share button (docs/features/core/social-button.md).
 *
 * Composes `bx-button`. The mark and name come from a provider registered with
 * {@link registerSocialProvider}; no brand artwork is bundled, so there is nothing to keep in
 * sync with providers' brand guidelines (FR-SOCIALBUTTON-03) — register the official mark you are
 * licensed to use. An unregistered provider falls back to a letter monogram and its capitalised
 * name. The default slot replaces the generated label; the logo is always `aria-hidden`.
 *
 * @fires click - Native click.
 *
 * @slot (default) - Overrides the generated label.
 *
 * @csspart base - The button surface.
 * @csspart logo - Provider mark.
 * @csspart label - Text.
 *
 * @cssprop --bx-social-button-bg - Background. Default per `appearance`.
 * @cssprop --bx-social-button-logo-size - Mark size. Default `1.25em`.
 */
export class BxSocialButton extends BixElement {
  static override tagName = 'bx-social-button';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-block;
        vertical-align: middle;
        max-inline-size: 100%;
      }
      .base {
        max-inline-size: 100%;
        --bx-button-truncate: nowrap;
      }
      .base[data-brand] {
        --bx-button-bg: var(--bx-social-button-bg, var(--_brand));
        --bx-button-fg: var(--_on-brand);
        --bx-button-border: var(--bx-social-button-bg, var(--_brand));
      }
      .base:not([data-brand]) {
        --bx-button-bg: var(--bx-social-button-bg);
      }
      .logo {
        display: inline-flex;
        flex-shrink: 0;
        inline-size: var(--bx-social-button-logo-size, 1.25em);
        block-size: var(--bx-social-button-logo-size, 1.25em);
      }
      .logo svg {
        inline-size: 100%;
        block-size: 100%;
      }
      .monogram {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 100%;
        block-size: 100%;
        border-radius: 50%;
        border: var(--bx-border-width) solid currentColor;
        font-size: 0.75em;
        font-weight: bolder;
        line-height: 1;
      }
    `,
  ];

  static override properties = {
    provider: { type: String },
    mode: { type: String },
    appearance: { type: String, reflect: true },
    size: { type: String, reflect: true },
    href: { type: String },
    disabled: { type: Boolean, reflect: true },
    loading: { type: Boolean, reflect: true },
  };

  declare provider: string;
  declare mode: 'continue' | 'signin' | 'signup' | 'share';
  declare appearance: 'brand' | 'outlined' | 'mono';
  declare size: 's' | 'm' | 'l';
  declare href: string;
  declare disabled: boolean;
  declare loading: boolean;

  #baseRef = createRef<HTMLElement>();

  constructor() {
    super();
    this.provider = '';
    this.mode = 'continue';
    this.appearance = 'outlined';
    this.size = 'm';
    this.href = '';
    this.disabled = false;
    this.loading = false;
  }

  override focus(options?: FocusOptions): void {
    this.#baseRef.value?.focus(options);
  }

  override blur(): void {
    this.#baseRef.value?.blur();
  }

  get #info(): SocialProvider {
    const key = this.provider.toLowerCase();
    return (
      providers.get(key) ?? {
        label: key.charAt(0).toUpperCase() + key.slice(1),
      }
    );
  }

  protected override render() {
    const info = this.#info;
    const brand = this.appearance === 'brand' && info.brandColor;
    const label = (
      socialLabels[this.mode] ?? socialLabels['continue']!
    ).replace('{provider}', info.label);
    const size = { s: 'small', m: 'medium', l: 'large' }[this.size] ?? 'medium';
    return html`<bx-button
      ${ref(this.#baseRef)}
      class="base"
      part="base"
      style=${
        brand
          ? `--_brand:${info.brandColor};--_on-brand:${info.onBrandColor ?? '#fff'}`
          : ''
      }
      ?data-brand=${brand}
      variant=${this.appearance === 'mono' ? 'secondary' : 'default'}
      appearance=${
        brand
          ? 'accent'
          : this.appearance === 'mono'
            ? 'filled'
            : 'filled outlined'
      }
      size=${size}
      href=${this.href || nothing}
      ?disabled=${this.disabled}
      ?loading=${this.loading}
    >
      <span class="logo" part="logo" slot="start" aria-hidden="true"
        >${
          info.svg
            ? this.#svg(info.svg)
            : html`<span class="monogram">${info.label.charAt(0)}</span>`
        }</span
      >
      <span part="label"><slot>${label}</slot></span>
    </bx-button>`;
  }

  #svg(markup: string) {
    const template = document.createElement('template');
    template.innerHTML = markup;
    template.content
      .querySelectorAll('script, foreignObject')
      .forEach((n) => n.remove());
    return template.content.cloneNode(true);
  }
}
