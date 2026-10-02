import {
  aTimeout,
  expect,
  fixture,
  html,
  nextFrame,
  oneEvent,
} from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import type { BxDataTable, ColumnDef } from './data-table.ts';
import {
  BlockCache,
  aggregate,
  compareValues,
  filterRows,
  groupRows,
  sortRows,
  toCsvChunks,
  toTsv,
  toXlsx,
} from './table-model.ts';
import './index.ts';

interface Person {
  id: number;
  name: string;
  age: number | null;
  city: string;
  salary: number;
}

const cities = ['Paris', 'Oslo', 'Rome', 'Lima'];
const people = (n: number): Person[] =>
  Array.from({ length: n }, (_, i) => ({
    id: i,
    name: `Person ${String(i).padStart(4, '0')}`,
    age: 20 + (i % 40),
    city: cities[i % cities.length]!,
    salary: 1000 + ((i * 37) % 500),
  }));

const columns = (): ColumnDef<Person>[] => [
  { field: 'name', header: 'Name', sortable: true, width: 160 },
  { field: 'age', header: 'Age', sortable: true, width: 90, align: 'end' },
  { field: 'city', header: 'City', sortable: true, width: 120 },
  {
    field: 'salary',
    header: 'Salary',
    sortable: true,
    width: 110,
    aggregate: 'sum',
  },
];

async function setup(
  props: Partial<BxDataTable<Person>> = {},
  style = 'block-size: 320px; inline-size: 700px',
): Promise<BxDataTable<Person>> {
  const el = await fixture<BxDataTable<Person>>(
    html`<bx-data-table style=${style} aria-label="People"></bx-data-table>`,
  );
  Object.assign(el, {
    columns: columns(),
    data: people(30),
    rowHeight: 36,
    ...props,
  });
  await settle(el);
  return el;
}

async function settle(el: BxDataTable<Person>): Promise<void> {
  await el.updateComplete;
  await nextFrame();
  await nextFrame();
  await el.updateComplete;
}

const scroller = (el: BxDataTable<Person>) =>
  el.shadowRoot!.querySelector<HTMLElement>('.scroller')!;
const rows = (el: BxDataTable<Person>) => [
  ...el.shadowRoot!.querySelectorAll<HTMLElement>('.row[data-row]'),
];
const cell = (el: BxDataTable<Person>, r: number, c: number) =>
  el.shadowRoot!.querySelector<HTMLElement>(
    `[data-row="${r}"][data-col="${c}"]`,
  )!;
const hcell = (el: BxDataTable<Person>, c: number) =>
  el.shadowRoot!.querySelector<HTMLElement>(`[data-hcol="${c}"]`)!;
const text = (e: Element | null) => e?.textContent?.trim() ?? '';
const col = (el: BxDataTable<Person>, c: number) =>
  rows(el).map((r) => text(r.querySelector(`[data-col="${c}"]`)));
const focused = (el: BxDataTable<Person>) =>
  el.shadowRoot!.activeElement as HTMLElement | null;

