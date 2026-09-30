import { expect, fixture, html } from '@open-wc/testing';
import type { BxTabPanel } from './tab-panel.ts';
import './index.ts';

describe('bx-tab-panel', () => {
  it('registers the tag with role=tabpanel', async () => {
    const el = await fixture<BxTabPanel>(
      html`<bx-tab-panel>Content</bx-tab-panel>`,
    );
    expect(el).to.be.instanceOf(customElements.get('bx-tab-panel')!);
    expect(el.getAttribute('role')).to.equal('tabpanel');
  });

  it('is hidden via the hidden attribute when inactive', async () => {
    const el = await fixture<BxTabPanel>(
      html`<bx-tab-panel>Content</bx-tab-panel>`,
    );
    expect(el.hidden).to.be.true;
    expect(getComputedStyle(el).display).to.equal('none');
  });

  it('removes hidden when active', async () => {
    const el = await fixture<BxTabPanel>(
      html`<bx-tab-panel active>Content</bx-tab-panel>`,
    );
    expect(el.hidden).to.be.false;
  });

  it('toggles hidden reactively', async () => {
    const el = await fixture<BxTabPanel>(
      html`<bx-tab-panel>Content</bx-tab-panel>`,
    );
    el.active = true;
    await el.updateComplete;
    expect(el.hidden).to.be.false;
    el.active = false;
    await el.updateComplete;
    expect(el.hidden).to.be.true;
  });

  it('has no axe violations when active', async () => {
    const el = await fixture<BxTabPanel>(
      html`<bx-tab-panel active aria-label="Panel">Content</bx-tab-panel>`,
    );
    await expect(el).to.be.accessible();
  });
});
