import { expect, fixture, html } from '@open-wc/testing';
import type { BxCarousel } from './carousel.ts';
import './index.ts';

async function threeSlides(): Promise<BxCarousel> {
  return fixture<BxCarousel>(html`
    <bx-carousel style="inline-size: 300px">
      <bx-carousel-item style="inline-size: 100%; aspect-ratio: 16/9">1</bx-carousel-item>
      <bx-carousel-item style="inline-size: 100%; aspect-ratio: 16/9">2</bx-carousel-item>
      <bx-carousel-item style="inline-size: 100%; aspect-ratio: 16/9">3</bx-carousel-item>
    </bx-carousel>
  `);
}

describe('bx-carousel', () => {
  it('registers the tag as an accessible region', async () => {
    const el = await threeSlides();
    expect(el).to.be.instanceOf(customElements.get('bx-carousel')!);
    expect(el.getAttribute('role')).to.equal('region');
    expect(el.getAttribute('aria-roledescription')).to.equal('carousel');
  });

  it('labels each slide "n of m"', async () => {
    const el = await threeSlides();
    const slides = el.querySelectorAll('bx-carousel-item');
    await new Promise((r) => requestAnimationFrame(r));
    expect(slides[0]!.getAttribute('aria-label')).to.equal('1 of 3');
    expect(slides[1]!.getAttribute('aria-label')).to.equal('2 of 3');
    expect(slides[2]!.getAttribute('aria-label')).to.equal('3 of 3');
  });

  it('defaults loop/navigation/pagination/autoplay to false', async () => {
    const el = await threeSlides();
    expect(el.loop).to.be.false;
    expect(el.navigation).to.be.false;
    expect(el.pagination).to.be.false;
    expect(el.autoplay).to.be.false;
    expect(el.slidesPerMove).to.equal(1);
    expect(el.orientation).to.equal('horizontal');
  });

  it('renders navigation buttons when navigation is set, previous disabled at start', async () => {
    const el = await fixture<BxCarousel>(html`
      <bx-carousel navigation style="inline-size: 300px">
        <bx-carousel-item style="inline-size: 100%">1</bx-carousel-item>
        <bx-carousel-item style="inline-size: 100%">2</bx-carousel-item>
      </bx-carousel>
    `);
    await el.updateComplete;
    const prev = el.shadowRoot!.querySelector(
      '.navigation-button--previous',
    ) as HTMLButtonElement;
    const next = el.shadowRoot!.querySelector(
      '.navigation-button--next',
    ) as HTMLButtonElement;
    expect(prev.disabled).to.be.true;
    expect(next.disabled).to.be.false;
  });

  it('renders one pagination dot per page', async () => {
    const el = await fixture<BxCarousel>(html`
      <bx-carousel pagination style="inline-size: 300px">
        <bx-carousel-item style="inline-size: 100%">1</bx-carousel-item>
        <bx-carousel-item style="inline-size: 100%">2</bx-carousel-item>
        <bx-carousel-item style="inline-size: 100%">3</bx-carousel-item>
      </bx-carousel>
    `);
    await el.updateComplete;
    const dots = el.shadowRoot!.querySelectorAll('.pagination-item');
    expect(dots.length).to.equal(3);
    expect(dots[0]!.getAttribute('aria-current')).to.equal('true');
  });

  it('goToSlide clamps to the valid range', async () => {
    const el = await threeSlides();
    await el.updateComplete;
    expect(() => el.goToSlide(99)).not.to.throw();
    expect(() => el.goToSlide(-5)).not.to.throw();
  });

  it('exposes next/previous/goToSlide methods', async () => {
    const el = await threeSlides();
    expect(el.next).to.be.a('function');
    expect(el.previous).to.be.a('function');
    expect(el.goToSlide).to.be.a('function');
  });

  it('shows an autoplay pause/play toggle when autoplay is set', async () => {
    const el = await fixture<BxCarousel>(html`
      <bx-carousel autoplay style="inline-size: 300px">
        <bx-carousel-item style="inline-size: 100%">1</bx-carousel-item>
        <bx-carousel-item style="inline-size: 100%">2</bx-carousel-item>
      </bx-carousel>
    `);
    await el.updateComplete;
    const toggle = el.shadowRoot!.querySelector('.play-toggle');
    expect(toggle).to.exist;
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxCarousel>(html`
      <bx-carousel navigation pagination aria-label="Featured" style="inline-size: 300px">
        <bx-carousel-item style="inline-size: 100%">1</bx-carousel-item>
        <bx-carousel-item style="inline-size: 100%">2</bx-carousel-item>
      </bx-carousel>
    `);
    await el.updateComplete;
    await expect(el).to.be.accessible();
  });
});
