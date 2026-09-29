import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxSlider } from './slider.ts';
import './index.ts';

describe('bx-slider', () => {
  it('registers the tag with default range 0-100', async () => {
    const el = await fixture<BxSlider>(html`<bx-slider></bx-slider>`);
    expect(el).to.be.instanceOf(customElements.get('bx-slider')!);
    expect(el.value).to.equal(0);
    expect(el.min).to.equal(0);
    expect(el.max).to.equal(100);
  });

  it('renders role=slider with aria-value* attributes', async () => {
    const el = await fixture<BxSlider>(html`<bx-slider value="30"></bx-slider>`);
    const thumb = el.shadowRoot!.querySelector('[role="slider"]')!;
    expect(thumb.getAttribute('aria-valuemin')).to.equal('0');
    expect(thumb.getAttribute('aria-valuemax')).to.equal('100');
    expect(thumb.getAttribute('aria-valuenow')).to.equal('30');
  });

  it('increments value on ArrowRight and fires input/change', async () => {
    const el = await fixture<BxSlider>(html`<bx-slider value="10" step="5"></bx-slider>`);
    const thumb = el.shadowRoot!.querySelector('[role="slider"]') as HTMLElement;
    const inputPromise = oneEvent(el, 'input');
    const changePromise = oneEvent(el, 'change');
    thumb.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await inputPromise;
    await changePromise;
    expect(el.value).to.equal(15);
  });

  it('PageUp steps by 10x', async () => {
    const el = await fixture<BxSlider>(html`<bx-slider value="10" step="1"></bx-slider>`);
    const thumb = el.shadowRoot!.querySelector('[role="slider"]') as HTMLElement;
    thumb.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true }));
    await el.updateComplete;
    expect(el.value).to.equal(20);
  });

  it('Home/End jump to min/max', async () => {
    const el = await fixture<BxSlider>(html`<bx-slider value="50"></bx-slider>`);
    const thumb = el.shadowRoot!.querySelector('[role="slider"]') as HTMLElement;
    thumb.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await el.updateComplete;
    expect(el.value).to.equal(100);
    thumb.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await el.updateComplete;
    expect(el.value).to.equal(0);
  });

  it('does not move when disabled', async () => {
    const el = await fixture<BxSlider>(html`<bx-slider value="10" disabled></bx-slider>`);
    const thumb = el.shadowRoot!.querySelector('[role="slider"]') as HTMLElement;
    thumb.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await el.updateComplete;
    expect(el.value).to.equal(10);
  });

  it('range mode keeps thumbs from crossing', async () => {
    const el = await fixture<BxSlider>(
      html`<bx-slider range min-value="40" max-value="60"></bx-slider>`,
    );
    const [minThumb, maxThumb] = [...el.shadowRoot!.querySelectorAll('[role="slider"]')] as HTMLElement[];
    for (let i = 0; i < 30; i++)
      minThumb!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await el.updateComplete;
    expect(el.minValue).to.equal(el.maxValue);

    for (let i = 0; i < 30; i++)
      maxThumb!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await el.updateComplete;
    expect(el.maxValue).to.equal(el.minValue);
  });

  it('participates in a form as a single field', async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form><bx-slider name="volume" value="42"></bx-slider></form>`,
    );
    const data = new FormData(form);
    expect(data.get('volume')).to.equal('42');
  });

  it('participates in a form as a min/max pair in range mode', async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form>
        <bx-slider name="price" range min-value="10" max-value="90"></bx-slider>
      </form>`,
    );
    const data = new FormData(form);
    expect(data.get('price-min')).to.equal('10');
    expect(data.get('price-max')).to.equal('90');
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxSlider>(html`<bx-slider value="20"></bx-slider>`);
    await expect(el).to.be.accessible();
  });

  it('has no axe violations in range mode', async () => {
    const el = await fixture<BxSlider>(
      html`<bx-slider range min-value="20" max-value="80"></bx-slider>`,
    );
    await expect(el).to.be.accessible();
  });
});
