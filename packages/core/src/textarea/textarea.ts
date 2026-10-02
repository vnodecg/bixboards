import { css, html, nothing, type PropertyValues } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';
import { FormAssociatedMixin } from '../internal/form-associated.ts';
import { textStyle, textFamily } from '../internal/text-style.ts';

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
 * @cssprop --bx-textarea-form-control-gap - Gap of the `form-control` part. Default `var(--bx-space-xs)`.
 * @cssprop --bx-textarea-label-fg - Text/icon color of the `label` part. Default `var(--bx-text-primary)`.
 * @cssprop --bx-textarea-radius - Corner radius of the root surface. Default `var(--bx-radius-m)`.
 * @cssprop --bx-textarea-border-width - Border width of the root surface. Default `var(--bx-border-width)`.
 * @cssprop --bx-textarea-border-color - Border color of the root surface. Default `var(--bx-border-subtle)`.
 * @cssprop --bx-textarea-bg - Background of the root surface. Default `var(--bx-surface-base)`.
 * @cssprop --bx-textarea-focus-ring-width - Focus ring width of the root surface (focus state). Default `var(--bx-border-width-strong)`.
 * @cssprop --bx-textarea-disabled-bg - Background of the root surface (disabled state). Default `var(--bx-surface-subtle)`.
 * @cssprop --bx-textarea-disabled-fg - Text/icon color of the root surface (disabled state). Default `var(--bx-text-disabled)`.
 * @cssprop --bx-textarea-invalid-border-color - Border color of the root surface (invalid state). Default `var(--bx-role-danger-border)`.
 * @cssprop --bx-textarea-min-height - Minimum height of the root surface. Default `calc(var(--bx-unit) * 1.5 * 2)`.
 * @cssprop --bx-textarea-padding-block - Padding block of the root surface. Default `var(--bx-space-xs)`.
 * @cssprop --bx-textarea-padding-inline - Padding inline of the root surface. Default `var(--bx-space-m)`.
 * @cssprop --bx-textarea-placeholder-fg - Text/icon color of the `::placeholder`. Default `var(--bx-text-secondary)`.
 * @cssprop --bx-textarea-count-padding-inline-end - Padding inline end of the `count` part. Default `var(--bx-space-m)`.
 * @cssprop --bx-textarea-count-padding-block-end - Padding block end of the `count` part. Default `var(--bx-space-2xs)`.
 * @cssprop --bx-textarea-count-fg - Text/icon color of the `count` part. Default `var(--bx-text-secondary)`.
 * @cssprop --bx-textarea-hint-fg - Text/icon color of the `hint` part. Default `var(--bx-text-secondary)`.
 * @cssprop --bx-textarea-hint-invalid-fg - Text/icon color of the `hint` part (invalid state). Default `var(--bx-role-danger-fg)`.
 * @cssprop --bx-textarea-count-over-limit-fg - Color of the character counter once `maxlength` is exceeded. Default `var(--bx-role-danger-fg)`.
 * @cssprop --bx-textarea-hover-border-color - Border color while hovered. Default `var(--bx-border-strong)`.
 * @cssprop --bx-textarea-focus-border-color - Border color while focused. Default `var(--bx-focus-ring)`.
 * @cssprop --bx-textarea-focus-shadow - Soft halo around the field while focused. Default a translucent `--bx-focus-ring` ring.
 * @cssprop --bx-textarea-hover-bg - Background of a `filled` field while hovered. Default `var(--bx-surface-muted)`.
 * @cssprop --bx-textarea-focus-bg - Background of a `filled` field while focused. Default `var(--bx-surface-base)`.
 * @cssprop --bx-textarea-disabled-border-color - Border color when disabled. Default `var(--bx-border-subtle)`.
 * @cssprop --bx-textarea-invalid-focus-shadow - Halo while focused and invalid. Default a translucent `--bx-role-danger-border` ring.
 * @cssprop --bx-textarea-placeholder-opacity - Placeholder opacity. Default `1`.
 * @cssprop --bx-textarea-font-family - Font family of the root surface. Default `var(--bx-type-body-family)`.
 * @cssprop --bx-textarea-label-font-family - Font family of the `label` part (text style `label-s`). Default `var(--bx-type-label-family)`.
 * @cssprop --bx-textarea-label-font-size - Font size of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-size)`.
 * @cssprop --bx-textarea-label-font-weight - Font weight of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-weight)`.
 * @cssprop --bx-textarea-label-line-height - Line height of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-leading)`.
 * @cssprop --bx-textarea-label-letter-spacing - Letter spacing of the `label` part (text style `label-s`). Default `var(--bx-type-label-s-tracking)`.
 * @cssprop --bx-textarea-font-family - Font family of the root surface (text style `body-m`). Default `var(--bx-type-body-family)`.
 * @cssprop --bx-textarea-font-size - Font size of the root surface (text style `body-m`). Default `var(--bx-type-body-m-size)`.
 * @cssprop --bx-textarea-font-weight - Font weight of the root surface (text style `body-m`). Default `var(--bx-type-body-m-weight)`.
 * @cssprop --bx-textarea-line-height - Line height of the root surface (text style `body-m`). Default `var(--bx-type-body-m-leading)`.
 * @cssprop --bx-textarea-letter-spacing - Letter spacing of the root surface (text style `body-m`). Default `var(--bx-type-body-m-tracking)`.
 * @cssprop --bx-textarea-count-font-family - Font family of the `count` element (text style `body-s`). Default `var(--bx-type-body-family)`.
 * @cssprop --bx-textarea-count-font-size - Font size of the `count` element (text style `body-s`). Default `var(--bx-type-body-s-size)`.
 * @cssprop --bx-textarea-count-font-weight - Font weight of the `count` element (text style `body-s`). Default `var(--bx-type-body-s-weight)`.
 * @cssprop --bx-textarea-count-line-height - Line height of the `count` element (text style `body-s`). Default `var(--bx-type-body-s-leading)`.
 * @cssprop --bx-textarea-count-letter-spacing - Letter spacing of the `count` element (text style `body-s`). Default `var(--bx-type-body-s-tracking)`.
 * @cssprop --bx-textarea-hint-font-family - Font family of the `hint` part (text style `body-s`). Default `var(--bx-type-body-family)`.
 * @cssprop --bx-textarea-hint-font-size - Font size of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-size)`.
 * @cssprop --bx-textarea-hint-font-weight - Font weight of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-weight)`.
 * @cssprop --bx-textarea-hint-line-height - Line height of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-leading)`.
 * @cssprop --bx-textarea-hint-letter-spacing - Letter spacing of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-tracking)`.
 */
export class BxTextarea extends FormAssociatedMixin(BixElement) {
  static override tagName = 'bx-textarea';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        ${textFamily('--bx-textarea', 'body')}
      }

      .form-control {
        display: flex;
        flex-direction: column;
        gap: var(--bx-textarea-form-control-gap, var(--bx-space-xs));
      }

      .label {
        color: var(--bx-textarea-label-fg, var(--bx-text-primary));

        ${textStyle('--bx-textarea-label', 'label-s')}
      }

      .label:empty {
        display: none;
      }

      .base {
        position: relative;
        display: flex;
        flex-direction: column;
        border-radius: var(--bx-textarea-radius, var(--bx-radius-m));
        border: var(--bx-textarea-border-width, var(--bx-border-width)) solid
          var(--bx-textarea-border-color, var(--bx-border-subtle));
        background: var(--bx-textarea-bg, var(--bx-surface-base));
      }

      :host([appearance~='filled']) .base {
        background: var(--bx-textarea-bg, var(--bx-surface-subtle));
        border-color: transparent;
      }

      .base {
        cursor: text;
        transition:
          border-color var(--bx-motion-duration-fast)
            var(--bx-motion-easing-standard),
          box-shadow var(--bx-motion-duration-fast)
            var(--bx-motion-easing-standard),
          background-color var(--bx-motion-duration-fast)
            var(--bx-motion-easing-standard);
      }

      .base:hover {
        border-color: var(
          --bx-textarea-hover-border-color,
          var(--bx-border-strong)
        );
      }

      /* Focus: a crisp brand border plus a soft halo instead of a hard outline (same as
         bx-input). The transparent outline keeps a visible ring in forced-colors mode. */
      .base:focus-within {
        border-color: var(
          --bx-textarea-focus-border-color,
          var(--bx-focus-ring)
        );
        box-shadow: var(
          --bx-textarea-focus-shadow,
          0 0 0 calc(var(--bx-border-width-strong) * 1.5)
            color-mix(in srgb, var(--bx-focus-ring) 22%, transparent)
        );
        outline: var(
            --bx-textarea-focus-ring-width,
            var(--bx-border-width-strong)
          )
          solid transparent;
      }

      :host([appearance='filled']) .base:hover {
        background: var(--bx-textarea-hover-bg, var(--bx-surface-muted));
      }
      :host([appearance~='filled']) .base:focus-within {
        background: var(--bx-textarea-focus-bg, var(--bx-surface-base));
        border-color: var(
          --bx-textarea-focus-border-color,
          var(--bx-focus-ring)
        );
      }

      :host([disabled]) .base {
        cursor: not-allowed;
        border-color: var(
          --bx-textarea-disabled-border-color,
          var(--bx-border-subtle)
        );
        background: var(--bx-textarea-disabled-bg, var(--bx-surface-subtle));
        color: var(--bx-textarea-disabled-fg, var(--bx-text-disabled));
      }

      .base:has(.textarea[data-user-invalid]) {
        border-color: var(
          --bx-textarea-invalid-border-color,
          var(--bx-role-danger-border)
        );
      }
      .base:has(.textarea[data-user-invalid]):focus-within {
        box-shadow: var(
          --bx-textarea-invalid-focus-shadow,
          0 0 0 calc(var(--bx-border-width-strong) * 1.5)
            color-mix(in srgb, var(--bx-role-danger-border) 22%, transparent)
        );
      }

      .textarea {
        all: unset;
        box-sizing: border-box;
        display: block;
        min-block-size: var(
          --bx-textarea-min-height,
          calc(var(--bx-unit) * 1.5 * 2)
        );
        max-block-size: var(--bx-textarea-max-height, none);
        padding-block: var(--bx-textarea-padding-block, var(--bx-space-xs));
        padding-inline: var(--bx-textarea-padding-inline, var(--bx-space-s));
        font: inherit;

        ${textStyle('--bx-textarea', 'body-m')}

        color: inherit;
        resize: var(--_resize, vertical);
        field-sizing: var(--_field-sizing, unset);
        overflow: auto;
      }

      .textarea::placeholder {
        color: var(--bx-textarea-placeholder-fg, var(--bx-text-hint));
        opacity: var(--bx-textarea-placeholder-opacity, 1);
      }

      :host([size='small']) .textarea {
        ${textStyle('--bx-textarea', 'body-s')}
      }
      :host([size='large']) .textarea {
        ${textStyle('--bx-textarea', 'body-l')}
      }

      @media (pointer: coarse) {
        .textarea {
          font-size: var(
            --bx-textarea-font-size,
            max(var(--bx-font-floor), var(--bx-type-body-m-size))
          );
        }
        :host([size='small']) .textarea {
          font-size: var(
            --bx-textarea-font-size,
            max(var(--bx-font-floor), var(--bx-type-body-s-size))
          );
        }
        :host([size='large']) .textarea {
          font-size: var(
            --bx-textarea-font-size,
            max(var(--bx-font-floor), var(--bx-type-body-l-size))
          );
        }
      }

      .count {
        align-self: flex-end;
        padding-inline-end: var(
          --bx-textarea-count-padding-inline-end,
          var(--bx-space-m)
        );
        padding-block-end: var(
          --bx-textarea-count-padding-block-end,
          var(--bx-space-2xs)
        );
        color: var(--bx-textarea-count-fg, var(--bx-text-secondary));

        ${textStyle('--bx-textarea-count', 'body-s')}
      }

      .count[data-over-limit] {
        color: var(--bx-textarea-count-over-limit-fg, var(--bx-role-danger-fg));
      }

      .announcement {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        overflow: hidden;
        clip-path: inset(50%);
      }

      .hint {
        color: var(--bx-textarea-hint-fg, var(--bx-text-secondary));

        ${textStyle('--bx-textarea-hint', 'body-s')}
      }

      .hint:empty {
        display: none;
      }

      .hint[data-user-invalid] {
        color: var(--bx-textarea-hint-invalid-fg, var(--bx-role-danger-fg));
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
          style="--_resize: ${resizeCss}; --_field-sizing: ${
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