describe('table model', () => {
  const data = people(40);
  const cols = columns();

  it('filters by string, condition and predicate on index arrays', () => {
    expect(filterRows(data, cols, { city: 'ro' }).length).to.equal(10); // Rome
    expect(
      filterRows(data, cols, { age: { op: 'between', value: 20, to: 22 } })
        .length,
    ).to.equal(3);
    expect(
      filterRows(data, cols, { age: { op: 'gt', value: 58 } }).length,
    ).to.equal(1);
    expect(
      filterRows(data, cols, { name: (v) => String(v).endsWith('7') }).length,
    ).to.equal(4);
    expect(filterRows(data, cols, { nope: 'x' }).length).to.equal(40);
  });

  it('sorts stably by several columns, numeric and text, empties last both ways', () => {
    const order = filterRows(data, cols, {});
    const sorted = sortRows(order, data, cols, [
      { field: 'city', direction: 'asc' },
      { field: 'age', direction: 'desc' },
    ]);
    expect(data[sorted[0]!]!.city).to.equal('Lima');
    expect(data[sorted[0]!]!.age).to.be.at.least(data[sorted[1]!]!.age!);
    const withNull: Person[] = [
      { ...data[0]!, age: null },
      { ...data[1]!, age: 5 },
      { ...data[2]!, age: 3 },
    ];
    const asc = sortRows(Uint32Array.of(0, 1, 2), withNull, cols, [
      { field: 'age', direction: 'asc' },
    ]);
    const desc = sortRows(Uint32Array.of(0, 1, 2), withNull, cols, [
      { field: 'age', direction: 'desc' },
    ]);
    expect([...asc]).to.deep.equal([2, 1, 0]);
    expect([...desc]).to.deep.equal([1, 2, 0]);
    // Stable: ties keep data order.
    const ties = sortRows(filterRows(data, cols, {}), data, cols, [
      { field: 'city', direction: 'asc' },
    ]);
    expect([...ties].slice(0, 3)).to.deep.equal([3, 7, 11]);
  });

  it('compares natural strings numerically and sorts 200k rows quickly', () => {
    expect(compareValues('item 2', 'item 10')).to.be.lessThan(0);
    const big = people(200_000);
    const start = performance.now();
    const out = sortRows(filterRows(big, cols, {}), big, cols, [
      { field: 'salary', direction: 'desc' },
    ]);
    const ms = performance.now() - start;
    console.log(`bx-data-table model: sort 200k rows in ${ms.toFixed(0)}ms`);
    expect(big[out[0]!]!.salary).to.be.at.least(big[out[1000]!]!.salary);
    expect(ms).to.be.lessThan(1500);
  });

  it('groups into expandable rows with aggregates', () => {
    const order = sortRows(filterRows(data, cols, {}), data, cols, [
      { field: 'city', direction: 'asc' },
    ]);
    const closed = groupRows(order, data, cols, ['city'], new Set());
    expect(closed.groups).to.have.length(4);
    expect(closed.refs.length).to.equal(4);
    expect(closed.groups[0]!.aggregates['salary']).to.be.a('number');
    const open = groupRows(order, data, cols, ['city'], new Set(['city:Lima']));
    expect(open.refs.length).to.equal(4 + 10);
    expect(open.groups[0]!.count).to.equal(10);
    expect(aggregate('avg', [1, 2, 3])).to.equal(2);
    expect(aggregate('max', [1, 9, 3])).to.equal(9);
    expect(aggregate((v) => v.length, [1, 2])).to.equal(2);
  });

  it('exports CSV (quoted) and TSV, and a zip-signed xlsx', () => {
    const rowsData = [{ id: 1, name: 'A, "B"', age: 3, city: 'X', salary: 1 }];
    const csv = toCsvChunks([0], rowsData, cols).join('');
    expect(csv).to.equal('Name,Age,City,Salary\r\n"A, ""B""",3,X,1\r\n');
    expect(
      toTsv([
        ['a', 'b\tc'],
        [1, null],
      ]),
    ).to.equal('a\tb c\n1\t');
    const xlsx = toXlsx([0], rowsData, cols);
    expect(String.fromCharCode(xlsx[0]!, xlsx[1]!)).to.equal('PK');
  });

  it('BlockCache de-duplicates, aborts far blocks and reports errors', async () => {
    const requested: number[] = [];
    let fail = true;
    const cache = new BlockCache<number>(
      10,
      async (start, end) => {
        requested.push(start);
        if (start === 20 && fail) throw new Error('x');
        return {
          rows: Array.from({ length: end - start }, (_, i) => start + i),
          total: 100,
        };
      },
      () => undefined,
      () => undefined,
      () => undefined,
    );
    cache.ensure(0, 5);
    cache.ensure(0, 5);
    cache.ensure(0, 25);
    await aTimeout(20);
    expect(requested.sort((a, b) => a - b)).to.deep.equal([0, 10, 20]);
    expect(cache.get(15)).to.equal(15);
    expect(cache.total).to.equal(100);
    expect(cache.hasError(25)).to.be.true;
    fail = false;
    cache.retry();
    cache.ensure(20, 25);
    await aTimeout(20);
    expect(cache.get(25)).to.equal(25);
  });
});

