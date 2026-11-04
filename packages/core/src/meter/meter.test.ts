import { expect, fixture, html } from '@open-wc/testing';
import type { BxMeter } from './meter.ts';
import { meterBand } from './meter.ts';
import './index.ts';

describe('bx-meter', () => {
  it('exposes role=meter with value, range and a band in aria-valuetext', async () => {
    const el = await fixture<BxMeter>(
      html`<bx-meter
        label="Disk"
        value="85"
        low="50"
        high="80"
        optimum="20"
        show-value
      ></bx-meter>`,
    );
    const meter = el.shadowRoot!.querySelector('[role=meter]')!;
    expect(meter.getAttribute('aria-valuenow')).to.equal('85');
    expect(meter.getAttribute('aria-valuemin')).to.equal('0');
    expect(meter.getAttribute('aria-valuemax')).to.equal('100');
    expect(meter.getAttribute('aria-valuetext')).to.contain('critical');
  });

  it('clamps the value to min/max', async () => {
    const el = await fixture<BxMeter>(
      html`<bx-meter label="x" value="500"></bx-meter>`,
    );
    expect(
      el
        .shadowRoot!.querySelector('[role=meter]')!
        .getAttribute('aria-valuenow'),
    ).to.equal('100');
    const fill = el.shadowRoot!.querySelector<HTMLElement>('.fill')!;
    expect(fill.style.getPropertyValue('--_pct')).to.equal('100');
  });

  it('follows the native <meter> band algorithm', () => {
    expect(meterBand(10, 0, 100, 30, 70, 50)).to.equal('warning');
    expect(meterBand(50, 0, 100, 30, 70, 50)).to.equal('good');
    expect(meterBand(90, 0, 100, 30, 70, 10)).to.equal('bad');
    expect(meterBand(90, 0, 100)).to.equal('good');
    expect(meterBand(90, 0, 100, 30, 70, 90)).to.equal('good');
  });

  it('shows a glyph so the band is not colour-only', async () => {
    const el = await fixture<BxMeter>(
      html`<bx-meter
        label="x"
        value="95"
        low="30"
        high="70"
        optimum="10"
      ></bx-meter>`,
    );
    expect(el.shadowRoot!.querySelector('.state svg path')).to.exist;
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxMeter>(
      html`<bx-meter label="Storage" value="40" show-value></bx-meter>`,
    );
    await expect(el).to.be.accessible();
  });
});
