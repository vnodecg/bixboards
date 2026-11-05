import { expect, fixture, html as testHtml, nextFrame } from '@open-wc/testing';
import { LitElement, html } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { PrefixSums } from './prefix-sum.ts';
import { VirtualizerController } from './virtualizer-controller.ts';

class TestHost extends LitElement {
  static override properties = {
    count: { type: Number },
    size: { type: Number },
    dynamic: { type: Boolean },
    overscan: { type: Number },
    enabled: { type: Boolean },
    maxScrollSize: { type: Number },
  };

  declare count: number;
  declare size: number;
  declare dynamic: boolean;
  declare overscan: number;
  declare enabled: boolean;
  declare maxScrollSize: number | undefined;

  heights = new Map<number, number>();
  sticky: number[] = [];
  pinned: number[] = [];
  getItemKey?: (index: number) => string | number;
  renders = 0;

  virtualizer = new VirtualizerController(this, {
    count: 0,
    getScrollElement: () => this.#getScrollElement(),
  });

  constructor() {
    super();
    this.count = 1000;
    this.size = 40;
    this.dynamic = false;
    this.overscan = 2;
    this.enabled = true;
  }

  #getScrollElement = (): Element | null =>
    this.shadowRoot?.querySelector('.scroller') ?? null;

  rowHeight(index: number): number {
    return this.heights.get(index) ?? (this.dynamic ? 40 : this.size);
  }

  override updated(): void {
    for (const row of this.shadowRoot!.querySelectorAll('.row'))
      this.virtualizer.measureElement(row);
  }

  override render() {
    this.renders++;
    this.virtualizer.setOptions({
      count: this.count,
      getScrollElement: this.#getScrollElement,
      itemSize: this.dynamic ? undefined : this.size,
      dynamic: this.dynamic,
      overscan: this.overscan,
      enabled: this.enabled,
      maxScrollSize: this.maxScrollSize,
      getItemKey: this.getItemKey,
      stickyIndexes: this.sticky,
      pinnedIndexes: this.pinned,
    });
    const items = this.virtualizer.items;
    return html`
      <style>
        .scroller {
          block-size: 200px;
          overflow: auto;
        }
        .spacer {
          position: relative;
        }
        .row {
          position: absolute;
          inset-inline: 0;
          inset-block-start: 0;
          box-sizing: border-box;
        }
      </style>
      <div class="scroller">
        <div
          class="spacer"
          style="block-size: ${this.virtualizer.spacerSize}px"
        >
          ${repeat(
            items,
            (item) => item.key,
            (item) =>
              html`<div
                class="row"
                data-index=${item.index}
                style="block-size: ${this.rowHeight(
                  item.index,
                )}px; transform: translateY(${item.position}px)"
              >
                ${item.index}
              </div>`,
          )}
        </div>
      </div>
    `;
  }
}
customElements.define('bx-test-virtual-host', TestHost);

async function setup(props: Partial<TestHost> = {}): Promise<TestHost> {
  const el = await fixture<TestHost>(
    testHtml`<bx-test-virtual-host></bx-test-virtual-host>`,
  );
  Object.assign(el, props);
  await el.updateComplete;
  await nextFrame();
  await nextFrame();
  await el.updateComplete;
  return el;
}

const scroller = (el: TestHost) =>
  el.shadowRoot!.querySelector<HTMLElement>('.scroller')!;
const rows = (el: TestHost) => [
  ...el.shadowRoot!.querySelectorAll<HTMLElement>('.row'),
];
const indexes = (el: TestHost) =>
  rows(el).map((row) => Number(row.dataset['index']));

async function scrollTo(el: TestHost, top: number): Promise<void> {
  scroller(el).scrollTop = top;
  await nextFrame();
  await nextFrame();
  await el.updateComplete;
}

