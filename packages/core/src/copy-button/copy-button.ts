import { css, html, nothing, type PropertyValues } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';
import type { BxButton } from '../button/button.ts';
import type { BxTooltip } from '../tooltip/tooltip.ts';
import type { Placement } from '../popup/popup.ts';

type State = 'idle' | 'success' | 'error';

/**
 * Resolves a `from` reference (`id`, `id[attr]` or `id.prop`) to text, looking the element up in
 * `root` — the copy button's own root node, so it works from inside a shadow tree (FR-COPY-BUTTON-02).
 */
function resolveFrom(reference: string, root: Document | ShadowRoot): string {
  const attrMatch = /^([^[\].]+)\[([^\]]+)\]$/.exec(reference);
  const propMatch = /^([^[\].]+)\.(.+)$/.exec(reference);
  const id = attrMatch?.[1] ?? propMatch?.[1] ?? reference;
  const element = root.getElementById?.(id) ?? document.getElementById(id);
  if (!element) throw new Error(`No element with id "${id}".`);

  if (attrMatch) {
    const value = element.getAttribute(attrMatch[2]!);
    if (value === null)
      throw new Error(`"${id}" has no "${attrMatch[2]}" attribute.`);
    return value;
  }
  if (propMatch) {
    const value = (element as unknown as Record<string, unknown>)[
      propMatch[2]!
    ];
    if (value === undefined)
      throw new Error(`"${id}" has no "${propMatch[2]}" property.`);
    return String(value);
  }
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement
  )
    return element.value;
  return element.textContent ?? '';
}

/** `execCommand('copy')` fallback for insecure contexts, where `navigator.clipboard` is absent. */
function legacyCopy(text: string): void {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.cssText = 'position:fixed;inset-block-start:0;opacity:0;';
  document.body.append(textarea);
  textarea.select();
  const ok = document.execCommand('copy');
  textarea.remove();
  if (!ok) throw new Error('execCommand("copy") was rejected.');
}

/**
 * `<bx-copy-button>` — one-click copy of text, a property, or another element's content to the
 * clipboard, with success/error feedback (docs/features/core/copy-button.md).
 *
 * A composite of existing pieces rather than a bespoke control: a `bx-button` (plain appearance,
 * icon-only) anchors a `bx-tooltip` whose text is the current label — the copy prompt at rest, then
 * the success/error message for `feedback-duration` after an attempt. The icons are `bx-icon`s
 * (`copy`, `check`, `warning`) behind slots, so anything slotted replaces them. Because it is a
 * real `bx-button`, `disabled`, focus ring, hit-target size and forced-colors handling are all
 * inherited, and `bx-button-group` can square its corners (`--bx-button-radius` inherits into it).
 *
 * The accessible name is the current label (FR-COPY-BUTTON accessibility): it is forwarded onto the
 * inner button as `aria-label`, and each state change is announced through a visually hidden
 * polite live region (FR-COPY-BUTTON-03) — the tooltip alone is not exposed to assistive tech.
 *
 * The success/error colors default to the design system's success/danger role tokens; the spec's
 * `--bx-success-color`/`--bx-error-color` are prefixed with the component name here
 * (`--bx-copy-button-success-color`) to follow the package's custom-property naming rule.
 *
 * @fires bx-copy - The text was written to the clipboard. `detail.value` is the copied text.
 * @fires bx-error - Copying failed. `detail.reason` describes why.
 *
 * The inner button's look is passed through: `variant` (default `secondary`), `appearance` (default
 * `plain`) and `size` — not in the spec's property table, but needed so it can match its siblings
 * (`bx-button-group` forces `variant`/`size` on it like on any `bx-button`).
 *
 * @slot copy-icon - Icon shown at rest. Default: the `copy` icon.
 * @slot success-icon - Icon shown after a successful copy. Default: the `check` icon.
 * @slot error-icon - Icon shown after a failed copy. Default: the `warning` icon.
 *
 * @csspart button - The inner `bx-button`.
 * @csspart copy-icon - The wrapper around the copy icon.
 * @csspart success-icon - The wrapper around the success icon.
 * @csspart error-icon - The wrapper around the error icon.
 * @csspart tooltip - The inner `bx-tooltip`.
 *
 * @cssprop --bx-copy-button-success-color - Icon color while showing success. Default `--bx-role-success-fg`.
 * @cssprop --bx-copy-button-error-color - Icon color while showing an error. Default `--bx-role-danger-fg`.
 */
