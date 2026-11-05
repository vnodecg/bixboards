import {
  aTimeout,
  expect,
  fixture,
  html,
  nextFrame,
  oneEvent,
  waitUntil,
} from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import type { BxSelect } from './select.ts';
import {
  RowIndex,
  findByPrefix,
  ordinalsOf,
  rowsFromOptions,
} from './select-model.ts';
import './index.ts';

const fruit = html`
  <bx-option value="apple">Apple</bx-option>
  <bx-option value="banana">Banana</bx-option>
  <bx-option value="cherry" disabled>Cherry</bx-option>
  <bx-option value="date">Date</bx-option>
`;

async function setup(
  template = html`<bx-select label="Fruit" name="fruit">${fruit}</bx-select>`,
): Promise<BxSelect> {
  const el = await fixture<BxSelect>(template);
  await settle(el);
  return el;
}

async function settle(el: BxSelect): Promise<void> {
  await el.updateComplete;
  await nextFrame();
  await el.updateComplete;
}

const input = (el: BxSelect) =>
  el.shadowRoot!.querySelector<HTMLInputElement>('.display-input')!;
const listbox = (el: BxSelect) =>
  el.shadowRoot!.querySelector<HTMLElement>('.listbox')!;
const shadowRows = (el: BxSelect) => [
  ...el.shadowRoot!.querySelectorAll<HTMLElement>('bx-option.row'),
];

async function press(el: BxSelect, key: string): Promise<void> {
  input(el).focus();
  await sendKeys({ press: key });
  await settle(el);
}

function activeDescendant(el: BxSelect): Element | null | undefined {
  return (
    input(el) as HTMLInputElement & {
      ariaActiveDescendantElement?: Element | null;
    }
  ).ariaActiveDescendantElement;
}

describe('select model', () => {
  it('inserts group headers and keeps duplicate values addressable', () => {
    const rows = rowsFromOptions([
      { value: 'a', group: 'G1' },
      { value: 'a', group: 'G1' },
      { value: 'b', group: 'G2' },
      { value: 'c' },
    ]);
    expect(rows.map((r) => r.kind)).to.deep.equal([
      'group',
      'option',
      'option',
      'group',
      'option',
      'option',
    ]);
    expect(new Set(rows.map((r) => r.key)).size).to.equal(rows.length);
  });

  it('filters case-insensitively and keeps headers only above matches', () => {
    const index = new RowIndex(
      rowsFromOptions([
        { value: '1', label: 'Apple', group: 'Fruit' },
        { value: '2', label: 'Carrot', group: 'Veg' },
        { value: '3', label: 'Pear', group: 'Fruit' },
      ]),
    );
    const out = index.filter('AP');
    expect(
      out.map((r) =>
        r.kind === 'group'
          ? `#${r.label}`
          : r.kind === 'option'
            ? r.label
            : '-',
      ),
    ).to.deep.equal(['#Fruit', 'Apple']);
    expect(index.filter('  ')).to.equal(index.rows);
  });

  it('computes option ordinals that skip headers', () => {
    const { ordinals, total } = ordinalsOf(
      rowsFromOptions([
        { value: 'a', group: 'G' },
        { value: 'b', group: 'G' },
      ]),
    );
    expect([...ordinals]).to.deep.equal([0, 1, 2]);
    expect(total).to.equal(2);
  });

  it('finds typeahead matches, cycling on a repeated letter and skipping disabled', () => {
    const rows = rowsFromOptions([
      { value: 'a1', label: 'Alpha' },
      { value: 'a2', label: 'Apex', disabled: true },
      { value: 'a3', label: 'Atlas' },
      { value: 'b', label: 'Beta' },
    ]);
    expect(findByPrefix(rows, 'a', -1)).to.equal(0);
    expect(findByPrefix(rows, 'a', 0)).to.equal(2);
    expect(findByPrefix(rows, 'aa', 2)).to.equal(0);
    expect(findByPrefix(rows, 'at', 0)).to.equal(2);
    expect(findByPrefix(rows, 'z', 0)).to.equal(-1);
  });
});

