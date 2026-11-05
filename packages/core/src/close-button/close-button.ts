import { css, html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';

/**
 * `<bx-close-button>` — the standard dismiss control (×) (docs/features/core/close-button.md).
 *
 * A thin specialisation of `bx-icon-button` with a fixed `close` icon and a localisable default
 * label (FR-CLOSEBUTTON-01). Activation emits a cancelable `bx-close`; Escape handling stays in
 * the owning overlay (FR-CLOSEBUTTON-03).
 *
 * @fires click - Native click.
 * @fires bx-close - Activation. Bubbles, composed, cancelable.
 *
 * @csspart base - The button surface.
 * @csspart icon - The × glyph.
 *
 * @cssprop --bx-close-button-size - Hit target size. Default `var(--bx-target-min)`.
 * @cssprop --bx-close-button-icon-size - Glyph size. Default `0.875em`.
 */
export class BxCloseButton extends BixElement {
  static override tagName = 'bx-close-button';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-block;
        vertical-align: middle;
      }

      .base {
        --bx-icon-button-size: var(
          --bx-close-button-size,
          var(--bx-target-min)
        );
        --bx-icon-button-icon-size: var(--bx-close-button-icon-size, 0.875em);
      }

      :host([size='s']) .base {
        --bx-icon-button-size: var(
          --bx-close-button-size,
          max(var(--bx-control-height-s), var(--bx-target-min))
        );
      }
      :host([size='l']) .base {
        --bx-icon-button-size: var(
          --bx-close-button-size,
          max(var(--bx-control-height-l), var(--bx-target-min))
        );
      }
    `,
  ];

  static override properties = {
    label: { type: String },
    size: { type: String, reflect: true },
    appearance: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  declare label: string;
  declare size: 's' | 'm' | 'l';
  declare appearance: 'plain' | 'filled';
  declare disabled: boolean;

  #baseRef = createRef<HTMLElement>();

  constructor() {
    super();
    this.label = 'Close';
    this.size = 'm';
    this.appearance = 'plain';
    this.disabled = false;
  }

  override focus(options?: FocusOptions): void {
    this.#baseRef.value?.focus(options);
  }

  override blur(): void {
    this.#baseRef.value?.blur();
  }

  #onClick = (): void => {
    if (this.disabled) return;
    this.dispatchEvent(
      new CustomEvent('bx-close', {
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
  };

  protected override render() {
    return html`<bx-icon-button
      ${ref(this.#baseRef)}
      class="base"
      part="base"
      exportparts="icon"
      name="close"
      label=${this.label}
      size=${this.size}
      appearance=${this.appearance}
      ?disabled=${this.disabled}
      @click=${this.#onClick}
    ></bx-icon-button>`;
  }
}
