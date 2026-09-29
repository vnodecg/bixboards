import { expect, fixture, html } from '@open-wc/testing';
import type { BxSpinner } from './spinner.ts';
import './index.ts';

describe('bx-spinner', () => {
  it('registers the tag with progressbar semantics and no value', async () => {
    const el = await fixture<BxSpinner>(
      html`<bx-spinner aria-label="Loading"></bx-spinner>`,
    );
    expect(el).to.be.instanceOf(customElements.get('bx-spinner')!);
    expect(el.getAttribute('role')).to.equal('progressbar');
    expect(el.hasAttribute('aria-valuenow')).to.be.false;
  });

  it('renders a track and an indicator circle', async () => {
    const el = await fixture<BxSpinner>(
      html`<bx-spinner aria-label="Loading"></bx-spinner>`,
    );
    expect(el.shadowRoot!.querySelector('circle.track')).to.exist;
    expect(el.shadowRoot!.querySelector('circle.indicator')).to.exist;
  });

  it('has no axe violations when given an accessible label', async () => {
    const el = await fixture<BxSpinner>(
      html`<bx-spinner aria-label="Loading"></bx-spinner>`,
    );
    await expect(el).to.be.accessible();
  });
});
