import { expect, fixture, html } from '@open-wc/testing';
import type { BxSkeleton } from './skeleton.ts';
import './index.ts';

describe('bx-skeleton', () => {
  it('registers the tag, aria-hidden, effect none by default', async () => {
    const el = await fixture<BxSkeleton>(html`<bx-skeleton></bx-skeleton>`);
    expect(el).to.be.instanceOf(customElements.get('bx-skeleton')!);
    expect(el.effect).to.equal('none');
    expect(el.getAttribute('aria-hidden')).to.equal('true');
  });

  it('reflects the effect attribute and renders the indicator part', async () => {
    const el = await fixture<BxSkeleton>(
      html`<bx-skeleton effect="sheen"></bx-skeleton>`,
    );
    expect(el.hasAttribute('effect')).to.be.true;
    expect(el.shadowRoot!.querySelector('[part="indicator"]')).to.exist;
  });

  it('starts assuming visible before the intersection observer reports', async () => {
    const el = await fixture<BxSkeleton>(
      html`<bx-skeleton effect="pulse"></bx-skeleton>`,
    );
    expect(
      el.shadowRoot!.querySelector('.indicator')!.classList.contains('paused'),
    ).to.be.false;
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxSkeleton>(
      html`<bx-skeleton effect="pulse"></bx-skeleton>`,
    );
    await expect(el).to.be.accessible();
  });
});
