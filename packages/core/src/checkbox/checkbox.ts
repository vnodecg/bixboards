import { css, html, nothing, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';
import { FormAssociatedMixin } from '../internal/form-associated.ts';

type Size = 'small' | 'medium' | 'large';

const CHECK_PATH =
  'M225.86,102.82c-3.77-3.94-10-4.1-13.94-.34l-83.6,80.13-38.86-40.14a10,10,0,0,0-14.34,13.94l45.7,47.24a10,10,0,0,0,7.17,3.05,10,10,0,0,0,6.94-2.79l90.6-86.85C229.46,113,229.63,106.75,225.86,102.82Z';
const MINUS_PATH = 'M208,128a12,12,0,0,1-12,12H60a12,12,0,0,1,0-24H196A12,12,0,0,1,208,128Z';

let nextId = 0;

/**
 * `<bx-checkbox>` — binary or indeterminate selection, form-associated via `ElementInternals`.
 *
 * The `role="checkbox"` control lives in the shadow root with `delegatesFocus`, so the host's
 * inherited `focus()`/`blur()`/`click()` (the spec's public methods, docs/features/core/checkbox.md
 * §2) work without any override: `delegatesFocus` sends `host.focus()` to the control, and a
 * single host-level click/keydown listener catches synthetic `host.click()`, real clicks on
 * slotted light-DOM label text, and clicks on the shadow control itself (all composed-bubble to
 * the host either way).
 *
 * FR-CHECKBOX-05's "lite" render path for `bx-data-table` row selection is deferred until that
 * package exists to define what "lite" needs to skip — nothing here depends on it yet.
 *
 * @fires input - Value changed by user (bubbles, composed).
 * @fires change - Committed change (bubbles, composed).
 * @fires bx-invalid - Constraint validation failed.
 *
 * @slot (default) - Label.
 * @slot hint - Overrides the `hint` attribute's text.
 *
 * @csspart base - The outer label wrapper.
 * @csspart control - The checkbox box.
 * @csspart checked-icon - The checkmark icon.
 * @csspart indeterminate-icon - The indeterminate (dash) icon.
 * @csspart label - The wrapper around the default slot.
 * @csspart hint - The wrapper around the hint slot.
 *
 * @cssprop --bx-checked-icon-color - Icon color when checked/indeterminate. Default `--bx-on-accent`.
 */
export class BxCheckbox extends FormAssociatedMixin(BixElement) {
  static override tagName = 'bx-checkbox';

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
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: var(--bx-checkbox-size, calc(var(--bx-unit) * 1.25));
        block-size: var(--bx-checkbox-size, calc(var(--bx-unit) * 1.25));
        margin: calc(
          (var(--bx-target-min, 2.75rem) - var(--bx-checkbox-size, calc(var(--bx-unit) * 1.25))) / 2
        );
        border: var(--bx-border-width-strong) solid var(--bx-border-strong);
        border-radius: var(--bx-radius-s);
        background: var(--bx-surface);
      }

      :host([size='small']) .control {
        --bx-checkbox-size: var(--bx-unit);
      }
      :host([size='large']) .control {
        --bx-checkbox-size: calc(var(--bx-unit) * 1.5);
      }

      :host([checked]) .control,
      :host([indeterminate]) .control {
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

      .control svg {
        inline-size: 85%;
        block-size: 85%;
        fill: var(--bx-checked-icon-color, var(--bx-on-accent));
      }

      .label {
        padding-block-start: calc(
          (var(--bx-target-min, 2.75rem) - 1lh) / 2
        );
        min-block-size: var(--bx-target-min, 2.75rem);
      }

      .label:empty {
        display: none;
      }

      .hint {
        margin-inline-start: calc(
          var(--bx-checkbox-size, calc(var(--bx-unit) * 1.25)) + var(--bx-space-xs)
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
        :host([checked]) .control,
        :host([indeterminate]) .control {
          background: Highlight;
          border-color: Highlight;
        }
        .control svg {
          fill: HighlightText;
        }
      }
    `,
  ];

  static override properties = {
    name: { type: String },
    value: { type: String },
    checked: { type: Boolean, reflect: true },
    indeterminate: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
    hint: { type: String },
  };

  declare name: string;
  declare value: string;
  declare checked: boolean;
  declare indeterminate: boolean;
  declare disabled: boolean;
  declare required: boolean;
  declare size: Size;
  declare hint: string;

  #labelId = `bx-checkbox-label-${nextId++}`;
  #hasInteracted = false;

  constructor() {
    super();
    this.name = '';
    this.value = 'on';
    this.checked = false;
    this.indeterminate = false;
    this.disabled = false;
    this.required = false;
    this.size = 'medium';
    this.hint = '';

    this.addEventListener('click', this.#handleActivate);
    this.addEventListener('keydown', this.#handleKeydown);
  }

  protected override createRenderRoot() {
    return this.attachShadow({ mode: 'open', delegatesFocus: true });
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('checked') || changed.has('indeterminate') || changed.has('required'))
      this.#syncFormState();
  }

  #syncFormState(): void {
    this.internals.setFormValue(this.checked ? this.value : null);

    const missing = this.required && !this.checked;
    this.internals.setValidity(
      missing ? { valueMissing: true } : {},
      missing ? 'Please check this box.' : undefined,
    );

    if (this.#hasInteracted) {
      this.toggleAttribute('data-user-valid', !missing);
      this.toggleAttribute('data-user-invalid', missing);
    }
  }

  formResetCallback(): void {
    this.checked = false;
    this.indeterminate = false;
    this.#hasInteracted = false;
    this.removeAttribute('data-user-valid');
    this.removeAttribute('data-user-invalid');
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    this.checked = state === this.value;
  }

  #toggle(): void {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.indeterminate = false; // FR-CHECKBOX-04
    this.#hasInteracted = true;

    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

    if (!this.internals.checkValidity())
      this.dispatchEvent(new CustomEvent('bx-invalid', { bubbles: true, composed: true }));
  }

  #handleActivate = (): void => this.#toggle();

  #handleKeydown = (event: KeyboardEvent): void => {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    this.#toggle();
  };

  protected override render() {
    return html`
      <div class="base" part="base">
        <span
          class="control"
          part="control"
          role="checkbox"
          tabindex=${this.disabled ? -1 : 0}
          aria-checked=${this.indeterminate ? 'mixed' : this.checked}
          aria-disabled=${this.disabled}
          aria-required=${this.required}
          aria-labelledby=${this.#labelId}
        >
          ${this.indeterminate
            ? html`<svg part="indeterminate-icon" viewBox="0 0 256 256"><path d=${MINUS_PATH}></path></svg>`
            : this.checked
              ? html`<svg part="checked-icon" viewBox="0 0 256 256"><path d=${CHECK_PATH}></path></svg>`
              : nothing}
        </span>
        <span class="label" part="label" id=${this.#labelId}><slot></slot></span>
      </div>
      <div class="hint" part="hint"><slot name="hint">${this.hint}</slot></div>
    `;
  }
}
