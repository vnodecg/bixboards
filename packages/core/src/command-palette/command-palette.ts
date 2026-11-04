import { css, html, nothing, type PropertyValues } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';
import { textFamily, textStyle } from '../internal/text-style.ts';
import { matchesShortcut } from '../search-field/search-field.ts';

export interface Command {
  id: string;
  label: string;
  group?: string;
  keywords?: string[];
  /** Chord such as `mod+shift+p`, rendered with `bx-kbd`. */
  shortcut?: string;
  /** `bx-icon` name. */
  icon?: string;
  disabled?: boolean;
  handler?: () => void;
  href?: string;
}

/**
 * Deterministic fuzzy rank of `query` against `text` (FR-COMMANDPALETTE-02): exact > prefix >
 * word-start > substring > subsequence. Higher is better, `0` means no match. Within a class,
 * earlier and tighter matches score higher; the function is pure, so ordering is stable.
 */
export function fuzzyScore(query: string, text: string): number {
  const q = query.trim().toLowerCase();
  const t = text.toLowerCase();
  if (!q) return 1;
  if (t === q) return 1000;
  if (t.startsWith(q)) return 900 - Math.min(t.length - q.length, 99);
  // Every query word starts a word of the text, in order ("op set" -> "Open settings").
  const words = [...t.matchAll(/[^\s\-_/.]+/g)];
  const qWords = q.split(/\s+/);
  let wi = 0;
  let wordStart = true;
  for (const qw of qWords) {
    while (wi < words.length && !words[wi]![0].startsWith(qw)) wi++;
    if (wi === words.length) {
      wordStart = false;
      break;
    }
    wi++;
  }
  if (wordStart)
    return 700 - Math.min(words[0] ? t.indexOf(qWords[0]!) : 0, 99);
  const at = t.indexOf(q);
  if (at >= 0) return 500 - Math.min(at, 99);
  // Subsequence: reward consecutive runs and early starts.
  let ti = 0;
  let run = 0;
  let score = 0;
  for (const ch of q) {
    const found = t.indexOf(ch, ti);
    if (found < 0) return 0;
    run = found === ti ? run + 1 : 0;
    score += 1 + run;
    ti = found + 1;
  }
  return Math.max(1, Math.min(300, 100 + score) - Math.floor(ti / 4));
}

const isEditable = (el: Element | null) =>
  !!el &&
  (el.tagName === 'INPUT' ||
    el.tagName === 'TEXTAREA' ||
    el.tagName === 'SELECT' ||
    (el as HTMLElement).isContentEditable);

function deepActive(): Element | null {
  let el = document.activeElement;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
  return el;
}

const MAX_RESULTS = 200;
let nextId = 0;

/**
 * `<bx-command-palette>` — global ⌘K launcher (docs/features/core/command-palette.md).
 *
 * A modal native `<dialog>` holding a search `input role="combobox"` and a `listbox`; DOM focus
 * stays in the input and the highlighted row is its `aria-activedescendant` (the combobox pattern).
 * Commands come from the `commands` property; with no query they are grouped (recent ids first),
 * with one they are ranked flat by {@link fuzzyScore} or a custom `filter(command, query) => number`
 * (higher wins, 0 hides). Selecting fires a cancelable `bx-select`; unless cancelled it runs the
 * command's `handler` or navigates to its `href`, then closes. The opening `shortcut` (default
 * `mod+k`) is registered globally and, when it has no modifier, ignored inside editable fields
 * (FR-COMMANDPALETTE-04). Shortcuts in rows use `bx-kbd` (FR-COMMANDPALETTE-03). At most 200 results
 * render; true virtualization above that (FR-COMMANDPALETTE-01) is not implemented, and the dialog
 * is a native `<dialog>` rather than `bx-dialog`.
 *
 * @fires bx-select - A command was chosen. Cancelable. `detail.command`.
 * @fires input - Query changed. `detail.query` (for async sources).
 * @fires bx-show - Opening. Cancelable.
 * @fires bx-after-show - Opened.
 * @fires bx-hide - Closing. Cancelable.
 * @fires bx-after-hide - Closed.
 *
 * @slot empty - Shown when nothing matches.
 * @slot footer - Hints (↑↓ navigate, ↵ select).
 *
 * @csspart dialog - The dialog part.
 * @csspart input - The input part.
 * @csspart list - The list part.
 * @csspart group - The group part.
 * @csspart item - The item part.
 * @csspart shortcut - The shortcut part.
 * @csspart footer - The footer part.
 *
 * @cssprop --bx-command-palette-width - Dialog width.
 * @cssprop --bx-command-palette-max-height - List max height.
 */