describe('PrefixSums', () => {
  it('matches a naive prefix sum for offsets and lookups', () => {
    const sizes = Array.from({ length: 257 }, (_, i) => 10 + ((i * 7) % 23));
    const sums = new PrefixSums();
    sums.rebuild(sizes.length, (i) => sizes[i]!);

    let running = 0;
    for (let i = 0; i < sizes.length; i++) {
      expect(sums.offsetOf(i)).to.equal(running);
      expect(sums.indexAt(running)).to.equal(i);
      expect(sums.indexAt(running + sizes[i]! - 0.5)).to.equal(i);
      running += sizes[i]!;
    }
    expect(sums.total).to.equal(running);
  });

  it('applies point updates in place', () => {
    const sums = new PrefixSums();
    sums.rebuild(10, () => 10);
    expect(sums.set(3, 30)).to.equal(20);
    expect(sums.offsetOf(4)).to.equal(60);
    expect(sums.total).to.equal(120);
    expect(sums.indexAt(59)).to.equal(3);
    expect(sums.indexAt(60)).to.equal(4);
  });

  it('clamps lookups to the data set and handles an empty index', () => {
    const sums = new PrefixSums();
    expect(sums.indexAt(5)).to.equal(-1);
    sums.rebuild(3, () => 10);
    expect(sums.indexAt(-50)).to.equal(0);
    expect(sums.indexAt(9999)).to.equal(2);
  });
});

