import { css, html, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';
import { FormAssociatedMixin } from '../internal/form-associated.ts';

type Size = 'small' | 'medium' | 'large';

// Fraction of the track's travel distance a touch drag must cross before release decides the
// state by drag direction rather than by treating the gesture as a tap (toggle-on-release).
const DRAG_COMMIT_RATIO = 0.3;

let nextId = 0;

/**
 * `<bx-switch>` — on/off toggle, form-associated via `ElementInternals`.
 *
 * Shares its focus/click delegation approach with `bx-checkbox` (`delegatesFocus` + a host-level
 * listener) — see that component's doc comment for why. `role="switch"` control size and the
 * `--bx-switch-*` custom properties are on the control alone.
 *
 * @fires input - Value changed by user (bubbles, composed).
 * @fires change - Committed change (bubbles, composed).
 * @fires bx-invalid - Constraint validation failed.
 *
 * @slot (default) - Label.
 * @slot hint - Overrides the `hint` attribute's text.
 *
 * @csspart base - The outer label wrapper.
 * @csspart control - The track.
 * @csspart thumb - The moving thumb.
 * @csspart label - The wrapper around the default slot.
 * @csspart hint - The wrapper around the hint slot.
 *
 * @cssprop --bx-switch-width - Track width. Default `calc(var(--bx-unit) * 2.75)`.
 * @cssprop --bx-switch-height - Track height. Default `calc(var(--bx-unit) * 1.5)`.
 * @cssprop --bx-thumb-size - Thumb diameter. Default track height minus padding.
 */
export class BxSwitch extends FormAssociatedMixin(BixElement) {
  static override tagName = 'bx-switch';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-block;
        font-family: var(--bx-font-family-sans);
      }

      .base {
        display: inline-flex;
        align-items: flex-start;
        gap: var(--bx-space-xs);
        cursor: pointer;
      }

      :host([disabled]) .base {
        cursor: not-allowed;
        color: var(--bx-text-disabled);
      }

      .control {
        box-sizing: border-box;
        flex-shrink: 0;
        position: relative;
        inline-size: var(--bx-switch-width, calc(var(--bx-unit) * 2.75));
        block-size: var(--bx-switch-height, calc(var(--bx-unit) * 1.5));
        margin: calc(
          (
              var(--bx-target-min, 2.75rem) - var(
                  --bx-switch-height,
                  calc(var(--bx-unit) * 1.5)
                )
            ) /
            2
        );
        border: var(--bx-border-width-strong) solid var(--bx-border-strong);
        border-radius: var(--bx-radius-full, 999px);
        background: var(--bx-surface-subtle);
        transition:
          background var(--bx-motion-duration-fast, 0.12s) ease,
          border-color var(--bx-motion-duration-fast, 0.12s) ease;
      }

      :host([size='small']) .control {
        --bx-switch-width: calc(var(--bx-unit) * 2.25);
        --bx-switch-height: calc(var(--bx-unit) * 1.25);
      }
      :host([size='large']) .control {
        --bx-switch-width: calc(var(--bx-unit) * 3.25);
        --bx-switch-height: calc(var(--bx-unit) * 1.75);
      }

      :host([checked]) .control {
        border-color: var(--bx-role-accent);
        background: var(--bx-role-accent);
      }

      .control:focus-visible {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: var(--bx-focus-ring-offset);
      }

      :host([disabled]) .control {
        border-color: var(--bx-border-subtle);
        background: var(--bx-surface-subtle);
      }

      .thumb {
        position: absolute;
        inset-block-start: 50%;
        inset-inline-start: 2px;
        inline-size: var(
          --bx-thumb-size,
          calc(var(--bx-switch-height, calc(var(--bx-unit) * 1.5)) - 6px)
        );
        block-size: var(
          --bx-thumb-size,
          calc(var(--bx-switch-height, calc(var(--bx-unit) * 1.5)) - 6px)
        );
        border-radius: 50%;
        background: var(--bx-surface);
        transform: translateY(-50%);
        transition: transform var(--bx-motion-duration-fast, 0.12s) ease;
      }

      :host([checked]) .thumb {
        transform: translateY(-50%)
          translateX(
            calc(
              var(--bx-switch-width, calc(var(--bx-unit) * 2.75)) - var(
                  --bx-thumb-size,
                  calc(
                    var(--bx-switch-height, calc(var(--bx-unit) * 1.5)) - 6px
                  )
                ) -
                4px
            )
          );
      }

      :host([disabled]) .thumb {
        background: var(--bx-surface-subtle);
      }

      @media (prefers-reduced-motion: reduce) {
        .control,
        .thumb {
          transition: none;
        }
      }

      .label {
        padding-block-start: calc((var(--bx-target-min, 2.75rem) - 1lh) / 2);
        min-block-size: var(--bx-target-min, 2.75rem);
      }

      .label:empty {
        display: none;
      }

      .hint {
        margin-inline-start: calc(
          var(--bx-switch-width, calc(var(--bx-unit) * 2.75)) +
            var(--bx-space-xs)
        );
        color: var(--bx-text-secondary);
        font-size: var(--bx-font-size-s);
      }

      .hint:empty {
        display: none;
      }

      @media (forced-colors: active) {
        .control {
          forced-color-adjust: none;
          border-color: CanvasText;
        }
        :host([checked]) .control {
          background: Highlight;
          border-color: Highlight;
        }
        .thumb {
          background: CanvasText;
        }
      }
    `,
  ];

  static override properties = {
    name: { type: String },
    value: { type: String },
    checked: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
    hint: { type: String },
  };

  declare name: string;
  declare value: string;
  declare checked: boolean;
  declare disabled: boolean;
  declare required: boolean;
  declare size: Size;
  declare hint: string;

  #labelId = `bx-switch-label-${nextId++}`;
  #hasInteracted = false;
  #dragStartX = 0;
  #dragging = false;

  constructor() {
    super();
    this.name = '';
    this.value = 'on';
    this.checked = false;
    this.disabled = false;
    this.required = false;
    this.size = 'medium';
    this.hint = '';

    this.addEventListener('click', this.#handleClick);
    this.addEventListener('keydown', this.#handleKeydown);
    this.addEventListener('pointerdown', this.#handlePointerDown);
  }

  static override shadowRootOptions: ShadowRootInit = {
    ...BixElement.shadowRootOptions,
    delegatesFocus: true,
  };

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('checked') || changed.has('required'))
      this.#syncFormState();
  }

  #syncFormState(): void {
    this.internals.setFormValue(this.checked ? this.value : null);

    const missing = this.required && !this.checked;
    this.internals.setValidity(
      missing ? { valueMissing: true } : {},
      missing ? 'Please turn this on.' : undefined,
    );

    if (this.#hasInteracted) {
      this.toggleAttribute('data-user-valid', !missing);
      this.toggleAttribute('data-user-invalid', missing);
    }
  }

  formResetCallback(): void {
    this.checked = false;
    this.#hasInteracted = false;
    this.removeAttribute('data-user-valid');
    this.removeAttribute('data-user-invalid');
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    this.checked = state === this.value;
  }

  #commit(next: boolean): void {
    if (this.disabled || this.checked === next) return;
    this.checked = next;
    this.#hasInteracted = true;

    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

    if (!this.internals.checkValidity())
      this.dispatchEvent(
        new CustomEvent('bx-invalid', { bubbles: true, composed: true }),
      );
  }

  #handleClick = (): void => {
    if (this.#dragging) return; // pointerup already committed the drag result.
    this.#commit(!this.checked);
  };

  #handleKeydown = (event: KeyboardEvent): void => {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    this.#commit(!this.checked);
  };

  // FR-SWITCH-05: drag-to-toggle on touch. A `click` still fires after `pointerup` for a tap, so
  // `#handleClick` guards on `#dragging` (reset on the next microtask) to avoid double-toggling
  // when the drag itself already committed a value.
  #handlePointerDown = (event: PointerEvent): void => {
    if (this.disabled || event.pointerType === 'mouse') return;
    this.#dragStartX = event.clientX;
    this.#dragging = false;

    const controlWidth =
      this.shadowRoot!.querySelector('.control')!.getBoundingClientRect().width;

    const handleMove = (moveEvent: PointerEvent): void => {
      const delta = moveEvent.clientX - this.#dragStartX;
      if (Math.abs(delta) > controlWidth * DRAG_COMMIT_RATIO) {
        this.#dragging = true;
        this.#commit(delta > 0);
      }
    };

    const handleUp = (): void => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      // Let the resulting `click` event through on a tap (no drag); swallow it after a real drag.
      if (this.#dragging) queueMicrotask(() => (this.#dragging = false));
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  protected override render() {
    return html`
      <div class="base" part="base">
        <span
          class="control"
          part="control"
          role="switch"
          tabindex=${this.disabled ? -1 : 0}
          aria-checked=${this.checked}
          aria-disabled=${this.disabled}
          aria-required=${this.required}
          aria-labelledby=${this.#labelId}
        >
          <span class="thumb" part="thumb"></span>
        </span>
        <span class="label" part="label" id=${this.#labelId}
          ><slot></slot
        ></span>
      </div>
      <div class="hint" part="hint"><slot name="hint">${this.hint}</slot></div>
    `;
  }
}
