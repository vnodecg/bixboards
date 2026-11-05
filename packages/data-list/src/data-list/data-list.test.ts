import {
  aTimeout,
  expect,
  fixture,
  html,
  nextFrame,
  oneEvent,
} from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import type { BxDataList, DataSource } from './data-list.ts';
import './index.ts';

interface Row {
  id: number;
  label: string;
  group?: string;
}

const make = (n: number, group = false): Row[] =>
  Array.from({ length: n }, (_, i) => ({
    id: i,
    label: `Item ${i}`,
    ...(group ? { group: `G${Math.floor(i / 10)}` } : {}),
  }));

async function setup(
  props: Partial<BxDataList<Row>> = {},
  style = 'block-size: 300px; inline-size: 500px',
): Promise<BxDataList<Row>> {
  const el = await fixture<BxDataList<Row>>(
    html`<bx-data-list style=${style} aria-label="Things"></bx-data-list>`,
  );
  Object.assign(el, props);
  await settle(el);
  return el;
}

async function settle(el: BxDataList<Row>): Promise<void> {
  await el.updateComplete;
  await nextFrame();
  await nextFrame();
  await el.updateComplete;
}

const viewport = (el: BxDataList<Row>) =>
  el.shadowRoot!.querySelector<HTMLElement>('.viewport')!;
const items = (el: BxDataList<Row>) => [
  ...el.shadowRoot!.querySelectorAll<HTMLElement>('.item'),
];
const idx = (e: HTMLElement) => Number(e.dataset['item']);

