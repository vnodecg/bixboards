import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxTab } from './tab.ts';
import './index.ts';

describe('bx-tab', () => {
  it('registers the tag with role=tab', async () => {
    const el = await fixture<BxTab>(html`<bx-tab>Tab</bx-tab>`);
    expect(el).to.be.instanceOf(customElements.get('bx-tab')!);
    expect(el.shadowRoot!.querySelector('[role="tab"]')).to.exist;
  });

  it('reflects active to aria-selected', async () => {
    const el = await fixture<BxTab>(html`<bx-tab active>Tab</bx-tab>`);
    expect(el.shadowRoot!.querySelector('[role="tab"]')!.getAttribute('aria-selected')).to.equal(
      'true',
    );
  });

  it('sets aria-controls from panel', async () => {
    const el = await fixture<BxTab>(html`<bx-tab panel="details">Tab</bx-tab>`);
    expect(el.shadowRoot!.querySelector('[role="tab"]')!.getAttribute('aria-controls')).to.equal(
      'details',
    );
  });

  it('is not a tab stop when disabled', async () => {
    const el = await fixture<BxTab>(html`<bx-tab disabled>Tab</bx-tab>`);
    expect(el.shadowRoot!.querySelector('[role="tab"]')!.getAttribute('tabindex')).to.equal('-1');
  });

  it('renders no close button by default', async () => {
    const el = await fixture<BxTab>(html`<bx-tab>Tab</bx-tab>`);
    expect(el.shadowRoot!.querySelector('.close-button')).to.not.exist;
  });

  it('fires bx-close when the close button is activated', async () => {
    const el = await fixture<BxTab>(html`<bx-tab closable>Tab</bx-tab>`);
    const closePromise = oneEvent(el, 'bx-close');
    el.shadowRoot!.querySelector<HTMLButtonElement>('.close-button')!.click();
    await closePromise;
  });

  it('does not fire bx-close when disabled', async () => {
    const el = await fixture<BxTab>(html`<bx-tab closable disabled>Tab</bx-tab>`);
    let fired = false;
    el.addEventListener('bx-close', () => (fired = true));
    el.shadowRoot!.querySelector<HTMLButtonElement>('.close-button')!.click();
    expect(fired).to.be.false;
  });

  it('closes via Backspace/Delete on the focused tab (close button is not its own tab stop)', async () => {
    const el = await fixture<BxTab>(html`<bx-tab closable>Tab</bx-tab>`);
    expect(el.shadowRoot!.querySelector('.close-button')!.hasAttribute('tabindex')).to.be.false;
    const row = el.shadowRoot!.querySelector<HTMLElement>('[role="tab"]')!;
    const closePromise = oneEvent(el, 'bx-close');
    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
    await closePromise;
  });

  it('has no axe violations (role=tab requires a tablist ancestor per the ARIA spec)', async () => {
    const wrapper = await fixture<HTMLDivElement>(
      html`<div role="tablist"><bx-tab closable active>Tab</bx-tab></div>`,
    );
    await expect(wrapper).to.be.accessible();
  });
});
