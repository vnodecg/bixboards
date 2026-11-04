import { css, html, nothing, type PropertyValues } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';
import { FormAssociatedMixin } from '../internal/form-associated.ts';
import { textFamily, textStyle } from '../internal/text-style.ts';

let nextId = 0;

/**
 * `<bx-tag-input>` — free-form multi-value entry (docs/features/core/tag-input.md).
 *
 * Typed text becomes a removable `bx-chip` when a delimiter (default comma or Enter) is typed or
 * the input blurs; paste is split on the delimiters (FR-TAGINPUT-02). Backspace in an empty input
 * first marks the last tag, then removes it (FR-TAGINPUT-03). Duplicates (case-insensitive), the
 * `max` limit and a failing `validate` refuse the tag, firing `bx-reject` with a `reason`.
 * Form-associated: one entry per tag under `name` (FR-TAGINPUT-01).
 *
 * @fires input - Typed text changed.
 * @fires change - The tag list changed. `detail.value`.
 * @fires bx-add - A tag was added. `detail.value`.
 * @fires bx-remove - A tag was removed. `detail.value`.
 * @fires bx-reject - A tag was refused. `detail.value`, `detail.reason` (`duplicate`, `max`, `invalid`).
 * @fires bx-invalid - Constraint validation failed.
 *
 * @slot label - Label content.
 * @slot hint - Help text.
 *
 * @csspart form-control - The form-control part.
 * @csspart base - The tag + input surface.
 * @csspart input - The text input.
 * @csspart tag - A tag chip.
 *
 * @cssprop --bx-tag-input-bg - Background.
 * @cssprop --bx-tag-input-border-color - Border color.
 * @cssprop --bx-tag-input-radius - Corner radius.
 * @cssprop --bx-tag-input-gap - Gap between tags.
 * @cssprop --bx-tag-input-font-family - Font family of the root surface. Default `var(--bx-type-field-family)`.
 * @cssprop --bx-tag-input-font-size - Font size of the root surface. Default `var(--bx-type-field-size)`.
 * @cssprop --bx-tag-input-font-weight - Font weight of the root surface. Default `var(--bx-type-field-weight)`.
 * @cssprop --bx-tag-input-line-height - Line height of the root surface. Default `var(--bx-type-field-leading)`.
 * @cssprop --bx-tag-input-letter-spacing - Letter spacing of the root surface. Default `var(--bx-type-field-tracking)`.
 * @cssprop --bx-tag-input-hint-font-family - Font family of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-family)`.
 * @cssprop --bx-tag-input-hint-font-size - Font size of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-size)`.
 * @cssprop --bx-tag-input-hint-font-weight - Font weight of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-weight)`.
 * @cssprop --bx-tag-input-hint-line-height - Line height of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-leading)`.
 * @cssprop --bx-tag-input-hint-letter-spacing - Letter spacing of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-tracking)`.
 * @cssprop --bx-tag-input-label-font-family - Font family of the `label` text (text style `label-m`). Default `var(--bx-type-label-family)`.
 * @cssprop --bx-tag-input-label-font-size - Font size of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-size)`.
 * @cssprop --bx-tag-input-label-font-weight - Font weight of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-weight)`.
 * @cssprop --bx-tag-input-label-line-height - Line height of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-leading)`.
 * @cssprop --bx-tag-input-label-letter-spacing - Letter spacing of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-tracking)`.
 */
