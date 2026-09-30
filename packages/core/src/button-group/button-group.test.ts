import { expect, fixture, html } from '@open-wc/testing';
import type { BxButton } from '../button/button.ts';
import type { BxCopyButton } from '../copy-button/copy-button.ts';
import type { BxButtonGroup } from './button-group.ts';
import './index.ts';
import '../copy-button/index.ts';
import '../tooltip/index.ts';

const radius = (button: Element, corner: string) =>
  getComputedStyle(button.shadowRoot!.querySelector('.base')!).getPropertyValue(
    `border-${corner}-radius`,
  );

async function trio(orientation = 'horizontal') {
  const group = await fixture<BxButtonGroup>(html`
    <bx-button-group label="Text alignment" orientation=${orientation}>
      <bx-button>Left</bx-button>
      <bx-button>Center</bx-button>
      <bx-button>Right</bx-button>
    </bx-button-group>
  `);
  const buttons = [...group.querySelectorAll<BxButton>('bx-button')];
  await Promise.all(buttons.map((b) => b.updateComplete));
  return { group, buttons };
}

describe('bx-button-group', () => {
  it('registers the tag and exposes role="group" with its label', async () => {
    const { group } = await trio();
    expect(group).to.be.instanceOf(customElements.get('bx-button-group')!);
    const base = group.shadowRoot!.querySelector('[part="base"]')!;
    expect(base.getAttribute('role')).to.equal('group');
    expect(base.getAttribute('aria-label')).to.equal('Text alignment');
  });

  it('rounds only the outer corners of a horizontal group', async () => {
    const { buttons } = await trio();
    const [first, middle, last] = buttons;
    expect(radius(first!, 'top-left')).to.not.equal('0px');
    expect(radius(first!, 'bottom-left')).to.not.equal('0px');
    expect(radius(first!, 'top-right')).to.equal('0px');
    expect(radius(middle!, 'top-left')).to.equal('0px');
    expect(radius(middle!, 'top-right')).to.equal('0px');
    expect(radius(last!, 'top-right')).to.not.equal('0px');
    expect(radius(last!, 'top-left')).to.equal('0px');
  });

  it('rounds the top and bottom edges of a vertical group', async () => {
    const { buttons } = await trio('vertical');
    const first = buttons[0]!;
    const last = buttons[2]!;
    expect(radius(first, 'top-left')).to.not.equal('0px');
    expect(radius(first, 'top-right')).to.not.equal('0px');
    expect(radius(first, 'bottom-left')).to.equal('0px');
    expect(radius(last, 'bottom-left')).to.not.equal('0px');
    expect(radius(last, 'top-left')).to.equal('0px');
  });

  it('flips the outer rounding in RTL', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div dir="rtl">
        <bx-button-group label="g">
          <bx-button>A</bx-button>
          <bx-button>B</bx-button>
        </bx-button-group>
      </div>
    `);
    const [first, last] = [...wrapper.querySelectorAll<BxButton>('bx-button')];
    await first!.updateComplete;
    await last!.updateComplete;
    expect(radius(first!, 'top-right')).to.not.equal('0px');
    expect(radius(first!, 'top-left')).to.equal('0px');
    expect(radius(last!, 'top-left')).to.not.equal('0px');
  });

  it('a single item keeps all four corners', async () => {
    const group = await fixture<BxButtonGroup>(
      html`<bx-button-group><bx-button>Only</bx-button></bx-button-group>`,
    );
    const button = group.querySelector<BxButton>('bx-button')!;
    await button.updateComplete;
    expect(radius(button, 'top-left')).to.not.equal('0px');
    expect(radius(button, 'top-right')).to.not.equal('0px');
  });

  it('overlaps neighbouring borders by one border width', async () => {
    const { buttons } = await trio();
    const a = buttons[0]!.getBoundingClientRect();
    const b = buttons[1]!.getBoundingClientRect();
    expect(a.right - b.left).to.be.greaterThan(0);
    expect(getComputedStyle(buttons[0]!).marginInlineStart).to.equal('0px');
  });

  it('raises the focused item above its neighbours', async () => {
    const { buttons } = await trio();
    buttons[1]!.focus();
    expect(getComputedStyle(buttons[1]!).zIndex).to.equal('1');
    expect(getComputedStyle(buttons[0]!).zIndex).to.equal('auto');
  });

  it('forces variant and size onto descendant buttons when set', async () => {
    const { group, buttons } = await trio();
    group.variant = 'secondary';
    group.size = 'small';
    await group.updateComplete;
    for (const button of buttons) {
      expect(button.getAttribute('variant')).to.equal('secondary');
      expect(button.getAttribute('size')).to.equal('small');
    }
  });

  it('leaves buttons alone when variant/size are unset', async () => {
    const group = await fixture<BxButtonGroup>(html`
      <bx-button-group>
        <bx-button variant="error">A</bx-button>
        <bx-button>B</bx-button>
      </bx-button-group>
    `);
    expect(
      group.querySelector<BxButton>('bx-button')!.getAttribute('variant'),
    ).to.equal('error');
  });

  it('composes bx-copy-button and tooltip-wrapped buttons', async () => {
    const group = await fixture<BxButtonGroup>(html`
      <bx-button-group label="Actions">
        <bx-button>Save</bx-button>
        <bx-tooltip>
          Delete it
          <bx-button slot="anchor" aria-label="Delete">✕</bx-button>
        </bx-tooltip>
        <bx-copy-button value="x"></bx-copy-button>
      </bx-button-group>
    `);
    const tooltip = group.querySelector('bx-tooltip')!;
    const copy = group.querySelector<BxCopyButton>('bx-copy-button')!;
    await copy.updateComplete;
    const anchor = tooltip.querySelector<BxButton>('bx-button')!;
    await anchor.updateComplete;
    // `inline-flex` (set by the group) blockifies to `flex` as a flex item.
    expect(getComputedStyle(tooltip).display).to.equal('flex');
    // Middle item is fully squared; the last item's inner bx-button inherits the end rounding.
    expect(radius(anchor, 'top-left')).to.equal('0px');
    expect(radius(anchor, 'top-right')).to.equal('0px');
    const inner = copy.shadowRoot!.querySelector<BxButton>('bx-button')!;
    await inner.updateComplete;
    expect(radius(inner, 'top-left')).to.equal('0px');
    expect(radius(inner, 'top-right')).to.not.equal('0px');
  });

  it('is accessible', async () => {
    const { group } = await trio();
    await expect(group).to.be.accessible();
  });

  it('scales to many buttons', async () => {
    const group = await fixture<BxButtonGroup>(html`
      <bx-button-group label="Many">
        ${Array.from(
          { length: 300 },
          (_, i) => html`<bx-button>${i}</bx-button>`,
        )}
      </bx-button-group>
    `);
    const buttons = group.querySelectorAll<BxButton>('bx-button');
    await buttons[299]!.updateComplete;
    await buttons[0]!.updateComplete;
    expect(radius(buttons[0]!, 'top-left')).to.not.equal('0px');
    expect(radius(buttons[150]!, 'top-left')).to.equal('0px');
    expect(radius(buttons[299]!, 'top-right')).to.not.equal('0px');
  });
});
