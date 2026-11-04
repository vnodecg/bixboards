import { css, html, nothing } from 'lit';
import { BixElement } from '../bix-element.ts';
import { textFamily, textStyle } from '../internal/text-style.ts';

export interface CodeToken {
  text: string;
  /** keyword | string | number | comment | function | punctuation | type | ... (others unstyled). */
  type?: string;
}
export type Highlighter = (code: string) => CodeToken[];

const highlighters = new Map<string, Highlighter>();

/**
 * Registers a grammar for `language` (FR-CODEBLOCK-01). The core ships none, so bundles stay small;
 * a highlighter returns a flat token list whose texts concatenate back to the source (tokens may
 * contain newlines). Returning tokens, not HTML, keeps the output injection-safe.
 */
export function registerHighlighter(
  language: string,
  highlighter: Highlighter,
): void {
  highlighters.set(language.toLowerCase(), highlighter);
}

/** Parses `2,5-7` into a set of 1-based line numbers. Invalid parts are ignored. */
export function parseLineRanges(spec: string): Set<number> {
  const lines = new Set<number>();
  for (const part of spec.split(',')) {
    const m = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!m) continue;
    const from = Number(m[1]);
    const to = m[2] ? Number(m[2]) : from;
    for (let n = from; n <= Math.min(to, from + 100000); n++) lines.add(n);
  }
  return lines;
}

/** Splits a flat token list into lines of tokens. */
export function splitLines(tokens: CodeToken[]): CodeToken[][] {
  const lines: CodeToken[][] = [[]];
  for (const token of tokens) {
    const parts = token.text.split('\n');
    parts.forEach((text, i) => {
      if (i > 0) lines.push([]);
      if (text) lines[lines.length - 1]!.push({ text, type: token.type });
    });
  }
  return lines;
}

/**
 * `<bx-code-block>` — code with line numbers, line highlighting, wrapping and a copy button
 * (docs/features/core/code-block.md).
 *
 * Source comes from `code` or the default slot's text. Grammars are pluggable via
 * {@link registerHighlighter}; with none registered for `language` the text is shown plain.
 * Token colours come from semantic tokens and are drawn from `*-fg` role colours (FR-CODEBLOCK-02).
 * The scroll region is a keyboard-focusable `role="region"` (FR-CODEBLOCK-03). Line numbers are
 * `aria-hidden` and `user-select: none`, so copying yields only the code. The copy button is
 * `bx-copy-button`; its `bx-copy`/`bx-error` events bubble out.
 *
 * @fires bx-copy - Via `bx-copy-button`.
 *
 * @slot (default) - Source text.
 * @slot header - Replaces the filename caption.
 *
 * @csspart base - The base part.
 * @csspart header - The header part.
 * @csspart pre - The pre part.
 * @csspart line - The line part.
 * @csspart line-number - The line-number part.
 * @csspart copy-button - The copy-button part.
 *
 * @cssprop --bx-code-block-bg - Background.
 * @cssprop --bx-code-block-line-highlight - Highlighted line background.
 */
