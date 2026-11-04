import { css, html, nothing, type PropertyValues } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';
import { FormAssociatedMixin } from '../internal/form-associated.ts';
import { textFamily, textStyle } from '../internal/text-style.ts';
import type { BxOption } from '../option/option.ts';

export type ComboboxFilter =
  | 'contains'
  | 'starts-with'
  | ((label: string, query: string, option: BxOption) => boolean);

let nextId = 0;

const CHEVRON =
  'M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z';

/** Text shown for an option: its `label`, else its text content. */
const optionLabel = (o: BxOption): string =>
  (o.label || o.textContent || '').trim();

/**
 * `<bx-combobox>` — text input with a filterable listbox (docs/features/core/combobox.md).
 *
 * The ARIA 1.2 combobox pattern: DOM focus never leaves the `<input role="combobox">`, and the
 * highlighted `bx-option` is exposed through `aria-activedescendant` (set via element reflection,
 * since the options live in the light DOM) (FR-COMBOBOX-04). Options are slotted `bx-option`s,
 * filtered locally by `filter` (hidden, not removed). Free text is accepted with `allow-custom`
 * on Enter/blur (FR-COMBOBOX-03). `input` is a `CustomEvent` with `detail.query`, debounced by
 * `debounce` ms, for driving an async source while `loading` shows a spinner (FR-COMBOBOX-02);
 * discarding stale responses is the consumer's side of that contract. `multiple` shows each
 * selection as a removable `bx-chip` and submits one form entry per value. Form-associated
 * (FR-COMBOBOX-01); sharing `bx-select`'s virtualizer is **not** implemented — every option is a
 * real element, which is fine for lists up to a few hundred entries.
 *
 * @fires input - Query text changed. `detail.query`.
 * @fires change - Committed selection changed.
 * @fires bx-show - Listbox is opening. Cancelable.
 * @fires bx-after-show - Listbox opened.
 * @fires bx-hide - Listbox is closing. Cancelable.
 * @fires bx-after-hide - Listbox closed.
 * @fires bx-invalid - Constraint validation failed.
 *
 * @slot (default) - `bx-option` children.
 * @slot label - Label content.
 * @slot hint - Help text.
 * @slot empty - Shown when nothing matches.
 *
 * @csspart control - The input surface.
 * @csspart input - The native input.
 * @csspart listbox - The listbox.
 * @csspart chip - A selection chip (multiple).
 *
 * @cssprop --bx-combobox-bg - Control background.
 * @cssprop --bx-combobox-border-color - Control border color.
 * @cssprop --bx-combobox-radius - Control radius.
 * @cssprop --bx-combobox-max-height - Max listbox height.
 */
