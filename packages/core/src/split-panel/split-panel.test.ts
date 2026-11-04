import { expect, fixture, html, aTimeout } from '@open-wc/testing';
import type { BxSplitPanel } from './split-panel.ts';
import './index.ts';

const make = (attrs = '') =>
  fixture<BxSplitPanel>(
    html` <bx-split-panel
      style="inline-size: 40rem; block-size: 10rem; --bx-split-panel-divider-width: 4px"
      storage-key=""
    >
      <div slot="start">A</div>
      <div slot="end">B</div>
    </bx-split-panel>`,
  );

const start = (el: BxSplitPanel) =>
  el.shadowRoot!.querySelector<HTMLElement>('[part~=start]')!;
const divider = (el: BxSplitPanel) =>
  el.shadowRoot!.querySelector<HTMLElement>('.divider')!;
const key = async (
  el: BxSplitPanel,
  k: string,
  init: KeyboardEventInit = {},
) => {
  divider(el).dispatchEvent(
    new KeyboardEvent('keydown', {
      key: k,
      bubbles: true,
      cancelable: true,
      ...init,
    }),
  );
  await el.updateComplete;
};

describe('bx-split-panel', () => {
  beforeEach(() => localStorage.removeItem('bx-split-test'));

  it('lays out two panels at 50% by default with a window-splitter divider', async () => {
    const el = await make();
    const total = el.getBoundingClientRect().width;
    expect(
      Math.abs(start(el).getBoundingClientRect().width - (total - 4) / 2),
    ).to.be.lessThan(1.5);
    const d = divider(el);
    expect(d.getAttribute('role')).to.equal('separator');
    expect(d.getAttribute('aria-valuenow')).to.equal('50');
    expect(d.getAttribute('aria-orientation')).to.equal('vertical');
    expect(d.getAttribute('tabindex')).to.equal('0');
  });

  it('moves with arrows (Shift = 10), Home/End, and fires bx-reposition', async () => {
    const el = await make();
    const events: number[] = [];
    el.addEventListener('bx-reposition', (e) =>
      events.push((e as CustomEvent).detail.position),
    );
    await key(el, 'ArrowRight');
    expect(el.position).to.equal(51);
    await key(el, 'ArrowLeft', { shiftKey: true });
    expect(el.position).to.equal(41);
    await key(el, 'End');
    expect(el.position).to.equal(100);
    await key(el, 'Home');
    expect(el.position).to.equal(0);
    expect(divider(el).getAttribute('aria-valuenow')).to.equal('0');
    expect(events).to.deep.equal([51, 41, 100, 0]);
  });

  it('Enter collapses the start panel then restores the previous position', async () => {
    const el = await make();
    el.position = 30;
    await el.updateComplete;
    await key(el, 'Enter');
    expect(el.position).to.equal(0);
    await key(el, 'Enter');
    expect(el.position).to.equal(30);
  });

  it('drags with pointer capture', async () => {
    const el = await make();
    const rect = el.getBoundingClientRect();
    const d = divider(el);
    const id = 1;
    d.setPointerCapture = () => undefined;
    d.releasePointerCapture = () => undefined;
    d.dispatchEvent(
      new PointerEvent('pointerdown', {
        pointerId: id,
        button: 0,
        bubbles: true,
        cancelable: true,
      }),
    );
    d.dispatchEvent(
      new PointerEvent('pointermove', {
        pointerId: id,
        clientX: rect.left + rect.width * 0.25,
        bubbles: true,
      }),
    );
    await el.updateComplete;
    expect(el.position).to.be.closeTo(25, 1.5);
    d.dispatchEvent(
      new PointerEvent('pointerup', { pointerId: id, bubbles: true }),
    );
    d.dispatchEvent(
      new PointerEvent('pointermove', {
        pointerId: id,
        clientX: rect.left + rect.width * 0.9,
        bubbles: true,
      }),
    );
    await el.updateComplete;
    expect(el.position).to.be.closeTo(25, 1.5);
  });

  it('snaps to nearby points while dragging', async () => {
    const el = await make();
    el.snap = '25% 75%';
    el.snapThreshold = 20;
    await el.updateComplete;
    const rect = el.getBoundingClientRect();
    const d = divider(el);
    d.setPointerCapture = () => undefined;
    d.dispatchEvent(
      new PointerEvent('pointerdown', {
        pointerId: 1,
        button: 0,
        bubbles: true,
        cancelable: true,
      }),
    );
    d.dispatchEvent(
      new PointerEvent('pointermove', {
        pointerId: 1,
        clientX: rect.left + rect.width * 0.27,
        bubbles: true,
      }),
    );
    await el.updateComplete;
    expect(el.position).to.equal(25);
  });

  it('supports position-in-pixels and the vertical orientation', async () => {
    const el = await fixture<BxSplitPanel>(
      html` <bx-split-panel
        orientation="vertical"
        position-in-pixels="40"
        style="block-size: 20rem; inline-size: 10rem; --bx-split-panel-divider-width: 4px"
      >
        <div slot="start">A</div>
        <div slot="end">B</div>
      </bx-split-panel>`,
    );
    await aTimeout(30);
    expect(Math.round(start(el).getBoundingClientRect().height)).to.be.closeTo(
      40,
      2,
    );
    expect(divider(el).getAttribute('aria-orientation')).to.equal('horizontal');
    await key(el, 'ArrowDown');
    expect(el.position).to.be.greaterThan(
      (40 / (el.getBoundingClientRect().height - 4)) * 100,
    );
  });

  it('keeps the primary panel pixel size when the container resizes', async () => {
    const el = await fixture<BxSplitPanel>(
      html` <bx-split-panel
        primary="start"
        position="25"
        style="inline-size: 40rem; block-size: 5rem; --bx-split-panel-divider-width: 4px"
      >
        <div slot="start">A</div>
        <div slot="end">B</div>
      </bx-split-panel>`,
    );
    await aTimeout(50);
    const before = start(el).getBoundingClientRect().width;
    el.style.inlineSize = '60rem';
    await aTimeout(120);
    await el.updateComplete;
    expect(
      Math.abs(start(el).getBoundingClientRect().width - before),
    ).to.be.lessThan(2);
  });

  it('persists the position under storage-key and restores it', async () => {
    const el = await fixture<BxSplitPanel>(
      html`<bx-split-panel
        storage-key="bx-split-test"
        style="inline-size: 20rem; block-size: 4rem"
        ><div slot="start">A</div>
        <div slot="end">B</div></bx-split-panel
      >`,
    );
    await key(el, 'ArrowRight', { shiftKey: true });
    expect(localStorage.getItem('bx-split-test')).to.equal('60');
    const again = await fixture<BxSplitPanel>(
      html`<bx-split-panel
        storage-key="bx-split-test"
        style="inline-size: 20rem; block-size: 4rem"
        ><div slot="start">A</div>
        <div slot="end">B</div></bx-split-panel
      >`,
    );
    expect(again.position).to.equal(60);
  });

  it('ignores input when disabled', async () => {
    const el = await make();
    el.disabled = true;
    await el.updateComplete;
    await key(el, 'ArrowRight');
    expect(el.position).to.equal(50);
    expect(divider(el).getAttribute('aria-disabled')).to.equal('true');
  });

  it('has no axe violations', async () => {
    const el = await make();
    await expect(el).to.be.accessible();
  });
});
