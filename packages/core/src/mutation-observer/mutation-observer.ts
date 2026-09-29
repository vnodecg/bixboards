import { css, html } from 'lit';
import { BixElement } from '../bix-element.ts';

/**
 * `<bx-mutation-observer>` — declaratively observes its own light-DOM subtree for attribute,
 * character-data and/or child-list changes, firing `bx-mutation` with the batched records.
 *
 * Native `MutationObserver` already invokes its callback once per microtask with every record
 * collected since the last callback (FR-MUTATION-OBSERVER-01); this component does not add its
 * own batching on top of that.
 *
 * @fires bx-mutation - One or more mutations occurred. `detail: { mutationList: MutationRecord[] }`.
 *
 * @slot (default) - Content whose mutations are tracked.
 */
export class BxMutationObserver extends BixElement {
  static override tagName = 'bx-mutation-observer';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: contents;
      }
    `,
  ];

  static override properties = {
    attr: { type: String },
    attrOldValue: { type: Boolean, attribute: 'attr-old-value' },
    charData: { type: Boolean, attribute: 'char-data' },
    charDataOldValue: { type: Boolean, attribute: 'char-data-old-value' },
    childList: { type: Boolean, attribute: 'child-list' },
    disabled: { type: Boolean },
  };

  declare attr?: string;
  declare attrOldValue: boolean;
  declare charData: boolean;
  declare charDataOldValue: boolean;
  declare childList: boolean;
  declare disabled: boolean;

  #observer?: MutationObserver;

  constructor() {
    super();
    this.attrOldValue = false;
    this.charData = false;
    this.charDataOldValue = false;
    this.childList = false;
    this.disabled = false;
  }

  #teardown(): void {
    this.#observer?.disconnect();
    this.#observer = undefined;
  }

  #setup(): void {
    this.#teardown();
    if (this.disabled || typeof MutationObserver === 'undefined') return;

    const attributeFilter = this.attr
      ? this.attr.split(',').map((name) => name.trim())
      : undefined;
    const observeAttributes =
      attributeFilter !== undefined || this.attrOldValue;

    // `MutationObserver.observe` throws unless at least one of these is set; with none of
    // `attr`/`char-data`/`child-list` given there is nothing to watch.
    if (!observeAttributes && !this.charData && !this.childList) return;

    this.#observer = new MutationObserver((mutationList) => {
      this.dispatchEvent(
        new CustomEvent('bx-mutation', {
          bubbles: true,
          composed: true,
          detail: { mutationList },
        }),
      );
    });

    this.#observer.observe(this, {
      subtree: true,
      childList: this.childList,
      characterData: this.charData,
      characterDataOldValue: this.charData && this.charDataOldValue,
      attributes: observeAttributes,
      attributeFilter,
      attributeOldValue: this.attrOldValue,
    });
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#setup();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#teardown();
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (
      changed.has('attr') ||
      changed.has('attrOldValue') ||
      changed.has('charData') ||
      changed.has('charDataOldValue') ||
      changed.has('childList') ||
      changed.has('disabled')
    )
      this.#setup();
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}
