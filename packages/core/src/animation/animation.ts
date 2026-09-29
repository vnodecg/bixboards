import { css, html, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';
import { getPreset } from './presets/registry.ts';

type Direction = PlaybackDirection;
type Fill = FillMode;

/**
 * `<bx-animation>` — declarative Web Animations API wrapper with named presets.
 *
 * Animates its default-slotted element (the first assigned element) via `Element.animate()`.
 * Keyframes come from the `keyframes` property when set, otherwise from the tree-shakable preset
 * registered under `name` (import `@bixant/core/animation/presets/<name>` to register one) —
 * `name="none"` (the default) plays nothing. Built-in presets: `bounce`, `fadeIn`, `fadeOut`,
 * `flip`, `pulse`, `shake`, `slideInDown`, `slideInLeft`, `slideInRight`, `slideInUp`, `spin`,
 * `zoomIn`, `zoomOut` (kebab-case subpaths, e.g. `@bixant/core/animation/presets/slide-in-up`).
 * Auto-disabled under `prefers-reduced-motion` (the animation still runs, but with zero duration
 * and a single iteration) unless `force` is set.
 *
 * @fires bx-start - The animation started (a `play` toggle-on, or an option change while playing).
 * @fires bx-finish - The animation reached its end naturally.
 * @fires bx-cancel - The animation was cancelled (`play` toggled off, `cancel()`, disconnect).
 *
 * @slot (default) - Element to animate.
 */
export class BxAnimation extends BixElement {
  static override tagName = 'bx-animation';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: contents;
      }
    `,
  ];

  static override properties = {
    name: { type: String },
    play: { type: Boolean, reflect: true },
    delay: { type: Number },
    direction: { type: String },
    duration: { type: Number },
    easing: { type: String },
    endDelay: { type: Number, attribute: 'end-delay' },
    fill: { type: String },
    iterations: { type: Number },
    iterationStart: { type: Number, attribute: 'iteration-start' },
    playbackRate: { type: Number, attribute: 'playback-rate' },
    force: { type: Boolean },
    keyframes: { attribute: false },
  };

  declare name: string;
  declare play: boolean;
  declare delay: number;
  declare direction: Direction;
  declare duration: number;
  declare easing: string;
  declare endDelay: number;
  declare fill: Fill;
  declare iterations: number;
  declare iterationStart: number;
  declare playbackRate: number;
  /** Runs at full duration/iterations even under `prefers-reduced-motion` (FR-ANIMATION-02). */
  declare force: boolean;
  /** Explicit keyframes; takes precedence over the `name` preset when set. */
  declare keyframes?: Keyframe[] | PropertyIndexedKeyframes;

  #animation?: Animation;

  constructor() {
    super();
    this.name = 'none';
    this.play = false;
    this.delay = 0;
    this.direction = 'normal';
    this.duration = 1000;
    this.easing = 'linear';
    this.endDelay = 0;
    this.fill = 'auto';
    this.iterations = Infinity;
    this.iterationStart = 0;
    this.playbackRate = 1;
    this.force = false;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#teardown();
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('playbackRate') && this.#animation)
      this.#animation.playbackRate = this.playbackRate;

    const optionsChanged =
      changed.has('name') ||
      changed.has('keyframes') ||
      changed.has('delay') ||
      changed.has('direction') ||
      changed.has('duration') ||
      changed.has('easing') ||
      changed.has('endDelay') ||
      changed.has('fill') ||
      changed.has('iterations') ||
      changed.has('iterationStart') ||
      changed.has('force');

    if (!changed.has('play') && !optionsChanged) return;
    if (this.play) this.#start();
    else this.#teardown();
  }

  #handleSlotChange = (): void => {
    if (this.play) this.#start();
  };

  #target(): Element | undefined {
    return this.renderRoot
      .querySelector('slot')
      ?.assignedElements({ flatten: true })[0];
  }

  #start(): void {
    this.#teardown();
    const target = this.#target();
    if (!target) return;

    const keyframes: Keyframe[] | PropertyIndexedKeyframes =
      this.keyframes ?? getPreset(this.name)?.() ?? [];
    const reduced = this.prefersReducedMotion && !this.force;

    const animation = target.animate(keyframes, {
      delay: this.delay,
      direction: this.direction,
      duration: reduced ? 0 : this.duration,
      easing: this.easing,
      endDelay: this.endDelay,
      fill: this.fill,
      iterations: reduced ? 1 : this.iterations,
      iterationStart: this.iterationStart,
    });
    animation.playbackRate = this.playbackRate;
    animation.onfinish = () => this.#emit('bx-finish');
    animation.oncancel = () => this.#emit('bx-cancel');
    this.#animation = animation;
    this.#emit('bx-start');
  }

  #teardown(): void {
    this.#animation?.cancel();
    this.#animation = undefined;
  }

  #emit(name: string): void {
    this.dispatchEvent(
      new CustomEvent(name, { bubbles: true, composed: true }),
    );
  }

  /** Stops the animation (equivalent to setting `play = false`). */
  cancel(): void {
    this.play = false;
  }

  /** Jumps the running animation to its end state. */
  finish(): void {
    this.#animation?.finish();
  }

  /** The current `Animation`, or `undefined` when not playing. */
  getAnimation(): Animation | undefined {
    return this.#animation;
  }

  protected override render() {
    return html`<slot @slotchange=${this.#handleSlotChange}></slot>`;
  }
}