describe('VirtualizerController — fixed size', () => {
  it('renders only the window plus overscan for a huge data set', async () => {
    const el = await setup({ count: 100_000 });
    expect(el.virtualizer.totalSize).to.equal(4_000_000);
    // 200px viewport / 40px = 5 visible, +2 overscan below.
    expect(indexes(el)).to.deep.equal([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it('moves the window with scrolling and positions items by data index', async () => {
    const el = await setup({ count: 100_000 });
    await scrollTo(el, 4000); // index 100
    const rendered = indexes(el);
    expect(rendered[0]).to.equal(98);
    expect(rendered.at(-1)).to.equal(107);
    const row = rows(el).find((r) => r.dataset['index'] === '100')!;
    expect(row.style.transform).to.equal('translateY(4000px)');
  });

  it('does not re-render while scrolling inside the same window', async () => {
    const el = await setup({ count: 1000, overscan: 10 });
    const before = el.renders;
    await scrollTo(el, 30);
    expect(el.renders).to.equal(before);
    await scrollTo(el, 1000);
    expect(el.renders).to.be.greaterThan(before);
  });

  it('returns every item when windowing is disabled', async () => {
    const el = await setup({ count: 60, enabled: false });
    expect(indexes(el)).to.have.length(60);
  });

  it('recycles DOM nodes by key as the window moves', async () => {
    const el = await setup({ count: 1000 });
    const rowFor = (i: number) =>
      rows(el).find((r) => r.dataset['index'] === String(i));
    const kept = rowFor(6)!;
    await scrollTo(el, 80); // window now starts at 0 and covers 6 still
    expect(rowFor(6)).to.equal(kept);
  });

  it('derives aria-setsize/posinset/rowindex from data indexes', async () => {
    const el = await setup({ count: 5000 });
    expect(el.virtualizer.getAria(41)).to.deep.equal({
      'aria-setsize': 5000,
      'aria-posinset': 42,
    });
    expect(el.virtualizer.getAria(41, 'row')).to.deep.equal({
      'aria-rowindex': 42,
    });
  });

  it('keeps pinned indexes rendered outside the window', async () => {
    const el = await setup({ count: 1000 });
    el.pinned = [500];
    el.requestUpdate();
    await el.updateComplete;
    expect(indexes(el)).to.include(500);
    expect(indexes(el)).to.include(0);
  });

  it('keeps the active sticky item rendered and flags it', async () => {
    const el = await setup({ count: 1000 });
    el.sticky = [0, 100, 200];
    await scrollTo(el, 4400); // index 110, past sticky 100
    expect(el.virtualizer.activeStickyIndex).to.equal(100);
    const item = el.virtualizer.items.find((i) => i.index === 100)!;
    expect(item.sticky).to.be.true;
    expect(indexes(el)).to.include(100);
  });

  it('scrollToIndex aligns start, center, end and auto', async () => {
    const el = await setup({ count: 1000 });
    const v = el.virtualizer;
    v.scrollToIndex(50, { align: 'start' });
    await nextFrame();
    expect(scroller(el).scrollTop).to.equal(2000);
    v.scrollToIndex(50, { align: 'end' });
    await nextFrame();
    expect(scroller(el).scrollTop).to.equal(1840);
    v.scrollToIndex(50, { align: 'center' });
    await nextFrame();
    expect(scroller(el).scrollTop).to.equal(1920);
    v.scrollToIndex(51, { align: 'auto' }); // already visible: no movement
    await nextFrame();
    expect(scroller(el).scrollTop).to.equal(1920);
  });

  it('scrollToKey resolves through getItemKey', async () => {
    const el = await setup({ count: 1000 });
    el.getItemKey = (i) => `row-${i}`;
    el.requestUpdate();
    await el.updateComplete;
    el.virtualizer.scrollToKey('row-30', { align: 'start' });
    await nextFrame();
    expect(scroller(el).scrollTop).to.equal(1200);
  });

  it('resolves a window for 100k items quickly', async () => {
    const el = await setup({ count: 100_000 });
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      el.virtualizer.setOptions({
        count: 100_000,
        getScrollElement: () => scroller(el),
        itemSize: 40,
        overscan: 2,
      });
      void el.virtualizer.items;
    }
    expect(performance.now() - start).to.be.lessThan(100);
  });
});

describe('VirtualizerController — dynamic size', () => {
  it('corrects total size from measured items and adapts the estimate', async () => {
    const el = await setup({ count: 1000, dynamic: true });
    // Every row measures 40px; the 32px default estimate adapts to the measured average.
    await nextFrame();
    await el.updateComplete;
    expect(el.virtualizer.totalSize).to.be.closeTo(40_000, 1);
  });

  it('uses measured sizes for offsets', async () => {
    const el = await setup({ count: 1000, dynamic: true });
    el.heights.set(1, 100);
    el.requestUpdate();
    await el.updateComplete;
    await nextFrame();
    await nextFrame();
    expect(el.virtualizer.offsetOf(2)).to.be.closeTo(140, 1);
    const row2 = rows(el).find((r) => r.dataset['index'] === '2')!;
    expect(row2.style.transform).to.match(/translateY\(14\d(\.\d+)?px\)/);
  });

  it('keeps the viewport anchored when an item above it changes size', async () => {
    const el = await setup({ count: 1000, dynamic: true });
    await scrollTo(el, 2000); // first visible index 50, overscan renders 48..
    const anchor = rows(el).find((r) => r.dataset['index'] === '50')!;
    const topBefore =
      anchor.getBoundingClientRect().top -
      scroller(el).getBoundingClientRect().top;
    // The adaptive estimate re-anchors the first scroll, so compare against the settled position.
    const scrollBefore = scroller(el).scrollTop;
    const rendered = indexes(el);
    const above = rendered[0]!;
    expect(above).to.be.lessThan(50);

    el.heights.set(above, 100); // +60px, entirely above the viewport
    el.requestUpdate();
    await el.updateComplete;
    await nextFrame();
    await nextFrame();
    await nextFrame();

    const topAfter =
      anchor.getBoundingClientRect().top -
      scroller(el).getBoundingClientRect().top;
    expect(topAfter).to.be.closeTo(topBefore, 1);
    // At least the 60px the item grew by (the adaptive estimate may add a little more).
    expect(scroller(el).scrollTop).to.be.at.least(scrollBefore + 60 - 1);
  });

  it('scrollToIndex lands on the target after sizes are measured', async () => {
    const el = await setup({ count: 400, dynamic: true });
    for (let i = 0; i < 400; i++) el.heights.set(i, 20 + (i % 5) * 10);
    el.requestUpdate();
    await el.updateComplete;
    el.virtualizer.scrollToIndex(300, { align: 'start' });
    for (let i = 0; i < 12; i++) await nextFrame();
    await el.updateComplete;
    const target = rows(el).find((r) => r.dataset['index'] === '300')!;
    const delta =
      target.getBoundingClientRect().top -
      scroller(el).getBoundingClientRect().top;
    expect(delta).to.be.closeTo(0, 2);
  });
});

describe('VirtualizerController — lifecycle', () => {
  it('stops reacting to scroll and resize after the host disconnects', async () => {
    const el = await setup({ count: 1000 });
    const el_ = scroller(el);
    let updates = 0;
    const original = el.requestUpdate.bind(el);
    el.requestUpdate = ((...args: unknown[]) => {
      updates++;
      return (original as (...a: unknown[]) => unknown)(...args);
    }) as typeof el.requestUpdate;

    el.remove();
    el_.scrollTop = 3000;
    await nextFrame();
    await nextFrame();
    expect(updates).to.equal(0);
  });

  it('re-attaches when the host is moved and reconnected', async () => {
    const el = await setup({ count: 1000 });
    const parent = el.parentElement!;
    el.remove();
    parent.append(el);
    await el.updateComplete;
    await nextFrame();
    await scrollTo(el, 4000);
    expect(indexes(el)).to.include(100);
  });
});

describe('VirtualizerController — content taller than the spacer cap', () => {
  // 100,000 × 40px = 4,000,000px of content in a 100,000px spacer: a 40× compression, standing in
  // for the ~17.9M px element-height limit that Firefox enforces.
  const CAP = 100_000;
  const big = (): Promise<TestHost> =>
    setup({ count: 100_000, maxScrollSize: CAP });
  const viewport = (el: TestHost): number => scroller(el).clientHeight;
  const rowTop = (el: TestHost, index: number): number =>
    rows(el)
      .find((r) => r.dataset['index'] === String(index))!
      .getBoundingClientRect().top - scroller(el).getBoundingClientRect().top;

  it('caps the spacer but keeps the real content size', async () => {
    const el = await big();
    expect(el.virtualizer.totalSize).to.equal(4_000_000);
    expect(el.virtualizer.spacerSize).to.equal(CAP);
    expect(
      el.shadowRoot!.querySelector<HTMLElement>('.spacer')!.offsetHeight,
    ).to.equal(CAP);
  });

  it('leaves lists under the cap untouched (position equals start)', async () => {
    const el = await setup({ count: 1000, maxScrollSize: CAP });
    await scrollTo(el, 4000);
    for (const item of el.virtualizer.items)
      expect(item.position).to.equal(item.start);
    expect(el.virtualizer.spacerSize).to.equal(el.virtualizer.totalSize);
  });

  it('maps the scroll range onto the content so the middle shows the middle', async () => {
    const el = await big();
    await scrollTo(el, (CAP - viewport(el)) / 2);
    const expected = (4_000_000 - viewport(el)) / 2;
    expect(el.virtualizer.scrollOffset).to.be.closeTo(expected, 1);
    const first = Math.floor(expected / 40);
    expect(indexes(el)).to.include(first);
    // The row at the content offset sits where the content offset says it should.
    expect(rowTop(el, first)).to.be.closeTo(first * 40 - expected, 1);
  });

  it('can reach the very last item at the end of the scroll range', async () => {
    const el = await big();
    await scrollTo(el, CAP); // clamps to the maximum
    expect(indexes(el).at(-1)).to.equal(99_999);
    const bottom = rows(el)
      .find((r) => r.dataset['index'] === '99999')!
      .getBoundingClientRect().bottom;
    expect(bottom).to.be.closeTo(
      scroller(el).getBoundingClientRect().bottom,
      1,
    );
  });

  it('starts at the first item at the top', async () => {
    const el = await big();
    expect(indexes(el)[0]).to.equal(0);
    expect(rowTop(el, 0)).to.be.closeTo(0, 1);
  });

  it('scrollToIndex lands the item at the top, far past the cap', async () => {
    const el = await big();
    el.virtualizer.scrollToIndex(70_000, { align: 'start' });
    await nextFrame();
    await nextFrame();
    await el.updateComplete;
    expect(indexes(el)).to.include(70_000);
    // One scroll-element pixel is ~40 content pixels here, so the target can only land within one
    // step of the top; what matters is that placement matches the real scroll offset.
    const scale = (4_000_000 - viewport(el)) / (CAP - viewport(el));
    const top = rowTop(el, 70_000);
    expect(Math.abs(top)).to.be.at.most(scale);
    expect(top).to.be.closeTo(70_000 * 40 - el.virtualizer.scrollOffset, 1);
    el.virtualizer.scrollToIndex(99_999, { align: 'end' });
    await nextFrame();
    await nextFrame();
    await el.updateComplete;
    expect(indexes(el).at(-1)).to.equal(99_999);
  });

  it('keeps aria metadata on the data index while compressed', async () => {
    const el = await big();
    await scrollTo(el, CAP / 2);
    for (const index of indexes(el)) {
      expect(el.virtualizer.getAria(index)['aria-posinset']).to.equal(
        index + 1,
      );
      expect(el.virtualizer.getAria(index)['aria-setsize']).to.equal(100_000);
    }
  });
});
