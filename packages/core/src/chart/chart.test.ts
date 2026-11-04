import { expect, fixture, html, aTimeout } from '@open-wc/testing';
import type { BxChart } from './chart.ts';
import { registerChartAdapter } from './chart.ts';
import { compactNumber, lttb, niceTicks } from './chart-utils.ts';
import './index.ts';

const data = [
  { month: 'Jan', sales: 10, cost: 4 },
  { month: 'Feb', sales: 25, cost: 9 },
  { month: 'Mar', sales: 18, cost: 12 },
  { month: 'Apr', sales: 32, cost: 10 },
];

const make = (attrs = '') =>
  fixture<BxChart>(
    html`<bx-chart
      style="inline-size: 30rem"
      label="Sales"
      x="month"
      .series=${['sales', 'cost']}
      .data=${data}
    ></bx-chart>`,
  );
const ready = async (el: BxChart) => {
  await el.updateComplete;
  await aTimeout(120);
  await el.updateComplete;
};

describe('chart utils', () => {
  it('niceTicks cover the domain with round steps', () => {
    expect(niceTicks(0, 32, 5)).to.deep.equal([0, 10, 20, 30, 40]);
    expect(niceTicks(-3, 7, 5)).to.deep.equal([-5, 0, 5, 10]);
    expect(niceTicks(5, 5)[0]).to.be.lessThan(5);
    expect(niceTicks(0, 0)).to.deep.equal([0, 1]);
  });
  it('lttb keeps endpoints, the threshold size and spikes', () => {
    const pts: [number, number][] = Array.from({ length: 5000 }, (_, i) => [
      i,
      i === 2500 ? 100 : 0,
    ]);
    const out = lttb(pts, 100);
    expect(out).to.have.length(100);
    expect(out[0]).to.deep.equal(pts[0]);
    expect(out[99]).to.deep.equal(pts[4999]);
    expect(Math.max(...out.map((p) => p[1]))).to.equal(100);
    expect(lttb(pts.slice(0, 10), 100)).to.have.length(10);
  });
  it('formats compact numbers', () => {
    expect(compactNumber(1500, 'en-US')).to.equal('1.5K');
  });
});