export class BxCodeBlock extends BixElement {
  static override tagName = 'bx-code-block';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        ${textFamily('--bx-code-block', 'code')}
      }
      .base {
        overflow: hidden;
        border: var(--bx-border-width) solid var(--bx-border-subtle);
        border-radius: var(--bx-radius-m);
        background: var(--bx-code-block-bg, var(--bx-surface-subtle));
        color: var(--bx-text-primary);
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--bx-space-s);
        padding: var(--bx-space-2xs) var(--bx-space-s);
        border-block-end: var(--bx-border-width) solid var(--bx-border-subtle);
        color: var(--bx-text-secondary);
        ${textStyle('--bx-code-block-header', 'caption-m')}
      }
      .body {
        position: relative;
      }
      .copy-button {
        position: absolute;
        inset-block-start: var(--bx-space-2xs);
        inset-inline-end: var(--bx-space-2xs);
      }
      .header .copy-button {
        position: static;
      }
      pre {
        margin: 0;
        padding: var(--bx-space-s);
        overflow: auto;
        ${textStyle('--bx-code-block', 'code-m')}
        tab-size: 2;
      }
      pre:focus-visible {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: calc(var(--bx-focus-ring-offset) * -1);
      }
      code {
        display: block;
        font: inherit;
        min-inline-size: max-content;
      }
      :host([wrap]) code {
        min-inline-size: 0;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }
      .line {
        display: flex;
        padding-inline: var(--bx-space-s);
        margin-inline: calc(var(--bx-space-s) * -1);
      }
      .line[data-highlight] {
        background: var(
          --bx-code-block-line-highlight,
          var(--bx-role-brand-subtle)
        );
      }
      .line-number {
        flex: none;
        min-inline-size: 2.5ch;
        margin-inline-end: var(--bx-space-s);
        text-align: end;
        color: var(--bx-text-secondary);
        user-select: none;
      }
      .text {
        flex: 1 1 auto;
        min-inline-size: 0;
      }
      .t-keyword {
        color: var(--bx-role-brand-fg);
      }
      .t-string {
        color: var(--bx-role-tertiary-fg);
      }
      .t-number {
        color: var(--bx-role-warning-fg);
      }
      .t-comment {
        color: var(--bx-text-secondary);
        font-style: italic;
      }
      .t-function,
      .t-type {
        color: var(--bx-role-danger-fg);
      }
      .t-punctuation {
        color: var(--bx-text-secondary);
      }
      @media (forced-colors: active) {
        .line[data-highlight] {
          outline: 1px solid Highlight;
        }
      }
    `,
  ];

  static override properties = {
    language: { type: String },
    code: { type: String },
    lineNumbers: { type: Boolean, attribute: 'line-numbers', reflect: true },
    highlightLines: { type: String, attribute: 'highlight-lines' },
    wrap: { type: Boolean, reflect: true },
    filename: { type: String },
    copyable: { type: Boolean },
    _slotted: { state: true },
  };

  declare language: string;
  declare code: string;
  declare lineNumbers: boolean;
  declare highlightLines: string;
  declare wrap: boolean;
  declare filename: string;
  declare copyable: boolean;
  /** @internal */
  declare _slotted: string;

  constructor() {
    super();
    this.language = 'plaintext';
    this.code = '';
    this.lineNumbers = false;
    this.highlightLines = '';
    this.wrap = false;
    this.filename = '';
    this.copyable = true;
    this._slotted = '';
  }

  /** The source text currently shown: `code`, else the slotted text. */
  get source(): string {
    return (this.code || this._slotted).replace(/^\n+|\s+$/g, '');
  }

  #readSlot = (): void => {
    this._slotted = this.textContent ?? '';
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.#readSlot();
  }

  protected override render() {
    const source = this.source;
    const highlighter = highlighters.get(this.language.toLowerCase());
    const tokens: CodeToken[] = highlighter
      ? highlighter(source)
      : [{ text: source }];
    const lines = splitLines(tokens);
    const marked = parseLineRanges(this.highlightLines);
    const hasHeader = !!this.filename;
    const copy = this.copyable
      ? html`<bx-copy-button
          class="copy-button"
          part="copy-button"
          size="small"
          appearance="plain"
          variant="secondary"
          .value=${source}
        ></bx-copy-button>`
      : nothing;
    return html`<div class="base" part="base">
      ${
        hasHeader
          ? html`<div class="header" part="header">
              <slot name="header"><span>${this.filename}</span></slot>
              ${copy}
            </div>`
          : nothing
      }
      <div class="body">
        ${hasHeader ? nothing : copy}
        <pre
          part="pre"
          tabindex="0"
          role="region"
          aria-label=${
            this.filename ||
            (this.language !== 'plaintext' ? `${this.language} code` : 'Code')
          }
        ><code>${lines.map(
          (line, i) =>
            html`<span
              class="line"
              part="line"
              ?data-highlight=${marked.has(i + 1)}
              ><span class="line-number" part="line-number" aria-hidden="true"
                >${this.lineNumbers ? i + 1 : nothing}</span
              ><span class="text"
                >${line.map((t) =>
                  t.type
                    ? html`<span class="t-${t.type}">${t.text}</span>`
                    : t.text,
                )}${line.length ? nothing : '\n'}</span
              ></span
            >`,
        )}</code></pre>
      </div>
      <slot style="display:none" @slotchange=${this.#readSlot}></slot>
    </div>`;
  }
}