export class BxCombobox extends FormAssociatedMixin(BixElement) {
  static override tagName = 'bx-combobox';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        ${textFamily('--bx-combobox', 'field')}
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
        ${textStyle('--bx-combobox-label', 'label-m')}
      }
      .label:not(:has(*)):empty {
        display: none;
      }
      .control {
        box-sizing: border-box;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--bx-space-2xs);
        min-block-size: max(var(--_h), var(--bx-target-min));
        padding-inline: var(--bx-space-s);
        border: var(--bx-border-width) solid
          var(
            --bx-combobox-border-color,
            var(--bx-border-strong, var(--bx-border-subtle))
          );
        border-radius: var(--bx-combobox-radius, var(--bx-radius-m));
        background: var(--bx-combobox-bg, var(--bx-surface-base));
        color: var(--bx-text-primary);
      }
      .control:focus-within {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: var(--bx-focus-ring-offset);
      }
      :host([disabled]) .control {
        opacity: 0.5;
        cursor: not-allowed;
      }
      input {
        flex: 1 1 6ch;
        min-inline-size: 0;
        padding: 0;
        border: 0;
        outline: 0;
        background: transparent;
        color: inherit;
        ${textStyle('--bx-combobox', 'field-m')}
      }
      input::placeholder {
        color: var(--bx-text-secondary);
      }
      .adornment {
        display: inline-flex;
        align-items: center;
        color: var(--bx-text-secondary);
      }
      .chevron {
        inline-size: 1em;
        block-size: 1em;
        fill: currentColor;
        cursor: pointer;
      }
      .hint {
        margin-block-start: var(--bx-space-2xs);
        color: var(--bx-text-secondary);
        ${textStyle('--bx-combobox-hint', 'caption-m')}
      }
      .hint:not(:has(::slotted(*))) {
        display: none;
      }
      .panel {
        box-sizing: border-box;
        overflow: hidden;
        border: var(--bx-border-width) solid var(--bx-border-subtle);
        border-radius: var(--bx-radius-m);
        box-shadow: var(--bx-shadow-m);
        background: var(--bx-surface-base);
        color: var(--bx-text-primary);
      }
      .listbox {
        max-block-size: min(
          var(--bx-combobox-max-height, calc(var(--bx-unit) * 20)),
          var(--bx-popup-auto-size-available-height, 100vh)
        );
        overflow-y: auto;
        overscroll-behavior: contain;
      }
      ::slotted([hidden]) {
        display: none !important;
      }
      .empty {
        padding: var(--bx-space-s);
        color: var(--bx-text-secondary);
        ${textStyle('--bx-combobox-empty', 'body-m')}
      }
      .empty[hidden] {
        display: none;
      }
    `,
  ];

  static override properties = {
    label: { type: String },
    hint: { type: String },
    name: { type: String },
    value: { attribute: 'value' },
    multiple: { type: Boolean, reflect: true },
    allowCustom: { type: Boolean, attribute: 'allow-custom' },
    filter: { attribute: false },
    loading: { type: Boolean, reflect: true },
    placeholder: { type: String },
    required: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
    open: { type: Boolean, reflect: true },
    debounce: { type: Number },
    _query: { state: true },
    _active: { state: true },
    _typing: { state: true },
  };

  declare label: string;
  declare hint: string;
  declare name: string;
  declare value: string | string[];
  declare multiple: boolean;
  declare allowCustom: boolean;
  declare filter: ComboboxFilter;
  declare loading: boolean;
  declare placeholder: string;
  declare required: boolean;
  declare disabled: boolean;
  declare size: 's' | 'm' | 'l';
  declare open: boolean;
  declare debounce: number;
  /** @internal */
  declare _query: string;
  /** @internal */
  declare _active: number;
  /** @internal */
  declare _typing: boolean;

  #uid = `bx-combobox-${nextId++}`;
  #inputRef = createRef<HTMLInputElement>();
  #options: BxOption[] = [];
  #debounceTimer?: ReturnType<typeof setTimeout>;
  #defaultValue?: string | string[];

  constructor() {
    super();
    this.label = '';
    this.hint = '';
    this.name = '';
    this.value = '';
    this.multiple = false;
    this.allowCustom = false;
    this.filter = 'contains';
    this.loading = false;
    this.placeholder = '';
    this.required = false;
    this.disabled = false;
    this.size = 'm';
    this.open = false;
    this.debounce = 0;
    this._query = '';
    this._active = -1;
    this._typing = false;
  }

  /** Selected values as an array, whatever the mode. */
  get values(): string[] {
    const v = this.value;
    if (Array.isArray(v)) return v;
    if (!v) return [];
    return this.multiple ? v.split(',').filter(Boolean) : [v];
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#defaultValue ??= Array.isArray(this.value)
      ? [...this.value]
      : this.value;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this.#debounceTimer);
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('value') || changed.has('multiple')) this.#syncOptions();
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (
      changed.has('value') ||
      changed.has('name') ||
      changed.has('multiple')
    ) {
      if (!this._typing && !this.multiple) {
        const opt = this.#options.find((o) => o.value === this.values[0]);
        this._query = opt ? optionLabel(opt) : (this.values[0] ?? '');
      }
    }
    if (
      changed.has('value') ||
      changed.has('name') ||
      changed.has('required') ||
      changed.has('multiple')
    ) {
      if (this.name && this.multiple) {
        const data = new FormData();
        for (const v of this.values) data.append(this.name, v);
        this.internals.setFormValue(data);
      } else {
        this.internals.setFormValue(
          this.name && this.values.length ? this.values[0] : null,
        );
      }
      const missing = this.required && !this.values.length;
      this.internals.setValidity(
        missing ? { valueMissing: true } : {},
        missing ? 'Please select an option.' : undefined,
        this.#inputRef.value,
      );
    }
    if (changed.has('_query') || changed.has('open') || changed.has('filter'))
      this.#applyFilter();
    this.#paintActive();
  }

  formResetCallback(): void {
    const d = this.#defaultValue ?? '';
    this.value = Array.isArray(d) ? [...d] : d;
    this._typing = false;
  }

  formStateRestoreCallback(state: string | null): void {
    this.value = state ?? '';
  }

  override focus(options?: FocusOptions): void {
    this.#inputRef.value?.focus(options);
  }

  override blur(): void {
    this.#inputRef.value?.blur();
  }

  // --- options ---------------------------------------------------------------------------------

  #syncOptions = (): void => {
    this.#options = [...this.querySelectorAll<BxOption>('bx-option')];
    const selected = new Set(this.values);
    for (const o of this.#options) o.selected = selected.has(o.value);
  };

  #matches(option: BxOption): boolean {
    const q = this._typing ? this._query.trim().toLowerCase() : '';
    if (!q) return true;
    const label = optionLabel(option);
    if (typeof this.filter === 'function')
      return this.filter(label, this._query.trim(), option);
    const l = label.toLowerCase();
    return this.filter === 'starts-with' ? l.startsWith(q) : l.includes(q);
  }

  #applyFilter(): void {
    let visible = 0;
    for (const o of this.#options) {
      const show = this.#matches(o);
      o.hidden = !show;
      if (show) visible++;
    }
    const empty = this.shadowRoot?.querySelector<HTMLElement>('.empty');
    if (empty) empty.hidden = visible > 0 || this.loading;
    const navigable = this.#navigable;
    if (!navigable.includes(this.#options[this._active])) this._active = -1;
  }

  get #navigable(): BxOption[] {
    return this.#options.filter((o) => !o.hidden && !o.disabled);
  }

  #paintActive(): void {
    const nav = this.#navigable;
    const active = this.#options[this._active];
    for (const o of this.#options)
      o.toggleAttribute('data-active', o === active);
    const input = this.#inputRef.value as
      | (HTMLInputElement & { ariaActiveDescendantElement?: Element | null })
      | undefined;
    if (!input) return;
    const target = this.open && active && nav.includes(active) ? active : null;
    if (input.ariaActiveDescendantElement !== undefined)
      input.ariaActiveDescendantElement = target;
    if (target) target.scrollIntoView?.({ block: 'nearest' });
  }

  #move(delta: number | 'first' | 'last'): void {
    const nav = this.#navigable;
    if (!nav.length) return;
    const cur = nav.indexOf(this.#options[this._active]);
    let next: number;
    if (delta === 'first') next = 0;
    else if (delta === 'last') next = nav.length - 1;
    else
      next =
        cur < 0
          ? delta > 0
            ? 0
            : nav.length - 1
          : (cur + delta + nav.length) % nav.length;
    this._active = this.#options.indexOf(nav[next]);
  }

  // --- open / close ----------------------------------------------------------------------------

  #show(): void {
    if (this.open || this.disabled) return;
    if (
      !this.dispatchEvent(
        new Event('bx-show', {
          bubbles: true,
          composed: true,
          cancelable: true,
        }),
      )
    )
      return;
    this.open = true;
    this.updateComplete.then(() =>
      this.dispatchEvent(
        new Event('bx-after-show', { bubbles: true, composed: true }),
      ),
    );
  }

  #hide(): void {
    if (!this.open) return;
    if (
      !this.dispatchEvent(
        new Event('bx-hide', {
          bubbles: true,
          composed: true,
          cancelable: true,
        }),
      )
    )
      return;
    this.open = false;
    this._active = -1;
    this.updateComplete.then(() =>
      this.dispatchEvent(
        new Event('bx-after-hide', { bubbles: true, composed: true }),
      ),
    );
  }

  // --- selection -------------------------------------------------------------------------------

  #commit(values: string[]): void {
    const before = this.values.join('\u0000');
    this.value = this.multiple ? values : (values[0] ?? '');
    this._typing = false;
    if (this.multiple) this._query = '';
    this.#syncOptions();
    if (values.join('\u0000') !== before)
      this.dispatchEvent(
        new Event('change', { bubbles: true, composed: true }),
      );
  }

  #choose(option: BxOption): void {
    if (option.disabled) return;
    if (this.multiple) {
      const set = this.values.includes(option.value)
        ? this.values.filter((v) => v !== option.value)
        : [...this.values, option.value];
      this.#commit(set);
      this.focus();
    } else {
      this._query = optionLabel(option);
      this.#commit([option.value]);
      this.#hide();
    }
  }

  #commitCustom(): boolean {
    const text = this._query.trim();
    if (!this.allowCustom || !text) return false;
    const existing = this.#options.find(
      (o) => optionLabel(o).toLowerCase() === text.toLowerCase(),
    );
    const value = existing?.value ?? text;
    if (this.multiple && !this.values.includes(value))
      this.#commit([...this.values, value]);
    else if (!this.multiple) this.#commit([value]);
    else this._query = '';
    return true;
  }

  // --- events ----------------------------------------------------------------------------------

  #onInput = (event: Event): void => {
    event.stopPropagation(); // Replaced by the `input` CustomEvent below.
    const query = (event.target as HTMLInputElement).value;
    this._query = query;
    this._typing = true;
    this.#show();
    this._active = -1;
    clearTimeout(this.#debounceTimer);
    const fire = () =>
      this.dispatchEvent(
        new CustomEvent('input', {
          bubbles: true,
          composed: true,
          detail: { query },
        }),
      );
    if (this.debounce > 0)
      this.#debounceTimer = setTimeout(fire, this.debounce);
    else fire();
  };

  #onKeydown = (event: KeyboardEvent): void => {
    if (this.disabled) return;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.open) this.#show();
        this.#move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.open) this.#show();
        this.#move(-1);
        break;
      case 'Home':
      case 'End':
        if (this.open && this._active >= 0) {
          event.preventDefault();
          this.#move(event.key === 'Home' ? 'first' : 'last');
        }
        break;
      case 'Enter': {
        const active = this.#options[this._active];
        if (this.open && active) {
          event.preventDefault();
          this.#choose(active);
        } else if (this.allowCustom && this._query.trim()) {
          event.preventDefault();
          this.#commitCustom();
          this.#hide();
        }
        break;
      }
      case 'Escape':
        if (this.open) {
          event.preventDefault();
          event.stopPropagation();
          this.#hide();
        } else if (this._query) {
          event.preventDefault();
          this._query = '';
          this._typing = false;
          if (!this.multiple) this.#commit([]);
        }
        break;
      case 'Backspace':
        if (this.multiple && !this._query && this.values.length)
          this.#commit(this.values.slice(0, -1));
        break;
      case 'Tab':
        this.#hide();
        break;
    }
  };

  #onBlur = (): void => {
    if (this.allowCustom && this._typing && this._query.trim())
      this.#commitCustom();
    this._typing = false;
    if (!this.multiple && !this.allowCustom) {
      const opt = this.#options.find((o) => o.value === this.values[0]);
      this._query = opt ? optionLabel(opt) : '';
    }
    this.#hide();
  };

  #onListClick = (event: MouseEvent): void => {
    const option = (event.target as Element).closest(
      'bx-option',
    ) as BxOption | null;
    if (option) this.#choose(option);
  };

  #onListPointerMove = (event: PointerEvent): void => {
    const option = (event.target as Element).closest(
      'bx-option',
    ) as BxOption | null;
    if (option && !option.disabled)
      this._active = this.#options.indexOf(option);
  };

  protected override render() {
    const selectedOptions = this.multiple
      ? this.values.map((v) => ({
          value: v,
          label: optionLabel(
            this.#options.find((o) => o.value === v) ??
              ({ value: v, label: v, textContent: v } as BxOption),
          ),
        }))
      : [];
    return html`
      <label class="label" for="${this.#uid}-input"
        ><slot name="label">${this.label}</slot></label
      >
      <div class="control" part="control" id="${this.#uid}-control">
        ${selectedOptions.map(
          (s) =>
            html`<bx-chip
              part="chip"
              size="s"
              removable
              ?disabled=${this.disabled}
              remove-label="Remove ${s.label}"
              @bx-remove=${(e: Event) => {
                e.preventDefault();
                this.#commit(this.values.filter((v) => v !== s.value));
              }}
              >${s.label}</bx-chip
            >`,
        )}
        <input
          ${ref(this.#inputRef)}
          part="input"
          id="${this.#uid}-input"
          role="combobox"
          type="text"
          autocomplete="off"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded=${this.open ? 'true' : 'false'}
          aria-controls="${this.#uid}-list"
          aria-describedby="${this.#uid}-hint"
          placeholder=${this.placeholder || nothing}
          ?disabled=${this.disabled}
          ?required=${this.required && !this.values.length}
          .value=${this._query}
          @input=${this.#onInput}
          @keydown=${this.#onKeydown}
          @blur=${this.#onBlur}
          @click=${() => this.#show()}
        />
        <span class="adornment"
          >${
            this.loading
              ? html`<bx-spinner aria-hidden="true"></bx-spinner>`
              : html`<svg
                  class="chevron"
                  viewBox="0 0 256 256"
                  aria-hidden="true"
                  @mousedown=${(e: Event) => {
                    e.preventDefault();
                    this.open ? this.#hide() : (this.focus(), this.#show());
                  }}
                >
                  <path d=${CHEVRON} />
                </svg>`
          }</span
        >
      </div>
      <div class="hint" id="${this.#uid}-hint">
        <slot name="hint">${this.hint}</slot>
      </div>
      <bx-popup
        anchor="${this.#uid}-control"
        ?active=${this.open}
        placement="bottom-start"
        strategy="fixed"
        distance="4"
        sync="width"
        auto-size="vertical"
        flip
        shift
      >
        <div class="panel">
          <div
            class="listbox"
            part="listbox"
            id="${this.#uid}-list"
            role="listbox"
            aria-multiselectable=${this.multiple ? 'true' : nothing}
            aria-busy=${this.loading ? 'true' : nothing}
            aria-label=${this.label || 'Options'}
            @mousedown=${(e: Event) => e.preventDefault()}
            @click=${this.#onListClick}
            @pointermove=${this.#onListPointerMove}
          >
            <slot
              @slotchange=${() => {
                this.#syncOptions();
                this.#applyFilter();
                this.requestUpdate();
              }}
            ></slot>
            <div class="empty" role="status" ?hidden=${true}>
              <slot name="empty">No results</slot>
            </div>
          </div>
        </div>
      </bx-popup>
    `;
  }
}