export class BxTagInput extends FormAssociatedMixin(BixElement) {
  static override tagName = 'bx-tag-input';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        ${textFamily('--bx-tag-input', 'field')}
        --_h: var(--bx-control-height-m);
      }
      :host([size='s']) {
        --_h: var(--bx-control-height-s);
      }
      :host([size='l']) {
        --_h: var(--bx-control-height-l);
      }
      .label {
        display: block;
        margin-block-end: var(--bx-space-2xs);
        color: var(--bx-text-primary);
        ${textStyle('--bx-tag-input-label', 'label-m')}
      }
      .label:not(:has(*)):empty {
        display: none;
      }
      .base {
        box-sizing: border-box;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--bx-tag-input-gap, var(--bx-space-2xs));
        min-block-size: max(var(--_h), var(--bx-target-min));
        padding: var(--bx-space-2xs) var(--bx-space-s);
        border: var(--bx-border-width) solid
          var(
            --bx-tag-input-border-color,
            var(--bx-border-strong, var(--bx-border-subtle))
          );
        border-radius: var(--bx-tag-input-radius, var(--bx-radius-m));
        background: var(--bx-tag-input-bg, var(--bx-surface-base));
        color: var(--bx-text-primary);
        cursor: text;
      }
      .base:focus-within {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: var(--bx-focus-ring-offset);
      }
      :host([disabled]) .base {
        opacity: 0.5;
        cursor: not-allowed;
      }
      bx-chip[data-marked] {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: 1px;
      }
      input {
        flex: 1 1 8ch;
        min-inline-size: 4ch;
        padding: 0;
        border: 0;
        outline: 0;
        background: transparent;
        color: inherit;
        ${textStyle('--bx-tag-input', 'field-m')}
      }
      input::placeholder {
        color: var(--bx-text-secondary);
      }
      .hint {
        margin-block-start: var(--bx-space-2xs);
        color: var(--bx-text-secondary);
        ${textStyle('--bx-tag-input-hint', 'caption-m')}
      }
      .hint:not(:has(::slotted(*))):empty {
        display: none;
      }
      @media (forced-colors: active) {
        .base {
          border-color: ButtonText;
        }
      }
    `,
  ];

  static override properties = {
    label: { type: String },
    hint: { type: String },
    name: { type: String },
    value: { attribute: 'value' },
    delimiters: { type: String },
    allowDuplicates: { type: Boolean, attribute: 'allow-duplicates' },
    max: { type: Number },
    validate: { attribute: false },
    placeholder: { type: String },
    required: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    readonly: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
    _text: { state: true },
    _marked: { state: true },
  };

  declare label: string;
  declare hint: string;
  declare name: string;
  declare value: string[];
  declare delimiters: string;
  declare allowDuplicates: boolean;
  declare max: number;
  declare validate?: (value: string) => boolean;
  declare placeholder: string;
  declare required: boolean;
  declare disabled: boolean;
  declare readonly: boolean;
  declare size: 's' | 'm' | 'l';
  /** @internal */
  declare _text: string;
  /** @internal */
  declare _marked: boolean;

  #id = `bx-tag-input-${nextId++}`;
  #inputRef = createRef<HTMLInputElement>();
  #defaultValue?: string[];

  constructor() {
    super();
    this.label = '';
    this.hint = '';
    this.name = '';
    this.value = [];
    this.delimiters = ',\n';
    this.allowDuplicates = false;
    this.max = 0;
    this.placeholder = '';
    this.required = false;
    this.disabled = false;
    this.readonly = false;
    this.size = 'm';
    this._text = '';
    this._marked = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // `value="a,b"` from markup arrives as a string.
    if (typeof this.value === 'string')
      this.value = (this.value as string)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    this.#defaultValue ??= [...(this.value ?? [])];
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    // `value="a,b"` from markup arrives as a string.
    if (typeof this.value === 'string')
      this.value = (this.value as string)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    if (changed.has('value')) this._marked = false;
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (
      changed.has('value') ||
      changed.has('name') ||
      changed.has('required')
    ) {
      const data = new FormData();
      if (this.name) for (const v of this.value) data.append(this.name, v);
      this.internals.setFormValue(this.name ? data : null);
      const missing = this.required && !this.value.length;
      this.internals.setValidity(
        missing ? { valueMissing: true } : {},
        missing ? 'Please add at least one tag.' : undefined,
        this.#inputRef.value,
      );
    }
  }

  formResetCallback(): void {
    this.value = [...(this.#defaultValue ?? [])];
    this._text = '';
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    if (state instanceof FormData)
      this.value = state.getAll(this.name).map(String);
  }

  override focus(options?: FocusOptions): void {
    this.#inputRef.value?.focus(options);
  }

  override blur(): void {
    this.#inputRef.value?.blur();
  }

  /** Adds a tag programmatically; returns false (and fires `bx-reject`) if refused. */
  add(raw: string): boolean {
    const tag = raw.trim();
    if (!tag) return false;
    const reject = (reason: string) => {
      this.dispatchEvent(
        new CustomEvent('bx-reject', {
          bubbles: true,
          composed: true,
          detail: { value: tag, reason },
        }),
      );
      return false;
    };
    if (this.max > 0 && this.value.length >= this.max) return reject('max');
    if (
      !this.allowDuplicates &&
      this.value.some((v) => v.toLowerCase() === tag.toLowerCase())
    )
      return reject('duplicate');
    if (this.validate && !this.validate(tag)) return reject('invalid');
    this.value = [...this.value, tag];
    this.dispatchEvent(
      new CustomEvent('bx-add', {
        bubbles: true,
        composed: true,
        detail: { value: tag },
      }),
    );
    this.#changed();
    return true;
  }

  /** Removes the tag at `index`. */
  removeAt(index: number): void {
    const tag = this.value[index];
    if (tag === undefined) return;
    this.value = this.value.filter((_, i) => i !== index);
    this.dispatchEvent(
      new CustomEvent('bx-remove', {
        bubbles: true,
        composed: true,
        detail: { value: tag },
      }),
    );
    this.#changed();
  }

  #changed(): void {
    this.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: { value: this.value },
      }),
    );
  }

  /** Splits `text` on the delimiters; every complete part is committed, the tail is returned. */
  #commitParts(text: string, includeTail: boolean): string {
    const set = new Set(this.delimiters.split(''));
    const parts: string[] = [];
    let current = '';
    for (const ch of text) {
      if (set.has(ch)) {
        parts.push(current);
        current = '';
      } else current += ch;
    }
    for (const part of parts) this.add(part);
    if (includeTail && current.trim()) {
      this.add(current);
      return '';
    }
    return current;
  }

  #onInput = (event: Event): void => {
    event.stopPropagation();
    const input = event.target as HTMLInputElement;
    this._marked = false;
    const rest = this.#commitParts(input.value, false);
    this._text = rest;
    input.value = rest;
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  };

  #onPaste = (event: ClipboardEvent): void => {
    const text = event.clipboardData?.getData('text');
    if (!text) return;
    const set = this.delimiters.split('');
    if (!set.some((d) => text.includes(d))) return;
    event.preventDefault();
    this._text = this.#commitParts(this._text + text, false);
  };

  #onKeydown = (event: KeyboardEvent): void => {
    if (this.readonly || this.disabled) return;
    if (event.key === 'Enter' && this.delimiters.includes('\n')) {
      event.preventDefault();
      this._text = this.#commitParts(this._text, true);
    } else if (event.key === 'Backspace' && !this._text) {
      if (!this.value.length) return;
      if (this._marked) {
        this.removeAt(this.value.length - 1);
        this._marked = false;
      } else this._marked = true;
    } else if (this._marked && event.key !== 'Backspace') {
      this._marked = false;
    }
  };

  #onBlur = (): void => {
    this._marked = false;
    if (this._text.trim()) this._text = this.#commitParts(this._text, true);
  };

  protected override render() {
    return html`
      <label class="label" for=${this.#id}
        ><slot name="label">${this.label}</slot></label
      >
      <div class="base" part="base form-control" @click=${() => this.focus()}>
        ${this.value.map(
          (tag, i) =>
            html`<bx-chip
              part="tag"
              size="s"
              variant="default"
              ?removable=${!this.readonly}
              ?disabled=${this.disabled}
              ?data-marked=${this._marked && i === this.value.length - 1}
              remove-label=${`Remove ${tag}`}
              @bx-remove=${(e: Event) => {
                e.preventDefault();
                e.stopPropagation();
                this.removeAt(i);
                this.focus();
              }}
              >${tag}</bx-chip
            >`,
        )}
        <input
          ${ref(this.#inputRef)}
          part="input"
          id=${this.#id}
          type="text"
          autocomplete="off"
          .value=${this._text}
          placeholder=${this.value.length ? nothing : this.placeholder || nothing}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          aria-describedby="${this.#id}-hint"
          @input=${this.#onInput}
          @keydown=${this.#onKeydown}
          @paste=${this.#onPaste}
          @blur=${this.#onBlur}
        />
      </div>
      <div class="hint" id="${this.#id}-hint">
        <slot name="hint">${this.hint}</slot>
      </div>
    `;
  }
}
