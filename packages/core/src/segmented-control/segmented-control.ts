import { css, html, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';
import { FormAssociatedMixin } from '../internal/form-associated.ts';
import { observeResize } from '../internal/shared-observers.ts';
import type { BxSegment } from '../segment/segment.ts';

/**
 * `<bx-segmented-control>` — compact single-choice control with a sliding indicator
 * (docs/features/core/segmented-control.md).
 *
 * A `role="radiogroup"` of `bx-segment` radios with roving tabindex; arrow keys move *and* select,
 * Home/End jump (FR-SEGMENTEDCONTROL-01). The indicator moves with `transform` only and is
 * re-measured through the shared `ResizeObserver` (FR-SEGMENTEDCONTROL-02); the slide duration is 0
 * under reduced motion. Form-associated: submits the selected `value` under `name`.
 *
 * @fires input - The selection changed by the user.
 * @fires change - The selection changed by the user; `detail.value`.
 *
 * @slot (default) - `bx-segment` children (value, label, optional icon, disabled).
 *
 * @csspart base - Track.
 * @csspart indicator - Sliding thumb.
 * @csspart segment - A segment.
 *
 * @cssprop --bx-segmented-control-bg - Track background.
 * @cssprop --bx-segmented-control-indicator-bg - Thumb color.
 * @cssprop --bx-segmented-control-indicator-duration - Slide duration; 0 under reduced motion.
 */
export class BxSegmentedControl extends FormAssociatedMixin(BixElement) {
  static override tagName = 'bx-segmented-control';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-block;
        --_h: var(--bx-control-height-m);
      }
      :host([size='s']) {
        --_h: var(--bx-control-height-s);
      }
      :host([size='l']) {
        --_h: var(--bx-control-height-l);
      }
      :host([full-width]) {
        display: block;
      }
      .base {
        position: relative;
        display: flex;
        padding: calc(var(--bx-border-width) * 2);
        border-radius: var(--bx-radius-m);
        background: var(--bx-segmented-control-bg, var(--bx-surface-subtle));
        border: var(--bx-border-width) solid var(--bx-border-subtle);
      }
      .indicator {
        position: absolute;
        inset-block: calc(var(--bx-border-width) * 2);
        inset-inline-start: 0;
        inline-size: var(--_w, 0);
        border-radius: var(--bx-radius-s);
        background: var(
          --bx-segmented-control-indicator-bg,
          var(--bx-surface-base)
        );
        box-shadow: var(--bx-shadow-s);
        transform: translateX(var(--_x, 0));
        transition:
          transform
            var(
              --bx-segmented-control-indicator-duration,
              var(--bx-motion-duration-base)
            )
            var(--bx-motion-easing-standard),
          inline-size
            var(
              --bx-segmented-control-indicator-duration,
              var(--bx-motion-duration-base)
            )
            var(--bx-motion-easing-standard);
      }
      .indicator[hidden] {
        display: none;
      }
      @media (prefers-reduced-motion: reduce) {
        .indicator {
          transition: none;
        }
      }
      @media (forced-colors: active) {
        .base {
          border-color: CanvasText;
        }
        .indicator {
          display: none;
        }
      }
    `,
  ];

  static override properties = {
    label: { type: String },
    value: { type: String },
    name: { type: String },
    size: { type: String, reflect: true },
    fullWidth: { type: Boolean, reflect: true, attribute: 'full-width' },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    _hasSelection: { state: true },
  };

  declare label: string;
  declare value: string;
  declare name: string;
  declare size: 's' | 'm' | 'l';
  declare fullWidth: boolean;
  declare disabled: boolean;
  declare required: boolean;
  /** @internal */
  declare _hasSelection: boolean;

  #unobserve?: () => void;
  #defaultValue?: string;

  constructor() {
    super();
    this.label = '';
    this.value = '';
    this.name = '';
    this.size = 'm';
    this.fullWidth = false;
    this.disabled = false;
    this.required = false;
    this._hasSelection = false;
  }

  get #segments(): BxSegment[] {
    return [...this.children].filter(
      (c) => c.localName === 'bx-segment',
    ) as BxSegment[];
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'radiogroup');
    this.addEventListener('click', this.#onClick);
    this.addEventListener('keydown', this.#onKeydown);
    this.#defaultValue ??= this.value;
    this.#unobserve = observeResize(this, () => this.#measure());
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('click', this.#onClick);
    this.removeEventListener('keydown', this.#onKeydown);
    this.#unobserve?.();
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('label')) {
      if (this.label) this.setAttribute('aria-label', this.label);
      else this.removeAttribute('aria-label');
    }
  }

  protected override updated(changed: PropertyValues<this>): void {
    this.#syncSegments();
    this.#measure();
    this.setAttribute('aria-disabled', String(this.disabled));
    this.setAttribute('aria-required', String(this.required));
    if (
      changed.has('value') ||
      changed.has('name') ||
      changed.has('required') ||
      changed.has('disabled')
    ) {
      this.internals.setFormValue(this.name ? this.value : null);
      const missing = this.required && !this.value;
      this.internals.setValidity(
        missing ? { valueMissing: true } : {},
        missing ? 'Please select an option.' : undefined,
        this.#segments[0],
      );
    }
  }

  formResetCallback(): void {
    this.value = this.#defaultValue ?? '';
  }

  formStateRestoreCallback(state: string | null): void {
    this.value = state ?? '';
  }

  #syncSegments(): void {
    const segments = this.#segments;
    const enabled = segments.filter((s) => !s.disabled && !this.disabled);
    const selected = segments.find((s) => s.value === this.value);
    // Roving tabindex: the selected segment, else the first enabled one.
    const stop = selected && enabled.includes(selected) ? selected : enabled[0];
    for (const segment of segments) {
      segment.selected = segment === selected;
      segment.fullWidth = this.fullWidth;
      segment.tabIndex = segment === stop ? 0 : -1;
      segment.toggleAttribute('data-group-disabled', this.disabled);
    }
    this._hasSelection = !!selected;
  }

  #measure = (): void => {
    const selected = this.#segments.find((s) => s.selected);
    const base = this.shadowRoot?.querySelector<HTMLElement>('.base');
    if (!selected || !base) return;
    const rtl = getComputedStyle(this).direction === 'rtl';
    const x = rtl
      ? selected.offsetLeft - (base.clientWidth - selected.offsetWidth - 0)
      : selected.offsetLeft;
    base.style.setProperty('--_x', `${x - base.clientLeft}px`);
    base.style.setProperty('--_w', `${selected.offsetWidth}px`);
  };

  #choose(segment: BxSegment | undefined): void {
    if (!segment || segment.disabled || this.disabled) return;
    if (segment.value === this.value) {
      segment.focus();
      return;
    }
    this.value = segment.value;
    segment.focus();
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: { value: this.value },
      }),
    );
  }

  #onClick = (event: MouseEvent): void => {
    this.#choose(
      (event.target as Element).closest('bx-segment') as BxSegment | undefined,
    );
  };

  #onKeydown = (event: KeyboardEvent): void => {
    const enabled = this.#segments.filter((s) => !s.disabled);
    if (!enabled.length || this.disabled) return;
    const current = enabled.indexOf(
      (event.target as Element).closest('bx-segment') as BxSegment,
    );
    const rtl = getComputedStyle(this).direction === 'rtl';
    let next = -1;
    switch (event.key) {
      case 'ArrowRight':
        next = current + (rtl ? -1 : 1);
        break;
      case 'ArrowLeft':
        next = current + (rtl ? 1 : -1);
        break;
      case 'ArrowDown':
        next = current + 1;
        break;
      case 'ArrowUp':
        next = current - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = enabled.length - 1;
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        this.#choose(enabled[current]);
        return;
      default:
        return;
    }
    event.preventDefault();
    this.#choose(enabled[(next + enabled.length) % enabled.length]);
  };

  protected override render() {
    return html`<div class="base" part="base">
      <span
        class="indicator"
        part="indicator"
        ?hidden=${!this._hasSelection}
      ></span>
      <slot @slotchange=${() => this.requestUpdate()}></slot>
    </div>`;
  }
}
