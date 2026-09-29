import { css, html } from 'lit';
import { BixElement } from '../bix-element.ts';

type Orientation = 'horizontal' | 'vertical';

/**
 * `<bx-divider>` — horizontal or vertical rule.
 *
 * A hairline separator between content groups. `orientation="vertical"` requires a sizing
 * context (flex/grid item, or an explicit block-size) since a vertical rule has no intrinsic
 * height of its own — the same constraint every vertical `<hr>`-alike has.
 *
 * @cssprop --bx-divider-color - Rule color. Default `--bx-border-subtle`.
 * @cssprop --bx-divider-width - Rule thickness. Default `--bx-border-width` (1 device px, the
 * only fixed-px exception per docs/features/_conventions.md §2).
 * @cssprop --bx-divider-spacing - Margin on the axis perpendicular to the rule. Default `--bx-space-m`.
 */
export class BxDivider extends BixElement {
  static override tagName = 'bx-divider';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        inline-size: 100%;
        block-size: var(--bx-divider-width, var(--bx-border-width));
        margin-block: var(--bx-divider-spacing, var(--bx-space-m));
        background: var(--bx-divider-color, var(--bx-border-subtle));
        flex-shrink: 0;
      }

      :host([orientation='vertical']) {
        display: inline-block;
        inline-size: var(--bx-divider-width, var(--bx-border-width));
        block-size: 100%;
        margin-block: 0;
        margin-inline: var(--bx-divider-spacing, var(--bx-space-m));
        align-self: stretch;
      }

      @media (forced-colors: active) {
        :host {
          background: CanvasText;
        }
      }
    `,
  ];

  static override properties = {
    orientation: { type: String, reflect: true },
  };

  declare orientation: Orientation;

  constructor() {
    super();
    this.orientation = 'horizontal';
  }

  protected override updated(): void {
    this.setAttribute('role', 'separator');
    this.setAttribute(
      'aria-orientation',
      this.orientation === 'vertical' ? 'vertical' : 'horizontal',
    );
  }

  protected override render() {
    return html``;
  }
}