export class BxCopyButton extends BixElement {
  static override tagName = 'bx-copy-button';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-block;
        vertical-align: middle;
      }

      bx-tooltip {
        display: contents;
      }

      bx-button {
        --bx-button-padding-inline: var(--bx-space-s);
      }

      .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1em;
      }

      .icon[hidden] {
        display: none;
      }

      .success {
        color: var(--bx-copy-button-success-color, var(--bx-role-success-fg));
      }

      .error {
        color: var(--bx-copy-button-error-color, var(--bx-role-danger-fg));
      }

      .live {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }
    `,
  ];

  static override properties = {
    value: { type: String },
    from: { type: String },
    disabled: { type: Boolean, reflect: true },
    variant: { type: String, reflect: true },
    appearance: { type: String, reflect: true },
    size: { type: String, reflect: true },
    copyLabel: { type: String, attribute: 'copy-label' },
    successLabel: { type: String, attribute: 'success-label' },
    errorLabel: { type: String, attribute: 'error-label' },
    feedbackDuration: { type: Number, attribute: 'feedback-duration' },
    tooltipPlacement: { type: String, attribute: 'tooltip-placement' },
    _state: { state: true },
  };

  declare value: string;
  declare from: string;
  declare disabled: boolean;
  declare variant: string;
  declare appearance: string;
  declare size: string;
  declare copyLabel: string;
  declare successLabel: string;
  declare errorLabel: string;
  declare feedbackDuration: number;
  declare tooltipPlacement: Placement;
  /** @internal */
  declare _state: State;

  #buttonRef = createRef<BxButton>();
  #tooltipRef = createRef<BxTooltip>();
  #timer?: ReturnType<typeof setTimeout>;

  constructor() {
    super();
    this.value = '';
    this.from = '';
    this.disabled = false;
    this.variant = 'secondary';
    this.appearance = 'plain';
    this.size = 'medium';
    this.copyLabel = 'Copy';
    this.successLabel = 'Copied';
    this.errorLabel = 'Error';
    this.feedbackDuration = 1000;
    this.tooltipPlacement = 'top';
    this._state = 'idle';
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this.#timer);
  }

  get #label(): string {
    return this._state === 'success'
      ? this.successLabel
      : this._state === 'error'
        ? this.errorLabel
        : this.copyLabel;
  }

  protected override updated(changed: PropertyValues<this>): void {
    // `bx-button` only re-reads its host `aria-label` when it re-renders, and an attribute change
    // doesn't schedule that — nudge it whenever this component's own render changed the label.
    if (changed.has('_state') || changed.has('copyLabel'))
      this.#buttonRef.value?.requestUpdate();
  }

  /** Copies `value` (or the `from` reference) to the clipboard and shows feedback. */
  async copy(): Promise<void> {
    if (this.disabled) return;
    let text: string;
    try {
      if (!this.value && !this.from)
        throw new Error('Nothing to copy: set `value` or `from`.');
      text =
        this.value ||
        resolveFrom(this.from, this.getRootNode() as Document | ShadowRoot);
      if (navigator.clipboard?.writeText)
        await navigator.clipboard.writeText(text);
      else legacyCopy(text);
    } catch (error) {
      this.#finish('error');
      this.dispatchEvent(
        new CustomEvent('bx-error', {
          bubbles: true,
          composed: true,
          detail: {
            reason: error instanceof Error ? error.message : String(error),
          },
        }),
      );
      return;
    }
    this.#finish('success');
    this.dispatchEvent(
      new CustomEvent('bx-copy', {
        bubbles: true,
        composed: true,
        detail: { value: text },
      }),
    );
  }

  #finish(state: State): void {
    clearTimeout(this.#timer);
    this._state = state;
    void this.updateComplete.then(() => this.#tooltipRef.value?.show());
    this.#timer = setTimeout(() => {
      this._state = 'idle';
      this.#tooltipRef.value?.hide();
    }, this.feedbackDuration);
  }

  /** Focuses the inner button. */
  override focus(options?: FocusOptions): void {
    this.#buttonRef.value?.focus(options);
  }

  protected override render() {
    const state = this._state;
    return html`
      <bx-tooltip
        ${ref(this.#tooltipRef)}
        part="tooltip"
        placement=${this.tooltipPlacement}
      >
        <bx-button
          ${ref(this.#buttonRef)}
          slot="anchor"
          part="button"
          appearance=${this.appearance}
          variant=${this.variant}
          size=${this.size}
          aria-label=${this.#label}
          ?disabled=${this.disabled}
          @click=${this.copy}
        >
          <span class="icon" part="copy-icon" ?hidden=${state !== 'idle'}>
            <slot name="copy-icon"><bx-icon name="copy"></bx-icon></slot>
          </span>
          <span
            class="icon success"
            part="success-icon"
            ?hidden=${state !== 'success'}
          >
            <slot name="success-icon"><bx-icon name="check"></bx-icon></slot>
          </span>
          <span
            class="icon error"
            part="error-icon"
            ?hidden=${state !== 'error'}
          >
            <slot name="error-icon"><bx-icon name="warning"></bx-icon></slot>
          </span>
        </bx-button>
        ${this.#label}
      </bx-tooltip>
      <span class="live" role="status" aria-live="polite"
        >${state === 'idle' ? nothing : this.#label}</span
      >
    `;
  }
}
