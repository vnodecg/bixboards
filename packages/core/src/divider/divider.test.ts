import { expect, fixture, html } from '@open-wc/testing';
import type { BxDivider } from './divider.ts';
import './index.ts';

describe('bx-divider', () => {
  it('registers the tag with separator semantics, horizontal by default', async () => {
    const el = await fixture<BxDivider>(html`<bx-divider></bx-divider>`);
    expect(el).to.be.instanceOf(customElements.get('bx-divider')!);
    expect(el.orientation).to.equal('horizontal');
    expect(el.getAttribute('role')).to.equal('separator');
    expect(el.getAttribute('aria-orientation')).to.equal('horizontal');
  });

  it('reflects orientation and updates aria-orientation', async () => {
    const el = await fixture<BxDivider>(
      html`<bx-divider orientation="vertical"></bx-divider>`,
    );
    expect(el.hasAttribute('orientation')).to.be.true;
    expect(el.getAttribute('aria-orientation')).to.equal('vertical');

    el.orientation = 'horizontal';
    await el.updateComplete;
    expect(el.getAttribute('aria-orientation')).to.equal('horizontal');
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxDivider>(html`<bx-divider></bx-divider>`);
    await expect(el).to.be.accessible();
  });
});
