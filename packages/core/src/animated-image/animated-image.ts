import { css, html, nothing, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';
import { PAUSE_ICON, PLAY_ICON } from '../internal/icons.ts';
import { observeIntersection } from '../internal/shared-observers.ts';

type Status = 'idle' | 'loading' | 'ready' | 'error';

const LAZY_LOAD_ROOT_MARGIN = '200px';

/**
 * `<bx-animated-image>` — play/pause control for GIF and animated WebP.
 *
 * Renders the first frame to a `<canvas>` while paused (browsers cannot pause an already-running
 * GIF/WebP in place) and swaps in a live `<img>` — restarted from frame one — while playing.
 * Lazy-loads via a shared `IntersectionObserver` and starts paused under `prefers-reduced-motion`.
 *
 * @fires bx-load - The image decoded successfully and a first frame is ready.
 * @fires bx-error - The image failed to load or decode.
 *
 * @csspart frame - The element containing the image/canvas and the control button.
 * @csspart control-box - The play/pause toggle button.
 * @csspart play-icon - The `play-icon` slot wrapper, present while paused.
 * @csspart pause-icon - The `pause-icon` slot wrapper, present while playing.
 *
 * @slot play-icon - Custom icon shown on the toggle while paused.
 * @slot pause-icon - Custom icon shown on the toggle while playing.
 *
 * @cssprop --bx-control-box-size - Toggle button diameter. Default `max(control-height-m, target-min)`.
 * @cssprop --bx-control-box-bg - Toggle button background. Default `--bx-surface-base` (translucent).
 * @cssprop --bx-control-box-color - Toggle button icon/text color. Default `--bx-text-primary`.
 * @cssprop --bx-control-box-border-color - Toggle button border. Default `--bx-border-base`.
 * @cssprop --bx-frame-border-color - Border around the image area. Default `--bx-border-subtle`.
 * @cssprop --bx-frame-radius - Corner radius of the image area. Default `--bx-radius-m`.
 */
export class BxAnimatedImage extends BixElement {
  static override tagName = 'bx-animated-image';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-block;
        position: relative;
        line-height: 0;
        width: 100%;
        height: 100%;
        --bx-control-box-size: max(
          var(--bx-control-height-m),
          var(--bx-target-min)
        );
      }

      .frame {
        position: relative;
        inline-size: 100%;
        block-size: 100%;
        overflow: hidden;
        border: var(--bx-border-width) solid
          var(--bx-frame-border-color, var(--bx-border-subtle));
        border-radius: var(--bx-frame-radius, var(--bx-radius-m));
        background: var(--bx-surface-muted);
      }

      canvas,
      img {
        display: block;
        inline-size: 100%;
        block-size: 100%;
        object-fit: contain;
      }

      canvas[hidden],
      img[hidden] {
        display: none;
      }

      .placeholder {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        color: var(--bx-text-hint);
        font-family: var(--bx-font-family-sans);
        font-size: var(--bx-font-s);
        text-align: center;
        padding: var(--bx-space-xs);
      }

      .control-box {
        position: absolute;
        inset-block-end: var(--bx-space-xs);
        inset-inline-end: var(--bx-space-xs);
        inline-size: var(--bx-control-box-size);
        block-size: var(--bx-control-box-size);
        display: grid;
        place-items: center;
        border: var(--bx-border-width) solid
          var(--bx-control-box-border-color, var(--bx-border-base));
        border-radius: var(--bx-radius-m);
        background: var(
          --bx-control-box-bg,
          color-mix(in srgb, var(--bx-surface-base) 85%, transparent)
        );
        color: var(--bx-control-box-color, var(--bx-text-primary));
        padding: 0;
        cursor: pointer;
        font-size: calc(var(--bx-control-box-size) * 0.45);
        transition:
          background-color var(--bx-motion-duration-fast)
            var(--bx-motion-easing-standard),
          opacity var(--bx-motion-duration-fast)
            var(--bx-motion-easing-standard);
      }

      .control-box:hover:not(:disabled) {
        background: var(--bx-role-neutral-subtle-hover);
      }

      .control-box:disabled {
        cursor: default;
        opacity: 0.5;
      }

      .control-box:focus-visible {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: 2px;
      }

      ::slotted(*) {
        display: block;
        inline-size: 1em;
        block-size: 1em;
      }

      @media (forced-colors: active) {
        .control-box {
          forced-color-adjust: none;
          background: ButtonFace;
          color: ButtonText;
          border-color: ButtonText;
        }
      }
    `,
  ];

  static override properties = {
    src: { type: String },
    alt: { type: String },
    play: { type: Boolean, reflect: true },
    _status: { state: true },
  };

  declare src: string;
  declare alt: string;
  declare play: boolean;
  /** @internal */
  declare _status: Status;

  #intersecting = false;
  #unobserve?: () => void;
  #appliedReducedMotionDefault = false;
  #frameSource?: HTMLImageElement;
  #naturalWidth = 0;
  #naturalHeight = 0;
  #loadToken = 0;

  constructor() {
    super();
    this.src = '';
    this.alt = '';
    this.play = false;
    this._status = 'idle';
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#applyReducedMotionDefault();

    if (this.#intersecting) return; // Reconnected after already loading once.

    if (typeof IntersectionObserver === 'undefined') {
      this.#intersecting = true;
      void this.#load();
      return;
    }

    this.#unobserve = observeIntersection(
      this,
      (entry) => {
        if (!entry.isIntersecting) return;
        this.#intersecting = true;
        this.#unobserve?.();
        this.#unobserve = undefined;
        void this.#load();
      },
      { rootMargin: LAZY_LOAD_ROOT_MARGIN },
    );
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#unobserve?.();
    this.#unobserve = undefined;
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('src')) {
      this._status = 'idle';
      this.#frameSource = undefined;
      if (this.#intersecting) void this.#load();
    }
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('play') && this._status === 'ready') this.#syncPlayback();
  }

  #applyReducedMotionDefault(): void {
    if (this.#appliedReducedMotionDefault) return;
    this.#appliedReducedMotionDefault = true;
    if (this.play && this.prefersReducedMotion) this.play = false;
  }

  async #load(): Promise<void> {
    if (!this.src) {
      this._status = 'idle';
      return;
    }

    const token = ++this.#loadToken;
    const src = this.src;
    this._status = 'loading';

    const probe = new Image();
    probe.decoding = 'async';
    probe.src = src;

    try {
      await probe.decode();
    } catch (error) {
      if (token !== this.#loadToken) return; // Superseded by a newer `src`.
      this._status = 'error';
      this.dispatchEvent(
        new CustomEvent('bx-error', {
          bubbles: true,
          composed: true,
          detail: { error },
        }),
      );
      return;
    }

    if (token !== this.#loadToken) return; // Superseded by a newer `src`.
    this.#frameSource = probe;
    this.#naturalWidth = probe.naturalWidth;
    this.#naturalHeight = probe.naturalHeight;
    this._status = 'ready';
    this.dispatchEvent(
      new CustomEvent('bx-load', { bubbles: true, composed: true }),
    );

    await this.updateComplete;
    this.#drawFrame();
    this.#syncPlayback();
  }

  #drawFrame(): void {
    const canvas = this.renderRoot.querySelector('canvas');
    if (
      !canvas ||
      !this.#frameSource ||
      !this.#naturalWidth ||
      !this.#naturalHeight
    )
      return;
    canvas.width = this.#naturalWidth;
    canvas.height = this.#naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(this.#frameSource, 0, 0, canvas.width, canvas.height);
  }

  #syncPlayback(): void {
    const img = this.renderRoot.querySelector('img.live');
    if (!(img instanceof HTMLImageElement)) return;
    img.removeAttribute('src'); // Force a fresh decode so playback restarts from frame one.
    if (this.play) img.src = this.src;
  }

  #handleToggle = (): void => {
    if (this._status !== 'ready') return;
    this.play = !this.play;
  };

  protected override render() {
    const playing = this.play && this._status === 'ready';
    const label = `${playing ? 'Pause' : 'Play'}${this.alt ? `: ${this.alt}` : ''}`;

    return html`
      <div class="frame" part="frame">
        <canvas ?hidden=${playing} aria-hidden="true"></canvas>
        <img class="live" alt="" aria-hidden="true" ?hidden=${!playing} />
        ${
          this._status === 'error'
            ? html`<div
                class="placeholder"
                role="img"
                aria-label=${this.alt || 'Image failed to load'}
              >
                Unable to load image
              </div>`
            : nothing
        }
        <button
          type="button"
          class="control-box"
          part="control-box"
          aria-label=${label}
          aria-pressed=${this.play ? 'true' : 'false'}
          ?disabled=${this._status !== 'ready'}
          @click=${this.#handleToggle}
        >
          ${
            this.play
              ? html`<slot name="pause-icon" part="pause-icon"
                  >${PAUSE_ICON}</slot
                >`
              : html`<slot name="play-icon" part="play-icon"
                  >${PLAY_ICON}</slot
                >`
          }
        </button>
      </div>
    `;
  }
}