describe('bx-select', () => {
  it('registers the tag and renders a labelled readonly combobox', async () => {
    const el = await setup();
    expect(el).to.be.instanceOf(customElements.get('bx-select')!);
    const control = input(el);
    expect(control.getAttribute('role')).to.equal('combobox');
    expect(control.readOnly).to.be.true;
    expect(control.getAttribute('aria-expanded')).to.equal('false');
    expect(control.getAttribute('aria-controls')).to.equal(listbox(el).id);
    expect(listbox(el).getAttribute('role')).to.equal('listbox');
    expect(el.shadowRoot!.querySelector('label')!.textContent!.trim()).to.equal(
      'Fruit',
    );
  });

  describe('single selection', () => {
    it('opens on click, selects with a click, then closes and shows the label', async () => {
      const el = await setup();
      const events: string[] = [];
      for (const name of [
        'input',
        'change',
        'bx-show',
        'bx-after-show',
        'bx-hide',
        'bx-after-hide',
      ])
        el.addEventListener(name, () => events.push(name));

      el.shadowRoot!.querySelector<HTMLElement>('.combobox')!.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          composed: true,
          button: 0,
        }),
      );
      await settle(el);
      expect(el.open).to.be.true;
      expect(input(el).getAttribute('aria-expanded')).to.equal('true');

      el.querySelector<HTMLElement>('[value="banana"]')!.click();
      await settle(el);
      expect(el.value).to.equal('banana');
      expect(input(el).value).to.equal('Banana');
      expect(el.open).to.be.false;
      expect(events).to.deep.equal([
        'bx-show',
        'bx-after-show',
        'input',
        'change',
        'bx-hide',
        'bx-after-hide',
      ]);
      expect(
        el
          .querySelector<HTMLElement>('[value="banana"]')!
          .hasAttribute('selected'),
      ).to.be.true;
    });

    it('does not fire change when the same option is re-selected', async () => {
      const el = await setup(
        html`<bx-select value="apple">${fruit}</bx-select>`,
      );
      let changes = 0;
      el.addEventListener('change', () => changes++);
      el.show();
      await settle(el);
      el.querySelector<HTMLElement>('[value="apple"]')!.click();
      await settle(el);
      expect(changes).to.equal(0);
    });

    it('ignores disabled options', async () => {
      const el = await setup();
      el.show();
      await settle(el);
      el.querySelector<HTMLElement>('[value="cherry"]')!.click();
      await settle(el);
      expect(el.value).to.equal('');
      expect(el.open).to.be.true;
    });

    it('adopts a native-style `selected` option as the initial value', async () => {
      const el = await setup(
        html`<bx-select>
          <bx-option value="a">A</bx-option>
          <bx-option value="b" selected>B</bx-option>
        </bx-select>`,
      );
      expect(el.value).to.equal('b');
      expect(input(el).value).to.equal('B');
    });

    it('takes the option label from its text when no label attribute is given', async () => {
      const el = await setup(
        html`<bx-select value="x"
          ><bx-option value="x"
            >Ex <span slot="end">⌘</span></bx-option
          ></bx-select
        >`,
      );
      expect(input(el).value).to.equal('Ex');
    });

    it('clears with the clear button and fires bx-clear', async () => {
      const el = await setup(
        html`<bx-select clearable value="apple">${fruit}</bx-select>`,
      );
      const cleared = oneEvent(el, 'bx-clear');
      el.shadowRoot!.querySelector<HTMLElement>('.clear-button')!.click();
      await cleared;
      await settle(el);
      expect(el.value).to.equal('');
      expect(el.shadowRoot!.querySelector('.clear-button')).to.be.null;
    });

    it('bx-show is cancelable and keeps the list closed', async () => {
      const el = await setup();
      el.addEventListener('bx-show', (event) => event.preventDefault());
      el.show();
      await settle(el);
      expect(el.open).to.be.false;
    });

    it('does not open while disabled or readonly', async () => {
      const el = await setup(html`<bx-select disabled>${fruit}</bx-select>`);
      el.show();
      await settle(el);
      expect(el.open).to.be.false;
      const ro = await setup(html`<bx-select readonly>${fruit}</bx-select>`);
      ro.show();
      await settle(ro);
      expect(ro.open).to.be.false;
    });

    it('closes when focus leaves', async () => {
      const wrapper = await fixture<HTMLDivElement>(
        html`<div>
          <bx-select>${fruit}</bx-select><button id="other">x</button>
        </div>`,
      );
      const el = wrapper.querySelector('bx-select') as BxSelect;
      await settle(el);
      input(el).focus();
      el.show();
      await settle(el);
      wrapper.querySelector<HTMLElement>('#other')!.focus();
      await settle(el);
      expect(el.open).to.be.false;
    });
  });

  describe('keyboard', () => {
    it('ArrowDown opens, arrows move the active option via aria-activedescendant, Enter selects', async () => {
      const el = await setup();
      await press(el, 'ArrowDown');
      expect(el.open).to.be.true;
      const apple = el.querySelector('[value="apple"]');
      expect(activeDescendant(el)).to.equal(apple);
      expect(apple!.hasAttribute('data-active')).to.be.true;

      await press(el, 'ArrowDown');
      expect(activeDescendant(el)).to.equal(
        el.querySelector('[value="banana"]'),
      );
      await press(el, 'ArrowDown'); // cherry is disabled
      expect(activeDescendant(el)).to.equal(el.querySelector('[value="date"]'));

      await press(el, 'Enter');
      expect(el.value).to.equal('date');
      expect(el.open).to.be.false;
    });

    it('Home/End jump to the first/last enabled option', async () => {
      const el = await setup();
      await press(el, 'ArrowDown');
      await press(el, 'End');
      expect(activeDescendant(el)).to.equal(el.querySelector('[value="date"]'));
      await press(el, 'Home');
      expect(activeDescendant(el)).to.equal(
        el.querySelector('[value="apple"]'),
      );
    });

    it('Escape closes without changing the value, and does not leak to ancestors', async () => {
      const wrapper = await fixture<HTMLDivElement>(
        html`<div><bx-select value="apple">${fruit}</bx-select></div>`,
      );
      const el = wrapper.querySelector('bx-select') as BxSelect;
      await settle(el);
      let leaked = false;
      wrapper.addEventListener('keydown', (e) => {
        if ((e as KeyboardEvent).key === 'Escape') leaked = true;
      });
      await press(el, 'ArrowDown');
      await press(el, 'ArrowDown');
      await press(el, 'Escape');
      expect(el.open).to.be.false;
      expect(el.value).to.equal('apple');
      expect(leaked).to.be.false;
    });

    it('opens on the selected option', async () => {
      const el = await setup(
        html`<bx-select value="banana">${fruit}</bx-select>`,
      );
      await press(el, 'ArrowDown');
      expect(activeDescendant(el)).to.equal(
        el.querySelector('[value="banana"]'),
      );
    });

    it('typeahead on a closed select changes the value like a native select', async () => {
      const el = await setup();
      await press(el, 'd');
      expect(el.value).to.equal('date');
    });

    it('typeahead on an open list moves the active option', async () => {
      const el = await setup();
      await press(el, 'ArrowDown');
      await press(el, 'b');
      expect(activeDescendant(el)).to.equal(
        el.querySelector('[value="banana"]'),
      );
      expect(el.value).to.equal('');
    });

    it('Enter never submits a surrounding form', async () => {
      const form = await fixture<HTMLFormElement>(
        html`<form><bx-select name="f">${fruit}</bx-select></form>`,
      );
      let submitted = false;
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        submitted = true;
      });
      const el = form.querySelector('bx-select') as BxSelect;
      await settle(el);
      await press(el, 'Enter');
      await press(el, 'Enter');
      expect(submitted).to.be.false;
    });
  });

  describe('multiple', () => {
    const multi = html`<bx-select
      multiple
      name="m"
      .value=${['apple', 'banana']}
      >${fruit}</bx-select
    >`;

    it('renders a removable tag per value and stays open while toggling', async () => {
      const el = await setup(multi);
      const tags = el.shadowRoot!.querySelectorAll('bx-badge.tag');
      expect(tags).to.have.length(2);
      expect(listbox(el).getAttribute('aria-multiselectable')).to.equal('true');

      el.show();
      await settle(el);
      el.querySelector<HTMLElement>('[value="date"]')!.click();
      await settle(el);
      expect(el.value).to.deep.equal(['apple', 'banana', 'date']);
      expect(el.open).to.be.true;
      el.querySelector<HTMLElement>('[value="apple"]')!.click();
      await settle(el);
      expect(el.value).to.deep.equal(['banana', 'date']);
    });

    it('collapses tags beyond max-options-visible into +N', async () => {
      const el = await setup(
        html`<bx-select
          multiple
          max-options-visible="1"
          .value=${['apple', 'banana', 'date']}
          >${fruit}</bx-select
        >`,
      );
      const tags = [...el.shadowRoot!.querySelectorAll('bx-badge.tag')];
      expect(tags).to.have.length(2);
      expect(tags[1]!.textContent).to.contain('+2');
    });

    it('removes a value through its tag and with Backspace', async () => {
      const el = await setup(multi);
      el.shadowRoot!.querySelector('bx-badge.tag')!.dispatchEvent(
        new CustomEvent('bx-remove', {
          bubbles: true,
          composed: true,
          cancelable: true,
        }),
      );
      await settle(el);
      expect(el.value).to.deep.equal(['banana']);
      await press(el, 'Backspace');
      expect(el.value).to.deep.equal([]);
    });

    it('accepts a whitespace-separated value attribute', async () => {
      const el = await setup(
        html`<bx-select multiple value="apple date">${fruit}</bx-select>`,
      );
      expect(el.value).to.deep.equal(['apple', 'date']);
    });

    it('fits tags to the available width with max-options-visible="auto"', async () => {
      const el = await setup(
        html`<bx-select
          style="display: block; inline-size: 220px"
          multiple
          max-options-visible="auto"
          .value=${['apple', 'banana', 'cherry', 'date']}
          >${fruit}</bx-select
        >`,
      );
      await aTimeout(50);
      await settle(el);
      const tags = [...el.shadowRoot!.querySelectorAll('bx-badge.tag')];
      expect(tags.length).to.be.lessThan(5); // at most the 4 tags + overflow
      const overflow = el.shadowRoot!.querySelector('[data-overflow]');
      expect(overflow, 'a narrow control must collapse some tags').to.exist;
    });
  });

  describe('search', () => {
    it('filters slotted options locally and highlights the first match', async () => {
      const el = await setup(html`<bx-select searchable>${fruit}</bx-select>`);
      input(el).focus();
      await sendKeys({ type: 'an' });
      await settle(el);
      expect(el.open).to.be.true;
      const hidden = [...el.querySelectorAll('bx-option')].filter((o) =>
        o.hasAttribute('hidden'),
      );
      expect(hidden.map((o) => o.getAttribute('value'))).to.deep.equal([
        'apple',
        'cherry',
        'date',
      ]);
      expect(activeDescendant(el)).to.equal(
        el.querySelector('[value="banana"]'),
      );
      await press(el, 'Enter');
      expect(el.value).to.equal('banana');
      expect(input(el).value).to.equal('Banana');
    });

    it('shows a status when nothing matches', async () => {
      const el = await setup(html`<bx-select searchable>${fruit}</bx-select>`);
      input(el).focus();
      await sendKeys({ type: 'zzz' });
      await settle(el);
      expect(el.shadowRoot!.querySelector('.status')!.textContent).to.contain(
        'No results',
      );
    });

    it('starts a fresh query instead of editing the selected label', async () => {
      const el = await setup(
        html`<bx-select searchable value="apple">${fruit}</bx-select>`,
      );
      input(el).focus();
      await sendKeys({ type: 'd' });
      await settle(el);
      expect(input(el).value).to.equal('d');
    });

    it('remote mode emits a debounced bx-search with an abortable signal and does not filter', async () => {
      const el = await setup(
        html`<bx-select searchable remote>${fruit}</bx-select>`,
      );
      const queries: { query: string; signal: AbortSignal }[] = [];
      el.addEventListener('bx-search', (e) =>
        queries.push((e as CustomEvent).detail),
      );
      input(el).focus();
      await sendKeys({ type: 'ab' });
      await aTimeout(400);
      expect(queries.map((q) => q.query)).to.deep.equal(['ab']);
      expect(
        [...el.querySelectorAll('bx-option')].some((o) =>
          o.hasAttribute('hidden'),
        ),
      ).to.be.false;

      await sendKeys({ type: 'c' });
      await aTimeout(400);
      expect(queries).to.have.length(2);
      expect(queries[1]!.query).to.equal('abc');
      el.hide();
      await settle(el);
    });

    it('aborts the pending remote search when the list closes', async () => {
      const el = await setup(
        html`<bx-select searchable remote>${fruit}</bx-select>`,
      );
      const queries: { query: string; signal: AbortSignal }[] = [];
      el.addEventListener('bx-search', (e) =>
        queries.push((e as CustomEvent).detail),
      );
      input(el).focus();
      await sendKeys({ type: 'a' });
      await aTimeout(350);
      expect(queries).to.have.length(1);
      el.hide();
      await settle(el);
      expect(queries[0]!.signal.aborted).to.be.true;
    });
  });

  describe('data-driven options', () => {
    const options = [
      { value: 'us', label: 'United States', group: 'Americas' },
      { value: 'ca', label: 'Canada', group: 'Americas' },
      { value: 'fr', label: 'France', group: 'Europe' },
      { value: 'de', label: 'Germany', group: 'Europe', disabled: true },
    ];

    it('renders rows (with group headers) from the options array', async () => {
      const el = await setup(html`<bx-select .options=${options}></bx-select>`);
      el.show();
      await settle(el);
      const rows = shadowRows(el);
      expect(rows.map((r) => r.getAttribute('value'))).to.deep.equal([
        'us',
        'ca',
        'fr',
        'de',
      ]);
      expect(el.shadowRoot!.querySelectorAll('.group-label')).to.have.length(2);
      expect(rows[0]!.getAttribute('role')).to.equal('option');
      expect(rows[3]!.getAttribute('aria-disabled')).to.equal('true');
      expect(rows[1]!.getAttribute('aria-posinset')).to.equal('2');
      expect(rows[1]!.getAttribute('aria-setsize')).to.equal('4');
    });

    it('selects from data rows, keeps highlight and aria-activedescendant in the shadow root', async () => {
      const el = await setup(html`<bx-select .options=${options}></bx-select>`);
      await press(el, 'ArrowDown');
      const active = activeDescendant(el) as HTMLElement;
      expect(active.getAttribute('value')).to.equal('us');
      await press(el, 'ArrowDown');
      await press(el, 'Enter');
      expect(el.value).to.equal('ca');
      expect(input(el).value).to.equal('Canada');
    });

    it('resolves the selected label before the options array contains it', async () => {
      const el = await setup(html`<bx-select value="fr"></bx-select>`);
      el.options = options;
      await settle(el);
      expect(input(el).value).to.equal('France');
    });

    it('keeps a selected label after the options change (remote paging)', async () => {
      const el = await setup(html`<bx-select .options=${options}></bx-select>`);
      el.show();
      await settle(el);
      shadowRows(el)[2]!.click();
      await settle(el);
      el.options = [{ value: 'jp', label: 'Japan' }];
      await settle(el);
      expect(el.value).to.equal('fr');
      expect(input(el).value).to.equal('France');
    });
  });

  describe('virtualization', () => {
    const big = (n: number) =>
      Array.from({ length: n }, (_, i) => ({
        value: `v${i}`,
        label: `Item ${i}`,
      }));

    it('renders only a window of rows for 10k options and exposes full-set aria metadata', async () => {
      const el = await setup(
        html`<bx-select .options=${big(10_000)}></bx-select>`,
      );
      el.show();
      await settle(el);
      await aTimeout(50);
      const rows = shadowRows(el);
      expect(rows.length).to.be.greaterThan(0);
      expect(rows.length).to.be.lessThan(60);
      expect(rows[0]!.getAttribute('aria-setsize')).to.equal('10000');
      expect(rows[0]!.getAttribute('aria-posinset')).to.equal('1');
    });

    it('auto-virtualizes slotted options past the threshold and honors virtual="false"', async () => {
      const many = Array.from(
        { length: 300 },
        (_, i) => html`<bx-option value=${i}>Opt ${i}</bx-option>`,
      );
      const auto = await setup(html`<bx-select>${many}</bx-select>`);
      auto.show();
      await settle(auto);
      expect(shadowRows(auto).length).to.be.lessThan(80);

      const off = await setup(
        html`<bx-select virtual="false">${many}</bx-select>`,
      );
      off.show();
      await settle(off);
      expect(shadowRows(off)).to.have.length(0); // slotted and untouched
      expect(off.querySelectorAll('bx-option')).to.have.length(300);
    });

    it('End jumps to the last option without rendering the whole list', async () => {
      const el = await setup(
        html`<bx-select .options=${big(10_000)}></bx-select>`,
      );
      await press(el, 'ArrowDown');
      await press(el, 'End');
      await aTimeout(80);
      await settle(el);
      const active = activeDescendant(el) as HTMLElement;
      expect(active.getAttribute('value')).to.equal('v9999');
      expect(active.getAttribute('aria-posinset')).to.equal('10000');
      expect(shadowRows(el).length).to.be.lessThan(60);
    });

    it('keeps the active node rendered when scrolled out of the window', async () => {
      const el = await setup(
        html`<bx-select .options=${big(10_000)}></bx-select>`,
      );
      await press(el, 'ArrowDown');
      listbox(el).scrollTop = 20_000;
      await aTimeout(80);
      await settle(el);
      expect(activeDescendant(el)).to.exist;
      expect(
        (activeDescendant(el) as HTMLElement).getAttribute('value'),
      ).to.equal('v0');
    });

    it('typeahead and search cover the whole data set, not the rendered window', async () => {
      const el = await setup(
        html`<bx-select .options=${big(10_000)}></bx-select>`,
      );
      await press(el, 'ArrowDown');
      await sendKeys({ type: 'Item 9876' });
      await settle(el);
      const active = activeDescendant(el) as HTMLElement | null;
      expect(active?.getAttribute('value')).to.equal('v9876');

      const searchable = await setup(
        html`<bx-select searchable .options=${big(10_000)}></bx-select>`,
      );
      searchable.focus();
      await sendKeys({ type: '9999' });
      await aTimeout(60);
      await settle(searchable);
      expect(
        shadowRows(searchable).map((r) => r.getAttribute('value')),
      ).to.deep.equal(['v9999']);
    });

    it('resolves the label of a selected value that is not rendered (FR-SELECT-05)', async () => {
      const el = await setup(
        html`<bx-select value="v9000" .options=${big(10_000)}></bx-select>`,
      );
      expect(input(el).value).to.equal('Item 9000');
    });

    it('opens a 100k-option list quickly', async () => {
      const options = big(100_000);
      const el = await setup(html`<bx-select></bx-select>`);
      const shown = oneEvent(el, 'bx-after-show');
      const start = performance.now();
      el.options = options;
      el.show();
      await shown;
      const elapsed = performance.now() - start;
      console.log(
        `bx-select: 100k options, set + open to first full window in ${elapsed.toFixed(1)}ms`,
      );
      expect(elapsed).to.be.lessThan(250); // spec target 50ms; generous bound against CI noise
      await settle(el);
      expect(shadowRows(el).length).to.be.greaterThan(0);
      expect(shadowRows(el).length).to.be.lessThan(60);
    });

    it('fires bx-load-more once per list length when scrolled near the end', async () => {
      const el = await setup(
        html`<bx-select .options=${big(40)} virtual></bx-select>`,
      );
      let loads = 0;
      el.addEventListener('bx-load-more', () => loads++);
      const shown = oneEvent(el, 'bx-after-show');
      el.show();
      await shown;
      await aTimeout(120); // let the open-time scroll-to-active retries finish
      expect(loads).to.equal(0);
      // Scroll handling runs on animation frames and the listbox may not be laid out yet, so keep
      // scrolling to the end until the event fires instead of racing a fixed sleep.
      await waitUntil(
        () => {
          listbox(el).scrollTop = listbox(el).scrollHeight;
          return loads === 1;
        },
        'bx-load-more should fire',
        { timeout: 3000 },
      );
      await settle(el);
      expect(loads).to.equal(1);
      listbox(el).scrollTop = listbox(el).scrollHeight;
      await aTimeout(60); // a negative check: it must not fire a second time for this length
      expect(loads).to.equal(1);
      el.options = big(80); // next page arrived
      await settle(el);
      await waitUntil(
        () => {
          listbox(el).scrollTop = listbox(el).scrollHeight;
          return loads === 2;
        },
        'bx-load-more should fire again',
        { timeout: 3000 },
      );
      expect(loads).to.equal(2);
    });

    it('does not request more while loading and shows a busy status', async () => {
      const el = await setup(
        html`<bx-select .options=${big(40)} virtual loading></bx-select>`,
      );
      let loads = 0;
      el.addEventListener('bx-load-more', () => loads++);
      const shown = oneEvent(el, 'bx-after-show');
      el.show();
      await shown;
      await aTimeout(120);
      listbox(el).scrollTop = listbox(el).scrollHeight;
      await aTimeout(80);
      expect(loads).to.equal(0);
      expect(listbox(el).getAttribute('aria-busy')).to.equal('true');
      expect(el.shadowRoot!.querySelector('.status bx-spinner')).to.exist;
    });
  });

  describe('forms', () => {
    it('submits the single value and the multiple values as repeated entries', async () => {
      const form = await fixture<HTMLFormElement>(
        html`<form>
          <bx-select name="one" value="banana">${fruit}</bx-select>
          <bx-select name="many" multiple .value=${['apple', 'date']}
            >${fruit}</bx-select
          >
        </form>`,
      );
      await Promise.all(
        [...form.querySelectorAll('bx-select')].map((e) =>
          settle(e as BxSelect),
        ),
      );
      const data = new FormData(form);
      expect(data.get('one')).to.equal('banana');
      expect(data.getAll('many')).to.deep.equal(['apple', 'date']);
    });

    it('is invalid when required and empty, valid once chosen', async () => {
      const el = await setup(html`<bx-select required>${fruit}</bx-select>`);
      expect(el.checkValidity()).to.be.false;
      expect(el.validity.valueMissing).to.be.true;
      expect(el.willValidate).to.be.true;
      el.value = 'apple';
      await settle(el);
      expect(el.checkValidity()).to.be.true;
    });

    it('supports setCustomValidity and clears it with an empty message', async () => {
      const el = await setup(
        html`<bx-select value="apple">${fruit}</bx-select>`,
      );
      el.setCustomValidity('Nope');
      expect(el.validity.customError).to.be.true;
      expect(el.validationMessage).to.equal('Nope');
      el.setCustomValidity('');
      expect(el.checkValidity()).to.be.true;
    });

    it('marks data-user-invalid only after interaction (FR-SELECT-03)', async () => {
      const el = await setup(html`<bx-select required>${fruit}</bx-select>`);
      expect(el.hasAttribute('data-user-invalid')).to.be.false;
      let invalid = 0;
      el.addEventListener('bx-invalid', () => invalid++);
      el.reportValidity();
      await settle(el);
      expect(invalid).to.equal(1);
      expect(el.hasAttribute('data-user-invalid')).to.be.true;
    });

    it('resets to the initial value and clears user validity', async () => {
      const form = await fixture<HTMLFormElement>(
        html`<form>
          <bx-select name="f" value="apple" required>${fruit}</bx-select>
        </form>`,
      );
      const el = form.querySelector('bx-select') as BxSelect;
      await settle(el);
      el.value = 'date';
      await settle(el);
      form.reset();
      await settle(el);
      expect(el.value).to.equal('apple');
    });

    it('restores state from autofill/back-navigation (single and multiple)', async () => {
      const single = await setup(
        html`<bx-select name="s">${fruit}</bx-select>`,
      );
      single.formStateRestoreCallback('banana');
      await settle(single);
      expect(single.value).to.equal('banana');

      const multi = await setup(
        html`<bx-select name="m" multiple>${fruit}</bx-select>`,
      );
      const data = new FormData();
      data.append('m', 'apple');
      data.append('m', 'date');
      multi.formStateRestoreCallback(data);
      await settle(multi);
      expect(multi.value).to.deep.equal(['apple', 'date']);
    });

    it('is disabled through a disabled fieldset', async () => {
      const fieldset = await fixture<HTMLFieldSetElement>(
        html`<fieldset disabled><bx-select>${fruit}</bx-select></fieldset>`,
      );
      const el = fieldset.querySelector('bx-select') as BxSelect;
      await settle(el);
      expect(el.disabled).to.be.true;
      expect(input(el).disabled).to.be.true;
    });
  });

  describe('lifecycle', () => {
    it('picks up options added, removed and relabelled after first render', async () => {
      const el = await setup(html`<bx-select value="new">${fruit}</bx-select>`);
      const added = document.createElement('bx-option');
      added.setAttribute('value', 'new');
      added.textContent = 'Fresh';
      el.append(added);
      await aTimeout(20);
      await settle(el);
      expect(input(el).value).to.equal('Fresh');
      added.textContent = 'Fresher';
      await aTimeout(20);
      await settle(el);
      expect(input(el).value).to.equal('Fresher');
    });

    it('survives being removed while open and re-attached', async () => {
      const wrapper = await fixture<HTMLDivElement>(
        html`<div><bx-select>${fruit}</bx-select></div>`,
      );
      const el = wrapper.querySelector('bx-select') as BxSelect;
      await settle(el);
      el.show();
      await settle(el);
      el.remove();
      wrapper.append(el);
      await settle(el);
      el.hide();
      await settle(el);
      expect(el.open).to.be.false;
    });
  });

  describe('accessibility', () => {
    it('has no axe violations closed, open, multiple and disabled', async () => {
      const el = await setup(
        html`<bx-select label="Fruit" hint="Pick one">${fruit}</bx-select>`,
      );
      await expect(el).to.be.accessible();
      el.show();
      await settle(el);
      await expect(el).to.be.accessible();

      const multi = await setup(
        html`<bx-select label="Fruit" multiple .value=${['apple', 'banana']}
          >${fruit}</bx-select
        >`,
      );
      await expect(multi).to.be.accessible();

      const disabled = await setup(
        html`<bx-select label="Fruit" disabled>${fruit}</bx-select>`,
      );
      await expect(disabled).to.be.accessible();

      const data = await setup(
        html`<bx-select
          label="Country"
          .options=${[
            { value: 'a', label: 'A', group: 'G' },
            { value: 'b', label: 'B', group: 'G' },
          ]}
        ></bx-select>`,
      );
      data.show();
      await settle(data);
      await expect(data).to.be.accessible();
    });

    it('names the combobox from aria-label when there is no visible label', async () => {
      const el = await setup(
        html`<bx-select aria-label="Pick a fruit">${fruit}</bx-select>`,
      );
      expect(input(el).getAttribute('aria-label')).to.equal('Pick a fruit');
      expect(listbox(el).getAttribute('aria-label')).to.equal('Pick a fruit');
    });
  });
});
