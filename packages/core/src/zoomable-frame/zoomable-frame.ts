import { css, html, nothing } from 'lit';
import { BixElement } from '../bix-element.ts';
import { textStyle, textFamily } from '../internal/text-style.ts';

type Loading = 'eager' | 'lazy';

const PLUS_PATH =
  'M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z';
const MINUS_PATH =
  'M216,128a8,8,0,0,1-8,8H48a8,8,0,0,1,0-16H208A8,8,0,0,1,216,128Z';
const MORE_PATH =
  'M60,128a16,16,0,1,1-16-16A16,16,0,0,1,60,128Zm68-16a16,16,0,1,0,16,16A16,16,0,0,0,128,112Zm68,0a16,16,0,1,0,16,16A16,16,0,0,0,196,112Z';

let nextId = 0;

function parseLevels(raw: string): number[] {
  const levels = raw
    .split(/\s+/)
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b);
  return levels.length > 0 ? levels : [1];
}

/**
 * `<bx-zoomable-frame>` — iframe with zoom controls. Not form-associated.
 *
 * FR-ZOOMABLE-FRAME-01: the iframe's own box is sized to `100% / zoom` and then scaled back up by
 * `zoom` with `transform-origin: top left`, so the *visible* footprint the host occupies never
 * changes — only what's rendered inside appears to zoom. FR-ZOOMABLE-FRAME-02: `sandbox` defaults
 * to the empty string (the platform's most restrictive combination — no scripts, no same-origin,
 * no forms, no popups) rather than omitting the attribute (which would mean *unsandboxed*);
 * callers opt back into specific capabilities explicitly via the `sandbox` attribute.
 *
 * `label` is not in the spec's own properties table (docs/features/core/zoomable-frame.md §2) but
 * is required to satisfy that same spec's §6 "iframe requires `title`" — see `bx-radio`/
 * `bx-rating`'s `name` for the same kind of gap, and that spec's §10 "confirm final property names
 * during implementation".
 *
 * @fires load - The iframe finished loading.
 * @fires error - The iframe failed to load.
 *
 * @slot zoom-in-icon - Overrides the default zoom-in icon.
 * @slot zoom-out-icon - Overrides the default zoom-out icon.
 *
 * @csspart frame - The scaled box that holds the iframe.
 * @csspart iframe - The `<iframe>` element.
 * @csspart controls - The wrapper around the zoom controls.
 * @csspart zoom-in-button - The zoom-in button.
 * @csspart zoom-out-button - The zoom-out button.
 * @csspart zoom-label - The current zoom percentage label.
 * @cssprop --bx-zoomable-frame-frame-radius - Corner radius of the `frame` part. Default `var(--bx-radius-m)`.
 * @cssprop --bx-zoomable-frame-frame-border-width - Border width of the `frame` part. Default `var(--bx-border-width)`.
 * @cssprop --bx-zoomable-frame-frame-border-color - Border color of the `frame` part. Default `var(--bx-border-subtle)`.
 * @cssprop --bx-zoomable-frame-controls-gap - Gap of the `controls` part. Default `var(--bx-space-2xs)`.
 * @cssprop --bx-zoomable-frame-controls-padding - Padding of the `controls` part. Default `var(--bx-space-2xs)`.
 * @cssprop --bx-zoomable-frame-controls-radius - Corner radius of the `controls` part. Default `var(--bx-radius-pill)`.
 * @cssprop --bx-zoomable-frame-controls-bg - Background of the `controls` part. Default `var(--bx-surface-base)`.
 * @cssprop --bx-zoomable-frame-controls-border-width - Border width of the `controls` part. Default `var(--bx-border-width)`.
 * @cssprop --bx-zoomable-frame-controls-border-color - Border color of the `controls` part. Default `var(--bx-border-subtle)`.
 * @cssprop --bx-zoomable-frame-controls-shadow - Box shadow of the `controls` part. Default `var(--bx-shadow-s)`.
 * @cssprop --bx-zoomable-frame-button-size - Size (width and height) of the `button` element. Default `var(--bx-target-min)`.
 * @cssprop --bx-zoomable-frame-button-fg - Text/icon color of the `button` element. Default `var(--bx-text-primary)`.
 * @cssprop --bx-zoomable-frame-menu-trigger-bg - Background of the `menu-trigger` element. Default `var(--bx-surface-base)`.
 * @cssprop --bx-zoomable-frame-menu-trigger-border-width - Border width of the `menu-trigger` element. Default `var(--bx-border-width)`.
 * @cssprop --bx-zoomable-frame-menu-trigger-border-color - Border color of the `menu-trigger` element. Default `var(--bx-border-subtle)`.
 * @cssprop --bx-zoomable-frame-menu-trigger-shadow - Box shadow of the `menu-trigger` element. Default `var(--bx-shadow-s)`.
 * @cssprop --bx-zoomable-frame-button-hover-bg - Background of the `button` element (hover state). Default `var(--bx-surface-subtle)`.
 * @cssprop --bx-zoomable-frame-button-focus-ring-width - Focus ring width of the `button` element (focus state). Default `var(--bx-border-width-strong)`.
 * @cssprop --bx-zoomable-frame-button-focus-ring-color - Focus ring color of the `button` element (focus state). Default `var(--bx-focus-ring)`.
 * @cssprop --bx-zoomable-frame-button-focus-ring-offset - Focus ring offset of the `button` element (focus state). Default `var(--bx-focus-ring-offset)`.
 * @cssprop --bx-zoomable-frame-button-disabled-fg - Text/icon color of the `button` element (disabled state). Default `var(--bx-text-disabled)`.
 * @cssprop --bx-zoomable-frame-zoom-label-min-width - Minimum width of the `zoom-label` part. Default `3.5ch`.
 * @cssprop --bx-zoomable-frame-zoom-label-fg - Text/icon color of the `zoom-label` part. Default `var(--bx-text-secondary)`.
 * @cssprop --bx-zoomable-frame-icon-size - Size (width and height) of the icon inside the `svg` element. Default `1.1em`.
 * @cssprop --bx-zoomable-frame-font-family - Font family of the root surface. Default `var(--bx-type-body-family)`.
 * @cssprop --bx-zoomable-frame-zoom-label-font-family - Font family of the `zoom-label` part (text style `body-s`). Default `var(--bx-type-body-family)`.
 * @cssprop --bx-zoomable-frame-zoom-label-font-size - Font size of the `zoom-label` part (text style `body-s`). Default `var(--bx-type-body-s-size)`.
 * @cssprop --bx-zoomable-frame-zoom-label-font-weight - Font weight of the `zoom-label` part (text style `body-s`). Default `var(--bx-type-body-s-weight)`.
 * @cssprop --bx-zoomable-frame-zoom-label-line-height - Line height of the `zoom-label` part (text style `body-s`). Default `var(--bx-type-body-s-leading)`.
 * @cssprop --bx-zoomable-frame-zoom-label-letter-spacing - Letter spacing of the `zoom-label` part (text style `body-s`). Default `var(--bx-type-body-s-tracking)`.
 */
