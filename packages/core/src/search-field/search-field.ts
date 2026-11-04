import { css, html, type PropertyValues } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';
import { FormAssociatedMixin } from '../internal/form-associated.ts';
import type { BxInput } from '../input/input.ts';

const SEARCH_PATH =
  'M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z';

/** True if `event` matches a chord such as `mod+k` (`mod` = Ctrl or Cmd). */
export function matchesShortcut(event: KeyboardEvent, chord: string): boolean {
  const parts = chord
    .toLowerCase()
    .split('+')
    .map((p) => p.trim())
    .filter(Boolean);
  const key = parts.pop();
  if (!key) return false;
  const want = new Set(parts);
  const mod = want.has('mod');
  const ctrl = want.has('ctrl');
  const meta = want.has('cmd') || want.has('meta');
  const ctrlOrMeta = event.ctrlKey || event.metaKey;
  const modOk = mod
    ? ctrlOrMeta
    : ctrl === event.ctrlKey && meta === event.metaKey;
  return (
    modOk &&
    want.has('shift') === event.shiftKey &&
    want.has('alt') === event.altKey &&
    event.key.toLowerCase() === (key === 'slash' ? '/' : key)
  );
}

function isEditable(el: Element | null): boolean {
  if (!el) return false;
  if (el instanceof HTMLElement && el.isContentEditable) return true;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

/** Deepest focused element, through open shadow roots. */
function deepActive(): Element | null {
  let el = document.activeElement;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
  return el;
}

/**
 * `<bx-search-field>` — search input (docs/features/core/search-field.md).
 *
 * Composes `bx-input type="search"` (FR-SEARCHFIELD-01) with a leading search icon, a clear
 * button and `bx-search`, fired `debounce` ms after typing stops or immediately on Enter.
 * Escape clears first, then blurs. `shortcut` (e.g. `mod+k`) opts in to a global focus key,
 * ignored while any other editable element has focus (FR-SEARCHFIELD-03). Form-associated: the
 * value is submitted under `name`. The `suggestions` slot (FR-SEARCHFIELD-02, combobox pattern) is
 * **not** implemented; use `bx-combobox` when suggestions are needed.
 *
 * @fires input - Each keystroke.
 * @fires bx-search - Debounced, or on Enter. `detail.query`.
 * @fires bx-clear - Clear button (or Escape) used.
 *
 * @slot start - Replaces the search icon.
 * @slot end - Trailing content (e.g. a shortcut hint).
 *
 * @csspart form-control - The form-control part.
 * @csspart input - The input part.
 * @csspart clear-button - The clear-button part.
 * @csspart icon - The icon part.
 *
 * @cssprop --bx-search-field-bg - Background.
 * @cssprop --bx-search-field-radius - Corner radius. Default `var(--bx-radius-l)`.
 */
export class BxSearchField extends FormAssociatedMixin(BixElement) {
  static override tagName = 'bx-search-field';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
      }
      bx-input {
        --bx-input-bg: var(--bx-search-field-bg);
        --bx-input-radius: var(--bx-search-field-radius, var(--bx-radius-l));
      }
      .icon {
        display: inline-flex;
        color: var(--bx-text-secondary);
      }
      .icon svg {
        inline-size: 1.1em;
        block-size: 1.1em;
        fill: currentColor;
      }
    `,
  ];

  static override properties = {
    label: { type: String },
    value: { type: String },
    name: { type: String },
    placeholder: { type: String },
    debounce: { type: Number },
    loading: { type: Boolean, reflect: true },
    clearable: { type: Boolean },
    shortcut: { type: String },
    size: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  declare label: string;
  declare value: string;
  declare name: string;
  declare placeholder: string;
  declare debounce: number;
  declare loading: boolean;
  declare clearable: boolean;
  declare shortcut: string;
  declare size: 's' | 'm' | 'l';
  declare disabled: boolean;

  #inputRef = createRef<BxInput>();
  #timer?: ReturnType<typeof setTimeout>;
  #defaultValue?: string;

  constructor() {
    super();
    this.label = '';
    this.value = '';
    this.name = '';
    this.placeholder = 'Search';
    this.debounce = 250;
    this.loading = false;
    this.clearable = true;
    this.shortcut = '';
    this.size = 'm';
    this.disabled = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#defaultValue ??= this.value;
    document.addEventListener('keydown', this.#onGlobalKeydown);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.#onGlobalKeydown);
    clearTimeout(this.#timer);
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('value') || changed.has('name'))
      this.internals.setFormValue(this.name ? this.value : null);
  }

  formResetCallback(): void {
    this.value = this.#defaultValue ?? '';
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

  select(): void {
    this.#inputRef.value?.select();
  }

  /** Clears the value, fires `bx-clear` and a (non-debounced) `bx-search` with an empty query. */
  clear(): void {
    if (!this.value) return;
    this.value = '';
    this.dispatchEvent(
      new Event('bx-clear', { bubbles: true, composed: true }),
    );
    this.#search(true);
  }

  #search(immediate = false): void {
    clearTimeout(this.#timer);
    const fire = () =>
      this.dispatchEvent(
        new CustomEvent('bx-search', {
          bubbles: true,
          composed: true,
          detail: { query: this.value },
        }),
      );
    if (immediate || this.debounce <= 0) fire();
    else this.#timer = setTimeout(fire, this.debounce);
  }

  #onGlobalKeydown = (event: KeyboardEvent): void => {
    if (!this.shortcut || this.disabled || event.defaultPrevented) return;
    if (!matchesShortcut(event, this.shortcut)) return;
    const active = deepActive();
    const mine =
      this.shadowRoot?.contains(active) ||
      this.#inputRef.value?.shadowRoot?.contains(active);
    if (isEditable(active) && !mine) return;
    event.preventDefault();
    this.focus();
    this.select();
  };

  #onInput = (event: Event): void => {
    this.value = (event.target as BxInput).value;
    this.#search();
  };

  #onKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Enter') {
      this.#search(true);
    } else if (event.key === 'Escape') {
      if (this.value) {
        event.preventDefault();
        event.stopPropagation();
        this.clear();
      } else {
        this.blur();
      }
    }
  };

  protected override render() {
    return html`<bx-input
      ${ref(this.#inputRef)}
      part="form-control"
      exportparts="input,clear-button"
      type="search"
      .value=${this.value}
      label=${this.label}
      ?with-label=${!!this.label}
      placeholder=${this.placeholder}
      size=${this.size === 's' ? 'small' : this.size === 'l' ? 'large' : 'medium'}
      ?clearable=${this.clearable}
      ?disabled=${this.disabled}
      autocomplete="off"
      enterkeyhint="search"
      @input=${this.#onInput}
      @bx-clear=${(e: Event) => {
        e.stopPropagation();
        this.value = '';
        this.dispatchEvent(
          new Event('bx-clear', { bubbles: true, composed: true }),
        );
        this.#search(true);
      }}
      @keydown=${this.#onKeydown}
    >
      <span class="icon" part="icon" slot="start"
        ><slot name="start"
          >${
            this.loading
              ? html`<bx-spinner aria-hidden="true"></bx-spinner>`
              : html`<svg viewBox="0 0 256 256" aria-hidden="true">
                  <path d=${SEARCH_PATH} />
                </svg>`
          }</slot
        ></span
      >
      <slot name="end" slot="end"></slot>
    </bx-input>`;
  }
}
