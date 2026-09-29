import { expect, fixture, html } from '@open-wc/testing';
import type { BxProgressBar } from './progress-bar.ts';
import './index.ts';

describe('bx-progress-bar', () => {
  it('registers the tag with a clamped 0 default', async () => {
    const el = await fixture<BxProgressBar>(
      html`<bx-progress-bar></bx-progress-bar>`,
    );
    expect(el).to.be.instanceOf(customElements.get('bx-progress-bar')!);
    expect(el.value).to.equal(0);
    expect(el.getAttribute('role')).to.equal('progressbar');
    expect(el.getAttribute('aria-valuemin')).to.equal('0');
    expect(el.getAttribute('aria-valuemax')).to.equal('100');
    expect(el.getAttribute('aria-valuenow')).to.equal('0');
  });

  it('clamps value to 0-100', async () => {
    const el = await fixture<BxProgressBar>(
      html`<bx-progress-bar value="150"></bx-progress-bar>`,
    );
    expect(el.value).to.equal(100);

    el.value = -20;
    await el.updateComplete;
    expect(el.value).to.equal(0);
    expect(el.getAttribute('aria-valuenow')).to.equal('0');
  });

  it('omits aria-valuenow when indeterminate', async () => {
    const el = await fixture<BxProgressBar>(
      html`<bx-progress-bar value="40" indeterminate></bx-progress-bar>`,
    );
    expect(el.hasAttribute('aria-valuenow')).to.be.false;

    el.indeterminate = false;
    await el.updateComplete;
    expect(el.getAttribute('aria-valuenow')).to.equal('40');
  });

  it('sets aria-label from the label property', async () => {
    const el = await fixture<BxProgressBar>(
      html`<bx-progress-bar label="Upload progress"></bx-progress-bar>`,
    );
    expect(el.getAttribute('aria-label')).to.equal('Upload progress');
  });

  it('hides the overlay label wrapper when the default slot is empty', async () => {
    const empty = await fixture<BxProgressBar>(
      html`<bx-progress-bar></bx-progress-bar>`,
    );
    await empty.updateComplete;
    expect(
      empty.shadowRoot!.querySelector('[part="label"]')!.hasAttribute('hidden'),
    ).to.be.true;

    const withOverlay = await fixture<BxProgressBar>(
      html`<bx-progress-bar value="42">42%</bx-progress-bar>`,
    );
    await withOverlay.updateComplete;
    expect(
      withOverlay
        .shadowRoot!.querySelector('[part="label"]')!
        .hasAttribute('hidden'),
    ).to.be.false;
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxProgressBar>(
      html`<bx-progress-bar value="50" label="Loading"></bx-progress-bar>`,
    );
    await expect(el).to.be.accessible();
  });
});
