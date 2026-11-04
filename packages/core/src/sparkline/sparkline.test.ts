import { expect, fixture, html } from '@open-wc/testing';
import type { BxSparkline } from './sparkline.ts';
import { decimate } from './sparkline.ts';
import './index.ts';

describe('bx-sparkline', () => {
  it('draws a line path for the values', async () => {
    const el = await fixture<BxSparkline>(
      html`<bx-sparkline label="Visits"></bx-sparkline>`,
    );
    el.values = [1, 3, 2, 5];
    await el.updateComplete;
    const d = el.shadowRoot!.querySelector('.line')!.getAttribute('d')!;
    expect(d.startsWith('M')).to.be.true;
    expect(d.split('L')).to.have.length(4);
    expect(el.shadowRoot!.querySelector('.point')).to.exist;
  });

  it('renders area and bar types', async () => {
    const el = await fixture<BxSparkline>(
      html`<bx-sparkline type="area"></bx-sparkline>`,
    );
    el.values = [1, 2, 3];
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.area')).to.exist;
    el.type = 'bar';
    await el.updateComplete;
    expect(el.shadowRoot!.querySelectorAll('.bar')).to.have.length(3);
  });

  it('decimates large series while keeping spikes', () => {
    const big = Array.from({ length: 10000 }, (_, i) => (i === 5000 ? 999 : 1));
    const out = decimate(big, 100);
    expect(out.length).to.be.at.most(100);
    expect(Math.max(...out)).to.equal(999);
    expect(decimate([1, 2, 3], 100)).to.deep.equal([1, 2, 3]);
  });

  it('is decorative without a label and an img with one', async () => {
    const el = await fixture<BxSparkline>(html`<bx-sparkline></bx-sparkline>`);
    el.values = [1, 2];
    await el.updateComplete;
    expect(
      el.shadowRoot!.querySelector('svg')!.getAttribute('aria-hidden'),
    ).to.equal('true');
    el.label = 'Trend';
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('svg')!.getAttribute('role')).to.equal(
      'img',
    );
    expect(
      el.shadowRoot!.querySelector('svg')!.getAttribute('aria-label'),
    ).to.contain('from 1 to 2');
  });

  it('marks the trend as good or bad', async () => {
    const el = await fixture<BxSparkline>(
      html`<bx-sparkline trend-is-good="down"></bx-sparkline>`,
    );
    el.values = [1, 5];
    await el.updateComplete;
    expect(
      el.shadowRoot!.querySelector('svg')!.getAttribute('data-good'),
    ).to.equal('bad');
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxSparkline>(
      html`<bx-sparkline label="Visits"></bx-sparkline>`,
    );
    el.values = [3, 1, 4, 1, 5];
    await el.updateComplete;
    await expect(el).to.be.accessible();
  });
});

describe('bx-sparkline values attribute', () => {
  it('parses a comma/space separated attribute', async () => {
    const el = await fixture<BxSparkline>(
      html`<bx-sparkline values="1, 2 3"></bx-sparkline>`,
    );
    expect(el.values).to.deep.equal([1, 2, 3]);
  });
});
