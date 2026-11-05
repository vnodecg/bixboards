import { expect, fixture, html } from '@open-wc/testing';
import type { BxStatCard } from './stat-card.ts';
import './index.ts';

const text = (el: BxStatCard, sel: string) =>
  el.shadowRoot!.querySelector(sel)!.textContent!.replace(/\s+/g, ' ').trim();

describe('bx-stat-card', () => {
  it('formats a numeric value with Intl options', async () => {
    const el = await fixture<BxStatCard>(
      html`<bx-stat-card label="Revenue" value="12345.6"></bx-stat-card>`,
    );
    el.format = { style: 'currency', currency: 'USD' };
    await el.updateComplete;
    expect(text(el, '.value')).to.equal('$12,345.60');
  });

  it('passes through non-numeric values', async () => {
    const el = await fixture<BxStatCard>(
      html`<bx-stat-card label="Plan" value="Pro"></bx-stat-card>`,
    );
    expect(text(el, '.value')).to.equal('Pro');
  });

  it('shows delta direction with an arrow, a sign and spoken text', async () => {
    const el = await fixture<BxStatCard>(
      html`<bx-stat-card label="Users" value="10" delta="12.5"></bx-stat-card>`,
    );
    const delta = el.shadowRoot!.querySelector('.delta')!;
    expect(delta.querySelector('svg')).to.exist;
    expect(delta.textContent).to.contain('+12.5%');
    expect(delta.textContent).to.contain('Increased by');
    expect(delta.getAttribute('data-tone')).to.equal('good');
  });

  it('inverts good/bad with trend-is-good="down"', async () => {
    const el = await fixture<BxStatCard>(
      html`<bx-stat-card
        label="Churn"
        value="3"
        delta="-2"
        trend-is-good="down"
      ></bx-stat-card>`,
    );
    expect(
      el.shadowRoot!.querySelector('.delta')!.getAttribute('data-tone'),
    ).to.equal('good');
    el.delta = 2;
    await el.updateComplete;
    expect(
      el.shadowRoot!.querySelector('.delta')!.getAttribute('data-tone'),
    ).to.equal('bad');
  });

  it('shows a skeleton while loading', async () => {
    const el = await fixture<BxStatCard>(
      html`<bx-stat-card label="x" value="1" loading></bx-stat-card>`,
    );
    expect(el.shadowRoot!.querySelector('bx-skeleton')).to.exist;
    expect(el.shadowRoot!.querySelector('.value')).to.be.null;
  });

  it('turns the label into a link with href', async () => {
    const el = await fixture<BxStatCard>(
      html`<bx-stat-card label="Sales" value="1" href="/sales"></bx-stat-card>`,
    );
    expect(
      el.shadowRoot!.querySelector('a.label')!.getAttribute('href'),
    ).to.equal('/sales');
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxStatCard>(
      html`<bx-stat-card label="Users" value="1200" delta="3"
        ><bx-sparkline slot="chart" label="Trend" values="1,2,3"></bx-sparkline
        ><span slot="footer">vs last week</span></bx-stat-card
      >`,
    );
    await expect(el).to.be.accessible();
  });
});
