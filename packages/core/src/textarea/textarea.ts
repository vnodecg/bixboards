import { css, html, nothing, type PropertyValues } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';
import { FormAssociatedMixin } from '../internal/form-associated.ts';

type Size = 'small' | 'medium' | 'large';
type Appearance = 'outlined' | 'filled' | 'filled outlined';
type LabelPosition = 'auto' | 'inline' | 'stacked';
type Resize = 'none' | 'vertical' | 'horizontal' | 'both' | 'auto';

let nextId = 0;

// Announce the counter (aria-live) only when `remaining` crosses one of these, not on every
// keystroke — docs/features/core/textarea.md §6 ("announced politely at thresholds").
const ANNOUNCE_THRESHOLDS = [20, 10, 5, 0];

const supportsFieldSizing =
  typeof CSS !== 'undefined' && CSS.supports?.('field-sizing', 'content');

/**
 * `<bx-textarea>` — multi-line text field, form-associated via `ElementInternals`, wrapping a
 * real native `<textarea>` in its shadow root (docs/features/core/textarea.md).
 *
 * Shares `bx-input`'s label/hint chrome and validity-forwarding approach verbatim (that
 * component's own doc comment): the native `<textarea>`'s own `ValidityState` is forwarded to
 * `internals.setValidity` rather than reimplemented.
 *
 * FR-TEXTAREA-04's auto-resize (`resize="auto"`) prefers `field-sizing: content` (CSS,
 * detected once via `CSS.supports` at module load — cheap, and the answer can't change at
 * runtime) and only runs the rAF-batched `scrollHeight` measurement fallback when that isn't
 * supported, the same "modern CSS path with a JS fallback, pick one at runtime" precedent
 * `bx-scroller`'s edge shadows and `bx-popup`'s positioning already set.
 *
 * FR-TEXTAREA-05 ("handles ≥1 MB values without freezing: count computed lazily") is naturally
 * satisfied by `value.length`, an O(1) string-length read regardless of content size — the actual
 * cost this FR guards against is a *counter render* on every keystroke for a huge value, which is
 * why the visible counter and the `aria-live` announcement are two separate elements: the visible
 * one updates every keystroke (cheap), the announced one only updates at `ANNOUNCE_THRESHOLDS`.
 *
 * @fires input - Value changed by user (bubbles, composed).
 * @fires change - Committed change.
 * @fires bx-invalid - Constraint validation failed.
 *
 * @slot label - Overrides the `label` attribute's text.
 * @slot hint - Overrides the `hint` attribute's text.
 *
 * @csspart form-control - The outer wrapper (label + base + hint).
 * @csspart label - The label element.
 * @csspart hint - The wrapper around the hint slot.
 * @csspart base - The wrapper around the textarea and count.
 * @csspart textarea - The native `<textarea>`.
 * @csspart count - The visible character counter, present when `show-count` is set.
 *
 * @cssprop --bx-textarea-max-height - Caps auto-resize growth. Unset: grows unbounded.
 */