export class BxZoomableFrame extends BixElement {
  static override tagName = 'bx-zoomable-frame';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        container-type: inline-size;
        position: relative;
        inline-size: 100%;
        block-size: 100%;
        ${textFamily('--bx-zoomable-frame', 'body')}
      }

      .frame {
        position: relative;
        inline-size: 100%;
        block-size: 100%;
        overflow: hidden;
        border-radius: var(
          --bx-zoomable-frame-frame-radius,
          var(--bx-radius-m)
        );
        border: var(
            --bx-zoomable-frame-frame-border-width,
            var(--bx-border-width)
          )
          solid
          var(--bx-zoomable-frame-frame-border-color, var(--bx-border-subtle));
      }

      .iframe {
        display: block;
        inline-size: calc(100% / var(--_zoom, 1));
        block-size: calc(100% / var(--_zoom, 1));
        border: none;
        transform: scale(var(--_zoom, 1));
        transform-origin: top left;
        transition: transform var(--bx-motion-duration-fast) ease;
      }

      @media (prefers-reduced-motion: reduce) {
        .iframe {
          transition: none;
        }
      }

      .controls {
        position: absolute;
        inset-block-end: var(--bx-space-s);
        inset-inline-end: var(--bx-space-s);
        display: flex;
        align-items: center;
        gap: var(--bx-zoomable-frame-controls-gap, var(--bx-space-2xs));
        padding: var(--bx-zoomable-frame-controls-padding, var(--bx-space-2xs));
        border-radius: var(
          --bx-zoomable-frame-controls-radius,
          var(--bx-radius-pill)
        );
        background: var(
          --bx-zoomable-frame-controls-bg,
          var(--bx-surface-base)
        );
        border: var(
            --bx-zoomable-frame-controls-border-width,
            var(--bx-border-width)
          )
          solid
          var(
            --bx-zoomable-frame-controls-border-color,
            var(--bx-border-subtle)
          );
        box-shadow: var(
          --bx-zoomable-frame-controls-shadow,
          var(--bx-shadow-s)
        );
      }

      .menu-trigger {
        display: none;
      }

      @container (max-width: 18rem) {
        .controls {
          display: none;
        }
        .controls[data-open] {
          display: flex;
        }
        .menu-trigger {
          display: inline-flex;
        }
      }

      button {
        all: unset;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: var(--bx-zoomable-frame-button-size, var(--bx-target-min));
        block-size: var(--bx-zoomable-frame-button-size, var(--bx-target-min));
        border-radius: 50%;
        cursor: pointer;
        color: var(--bx-zoomable-frame-button-fg, var(--bx-text-primary));
      }

      .menu-trigger {
        position: absolute;
        inset-block-end: var(--bx-space-s);
        inset-inline-end: var(--bx-space-s);
        background: var(
          --bx-zoomable-frame-menu-trigger-bg,
          var(--bx-surface-base)
        );
        border: var(
            --bx-zoomable-frame-menu-trigger-border-width,
            var(--bx-border-width)
          )
          solid
          var(
            --bx-zoomable-frame-menu-trigger-border-color,
            var(--bx-border-subtle)
          );
        box-shadow: var(
          --bx-zoomable-frame-menu-trigger-shadow,
          var(--bx-shadow-s)
        );
      }

      button:hover {
        background: var(
          --bx-zoomable-frame-button-hover-bg,
          var(--bx-surface-subtle)
        );
      }

      button:focus-visible {
        outline: var(
            --bx-zoomable-frame-button-focus-ring-width,
            var(--bx-border-width-strong)
          )
          solid
          var(--bx-zoomable-frame-button-focus-ring-color, var(--bx-focus-ring));
        outline-offset: var(
          --bx-zoomable-frame-button-focus-ring-offset,
          var(--bx-focus-ring-offset)
        );
      }

      button:disabled {
        color: var(
          --bx-zoomable-frame-button-disabled-fg,
          var(--bx-text-disabled)
        );
        cursor: not-allowed;
      }

      button svg {
        inline-size: var(--bx-zoomable-frame-icon-size, 1.1em);
        block-size: var(--bx-zoomable-frame-icon-size, 1.1em);
        fill: currentColor;
      }

      .zoom-label {
        min-inline-size: var(--bx-zoomable-frame-zoom-label-min-width, 3.5ch);
        text-align: center;

        ${textStyle('--bx-zoomable-frame-zoom-label', 'body-s')}

        color: var(--bx-zoomable-frame-zoom-label-fg, var(--bx-text-secondary));
      }

      @media (forced-colors: active) {
        .controls,
        .menu-trigger {
          forced-color-adjust: none;
          border-color: CanvasText;
          background: Canvas;
        }
      }
    `,
  ];

  static override properties = {
    src: { type: String },
    srcdoc: { type: String },
    label: { type: String },
    allowFullscreen: {
      type: Boolean,
      reflect: true,
      attribute: 'allow-fullscreen',
    },
    loading: { type: String },
    referrerpolicy: { type: String },
    sandbox: { type: String },
    zoom: { type: Number },
    zoomLevels: { type: String, attribute: 'zoom-levels' },
    _menuOpen: { state: true },
  };

  declare src: string;
  declare srcdoc: string;
  declare label: string;
  declare allowFullscreen: boolean;
  declare loading: Loading;
  declare referrerpolicy: string;
  declare sandbox: string;
  declare zoom: number;
  declare zoomLevels: string;
  /** @internal */
  declare _menuOpen: boolean;

  #controlsId = `bx-zoomable-frame-controls-${nextId++}`;

  constructor() {
    super();
    this.src = '';
    this.srcdoc = '';
    this.label = '';
    this.allowFullscreen = false;
    this.loading = 'eager';
    this.referrerpolicy = '';
    this.sandbox = '';
    this.zoom = 1;
    this.zoomLevels = '0.25 0.5 1 1.5 2';
    this._menuOpen = false;

    this.addEventListener('keydown', this.#handleKeydown);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('click', this.#handleOutsideClick, true);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('click', this.#handleOutsideClick, true);
  }

  #handleOutsideClick = (event: MouseEvent): void => {
    if (this._menuOpen && !event.composedPath().includes(this))
      this._menuOpen = false;
  };

  #handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this._menuOpen) {
      this._menuOpen = false;
      this.shadowRoot?.querySelector<HTMLElement>('.menu-trigger')?.focus();
    }
  };

  #toggleMenu = (): void => {
    this._menuOpen = !this._menuOpen;
  };

  /** Steps to the next larger configured zoom level, clamped at the top of `zoomLevels`. */
  zoomIn(): void {
    const levels = parseLevels(this.zoomLevels);
    const next = levels.find((level) => level > this.zoom);
    this.zoom = next ?? levels[levels.length - 1]!;
  }

  /** Steps to the next smaller configured zoom level, clamped at the bottom of `zoomLevels`. */
  zoomOut(): void {
    const levels = parseLevels(this.zoomLevels);
    const previous = [...levels].reverse().find((level) => level < this.zoom);
    this.zoom = previous ?? levels[0]!;
  }

  #handleLoad = (): void => {
    this.dispatchEvent(new Event('load', { bubbles: true, composed: true }));
  };

  #handleError = (): void => {
    this.dispatchEvent(new Event('error', { bubbles: true, composed: true }));
  };

  #renderControls() {
    const levels = parseLevels(this.zoomLevels);
    return html`
      <div
        class="controls"
        part="controls"
        id=${this.#controlsId}
        ?data-open=${this._menuOpen}
      >
        <button
          type="button"
          class="zoom-out-button"
          part="zoom-out-button"
          aria-label="Zoom out"
          ?disabled=${this.zoom <= levels[0]!}
          @click=${this.zoomOut}
        >
          <slot name="zoom-out-icon"
            ><svg viewBox="0 0 256 256"><path d=${MINUS_PATH}></path></svg
          ></slot>
        </button>
        <span class="zoom-label" part="zoom-label"
          >${Math.round(this.zoom * 100)}%</span
        >
        <button
          type="button"
          class="zoom-in-button"
          part="zoom-in-button"
          aria-label="Zoom in"
          ?disabled=${this.zoom >= levels[levels.length - 1]!}
          @click=${this.zoomIn}
        >
          <slot name="zoom-in-icon"
            ><svg viewBox="0 0 256 256"><path d=${PLUS_PATH}></path></svg
          ></slot>
        </button>
      </div>
    `;
  }

  protected override render() {
    return html`
      <div class="frame" part="frame" style="--_zoom: ${this.zoom}">
        <iframe
          class="iframe"
          part="iframe"
          title=${this.label || 'Embedded content'}
          src=${this.src || nothing}
          srcdoc=${this.srcdoc || nothing}
          loading=${this.loading}
          referrerpolicy=${this.referrerpolicy || nothing}
          sandbox=${this.sandbox}
          ?allowfullscreen=${this.allowFullscreen}
          @load=${this.#handleLoad}
          @error=${this.#handleError}
        ></iframe>
      </div>
      ${this.#renderControls()}
      <button
        type="button"
        class="menu-trigger"
        aria-label="Zoom controls"
        aria-haspopup="true"
        aria-expanded=${this._menuOpen}
        aria-controls=${this.#controlsId}
        @click=${this.#toggleMenu}
      >
        <svg viewBox="0 0 256 256"><path d=${MORE_PATH}></path></svg>
      </button>
    `;
  }
}
