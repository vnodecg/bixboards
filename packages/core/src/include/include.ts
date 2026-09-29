import { css, html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';

type FetchMode = 'cors' | 'no-cors' | 'same-origin';

// Attributes that can carry a script-executing URI/handler on any element (not just the obvious
// `on*` set — `href`/`src`/`action`/`formaction`/`data` all accept a `javascript:` URI).
const EVENT_ATTR_PREFIX = 'on';
const URI_ATTRS = new Set([
  'href',
  'src',
  'action',
  'formaction',
  'data',
  'xlink:href',
]);

function isJsUri(value: string): boolean {
  return /^\s*javascript:/i.test(value);
}

/**
 * Strips `<script>` elements (unless `allowScripts`) and any script-executing attribute
 * (`on*` handlers, `javascript:` URIs) from `root`'s subtree in place (FR-INCLUDE-01).
 */
function sanitize(root: DocumentFragment, allowScripts: boolean): void {
  if (!allowScripts)
    for (const el of [...root.querySelectorAll('script')]) el.remove();

  for (const el of root.querySelectorAll('*')) {
    for (const attr of [...el.attributes]) {
      const name = attr.name.toLowerCase();
      if (name.startsWith(EVENT_ATTR_PREFIX)) el.removeAttribute(attr.name);
      else if (URI_ATTRS.has(name) && isJsUri(attr.value))
        el.removeAttribute(attr.name);
    }
  }
}

/** Re-creates every `<script>` under `root` so the browser executes it (assigning `innerHTML` does not). */
function executeScripts(root: Element): void {
  for (const original of [...root.querySelectorAll('script')]) {
    const clone = document.createElement('script');
    for (const attr of [...original.attributes])
      clone.setAttribute(attr.name, attr.value);
    clone.textContent = original.textContent;
    original.replaceWith(clone);
  }
}

/**
 * `<bx-include>` — fetches remote HTML and inlines it into a shadow-DOM container.
 *
 * The response is parsed with `DOMParser` and sanitized (`<script>` elements and script-executing
 * attributes stripped) before insertion, unless `allow-scripts` opts in (FR-INCLUDE-01) — even
 * then, scripts are re-created rather than left as inert markup so they actually run
 * ({@link executeScripts}), since assigning `innerHTML` never executes embedded `<script>` tags.
 *
 * Changing `src` aborts any in-flight request for the previous one (FR-INCLUDE-02).
 *
 * @fires bx-load - The include finished fetching and inserting content. `detail: { url: string }`.
 * @fires bx-error - The fetch or parse failed. `detail: { url: string, error: unknown }`.
 *
 * @csspart base - The container the fetched content is inserted into.
 */
export class BxInclude extends BixElement {
  static override tagName = 'bx-include';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: contents;
      }
    `,
  ];

  static override properties = {
    src: { type: String },
    mode: { type: String },
    allowScripts: { type: Boolean, attribute: 'allow-scripts' },
  };

  declare src: string;
  declare mode: FetchMode;
  declare allowScripts: boolean;

  #container = createRef<HTMLDivElement>();
  #abortController?: AbortController;

  constructor() {
    super();
    this.src = '';
    this.mode = 'cors';
    this.allowScripts = false;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#abortController?.abort();
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has('src')) void this.#load();
  }

  async #load(): Promise<void> {
    this.#abortController?.abort();
    const container = this.#container.value;
    if (!container) return;

    container.replaceChildren();
    if (!this.src) return;

    const controller = new AbortController();
    this.#abortController = controller;
    const url = this.src;

    try {
      const response = await fetch(url, {
        mode: this.mode,
        signal: controller.signal,
      });
      if (!response.ok)
        throw new Error(`${response.status} ${response.statusText}`);
      const text = await response.text();
      if (controller.signal.aborted) return;

      // Parsed as a `<template>` fragment (not via `DOMParser`'s full-document mode): a
      // full-document parse can place a lone top-level `<script>` under the synthesized `<head>`
      // instead of `<body>`, which would silently drop it from a body-only walk.
      const template = document.createElement('template');
      template.innerHTML = text;
      sanitize(template.content, this.allowScripts);

      container.replaceChildren(...template.content.childNodes);
      if (this.allowScripts) executeScripts(container);

      this.dispatchEvent(
        new CustomEvent('bx-load', {
          bubbles: true,
          composed: true,
          detail: { url },
        }),
      );
    } catch (error) {
      if (controller.signal.aborted) return;
      this.dispatchEvent(
        new CustomEvent('bx-error', {
          bubbles: true,
          composed: true,
          detail: { url, error },
        }),
      );
    }
  }

  protected override render() {
    return html`<div part="base" ${ref(this.#container)}></div>`;
  }
}