describe('bx-chart', () => {
  it('draws a line per series in the built-in SVG adapter', async () => {
    const el = await make();
    await ready(el);
    const svg = el.shadowRoot!.querySelector('.canvas svg')!;
    expect(svg).to.exist;
    expect(svg.querySelectorAll('path.line')).to.have.length(2);
    expect(svg.querySelectorAll('circle.dot')).to.have.length(8);
  });

  it('draws areas, bars, stacked bars, bar-list, scatter and radial', async () => {
    const el = await make();
    const count = async (type: string, sel: string) => {
      el.type = type as BxChart['type'];
      await ready(el);
      return el.shadowRoot!.querySelectorAll(`.canvas svg ${sel}`).length;
    };
    expect(await count('area', 'path.area')).to.equal(2);
    expect(await count('bar', 'rect.bar')).to.equal(8);
    expect(await count('stacked-bar', 'rect.bar')).to.equal(8);
    expect(await count('bar-list', 'rect.bar')).to.equal(4);
    el.x = 'sales';
    expect(await count('scatter', 'circle.dot')).to.be.greaterThan(0);
    el.x = 'month';
    expect(await count('radial', 'path.slice')).to.equal(4);
  });

  it('exposes a role=img with a label and an always-present data table', async () => {
    const el = await make();
    await ready(el);
    expect(
      el.shadowRoot!.querySelector('[role=img]')!.getAttribute('aria-label'),
    ).to.equal('Sales');
    const table = el.shadowRoot!.querySelector('table')!;
    expect(table.querySelectorAll('tbody tr')).to.have.length(4);
    expect(table.querySelectorAll('thead th')).to.have.length(3);
  });

  it('toggles series from the legend and fires bx-legend-toggle', async () => {
    const el = await make();
    await ready(el);
    let detail: unknown;
    el.addEventListener(
      'bx-legend-toggle',
      (e) => (detail = (e as CustomEvent).detail),
    );
    el.shadowRoot!.querySelector<HTMLElement>('.legend button')!.click();
    await ready(el);
    expect(detail).to.deep.equal({ series: 'sales', visible: false });
    expect(el.shadowRoot!.querySelectorAll('.canvas path.line')).to.have.length(
      1,
    );
    expect(
      el
        .shadowRoot!.querySelector('.legend button')!
        .getAttribute('aria-pressed'),
    ).to.equal('false');
  });

  it('fires bx-point-click with the series and datum', async () => {
    const el = await make();
    await ready(el);
    let detail: { series: string; datum: unknown } | undefined;
    el.addEventListener(
      'bx-point-click',
      (e) => (detail = (e as CustomEvent).detail),
    );
    el.shadowRoot!.querySelector<SVGElement>(
      'circle.dot[data-index="1"]',
    )!.dispatchEvent(
      new MouseEvent('click', { bubbles: true, composed: true }),
    );
    expect(detail!.series).to.equal('sales');
    expect((detail!.datum as { month: string }).month).to.equal('Feb');
  });

  it('shows a tooltip for the hovered category when enabled', async () => {
    const el = await make();
    await ready(el);
    const dot = el.shadowRoot!.querySelector<SVGElement>(
      'circle.dot[data-index="2"]',
    )!;
    const r = dot.getBoundingClientRect();
    dot.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        composed: true,
        clientX: r.x,
        clientY: r.y,
      }),
    );
    await el.updateComplete;
    const tip = el.shadowRoot!.querySelector('.tooltip')!;
    expect(tip.textContent).to.contain('Mar');
    expect(tip.textContent).to.contain('18');
  });

  it('shows the empty slot, a skeleton while loading, and a fallback for unsupported types', async () => {
    const el = await fixture<BxChart>(
      html`<bx-chart style="inline-size: 20rem"></bx-chart>`,
    );
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.empty')!.textContent).to.contain(
      'No data',
    );
    el.loading = true;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('bx-skeleton')).to.exist;

    const sankey = await make();
    sankey.type = 'sankey';
    let unsupported = false;
    sankey.addEventListener('bx-unsupported', () => (unsupported = true));
    await ready(sankey);
    expect(unsupported).to.be.true;
    expect(sankey.shadowRoot!.querySelector('.unsupported')).to.exist;
    expect(sankey.shadowRoot!.querySelector('table')).to.exist;
  });

  it('uses a registered adapter for other types', async () => {
    let drawn = '';
    registerChartAdapter('toy', {
      supports: new Set(['sankey']),
      create: (container) => ({
        update: (spec) => {
          drawn = `${spec.type}:${spec.series.length}`;
          container.textContent = 'toy';
        },
        destroy: () => container.replaceChildren(),
      }),
    });
    const el = await make();
    el.adapter = 'toy';
    el.type = 'sankey';
    await ready(el);
    expect(drawn).to.equal('sankey:2');
    expect(el.shadowRoot!.querySelector('.unsupported')).to.be.null;
  });

  it('exposes token-backed series colours', async () => {
    const el = await make();
    await ready(el);
    expect(
      el.shadowRoot!.querySelector('path.line')!.getAttribute('stroke'),
    ).to.equal('var(--_c1)');
    expect(getComputedStyle(el).getPropertyValue('--_c1').trim()).to.not.equal(
      '',
    );
  });

  it('themes gridlines through --bx-chart-grid-color', async () => {
    const el = await make();
    await ready(el);
    el.style.setProperty('--bx-chart-grid-color', 'rgb(1, 2, 3)');
    expect(
      getComputedStyle(el.shadowRoot!.querySelector('line.grid')!).stroke,
    ).to.equal('rgb(1, 2, 3)');
  });

  it('has no axe violations', async () => {
    const el = await make();
    await ready(el);
    await expect(el).to.be.accessible();
  });
});