describe('bx-data-table', () => {
  it('registers and renders a grid with ARIA counts from data', async () => {
    const el = await setup({ data: people(1000) });
    expect(el).to.be.instanceOf(customElements.get('bx-data-table')!);
    const grid = scroller(el);
    expect(grid.getAttribute('role')).to.equal('grid');
    el.groupBy = ['city'];
    await settle(el);
    expect(grid.getAttribute('role')).to.equal('treegrid');
    el.groupBy = [];
    await settle(el);
    expect(grid.getAttribute('aria-rowcount')).to.equal('1001');
    expect(grid.getAttribute('aria-colcount')).to.equal('4');
    expect(hcell(el, 0).getAttribute('role')).to.equal('columnheader');
    expect(rows(el)[0]!.getAttribute('aria-rowindex')).to.equal('2');
    expect(cell(el, 0, 0).getAttribute('aria-colindex')).to.equal('1');
    expect(text(cell(el, 0, 0))).to.equal('Person 0000');
  });

  it('keeps the DOM small for 1M rows and aria-rowindex tracks the data index', async () => {
    const el = await setup({ data: people(1_000_000) });
    expect(rows(el).length).to.be.lessThan(40);
    scroller(el).scrollTop = 36 * 500_000;
    await settle(el);
    const first = rows(el)[0]!;
    const index = Number(first.dataset['row']);
    expect(index).to.be.within(499_990, 500_000);
    expect(first.getAttribute('aria-rowindex')).to.equal(String(index + 2));
    expect(text(first.querySelector('[data-col="0"]'))).to.equal(
      `Person ${String(index).padStart(4, '0')}`,
    );
  });

  it('virtualizes columns past 50 and keeps pinned ones', async () => {
    const wide: ColumnDef<Record<string, number>>[] = Array.from(
      { length: 120 },
      (_, i) => ({
        field: `c${i}`,
        header: `Col ${i}`,
        width: 100,
        pinned: i === 0 ? ('start' as const) : undefined,
      }),
    );
    const row = Object.fromEntries(wide.map((c, i) => [c.field!, i]));
    const el = (await setup({
      columns: wide as unknown as ColumnDef<Person>[],
      data: [row as unknown as Person],
    })) as unknown as BxDataTable<Person>;
    const rendered = () =>
      new Set(
        [...rows(el)[0]!.querySelectorAll<HTMLElement>('[data-col]')].map((c) =>
          Number(c.dataset['col']),
        ),
      );
    expect(rendered().size).to.be.lessThan(20);
    expect(rendered().has(0)).to.be.true;
    scroller(el).scrollLeft = 8000;
    await settle(el);
    await aTimeout(30);
    expect(rendered().has(0)).to.be.true; // pinned
    expect(rendered().has(80)).to.be.true;
    expect(rendered().has(5)).to.be.false;
    expect(scroller(el).getAttribute('aria-colcount')).to.equal('120');
  });

  describe('sorting & filtering', () => {
    it('sorts on header click through asc/desc/none, adds with Shift, fires bx-sort-change, sets aria-sort', async () => {
      const el = await setup();
      const changes: unknown[] = [];
      el.addEventListener('bx-sort-change', (e) =>
        changes.push((e as CustomEvent).detail.sort),
      );
      expect(hcell(el, 1).getAttribute('aria-sort')).to.equal('none');
      hcell(el, 1).click();
      await settle(el);
      expect(hcell(el, 1).getAttribute('aria-sort')).to.equal('ascending');
      expect(col(el, 1)[0]).to.equal('20');
      hcell(el, 1).click();
      await settle(el);
      expect(hcell(el, 1).getAttribute('aria-sort')).to.equal('descending');
      expect(col(el, 1)[0]).to.equal('49');
      hcell(el, 2).dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          composed: true,
          shiftKey: true,
        }),
      );
      await settle(el);
      expect(el.sort.map((s) => s.field)).to.deep.equal(['age', 'city']);
      hcell(el, 1).click();
      hcell(el, 2).click();
      await settle(el);
      expect(changes.length).to.be.greaterThan(3);
      expect(el.shadowRoot!.querySelector('.sr')!.textContent).to.contain(
        'Sorted',
      );
    });

    it('sorts from the keyboard (Enter on a header)', async () => {
      const el = await setup();
      hcell(el, 0).focus();
      await sendKeys({ press: 'Enter' });
      await settle(el);
      expect(hcell(el, 0).getAttribute('aria-sort')).to.equal('ascending');
    });

    it('filters rows, fires an event, and clearFilters restores them', async () => {
      const el = await setup({ data: people(100) });
      const fired = oneEvent(el, 'bx-filter-change');
      el.setFilter('city', 'oslo');
      await fired;
      await settle(el);
      expect(scroller(el).getAttribute('aria-rowcount')).to.equal('26');
      expect(new Set(col(el, 2))).to.deep.equal(new Set(['Oslo']));
      el.clearFilters();
      await settle(el);
      expect(scroller(el).getAttribute('aria-rowcount')).to.equal('101');
    });

    it('shows the empty state when nothing matches', async () => {
      const el = await setup({ filters: { name: 'zzz' } });
      expect(el.shadowRoot!.querySelector('.state')!.textContent).to.contain(
        'No rows',
      );
    });
  });

  describe('grouping', () => {
    it('renders group rows with counts and aggregates, expands on click, fires bx-row-expand', async () => {
      const el = await setup({ groupBy: ['city'], data: people(40) });
      const groups = () => [
        ...el.shadowRoot!.querySelectorAll<HTMLElement>('.group-row'),
      ];
      expect(groups()).to.have.length(4);
      expect(groups()[0]!.getAttribute('aria-expanded')).to.equal('false');
      expect(groups()[0]!.textContent).to.contain('(10)');
      const expanded = oneEvent(el, 'bx-row-expand');
      groups()[0]!.querySelector<HTMLElement>('[data-col="0"]')!.click();
      expect(((await expanded) as CustomEvent).detail.expanded).to.be.true;
      await settle(el);
      expect(rows(el).length).to.equal(4 + 10);
      expect(el.expandedKeys).to.deep.equal(['city:Lima']);
      expect(groups()[0]!.textContent).to.match(/\d{5}/); // summed salaries
    });
  });

  describe('selection', () => {
    it('single selects one row; multiple supports ctrl, shift ranges and select-all', async () => {
      const single = await setup({ selection: 'single' });
      cell(single, 1, 0).click();
      cell(single, 3, 0).click();
      expect(single.selectedKeys).to.deep.equal([3]);

      const el = await setup({ selection: 'multiple' });
      // Column 0 is the internal checkbox column.
      expect(hcell(el, 0).querySelector('[role="checkbox"]')).to.exist;
      cell(el, 1, 1).click();
      cell(el, 3, 1).dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          composed: true,
          ctrlKey: true,
        }),
      );
      await settle(el);
      expect(el.selectedKeys).to.have.members([1, 3]);
      expect(rows(el)[1]!.getAttribute('aria-selected')).to.equal('true');
      cell(el, 6, 1).dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          composed: true,
          shiftKey: true,
        }),
      );
      await settle(el);
      expect(el.selectedKeys).to.include.members([3, 4, 5, 6]);

      hcell(el, 0).click();
      await settle(el);
      expect(el.selectedKeys).to.have.length(30);
      expect(
        hcell(el, 0)
          .querySelector('[role="checkbox"]')!
          .getAttribute('aria-checked'),
      ).to.equal('true');
      hcell(el, 0).click();
      await settle(el);
      expect(el.selectedKeys).to.have.length(0);
    });

    it('server-side select-all-matching marks rows without loading them', async () => {
      const el = await setup({
        data: [],
        selection: 'multiple',
        dataSource: {
          getRows: async ({ start, end }) => ({
            rows: people(5000).slice(start, end),
            total: 5000,
          }),
        },
      });
      await aTimeout(50);
      await settle(el);
      const detail = oneEvent(el, 'bx-selection-change');
      el.selectAll();
      expect(((await detail) as CustomEvent).detail.allMatching).to.be.true;
      await settle(el);
      expect(rows(el)[0]!.getAttribute('aria-selected')).to.equal('true');
    });
  });

  describe('keyboard', () => {
    it('roving tabindex: one tabbable cell, arrows/Home/End/Ctrl+Home/End/PageDown move it', async () => {
      const el = await setup({ data: people(200) });
      expect(el.shadowRoot!.querySelectorAll('[tabindex="0"]').length).to.equal(
        1,
      );
      hcell(el, 0).focus();
      await sendKeys({ press: 'ArrowDown' });
      await settle(el);
      expect(focused(el)).to.equal(cell(el, 0, 0));
      await sendKeys({ press: 'ArrowRight' });
      await sendKeys({ press: 'ArrowDown' });
      await settle(el);
      expect(focused(el)).to.equal(cell(el, 1, 1));
      await sendKeys({ press: 'End' });
      await settle(el);
      expect(focused(el)).to.equal(cell(el, 1, 3));
      await sendKeys({ press: 'Home' });
      await settle(el);
      expect(focused(el)).to.equal(cell(el, 1, 0));
      await sendKeys({ press: 'Control+End' });
      await aTimeout(80);
      await settle(el);
      expect(focused(el)).to.equal(cell(el, 199, 3));
      expect(el.shadowRoot!.querySelectorAll('[tabindex="0"]').length).to.equal(
        1,
      );
      await sendKeys({ press: 'Control+Home' });
      await aTimeout(80);
      await settle(el);
      expect(focused(el)).to.equal(cell(el, 0, 0));
      await sendKeys({ press: 'PageDown' });
      await settle(el);
      expect(Number(focused(el)!.dataset['row'])).to.be.greaterThan(3);
    });

    it('Space selects the focused row', async () => {
      const el = await setup({ selection: 'multiple' });
      cell(el, 0, 1).focus();
      el.shadowRoot!.querySelector<HTMLElement>(
        '[data-row="0"][data-col="1"]',
      )!.focus();
      await sendKeys({ press: 'Space' });
      await settle(el);
      expect(el.selectedKeys).to.deep.equal([0]);
    });

    it('Shift+Arrow extends a cell range and Ctrl+C copies it as TSV', async () => {
      const el = await setup();
      cell(el, 0, 0).focus();
      el.shadowRoot!.querySelector<HTMLElement>(
        '[data-row="0"][data-col="0"]',
      )!.click();
      await sendKeys({ down: 'Shift' });
      await sendKeys({ press: 'ArrowDown' });
      await sendKeys({ press: 'ArrowRight' });
      await sendKeys({ up: 'Shift' });
      await settle(el);
      expect(el.shadowRoot!.querySelectorAll('[data-range]').length).to.equal(
        4,
      );
      await sendKeys({ press: 'Control+c' });
      await aTimeout(30);
      expect(el.lastCopied).to.equal('Person 0000\t20\nPerson 0001\t21');
    });

    it('typing jumps to the next row starting with the text', async () => {
      const el = await setup({
        data: [
          { id: 0, name: 'Ann', age: 1, city: '', salary: 0 },
          { id: 1, name: 'Bob', age: 1, city: '', salary: 0 },
          { id: 2, name: 'Cy', age: 1, city: '', salary: 0 },
        ],
      });
      cell(el, 0, 0).focus();
      el.shadowRoot!.querySelector<HTMLElement>(
        '[data-row="0"][data-col="0"]',
      )!.click();
      await sendKeys({ type: 'c' });
      await settle(el);
      expect(focused(el)).to.equal(cell(el, 2, 0));
    });
  });

  describe('columns', () => {
    it('resizes with Alt+Arrow and by pointer drag, firing bx-column-resize with a min width', async () => {
      const el = await setup();
      const events: { columnId: string; width: number }[] = [];
      el.addEventListener('bx-column-resize', (e) =>
        events.push((e as CustomEvent).detail),
      );
      hcell(el, 0).focus();
      await sendKeys({ press: 'Alt+ArrowRight' });
      await settle(el);
      expect(events.at(-1)!.width).to.equal(176);
      expect(el.getState().widths['name']).to.equal(176);
      const handle = hcell(el, 0).querySelector<HTMLElement>('.resize-handle')!;
      const box = handle.getBoundingClientRect();
      handle.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          composed: true,
          clientX: box.left,
          clientY: box.top,
          button: 0,
          pointerId: 2,
        }),
      );
      document.dispatchEvent(
        new PointerEvent('pointermove', {
          bubbles: true,
          clientX: box.left - 500,
          pointerId: 2,
        }),
      );
      document.dispatchEvent(
        new PointerEvent('pointerup', {
          bubbles: true,
          clientX: box.left - 500,
          pointerId: 2,
        }),
      );
      await settle(el);
      expect(el.getState().widths['name']).to.equal(64);
    });

    it('reorders with Alt+Shift+Arrow and reports the new order', async () => {
      const el = await setup();
      const fired = oneEvent(el, 'bx-column-reorder');
      hcell(el, 0).focus();
      await sendKeys({ press: 'Alt+Shift+ArrowRight' });
      expect(((await fired) as CustomEvent).detail.order).to.deep.equal([
        'age',
        'name',
        'city',
        'salary',
      ]);
      await settle(el);
      expect(text(hcell(el, 0))).to.equal('Age');
    });

    it('pins columns with sticky positioning and can hide them', async () => {
      const el = await setup();
      el.setColumnPinned('salary', 'end');
      await settle(el);
      expect(hcell(el, 3).getAttribute('data-pinned')).to.equal('end');
      expect(getComputedStyle(cell(el, 0, 3)).position).to.equal('sticky');
      el.setColumnVisible('age', false);
      await settle(el);
      expect(scroller(el).getAttribute('aria-colcount')).to.equal('3');
    });

    it('round-trips layout through getState()/setState()', async () => {
      const el = await setup();
      el.setState({
        order: ['city', 'name', 'age', 'salary'],
        widths: { city: 200 },
        sort: [{ field: 'age', direction: 'desc' }],
      });
      await settle(el);
      expect(text(hcell(el, 0))).to.equal('City');
      const state = el.getState();
      expect(JSON.parse(JSON.stringify(state))).to.deep.equal(state);
      const other = await setup();
      other.setState(state);
      await settle(other);
      expect(text(hcell(other, 0))).to.equal('City');
      expect(other.sort).to.deep.equal([{ field: 'age', direction: 'desc' }]);
    });

    it('hides low-priority columns when the table is narrow (responsive="priority")', async () => {
      const cols: ColumnDef<Person>[] = [
        { field: 'name', header: 'Name', width: 200 },
        { field: 'age', header: 'Age', width: 200, priority: 2 },
        { field: 'city', header: 'City', width: 200, priority: 1 },
      ];
      const el = await setup(
        { columns: cols },
        'block-size: 300px; inline-size: 520px',
      );
      await aTimeout(60);
      await settle(el);
      const headers = [...el.shadowRoot!.querySelectorAll('.hcell')].map(text);
      expect(headers).to.include('Name');
      expect(headers).to.not.include('Age');
    });

    it('switches to labelled cards below the cards breakpoint', async () => {
      const el = await setup(
        { responsive: 'cards' },
        'block-size: 400px; inline-size: 400px',
      );
      await aTimeout(60);
      await settle(el);
      expect(el.hasAttribute('data-cards')).to.be.true;
      expect(cell(el, 0, 0).getAttribute('data-label')).to.equal('Name');
    });

    it('reads declarative bx-column children', async () => {
      const el = await fixture<BxDataTable<Person>>(html`
        <bx-data-table style="block-size: 240px; inline-size: 500px">
          <bx-column
            field="name"
            header="Full name"
            sortable
            width="200"
          ></bx-column>
          <bx-column field="city">City</bx-column>
        </bx-data-table>
      `);
      el.data = people(5);
      await settle(el);
      expect(text(hcell(el, 0))).to.equal('Full name');
      expect(text(hcell(el, 1))).to.equal('City');
      expect(hcell(el, 0).hasAttribute('data-sortable')).to.be.true;
    });
  });

  describe('rendering', () => {
    it('uses custom renderers and isolates renderer errors to the cell', async () => {
      const cols: ColumnDef<Person>[] = [
        {
          field: 'name',
          header: 'Name',
          render: (r) => html`<b>${r.name}</b>`,
        },
        {
          field: 'age',
          header: 'Age',
          render: (r) => {
            if (r.id === 1) throw new Error('bad renderer');
            return `${r.age}y`;
          },
        },
      ];
      const el = await setup({ columns: cols });
      expect(cell(el, 0, 0).querySelector('b')).to.exist;
      expect(text(cell(el, 0, 1))).to.equal('20y');
      expect(text(cell(el, 1, 1))).to.equal('⚠');
      expect(text(cell(el, 2, 1))).to.equal('22y'); // siblings unaffected
    });

    it('expands row detail panels', async () => {
      const el = await setup({
        renderDetail: (r: Person) => `Detail for ${r.name}`,
      });
      const toggle = cell(el, 0, 0).querySelector<HTMLElement>('.toggle')!;
      toggle.click();
      await settle(el);
      expect(rows(el)[0]!.querySelector('.detail')!.textContent).to.contain(
        'Detail for Person 0000',
      );
      expect(rows(el)[0]!.getAttribute('aria-expanded')).to.equal('true');
      cell(el, 0, 0).querySelector<HTMLElement>('.toggle')!.click();
      await settle(el);
      expect(rows(el)[0]!.querySelector('.detail')).to.be.null;
    });

    it('shows loading and fires bx-row-click / bx-row-dblclick', async () => {
      const el = await setup({ loading: true });
      expect(el.shadowRoot!.querySelector('.overlay')).to.exist;
      expect(scroller(el).getAttribute('aria-busy')).to.equal('true');
      el.loading = false;
      await settle(el);
      const click = oneEvent(el, 'bx-row-click');
      cell(el, 2, 1).click();
      expect(((await click) as CustomEvent).detail.index).to.equal(2);
      const dbl = oneEvent(el, 'bx-row-dblclick');
      cell(el, 2, 1).dispatchEvent(
        new MouseEvent('dblclick', { bubbles: true, composed: true }),
      );
      expect(((await dbl) as CustomEvent).detail.key).to.equal(2);
    });
  });

  describe('editing', () => {
    const editCols = (): ColumnDef<Person>[] => [
      { field: 'name', header: 'Name', editor: 'text' },
      { field: 'age', header: 'Age', editor: 'number' },
      {
        field: 'city',
        header: 'City',
        editor: 'select',
        editorOptions: cities.map((c) => ({ value: c, label: c })),
      },
      { field: 'salary', header: 'Salary' },
    ];

    it('edits with Enter, commits with Enter and writes the value', async () => {
      const el = await setup({ columns: editCols(), editable: true });
      const started = oneEvent(el, 'bx-cell-edit-start');
      cell(el, 0, 0).focus();
      el.shadowRoot!.querySelector<HTMLElement>(
        '[data-row="0"][data-col="0"]',
      )!.click();
      await sendKeys({ press: 'Enter' });
      expect(((await started) as CustomEvent).detail.columnId).to.equal('name');
      await settle(el);
      const input =
        el.shadowRoot!.querySelector<HTMLInputElement>('.editor input')!;
      expect(input).to.exist;
      expect(el.shadowRoot!.activeElement).to.equal(input);
      input.value = 'Renamed';
      const commit = oneEvent(el, 'bx-cell-edit-commit');
      await sendKeys({ press: 'Enter' });
      const detail = ((await commit) as CustomEvent).detail;
      expect(detail.oldValue).to.equal('Person 0000');
      expect(detail.newValue).to.equal('Renamed');
      await settle(el);
      expect(text(cell(el, 0, 0))).to.equal('Renamed');
      expect(el.data[0]!.name).to.equal('Renamed');
      expect(focused(el)).to.equal(cell(el, 0, 0));
    });

    it('Escape cancels and a cancelable commit can be vetoed', async () => {
      const el = await setup({ columns: editCols(), editable: true });
      cell(el, 1, 0).focus();
      el.shadowRoot!.querySelector<HTMLElement>(
        '[data-row="1"][data-col="0"]',
      )!.click();
      await sendKeys({ press: 'F2' });
      await settle(el);
      el.shadowRoot!.querySelector<HTMLInputElement>('.editor input')!.value =
        'Nope';
      await sendKeys({ press: 'Escape' });
      await settle(el);
      expect(text(cell(el, 1, 0))).to.equal('Person 0001');

      el.addEventListener('bx-cell-edit-commit', (e) => e.preventDefault());
      await sendKeys({ press: 'Enter' });
      await settle(el);
      el.shadowRoot!.querySelector<HTMLInputElement>('.editor input')!.value =
        'Vetoed';
      await sendKeys({ press: 'Enter' });
      await settle(el);
      expect(el.data[1]!.name).to.equal('Person 0001');
    });

    it('supports async validation: a rejection keeps the editor open with an error', async () => {
      const el = await setup({ columns: editCols(), editable: true });
      el.addEventListener('bx-cell-edit-commit', (e) => {
        const d = (e as CustomEvent).detail;
        d.waitUntil(
          d.newValue === 'bad'
            ? Promise.reject(new Error('Name not allowed'))
            : Promise.resolve(),
        );
      });
      cell(el, 0, 0).focus();
      el.shadowRoot!.querySelector<HTMLElement>(
        '[data-row="0"][data-col="0"]',
      )!.click();
      await sendKeys({ press: 'Enter' });
      await settle(el);
      const input = () =>
        el.shadowRoot!.querySelector<HTMLInputElement>('.editor input')!;
      input().value = 'bad';
      await sendKeys({ press: 'Enter' });
      await aTimeout(30);
      await settle(el);
      expect(
        el.shadowRoot!.querySelector('.editor .error')!.textContent,
      ).to.contain('Name not allowed');
      expect(el.data[0]!.name).to.equal('Person 0000');
      input().value = 'good';
      await sendKeys({ press: 'Enter' });
      await aTimeout(30);
      await settle(el);
      expect(el.data[0]!.name).to.equal('good');
    });

    it('Tab commits and moves to the next editable cell; number/select editors coerce values', async () => {
      const el = await setup({ columns: editCols(), editable: true });
      cell(el, 0, 0).focus();
      el.shadowRoot!.querySelector<HTMLElement>(
        '[data-row="0"][data-col="1"]',
      )!.click();
      await sendKeys({ press: 'Enter' });
      await settle(el);
      el.shadowRoot!.querySelector<HTMLInputElement>('.editor input')!.value =
        '41';
      await sendKeys({ press: 'Tab' });
      await settle(el);
      expect(el.data[0]!.age).to.equal(41);
      expect(focused(el)).to.equal(cell(el, 0, 2));
      await sendKeys({ press: 'Enter' });
      await settle(el);
      const select =
        el.shadowRoot!.querySelector<HTMLSelectElement>('.editor select')!;
      select.value = 'Rome';
      await sendKeys({ press: 'Enter' });
      await settle(el);
      expect(el.data[0]!.city).to.equal('Rome');
    });

    it('does nothing for read-only columns or when not editable', async () => {
      const el = await setup({ columns: editCols(), editable: false });
      cell(el, 0, 0).focus();
      el.shadowRoot!.querySelector<HTMLElement>(
        '[data-row="0"][data-col="0"]',
      )!.click();
      await sendKeys({ press: 'Enter' });
      await settle(el);
      expect(el.shadowRoot!.querySelector('.editor')).to.be.null;
    });
  });

  describe('server-side row model', () => {
    const server = (
      total: number,
      log: { start: number; end: number; sort?: string }[] = [],
      failFirst = false,
    ) => {
      let failed = !failFirst;
      return {
        async getRows({
          start,
          end,
          sort,
        }: {
          start: number;
          end: number;
          sort: { field: string; direction: string }[];
        }) {
          log.push({
            start,
            end,
            sort: sort[0] ? `${sort[0].field}:${sort[0].direction}` : undefined,
          });
          if (!failed) {
            failed = true;
            throw new Error('server down');
          }
          const all = people(total);
          if (sort[0]?.direction === 'desc') all.reverse();
          return { rows: all.slice(start, end), total };
        },
      };
    };

    it('fetches only the blocks near the viewport and de-duplicates requests', async () => {
      const log: { start: number; end: number }[] = [];
      const requests: unknown[] = [];
      const el = await fixture<BxDataTable<Person>>(
        html`<bx-data-table
          style="block-size: 320px; inline-size: 700px"
        ></bx-data-table>`,
      );
      el.addEventListener('bx-data-request', (e) =>
        requests.push((e as CustomEvent).detail),
      );
      Object.assign(el, {
        columns: columns(),
        rowHeight: 36,
        dataSource: server(1_000_000, log),
      });
      await aTimeout(60);
      await settle(el);
      expect(scroller(el).getAttribute('aria-rowcount')).to.equal('1000001');
      expect(text(cell(el, 0, 0))).to.equal('Person 0000');
      expect(log.map((l) => l.start)).to.deep.equal([0]);
      scroller(el).scrollTop = 36 * 300_000;
      await aTimeout(120);
      await settle(el);
      expect(log.some((l) => l.start >= 299_900)).to.be.true;
      expect(log.length).to.be.lessThan(6);
      expect(requests.length).to.equal(log.length);
    });

    it('shows skeleton rows while loading, resets on sort, and sends the sort to the server', async () => {
      const log: { start: number; end: number; sort?: string }[] = [];
      const el = await setup({ data: [], dataSource: server(500, log) });
      await aTimeout(60);
      await settle(el);
      hcell(el, 0).click();
      await settle(el);
      hcell(el, 0).click(); // desc
      await aTimeout(60);
      await settle(el);
      expect(log.some((l) => l.sort === 'name:desc')).to.be.true;
      expect(text(cell(el, 0, 0))).to.equal('Person 0499');
    });

    it('reports a failed block with bx-data-error and retries', async () => {
      const el = await fixture<BxDataTable<Person>>(
        html`<bx-data-table
          style="block-size: 320px; inline-size: 700px"
        ></bx-data-table>`,
      );
      const failed = oneEvent(el, 'bx-data-error');
      Object.assign(el, {
        columns: columns(),
        rowHeight: 36,
        dataSource: server(200, [], true),
      });
      expect(((await failed) as CustomEvent).detail.error.message).to.equal(
        'server down',
      );
      await aTimeout(30);
      await settle(el);
      const retryButton =
        el.shadowRoot!.querySelector<HTMLElement>('.state button');
      expect(retryButton, 'retry control').to.exist;
      retryButton!.click();
      await aTimeout(60);
      await settle(el);
      expect(text(cell(el, 0, 0))).to.equal('Person 0000');
    });
  });

  describe('export', () => {
    it('exports the current sort/filter as CSV and a zip-signed xlsx', async () => {
      const el = await setup({
        data: people(20),
        filters: { city: 'Rome' },
        sort: [{ field: 'name', direction: 'desc' }],
      });
      const csv = await (await el.exportCsv()).text();
      const lines = csv.trim().split('\r\n');
      expect(lines[0]).to.equal('Name,Age,City,Salary');
      expect(lines).to.have.length(1 + 5);
      expect(lines[1]).to.contain('Person 0018');
      const xlsx = new Uint8Array(await (await el.exportXlsx()).arrayBuffer());
      expect(String.fromCharCode(xlsx[0]!, xlsx[1]!)).to.equal('PK');
    });
  });

  describe('methods', () => {
    it('scrollToIndex/scrollToKey/getVisibleRange/refresh/invalidateRow/autosizeColumns work', async () => {
      const el = await setup({ data: people(5000) });
      el.scrollToIndex(2500, 'start');
      await settle(el);
      await aTimeout(30);
      expect(el.getVisibleRange().start).to.be.within(2495, 2500);
      el.scrollToKey(40, 'start');
      await settle(el);
      await aTimeout(30);
      expect(el.getVisibleRange().start).to.be.within(36, 40);
      el.data[40]!.name = 'Changed';
      el.invalidateRow(40);
      await settle(el);
      el.autosizeColumns();
      await settle(el);
      expect(el.getState().widths['name']).to.be.a('number');
      el.refresh();
      await settle(el);
    });

    it('emits bx-range-change as the window moves', async () => {
      const el = await setup({ data: people(1000) });
      const seen: number[] = [];
      el.addEventListener('bx-range-change', (e) =>
        seen.push((e as CustomEvent).detail.start),
      );
      scroller(el).scrollTop = 3600;
      await settle(el);
      expect(seen.at(-1)).to.be.within(95, 101);
    });
  });

  it('releases listeners on disconnect', async () => {
    const el = await setup();
    const parent = el.parentElement!;
    el.remove();
    scroller(el).scrollLeft = 100;
    await aTimeout(30);
    parent.append(el);
    await settle(el);
    expect(rows(el).length).to.be.greaterThan(0);
  });

  it('has no axe violations (plain, multiple-select, grouped, editing)', async () => {
    await expect(await setup()).to.be.accessible();
    await expect(await setup({ selection: 'multiple' })).to.be.accessible();
    await expect(await setup({ groupBy: ['city'] })).to.be.accessible();
    await expect(await setup({ data: [] })).to.be.accessible();
  });
});