export class BxTextarea extends FormAssociatedMixin(BixElement) {
  static override tagName = 'bx-textarea';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        font-family: var(--bx-font-family-sans);
      }

      .form-control {
        display: flex;
        flex-direction: column;
        gap: var(--bx-space-xs);
      }

      .label {
        color: var(--bx-text-primary);
        font-weight: var(--bx-font-weight-medium);
        font-size: var(--bx-font-s);
      }

      .label:empty {
        display: none;
      }

      .base {
        position: relative;
        display: flex;
        flex-direction: column;
        border-radius: var(--bx-radius-m);
        border: var(--bx-border-width) solid var(--bx-border-subtle);
        background: var(--bx-surface-base);
      }

      :host([appearance~='filled']) .base {
        background: var(--bx-surface-subtle);
        border-color: transparent;
      }

      .base:has(.textarea:focus-visible) {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: var(--bx-focus-ring-offset);
      }

      :host([disabled]) .base {
        background: var(--bx-surface-subtle);
        color: var(--bx-text-disabled);
      }

      .base:has(.textarea[data-user-invalid]) {
        border-color: var(--bx-role-danger-border);
      }

      .textarea {
        all: unset;
        box-sizing: border-box;
        display: block;
        min-block-size: calc(var(--bx-unit) * 1.5 * 2);
        max-block-size: var(--bx-textarea-max-height, none);
        padding-block: var(--bx-space-xs);
        padding-inline: var(--bx-space-m);
        font: inherit;
        font-size: max(1rem, var(--bx-font-m));
        line-height: var(--bx-font-leading-normal, 1.5);
        color: inherit;
        resize: var(--bx-textarea-resize, vertical);
        field-sizing: var(--bx-textarea-field-sizing, unset);
        overflow: auto;
      }

      .textarea::placeholder {
        color: var(--bx-text-secondary);
      }

      :host([size='small']) .textarea {
        font-size: var(--bx-font-s);
      }
      :host([size='large']) .textarea {
        font-size: var(--bx-font-l);
      }

      .count {
        align-self: flex-end;
        padding-inline-end: var(--bx-space-m);
        padding-block-end: var(--bx-space-2xs);
        color: var(--bx-text-secondary);
        font-size: var(--bx-font-s);
      }

      .count[data-over-limit] {
        color: var(--bx-role-danger-fg);
      }

      .announcement {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        overflow: hidden;
        clip-path: inset(50%);
      }

      .hint {
        color: var(--bx-text-secondary);
        font-size: var(--bx-font-s);
      }

      .hint:empty {
        display: none;
      }

      .hint[data-user-invalid] {
        color: var(--bx-role-danger-fg);
      }

      @media (forced-colors: active) {
        .base {
          forced-color-adjust: none;
          border-color: CanvasText;
          background: Canvas;
        }
      }
    `,
  ];

  static override properties = {
    name: { type: String },
    value: { type: String },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    hint: { type: String },
    label: { type: String },
    withLabel: { type: Boolean, reflect: true, attribute: 'with-label' },
    withHint: { type: Boolean, reflect: true, attribute: 'with-hint' },
    size: { type: String, reflect: true },
    rows: { type: Number },
    resize: { type: String },
    minlength: { type: Number },
    maxlength: { type: Number },
    placeholder: { type: String },
    readonly: { type: Boolean, reflect: true },
    appearance: { type: String, reflect: true },
    autocapitalize: { type: String },
    spellcheck: { type: Boolean },
    showCount: { type: Boolean, attribute: 'show-count' },
    labelPosition: { type: String, reflect: true, attribute: 'label-position' },
  };

  declare name: string;
  declare value: string;
  declare disabled: boolean;
  declare required: boolean;
  declare hint: string;
  declare label: string;
  declare withLabel: boolean;
  declare withHint: boolean;
  declare size: Size;
  declare rows: number;
  declare resize: Resize;
  declare minlength?: number;
  declare maxlength?: number;
  declare placeholder: string;
  declare readonly: boolean;
  declare appearance: Appearance;
  declare autocapitalize: string;
  declare spellcheck: boolean;
  declare showCount: boolean;
  declare labelPosition: LabelPosition;

  #textareaId = `bx-textarea-${nextId++}`;
  #hintId = `bx-textarea-hint-${nextId++}`;
  #hasInteracted = false;
  #defaultValue = '';
  #announcedRemaining: number | undefined;
  #resizeRafId = 0;
  #textareaRef = createRef<HTMLTextAreaElement>();

  get #textareaEl(): HTMLTextAreaElement {
    return this.#textareaRef.value!;
  }

  constructor() {
    super();
    this.name = '';
    this.value = '';
    this.disabled = false;
    this.required = false;
    this.hint = '';
    this.label = '';
    this.withLabel = false;
    this.withHint = false;
    this.size = 'medium';
    this.rows = 4;
    this.resize = 'vertical';
    this.placeholder = '';
    this.readonly = false;
    this.appearance = 'outlined';
    this.autocapitalize = '';
    this.spellcheck = true;
    this.showCount = false;
    this.labelPosition = 'auto';
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.#resizeRafId) cancelAnimationFrame(this.#resizeRafId);
    this.#resizeRafId = 0;
  }

  protected override firstUpdated(): void {
    this.#defaultValue = this.value;
    this.#syncValidity();
    this.#scheduleAutoResize();
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('value')) {
      this.internals.setFormValue(this.value);
      this.#syncExternalValue(changed.get('value') as string | undefined);
      this.#scheduleAutoResize();
    }
    if (
      changed.has('required') ||
      changed.has('minlength') ||
      changed.has('maxlength')
    )
      this.#syncValidity();
    if (changed.has('resize')) this.#scheduleAutoResize();
  }

  #syncExternalValue(previous: string | undefined): void {
    const textareaEl = this.#textareaEl;
    if (
      !textareaEl ||
      textareaEl.value === this.value ||
      previous === undefined
    )
      return;
    textareaEl.value = this.value;
  }

  #syncValidity(hasInteracted = this.#hasInteracted): void {
    const textareaEl = this.#textareaEl;
    if (!textareaEl) return;
    this.internals.setValidity(
      textareaEl.validity,
      textareaEl.validationMessage,
      textareaEl,
    );
    if (hasInteracted) {
      this.toggleAttribute('data-user-valid', textareaEl.validity.valid);
      this.toggleAttribute('data-user-invalid', !textareaEl.validity.valid);
      textareaEl.toggleAttribute(
        'data-user-invalid',
        !textareaEl.validity.valid,
      );
    }
  }

  // FR-TEXTAREA-04: only the JS fallback path measures/writes an explicit height; when
  // `field-sizing: content` is supported, CSS alone handles it and this is a no-op.
  #scheduleAutoResize(): void {
    if (this.resize !== 'auto' || supportsFieldSizing) return;
    if (this.#resizeRafId) return;
    this.#resizeRafId = requestAnimationFrame(() => {
      this.#resizeRafId = 0;
      const textareaEl = this.#textareaEl;
      if (!textareaEl) return;
      textareaEl.style.height = 'auto';
      const maxHeight = getComputedStyle(textareaEl).maxHeight;
      const cap =
        maxHeight === 'none' ? Infinity : Number.parseFloat(maxHeight);
      textareaEl.style.height = `${Math.min(textareaEl.scrollHeight, cap)}px`;
    });
  }

  formResetCallback(): void {
    this.value = this.#defaultValue;
    this.#hasInteracted = false;
    this.removeAttribute('data-user-valid');
    this.removeAttribute('data-user-invalid');
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    if (typeof state === 'string') this.value = state;
  }

  #handleInput = (event: Event): void => {
    // The native `input` is composed and would reach consumers next to the one dispatched below.
    event.stopPropagation();
    this.value = (event.target as HTMLTextAreaElement).value;
    this.#hasInteracted = true;
    this.#syncValidity();
    this.#syncAnnouncement();
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  };

  #handleChange = (): void => {
    this.#hasInteracted = true;
    this.#syncValidity();
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    if (!this.internals.checkValidity())
      this.dispatchEvent(
        new CustomEvent('bx-invalid', { bubbles: true, composed: true }),
      );
  };

  #handleInvalid = (event: Event): void => {
    event.preventDefault();
    this.#hasInteracted = true;
    this.#syncValidity();
  };

  #syncAnnouncement(): void {
    if (!this.showCount || !this.maxlength) return;
    const remaining = this.maxlength - this.value.length;
    const crossed = ANNOUNCE_THRESHOLDS.find(
      (threshold) =>
        remaining <= threshold &&
        (this.#announcedRemaining === undefined ||
          this.#announcedRemaining > threshold),
    );
    if (crossed === undefined) return;
    this.#announcedRemaining = remaining;
    this.requestUpdate();
  }

  /** Focuses the internal textarea. */
  override focus(options?: FocusOptions): void {
    this.#textareaEl?.focus(options);
  }

  /** Blurs the internal textarea. */
  override blur(): void {
    this.#textareaEl?.blur();
  }

  /** Selects all text in the internal textarea. */
  select(): void {
    this.#textareaEl?.select();
  }

  setSelectionRange(
    start: number | null,
    end: number | null,
    direction?: 'forward' | 'backward' | 'none',
  ): void {
    this.#textareaEl?.setSelectionRange(start, end, direction);
  }

  setRangeText(...args: Parameters<HTMLTextAreaElement['setRangeText']>): void {
    this.#textareaEl?.setRangeText(...args);
    this.value = this.#textareaEl.value;
  }

  protected override render() {
    const showLabel = this.withLabel || this.label.length > 0;
    const showHint = this.withHint || this.hint.length > 0;
    const remaining =
      this.maxlength !== undefined
        ? this.maxlength - this.value.length
        : undefined;
    const resizeCss = this.resize === 'auto' ? 'none' : this.resize;

    return html`
      <div class="form-control" part="form-control">
        ${
          showLabel
            ? html`<label class="label" part="label" for=${this.#textareaId}
                ><slot name="label">${this.label}</slot></label
              >`
            : nothing
        }
        <div
          class="base"
          part="base"
          style="--bx-textarea-resize: ${resizeCss}; --bx-textarea-field-sizing: ${
            this.resize === 'auto' && supportsFieldSizing ? 'content' : 'unset'
          }"
        >
          <textarea
            ${ref(this.#textareaRef)}
            class="textarea"
            part="textarea"
            id=${this.#textareaId}
            name=${this.name || nothing}
            .value=${this.value}
            rows=${this.rows}
            placeholder=${this.placeholder || nothing}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            ?required=${this.required}
            ?spellcheck=${this.spellcheck}
            minlength=${this.minlength ?? nothing}
            maxlength=${this.maxlength ?? nothing}
            autocapitalize=${this.autocapitalize || nothing}
            aria-describedby=${showHint ? this.#hintId : nothing}
            @input=${this.#handleInput}
            @change=${this.#handleChange}
            @invalid=${this.#handleInvalid}
          ></textarea>
          ${
            this.showCount
              ? html`<span
                  class="count"
                  part="count"
                  aria-hidden="true"
                  ?data-over-limit=${remaining !== undefined && remaining < 0}
                  >${this.maxlength !== undefined ? `${remaining}` : this.value.length}</span
                >`
              : nothing
          }
          ${
            this.showCount && this.maxlength
              ? html`<span class="announcement" role="status" aria-live="polite"
                  >${this.#announcedRemaining ?? ''} characters remaining</span
                >`
              : nothing
          }
        </div>
        ${
          showHint
            ? html`<div class="hint" part="hint" id=${this.#hintId}>
                <slot name="hint">${this.hint}</slot>
              </div>`
            : nothing
        }
      </div>
    `;
  }
}
