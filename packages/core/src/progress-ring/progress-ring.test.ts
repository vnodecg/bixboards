import { expect, fixture, html } from '@open-wc/testing';
import type { BxProgressRing } from './progress-ring.ts';
import './index.ts';

describe('bx-progress-ring', () => {
  it('registers the tag with a clamped 0 default', async () => {
    const el = await fixture<BxProgressRing>(
      html`<bx-progress-ring></bx-progress-ring>`,
    );
    expect(el).to.be.instanceOf(customElements.get('bx-progress-ring')!);
    expect(el.value).to.equal(0);
    expect(el.getAttribute('role')).to.equal('progressbar');
    expect(el.getAttribute('aria-valuenow')).to.equal('0');
  });

  it('clamps value to 0-100', async () => {
    const el = await fixture<BxProgressRing>(
      html`<bx-progress-ring value="150"></bx-progress-ring>`,
    );
    expect(el.value).to.equal(100);

    el.value = -10;
    await el.updateComplete;
    expect(el.value).to.equal(0);
  });

  it('derives stroke-dashoffset from value with no layout read', async () => {
    const el = await fixture<BxProgressRing>(
      html`<bx-progress-ring value="50"></bx-progress-ring>`,
    );
    const indicator = el.shadowRoot!.querySelector(
      'circle.indicator',
    ) as SVGCircleElement;
    const dasharray = Number(indicator.getAttribute('stroke-dasharray'));
    const offset = Number(indicator.getAttribute('stroke-dashoffset'));
    expect(offset).to.be.closeTo(dasharray / 2, 0.01);
  });

  it('sets aria-label from the label property', async () => {
    const el = await fixture<BxProgressRing>(
      html`<bx-progress-ring label="Upload progress"></bx-progress-ring>`,
    );
    expect(el.getAttribute('aria-label')).to.equal('Upload progress');
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxProgressRing>(
      html`<bx-progress-ring value="50" label="Loading">50%</bx-progress-ring>`,
    );
    await expect(el).to.be.accessible();
  });
});