export class BxCommandPalette extends BixElement {
  static override tagName = 'bx-command-palette';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        ${textFamily('--bx-command-palette', 'body')}
      }
      dialog {
        box-sizing: border-box;
        inline-size: min(
          var(--bx-command-palette-width, 38rem),
          calc(100vw - var(--bx-space-m) * 2)
        );
        max-inline-size: none;
        margin: 12vh auto auto;
        padding: 0;
        overflow: hidden;
        border: var(--bx-border-width) solid var(--bx-border-subtle);
        border-radius: var(--bx-radius-l);
        background: var(--bx-surface-base);
        color: var(--bx-text-primary);
        box-shadow: var(--bx-shadow-l);
      }
      dialog::backdrop {
        background: color-mix(in srgb, black 45%, transparent);
      }
      .search {
        display: flex;
        align-items: center;
        gap: var(--bx-space-xs);
        padding: var(--bx-space-s) var(--bx-space-m);
        border-block-end: var(--bx-border-width) solid var(--bx-border-subtle);
      }
      .search bx-icon {
        color: var(--bx-text-secondary);
      }
      input {
        flex: 1;
        min-inline-size: 0;
        padding: 0;
        border: 0;
        outline: 0;
        background: transparent;
        color: inherit;
        ${textStyle('--bx-command-palette', 'field-l')}
      }
      input::placeholder {
        color: var(--bx-text-secondary);
      }
      .list {
        max-block-size: var(--bx-command-palette-max-height, 50vh);
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: var(--bx-space-2xs);
      }
      .group-label {
        padding: var(--bx-space-xs) var(--bx-space-s) var(--bx-space-3xs);
        color: var(--bx-text-secondary);
        text-transform: uppercase;
        ${textStyle('--bx-command-palette-group', 'label-xs')}
      }
      .item {
        display: flex;
        align-items: center;
        gap: var(--bx-space-xs);
        min-block-size: max(var(--bx-control-height-m), var(--bx-target-min));
        padding: 0 var(--bx-space-s);
        border-radius: var(--bx-radius-m);
        cursor: pointer;
        ${textStyle('--bx-command-palette-item', 'body-m')}
      }
      .item[data-active] {
        background: var(--bx-role-brand-subtle);
        outline: var(
            --bx-command-palette-focus-ring-width,
            var(--bx-border-width-strong)
          )
          solid var(--bx-command-palette-focus-ring-color, var(--bx-focus-ring));
        outline-offset: -2px;
      }
      .item[aria-disabled='true'] {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .item .label {
        flex: 1;
        min-inline-size: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .item .where {
        color: var(--bx-text-secondary);
        ${textStyle('--bx-command-palette-where', 'caption-m')}
      }
      .empty {
        padding: var(--bx-space-l);
        color: var(--bx-text-secondary);
        text-align: center;
      }
      .footer {
        display: flex;
        gap: var(--bx-space-m);
        padding: var(--bx-space-xs) var(--bx-space-m);
        border-block-start: var(--bx-border-width) solid var(--bx-border-subtle);
        color: var(--bx-text-secondary);
        ${textStyle('--bx-command-palette-footer', 'caption-m')}
      }
      .footer span {
        display: inline-flex;
        align-items: center;
        gap: var(--bx-space-3xs);
      }
      .sr {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        overflow: hidden;
        clip-path: inset(50%);
      }
      @media (forced-colors: active) {
        .item[data-active] {
          outline: 2px solid Highlight;
        }
      }
    `,
  ];

  static override properties = {
    open: { type: Boolean, reflect: true },
    commands: { attribute: false },
    placeholder: { type: String },
    shortcut: { type: String },
    loading: { type: Boolean, reflect: true },
    recent: { attribute: false },
    filter: { attribute: false },
    label: { type: String },
    _query: { state: true },
    _active: { state: true },
  };

  declare open: boolean;
  declare commands: Command[];
  declare placeholder: string;
  declare shortcut: string;
  declare loading: boolean;
  declare recent: string[];
  declare filter?: (command: Command, query: string) => number;
  declare label: string;
  /** @internal */
  declare _query: string;
  /** @internal */
  declare _active: number;

  #id = `bx-cp-${nextId++}`;
  #dialogRef = createRef<HTMLDialogElement>();
  #inputRef = createRef<HTMLInputElement>();
  #returnFocus: Element | null = null;

  constructor() {
    super();
    this.open = false;
    this.commands = [];
    this.placeholder = 'Type a command or search…';
    this.shortcut = 'mod+k';
    this.loading = false;
    this.recent = [];
    this.label = 'Command palette';
    this._query = '';
    this._active = 0;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('keydown', this.#onGlobalKeydown);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.#onGlobalKeydown);
  }

  protected override updated(changed: PropertyValues<this>): void {
    const dialog = this.#dialogRef.value;
    if (changed.has('open') && dialog) {
      if (this.open && !dialog.open) {
        this.#returnFocus = deepActive();
        dialog.showModal();
        this.#inputRef.value?.focus();
        this.dispatchEvent(
          new Event('bx-after-show', { bubbles: true, composed: true }),
        );
      } else if (!this.open && dialog.open) {
        dialog.close();
        this._query = '';
        this._active = 0;
        (this.#returnFocus as HTMLElement | null)?.focus?.();
        this.dispatchEvent(
          new Event('bx-after-hide', { bubbles: true, composed: true }),
        );
      }
    }
    if (
      changed.has('_active') ||
      changed.has('_query') ||
      changed.has('commands')
    )
      this.shadowRoot
        ?.querySelector('[data-active]')
        ?.scrollIntoView?.({ block: 'nearest' });
  }

  show(): void {
    if (this.open) return;
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
  }

  hide(): void {
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
  }

  #onGlobalKeydown = (event: KeyboardEvent): void => {
    if (!this.shortcut || event.defaultPrevented) return;
    if (!matchesShortcut(event, this.shortcut)) return;
    const hasModifier = /(^|\+)(mod|ctrl|cmd|meta|alt)(\+|$)/i.test(
      this.shortcut,
    );
    if (!hasModifier && isEditable(deepActive())) return;
    event.preventDefault();
    this.open ? this.hide() : this.show();
  };

  // --- results ---------------------------------------------------------------------------------

  get #results(): {
    sections: { label?: string; items: Command[] }[];
    flat: Command[];
  } {
    const commands = this.commands ?? [];
    const q = this._query.trim();
    let sections: { label?: string; items: Command[] }[];
    if (q) {
      const rank =
        this.filter ??
        ((c: Command, query: string) =>
          Math.max(
            fuzzyScore(query, c.label),
            ...(c.keywords ?? []).map((k) => fuzzyScore(query, k) * 0.8),
            c.group ? fuzzyScore(query, c.group) * 0.5 : 0,
          ));
      const scored = commands
        .map((c, i) => ({ c, i, s: rank(c, q) }))
        .filter((r) => r.s > 0)
        .sort((a, b) => b.s - a.s || a.i - b.i)
        .map((r) => r.c);
      sections = [{ items: scored }];
    } else {
      const recent = (this.recent ?? [])
        .map((id) => commands.find((c) => c.id === id))
        .filter((c): c is Command => !!c);
      const rest = commands.filter((c) => !recent.includes(c));
      sections = [];
      if (recent.length) sections.push({ label: 'Recent', items: recent });
      const groups = new Map<string, Command[]>();
      for (const c of rest) {
        const key = c.group ?? '';
        groups.set(key, [...(groups.get(key) ?? []), c]);
      }
      for (const [label, items] of groups)
        sections.push({ label: label || undefined, items });
    }
    let budget = MAX_RESULTS;
    sections = sections
      .map((s) => {
        const items = s.items.slice(0, Math.max(budget, 0));
        budget -= items.length;
        return { ...s, items };
      })
      .filter((s) => s.items.length);
    return { sections, flat: sections.flatMap((s) => s.items) };
  }

  #move(delta: number): void {
    const { flat } = this.#results;
    if (!flat.length) return;
    let i = this._active;
    for (let n = 0; n < flat.length; n++) {
      i = (i + delta + flat.length) % flat.length;
      if (!flat[i]!.disabled) break;
    }
    this._active = i;
  }

  #choose(command: Command | undefined): void {
    if (!command || command.disabled) return;
    const proceed = this.dispatchEvent(
      new CustomEvent('bx-select', {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: { command },
      }),
    );
    if (!proceed) return;
    this.hide();
    if (command.handler) command.handler();
    else if (command.href) window.location.href = command.href;
  }

  #onKeydown = (event: KeyboardEvent): void => {
    const { flat } = this.#results;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.#move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.#move(-1);
        break;
      case 'Home':
        if (flat.length) {
          event.preventDefault();
          this._active = 0;
        }
        break;
      case 'End':
        if (flat.length) {
          event.preventDefault();
          this._active = flat.length - 1;
        }
        break;
      case 'Enter':
        event.preventDefault();
        this.#choose(flat[this._active]);
        break;
    }
  };

  protected override render() {
    const { sections, flat } = this.#results;
    const active = Math.min(this._active, Math.max(flat.length - 1, 0));
    let index = -1;
    const activeId = flat.length ? `${this.#id}-o${active}` : undefined;
    return html`<dialog
      ${ref(this.#dialogRef)}
      part="dialog"
      aria-label=${this.label}
      @cancel=${(e: Event) => {
        e.preventDefault();
        this.hide();
      }}
      @click=${(e: MouseEvent) => {
        if (e.target === this.#dialogRef.value) this.hide();
      }}
    >
      <div class="search">
        <input
          ${ref(this.#inputRef)}
          part="input"
          type="text"
          role="combobox"
          autocomplete="off"
          spellcheck="false"
          aria-label=${this.label}
          aria-expanded="true"
          aria-controls="${this.#id}-list"
          aria-autocomplete="list"
          aria-activedescendant=${activeId ?? nothing}
          placeholder=${this.placeholder}
          .value=${this._query}
          @input=${(e: Event) => {
            e.stopPropagation();
            this._query = (e.target as HTMLInputElement).value;
            this._active = 0;
            this.dispatchEvent(
              new CustomEvent('input', {
                bubbles: true,
                composed: true,
                detail: { query: this._query },
              }),
            );
          }}
          @keydown=${this.#onKeydown}
        />
        ${this.loading ? html`<bx-spinner aria-hidden="true"></bx-spinner>` : nothing}
      </div>
      <div
        class="list"
        part="list"
        id="${this.#id}-list"
        role="listbox"
        aria-label=${this.label}
        aria-busy=${this.loading ? 'true' : nothing}
      >
        ${sections.map(
          (section, s) =>
            html`<div
              part="group"
              role=${section.label ? 'group' : 'presentation'}
              aria-labelledby=${section.label ? `${this.#id}-g${s}` : nothing}
            >
              ${
                section.label
                  ? html`<div
                      class="group-label"
                      id="${this.#id}-g${s}"
                      role="presentation"
                    >
                      ${section.label}
                    </div>`
                  : nothing
              }
              ${section.items.map((command) => {
                index++;
                const i = index;
                return html`<div
                  class="item"
                  part="item"
                  id="${this.#id}-o${i}"
                  role="option"
                  aria-selected=${i === active ? 'true' : 'false'}
                  aria-disabled=${command.disabled ? 'true' : nothing}
                  ?data-active=${i === active}
                  @click=${() => this.#choose(command)}
                  @pointermove=${() => this._active !== i && !command.disabled && (this._active = i)}
                >
                  ${command.icon ? html`<bx-icon name=${command.icon} aria-hidden="true"></bx-icon>` : nothing}
                  <span class="label">${command.label}</span>
                  ${this._query && command.group ? html`<span class="where">${command.group}</span>` : nothing}
                  ${
                    command.shortcut
                      ? html`<bx-kbd
                          part="shortcut"
                          size="s"
                          keys=${command.shortcut}
                        ></bx-kbd>`
                      : nothing
                  }
                </div>`;
              })}
            </div>`,
        )}
        ${
          flat.length
            ? nothing
            : html`<div class="empty" role="status">
                <slot name="empty">No results</slot>
              </div>`
        }
      </div>
      <div class="footer" part="footer">
        <slot name="footer"
          ><span
            ><bx-kbd keys="up"></bx-kbd
            ><bx-kbd keys="down"></bx-kbd> navigate</span
          ><span><bx-kbd keys="enter"></bx-kbd> select</span
          ><span><bx-kbd keys="esc"></bx-kbd> close</span></slot
        >
      </div>
      <div class="sr" role="status" aria-live="polite">
        ${flat.length ? `${flat.length} result${flat.length === 1 ? '' : 's'}` : 'No results'}
      </div>
    </dialog>`;
  }
}
