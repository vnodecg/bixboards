import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxRating } from './rating.ts';
import './index.ts';

describe('bx-rating', () => {
  it('registers the tag with defaults', async () => {
    const el = await fixture<BxRating>(html`<bx-rating></bx-rating>`);
    expect(el).to.be.instanceOf(customElements.get('bx-rating')!);
    expect(el.value).to.equal(0);
    expect(el.max).to.equal(5);
  });

  it('renders role=slider with aria-value* attributes', async () => {
    const el = await fixture<BxRating>(html`<bx-rating value="3"></bx-rating>`);
    const base = el.shadowRoot!.querySelector('[role="slider"]')!;
    expect(base.getAttribute('aria-valuemin')).to.equal('0');
    expect(base.getAttribute('aria-valuemax')).to.equal('5');
    expect(base.getAttribute('aria-valuenow')).to.equal('3');
  });

  it('increments value on ArrowRight and fires input/change', async () => {
    const el = await fixture<BxRating>(html`<bx-rating value="2"></bx-rating>`);
    const base = el.shadowRoot!.querySelector('[role="slider"]') as HTMLElement;
    const inputPromise = oneEvent(el, 'input');
    const changePromise = oneEvent(el, 'change');
    base.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await inputPromise;
    await changePromise;
    expect(el.value).to.equal(3);
  });

  it('Home/End jump to 0/max', async () => {
    const el = await fixture<BxRating>(html`<bx-rating value="2"></bx-rating>`);
    const base = el.shadowRoot!.querySelector('[role="slider"]') as HTMLElement;
    base.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await el.updateComplete;
    expect(el.value).to.equal(5);
    base.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await el.updateComplete;
    expect(el.value).to.equal(0);
  });

  it('does not change when readonly or disabled', async () => {
    const readonlyEl = await fixture<BxRating>(html`<bx-rating value="2" readonly></bx-rating>`);
    const readonlyBase = readonlyEl.shadowRoot!.querySelector('[role="slider"]') as HTMLElement;
    readonlyBase.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await readonlyEl.updateComplete;
    expect(readonlyEl.value).to.equal(2);

    const disabledEl = await fixture<BxRating>(html`<bx-rating value="2" disabled></bx-rating>`);
    const disabledBase = disabledEl.shadowRoot!.querySelector('[role="slider"]') as HTMLElement;
    disabledBase.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await disabledEl.updateComplete;
    expect(disabledEl.value).to.equal(2);
  });

  it('uses getSymbol to render custom content per position', async () => {
    const el = await fixture<BxRating>(html`<bx-rating max="3"></bx-rating>`);
    el.getSymbol = (value: number) => (value === 1 ? '😢' : value === 2 ? '😐' : '😀');
    el.requestUpdate();
    await el.updateComplete;
    const symbols = el.shadowRoot!.querySelectorAll('.track .symbol span');
    expect(symbols.length).to.equal(3);
    expect(symbols[0]!.textContent).to.equal('😢');
  });

  it('participates in a form and resets', async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form><bx-rating name="stars" value="4"></bx-rating></form>`,
    );
    const data = new FormData(form);
    expect(data.get('stars')).to.equal('4');

    const rating = form.querySelector('bx-rating') as BxRating;
    form.reset();
    await rating.updateComplete;
    expect(rating.value).to.equal(0);
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxRating>(html`<bx-rating label="Rate this" value="3"></bx-rating>`);
    await expect(el).to.be.accessible();
  });
});
