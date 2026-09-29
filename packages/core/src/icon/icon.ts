import { css, html, nothing, type PropertyValues } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { BixElement } from '../bix-element.ts';
import { resolveIcon, resolveIconSrc } from './registry.ts';
import './default-library.ts';

type Status = 'idle' | 'loading' | 'ready' | 'error';

/**
 * `<bx-icon>` — icon from a registered library or URL, inlined SVG.
 *
 * Resolves either `src` (fetched directly) or `name`/`library`/`family`/`variant` against a
 * library registered with {@link registerIconLibrary}; the bundled `default` library needs no
 * network. Results are sanitised (`<script>`/`<foreignObject>` stripped), cached and de-duplicated
 * across every instance on the page (docs/features/core/icon.md FR-ICON-01/02/03).
 *
 * @fires bx-load - The icon resolved and rendered.
 * @fires bx-error - The icon failed to resolve (unknown name, fetch failure, invalid markup).
 *
 * @csspart svg - The wrapper around the inlined `<svg>`.
 *
 * @cssprop --bx-icon-size - Width/height. Default `1em`, so the icon follows fluid type.
 */
export class BxIcon extends BixElement {
  static override tagName = 'bx-icon';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-flex;
        inline-size: var(--bx-icon-size, 1em);
        block-size: var(--bx-icon-size, 1em);
        flex-shrink: 0;
        line-height: 0;
      }

      .svg,
      .svg svg {
        display: block;
        inline-size: 100%;
        block-size: 100%;
      }

      .svg svg {
        fill: currentColor;
      }
    `,
  ];

  static override properties = {
    name: { type: String },
    family: { type: String },
    variant: { type: String },
    src: { type: String },
    label: { type: String },
    library: { type: String },
    _status: { state: true },
    _markup: { state: true },
  };

  declare name: string;
  declare family: string;
  declare variant: string;
  declare src: string;
  declare label: string;
  declare library: string;
  /** @internal */
  declare _status: Status;
  /** @internal */
  declare _markup?: string;

  #token = 0;

  constructor() {
    super();
    this.name = '';
    this.family = 'default';
    this.variant = '';
    this.src = '';
    this.label = '';
    this.library = 'default';
    this._status = 'idle';
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (
      changed.has('src') ||
      changed.has('name') ||
      changed.has('library') ||
      changed.has('family') ||
      changed.has('variant')
    )
      void this.#load();
  }

  async #load(): Promise<void> {
    const token = ++this.#token;

    if (!this.src && !this.name) {
      this._status = 'idle';
      this._markup = undefined;
      return;
    }

    this._status = 'loading';

    try {
      const markup = this.src
        ? await resolveIconSrc(this.src)
        : await resolveIcon(this.library, this.name, {
            family: this.family,
            variant: this.variant,
          });
      if (token !== this.#token) return; // Superseded by a newer property change.
      this._markup = markup;
      this._status = 'ready';
      this.dispatchEvent(
        new CustomEvent('bx-load', { bubbles: true, composed: true }),
      );
    } catch (error) {
      if (token !== this.#token) return;
      this._markup = undefined;
      this._status = 'error';
      this.dispatchEvent(
        new CustomEvent('bx-error', {
          bubbles: true,
          composed: true,
          detail: { error },
        }),
      );
    }
  }

  protected override render() {
    return html`
      <span
        class="svg"
        part="svg"
        role=${this.label ? 'img' : nothing}
        aria-label=${this.label || nothing}
        aria-hidden=${this.label ? nothing : 'true'}
      >
        ${this._status === 'ready' && this._markup ? unsafeSVG(this._markup) : nothing}
      </span>
    `;
  }
}
