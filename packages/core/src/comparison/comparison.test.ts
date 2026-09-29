import { expect, fixture, html } from '@open-wc/testing';
import type { BxComparison } from './comparison.ts';
import './index.ts';

describe('bx-comparison', () => {
  it('registers the tag with default position 50', async () => {
    const el = await fixture<BxComparison>(html`<bx-comparison></bx-comparison>`);
    expect(el).to.be.instanceOf(customElements.get('bx-comparison')!);
    expect(el.position).to.equal(50);
  });

  it('clamps position to 0-100', async () => {
    const el = await fixture<BxComparison>(html`<bx-comparison position="150"></bx-comparison>`);
    expect(el.position).to.equal(100);
  });

  it('renders role=slider with aria-value* attributes', async () => {
    const el = await fixture<BxComparison>(html`<bx-comparison position="30"></bx-comparison>`);
    const divider = el.shadowRoot!.querySelector('[role="slider"]')!;
    expect(divider.getAttribute('aria-valuemin')).to.equal('0');
    expect(divider.getAttribute('aria-valuemax')).to.equal('100');
    expect(divider.getAttribute('aria-valuenow')).to.equal('30');
  });

  it('moves 1% on ArrowRight and fires change', async () => {
    const el = await fixture<BxComparison>(html`<bx-comparison position="50"></bx-comparison>`);
    const divider = el.shadowRoot!.querySelector('[role="slider"]') as HTMLElement;
    let detail: { position: number } | undefined;
    el.addEventListener('change', (e) => (detail = (e as CustomEvent).detail));
    divider.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await el.updateComplete;
    expect(el.position).to.equal(51);
    expect(detail?.position).to.equal(51);
  });

  it('moves 10% on Shift+ArrowRight', async () => {
    const el = await fixture<BxComparison>(html`<bx-comparison position="50"></bx-comparison>`);
    const divider = el.shadowRoot!.querySelector('[role="slider"]') as HTMLElement;
    divider.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true, bubbles: true }),
    );
    await el.updateComplete;
    expect(el.position).to.equal(60);
  });

  it('Home/End jump to 0/100', async () => {
    const el = await fixture<BxComparison>(html`<bx-comparison position="50"></bx-comparison>`);
    const divider = el.shadowRoot!.querySelector('[role="slider"]') as HTMLElement;
    divider.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await el.updateComplete;
    expect(el.position).to.equal(100);
    divider.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await el.updateComplete;
    expect(el.position).to.equal(0);
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxComparison>(html`<bx-comparison position="40"></bx-comparison>`);
    await expect(el).to.be.accessible();
  });
});