describe('bx-data-list', () => {
  it('registers and renders item text', async () => {
    const el = await setup({ items: make(5), itemHeight: 40 });
    expect(el).to.be.instanceOf(customElements.get('bx-data-list')!);
    expect(items(el).map((i) => i.textContent!.trim())).to.deep.equal([
      'Item 0',
      'Item 1',
      'Item 2',
      'Item 3',
      'Item 4',
    ]);
    expect(viewport(el).getAttribute('role')).to.equal('list');
    expect(items(el)[0]!.getAttribute('role')).to.equal('listitem');
  });

  it('virtualizes a huge list with aria-setsize/posinset from data', async () => {
    const el = await setup({ items: make(500_000), itemHeight: 40 });
    expect(items(el).length).to.be.lessThan(40);
    expect(items(el)[0]!.getAttribute('aria-setsize')).to.equal('500000');
    // 500k × 40px exceeds the spacer cap, so scrollTop is compressed: scale it to reach the
    // content offset 4,000,000 (item 100,000).
    const host = viewport(el);
    const scale =
      (500_000 * 40 - host.clientHeight) /
      (host.scrollHeight - host.clientHeight);
    host.scrollTop = 4_000_000 / scale;
    await settle(el);
    const first = idx(items(el)[0]!);
    expect(first).to.be.within(99_990, 100_000);
    expect(items(el)[0]!.getAttribute('aria-posinset')).to.equal(
      String(first + 1),
    );
  });

  it('measures variable-height rows and uses renderItem', async () => {
    const el = await setup({
      items: make(200),
      renderItem: (item: Row, i: number) =>
        html`<div style="block-size: ${20 + (i % 3) * 20}px">
          ${item.label}
        </div>`,
    });
    await aTimeout(50);
    expect(items(el).length).to.be.greaterThan(2);
    expect(viewport(el).scrollHeight).to.be.greaterThan(300);
  });

  it('emits bx-range-change as the window moves', async () => {
    const el = await setup({ items: make(1000), itemHeight: 40 });
    const ranges: { start: number; end: number }[] = [];
    el.addEventListener('bx-range-change', (e) =>
      ranges.push((e as CustomEvent).detail),
    );
    viewport(el).scrollTop = 2000;
    await settle(el);
    expect(ranges.at(-1)!.start).to.be.within(45, 51);
  });

  describe('grid', () => {
    it('derives columns from the container width and reflows without breakpoints', async () => {
      const el = await setup(
        {
          items: make(40),
          layout: 'grid',
          minItemWidth: '10rem',
          itemHeight: 80,
        },
        'block-size: 400px; inline-size: 700px',
      );
      await aTimeout(50);
      const cols = (e: BxDataList<Row>) =>
        new Set(
          items(e)
            .slice(0, 12)
            .map((i) => Math.round(i.getBoundingClientRect().left)),
        ).size;
      const wide = cols(el);
      expect(wide).to.be.greaterThan(2);
      el.style.inlineSize = '200px';
      await aTimeout(80);
      await settle(el);
      expect(cols(el)).to.be.lessThan(wide);
      el.layout = 'list';
      await settle(el);
      expect(cols(el)).to.equal(1);
    });
  });

  describe('groups', () => {
    it('renders group headers and sticks the active one', async () => {
      const el = await setup({
        items: make(100, true),
        groupBy: 'group',
        itemHeight: 40,
      });
      const headers = () => [
        ...el.shadowRoot!.querySelectorAll<HTMLElement>('.group-header'),
      ];
      expect(headers()[0]!.textContent!.trim()).to.equal('G0');
      viewport(el).scrollTop = 1500;
      await settle(el);
      const sticky = headers().find((h) => h.hasAttribute('data-sticky'));
      expect(sticky, 'a sticky header').to.exist;
      const top =
        sticky!.getBoundingClientRect().top -
        viewport(el).getBoundingClientRect().top;
      expect(top).to.be.closeTo(0, 2);
    });

    it('supports a group function and custom header rendering', async () => {
      const el = await setup({
        items: make(20),
        groupBy: (r: Row) => (r.id < 10 ? 'Low' : 'High'),
        renderGroupHeader: (g: string) => html`<b>${g} group</b>`,
        itemHeight: 40,
      });
      expect(
        el.shadowRoot!.querySelector('.group-header b')!.textContent,
      ).to.equal('Low group');
    });
  });

  describe('selection and keyboard', () => {
    it('selects on click (single replaces, multiple accumulates, shift ranges)', async () => {
      const el = await setup({
        items: make(20),
        selection: 'multiple',
        itemHeight: 40,
      });
      const changes: (string | number)[][] = [];
      el.addEventListener('bx-selection-change', (e) =>
        changes.push((e as CustomEvent).detail.selectedKeys),
      );
      items(el)[1]!.click();
      items(el)[3]!.click();
      await settle(el);
      expect(el.selectedKeys).to.deep.equal([1, 3]);
      items(el)[1]!.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          composed: true,
          shiftKey: true,
        }),
      );
      items(el)[5]!.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          composed: true,
          shiftKey: true,
        }),
      );
      await settle(el);
      expect(el.selectedKeys).to.include.members([1, 2, 3, 4, 5]);
      expect(items(el)[2]!.getAttribute('aria-selected')).to.equal('true');
      expect(viewport(el).getAttribute('role')).to.equal('listbox');
      expect(viewport(el).getAttribute('aria-multiselectable')).to.equal(
        'true',
      );

      const single = await setup({
        items: make(5),
        selection: 'single',
        itemHeight: 40,
      });
      items(single)[0]!.click();
      items(single)[2]!.click();
      expect(single.selectedKeys).to.deep.equal([2]);
    });

    it('moves the active item with arrows, Home/End, PageDown and announces it via aria-activedescendant', async () => {
      const el = await setup({
        items: make(500),
        selection: 'single',
        itemHeight: 40,
      });
      viewport(el).focus();
      await sendKeys({ press: 'ArrowDown' });
      await sendKeys({ press: 'ArrowDown' });
      await settle(el);
      expect(viewport(el).getAttribute('aria-activedescendant')).to.match(
        /-i1$/,
      );
      await sendKeys({ press: 'End' });
      await settle(el);
      await aTimeout(60);
      expect(viewport(el).getAttribute('aria-activedescendant')).to.match(
        /-i499$/,
      );
      expect(items(el).some((i) => idx(i) === 499)).to.be.true;
      await sendKeys({ press: 'Home' });
      await settle(el);
      expect(viewport(el).getAttribute('aria-activedescendant')).to.match(
        /-i0$/,
      );
      await sendKeys({ press: 'Space' });
      await settle(el);
      expect(el.selectedKeys).to.deep.equal([0]);
    });

    it('extends the selection with Shift+Arrow and selects all with Ctrl+A', async () => {
      const el = await setup({
        items: make(10),
        selection: 'multiple',
        itemHeight: 40,
      });
      viewport(el).focus();
      await sendKeys({ press: 'ArrowDown' });
      await sendKeys({ press: 'Space' });
      await sendKeys({ down: 'Shift' });
      await sendKeys({ press: 'ArrowDown' });
      await sendKeys({ press: 'ArrowDown' });
      await sendKeys({ up: 'Shift' });
      await settle(el);
      expect(el.selectedKeys).to.have.members([0, 1, 2]);
      await sendKeys({ press: 'Control+a' });
      await settle(el);
      expect(el.selectedKeys).to.have.length(10);
    });

    it('jumps by typeahead on item-label', async () => {
      const el = await setup({
        items: make(30),
        selection: 'single',
        itemHeight: 40,
      });
      viewport(el).focus();
      await sendKeys({ type: 'Item 2' });
      await settle(el);
      expect(viewport(el).getAttribute('aria-activedescendant')).to.match(
        /-i2$/,
      );
    });

    it('fires bx-item-click', async () => {
      const el = await setup({
        items: make(3),
        selection: 'single',
        itemHeight: 40,
      });
      const clicked = oneEvent(el, 'bx-item-click');
      items(el)[1]!.click();
      const detail = ((await clicked) as CustomEvent).detail;
      expect(detail.index).to.equal(1);
      expect(detail.key).to.equal(1);
    });
  });

  describe('reorder', () => {
    it('moves an item with Space, arrows, Space and cancels with Escape', async () => {
      const el = await setup({
        items: make(5),
        reorderable: true,
        itemHeight: 40,
      });
      const events: { from: number; to: number }[] = [];
      el.addEventListener('bx-reorder', (e) =>
        events.push((e as CustomEvent).detail),
      );
      viewport(el).focus();
      await sendKeys({ press: 'ArrowDown' });
      await sendKeys({ press: 'Space' });
      await sendKeys({ press: 'ArrowDown' });
      await sendKeys({ press: 'ArrowDown' });
      await sendKeys({ press: 'Space' });
      await settle(el);
      expect(el.items.map((r) => r.id)).to.deep.equal([1, 2, 0, 3, 4]);
      expect(events.at(-1)).to.deep.include({ from: 1, to: 2 });

      const live = el.shadowRoot!.querySelector('.sr')!.textContent;
      expect(live).to.contain('Dropped');

      await sendKeys({ press: 'Space' });
      await sendKeys({ press: 'ArrowUp' });
      await sendKeys({ press: 'Escape' });
      await settle(el);
      expect(el.items.map((r) => r.id)).to.deep.equal([1, 2, 0, 3, 4]);
    });

    it('drags an item by pointer and drops it on the target row', async () => {
      const el = await setup({
        items: make(6),
        reorderable: true,
        itemHeight: 40,
      });
      const done = oneEvent(el, 'bx-reorder');
      const first = items(el)[0]!;
      const box = first.getBoundingClientRect();
      const send = (type: string, y: number) =>
        document.dispatchEvent(
          new PointerEvent(type, {
            bubbles: true,
            composed: true,
            pointerId: 1,
            clientX: box.left + 10,
            clientY: y,
            button: 0,
          }),
        );
      first.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          composed: true,
          pointerId: 1,
          clientX: box.left + 10,
          clientY: box.top + 10,
          button: 0,
        }),
      );
      send('pointermove', box.top + 30);
      send('pointermove', box.top + 40 * 3 + 10);
      await nextFrame();
      await nextFrame();
      send('pointerup', box.top + 40 * 3 + 10);
      const detail = ((await done) as CustomEvent).detail;
      expect(detail.from).to.equal(0);
      expect(detail.to).to.equal(3);
      expect(el.items[3]!.id).to.equal(0);
    });
  });

  describe('reverse (chat)', () => {
    it('starts at the bottom and follows new items unless scrolled up', async () => {
      const el = await setup({
        items: make(100),
        direction: 'reverse',
        itemHeight: 40,
      });
      await aTimeout(80);
      const v = viewport(el);
      expect(v.scrollHeight - v.scrollTop - v.clientHeight).to.be.lessThan(5);

      el.items = make(105);
      await settle(el);
      await aTimeout(60);
      expect(v.scrollHeight - v.scrollTop - v.clientHeight).to.be.lessThan(5);

      v.scrollTop = 1000;
      await settle(el);
      const before = v.scrollTop;
      el.items = make(110);
      await settle(el);
      expect(Math.abs(v.scrollTop - before)).to.be.lessThan(5);
    });
  });

  describe('data source', () => {
    const source = (
      total: number,
      calls: { start: number }[] = [],
    ): DataSource<Row> => ({
      async getItems({ start, count }) {
        calls.push({ start });
        const rows = make(total).slice(start, start + count);
        return { items: rows, hasMore: start + count < total };
      },
    });

    it('loads the first page, then the next as the end nears, announcing each batch', async () => {
      const calls: { start: number }[] = [];
      const el = await setup({
        dataSource: source(200, calls),
        itemHeight: 40,
      });
      await aTimeout(50);
      expect(calls.map((c) => c.start)).to.include(0);
      expect(el.count).to.equal(50);
      expect(el.shadowRoot!.querySelector('.sr')!.textContent).to.contain(
        'Loaded 50',
      );
      viewport(el).scrollTop = viewport(el).scrollHeight;
      await aTimeout(120);
      await settle(el);
      expect(el.count).to.be.greaterThan(50);
      expect(calls.filter((c) => c.start === 50)).to.have.length(1); // de-duplicated
    });

    it('stops when there is no more data and aborts on disconnect', async () => {
      let signal: AbortSignal | undefined;
      const slow: DataSource<Row> = {
        getItems: ({ signal: s }) => {
          signal = s;
          return new Promise(() => undefined);
        },
      };
      const el = await setup({ dataSource: slow });
      const parent = el.parentElement!;
      el.remove();
      expect(signal!.aborted).to.be.true;
      parent.append(el);
    });

    it('reports failures with bx-data-error and recovers through refresh()', async () => {
      let fail = true;
      const flaky: DataSource<Row> = {
        async getItems() {
          if (fail) throw new Error('boom');
          return { items: make(3), hasMore: false };
        },
      };
      const el = await fixture<BxDataList<Row>>(
        html`<bx-data-list style="block-size: 200px"></bx-data-list>`,
      );
      const failed = oneEvent(el, 'bx-data-error');
      el.dataSource = flaky;
      expect(((await failed) as CustomEvent).detail.error.message).to.equal(
        'boom',
      );
      fail = false;
      el.refresh();
      await aTimeout(50);
      await settle(el);
      expect(el.count).to.equal(3);
    });
  });

  it('emits bx-load-more near the end without a data source, once per length', async () => {
    const el = await setup({ items: make(30), itemHeight: 40 });
    let loads = 0;
    el.addEventListener('bx-load-more', () => loads++);
    viewport(el).scrollTop = viewport(el).scrollHeight;
    await settle(el);
    await aTimeout(50);
    expect(loads).to.equal(1);
    viewport(el).scrollTop = 0;
    viewport(el).scrollTop = viewport(el).scrollHeight;
    await settle(el);
    expect(loads).to.equal(1);
  });

  it('shows empty and loading states', async () => {
    const el = await setup({ items: [], emptyLabel: 'Nothing here' });
    expect(el.shadowRoot!.querySelector('.state')!.textContent).to.contain(
      'Nothing here',
    );
    el.loading = true;
    await settle(el);
    expect(el.shadowRoot!.querySelector('[part="loading"]')).to.exist;
    expect(viewport(el).getAttribute('aria-busy')).to.equal('true');
  });

  it('invalidateItem re-measures a resized item', async () => {
    let tall = false;
    const el = await setup({
      items: make(50),
      renderItem: (item: Row, i: number) =>
        html`<div style="block-size: ${i === 0 && tall ? 120 : 30}px">
          ${item.label}
        </div>`,
    });
    await aTimeout(50);
    const before = viewport(el).scrollHeight;
    tall = true;
    el.requestUpdate();
    await settle(el);
    await aTimeout(50);
    expect(viewport(el).scrollHeight).to.be.greaterThan(before);
    el.invalidateItem(0);
    await settle(el);
  });

  it('has no axe violations (plain, selectable, grouped, empty)', async () => {
    const plain = await setup({ items: make(20), itemHeight: 40 });
    await expect(plain).to.be.accessible();
    const sel = await setup({
      items: make(20),
      selection: 'multiple',
      itemHeight: 40,
    });
    viewport(sel).focus();
    await sendKeys({ press: 'ArrowDown' });
    await expect(sel).to.be.accessible();
    const grouped = await setup({
      items: make(30, true),
      groupBy: 'group',
      itemHeight: 40,
    });
    await expect(grouped).to.be.accessible();
    const empty = await setup({ items: [] });
    await expect(empty).to.be.accessible();
  });
});
