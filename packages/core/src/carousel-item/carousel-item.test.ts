import { expect, fixture, html } from '@open-wc/testing';
import type { BxCarouselItem } from './carousel-item.ts';
import './index.ts';

describe('bx-carousel-item', () => {
  it('registers the tag with role=group', async () => {
    const el = await fixture<BxCarouselItem>(html`<bx-carousel-item></bx-carousel-item>`);
    expect(el).to.be.instanceOf(customElements.get('bx-carousel-item')!);
    expect(el.getAttribute('role')).to.equal('group');
  });

  it('sets aria-label from the label property', async () => {
    const el = await fixture<BxCarouselItem>(
      html`<bx-carousel-item .label=${'2 of 5'}></bx-carousel-item>`,
    );
    expect(el.getAttribute('aria-label')).to.equal('2 of 5');
  });

  it('renders slotted content', async () => {
    const el = await fixture<BxCarouselItem>(
      html`<bx-carousel-item><img alt="slide" /></bx-carousel-item>`,
    );
    expect(el.querySelector('img')).to.exist;
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxCarouselItem>(
      html`<bx-carousel-item .label=${'1 of 3'}>Slide</bx-carousel-item>`,
    );
    await expect(el).to.be.accessible();
  });
});
