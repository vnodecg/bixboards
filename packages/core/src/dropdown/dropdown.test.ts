import {
  aTimeout,
  expect,
  fixture,
  html,
  nextFrame,
  oneEvent,
} from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import type { BxDropdownItem } from '../dropdown-item/dropdown-item.ts';
import {
  inSafeTriangle,
  pointInBox,
  pointInTriangle,
} from '../dropdown-item/safe-triangle.ts';
import type { BxDropdown } from './dropdown.ts';
import './index.ts';
import '../button/index.ts';

const menuTemplate = () => html`
  <bx-dropdown>
    <button slot="trigger" id="trigger">Actions</button>
    <bx-dropdown-item value="rename">Rename</bx-dropdown-item>
    <bx-dropdown-item value="copy">Copy</bx-dropdown-item>
    <bx-dropdown-item value="move" disabled>Move</bx-dropdown-item>
    <bx-dropdown-item value="delete" variant="error">Delete</bx-dropdown-item>
  </bx-dropdown>
`;

async function setup(template = menuTemplate()): Promise<{
  el: BxDropdown;
  trigger: HTMLButtonElement;
  items: BxDropdownItem[];
}> {
  const wrapper = await fixture<HTMLDivElement>(
    html`<div>${template}<button id="outside">Outside</button></div>`,
  );
  const el = wrapper.querySelector('bx-dropdown') as BxDropdown;
  await settle(el);
  return {
    el,
    trigger: el.querySelector('[slot="trigger"]') as HTMLButtonElement,
    items: [
      ...el.querySelectorAll(':scope > bx-dropdown-item'),
    ] as BxDropdownItem[],
  };
}

async function settle(el: BxDropdown): Promise<void> {
  await el.updateComplete;
  await nextFrame();
  await el.updateComplete;
}

async function open(el: BxDropdown): Promise<void> {
  const shown = oneEvent(el, 'bx-after-show');
  el.show();
  await shown;
  await settle(el);
}

/** The element holding focus, whether in the light DOM or inside the dropdown's shadow root. */
const focused = (el: BxDropdown): Element | null =>
  el.shadowRoot!.activeElement ?? document.activeElement;

const menu = (el: BxDropdown) =>
  el.shadowRoot!.querySelector<HTMLElement>('.menu')!;

async function press(el: BxDropdown, key: string): Promise<void> {
  await sendKeys({ press: key });
  await settle(el);
}

describe('safe triangle geometry', () => {
  it('tests point-in-triangle and point-in-box', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 10, y: 0 };
    const c = { x: 0, y: 10 };
    expect(pointInTriangle({ x: 2, y: 2 }, a, b, c)).to.be.true;
    expect(pointInTriangle({ x: 9, y: 9 }, a, b, c)).to.be.false;
    expect(
      pointInBox({ x: 5, y: 5 }, { left: 0, right: 10, top: 0, bottom: 10 }),
    ).to.be.true;
    expect(
      pointInBox({ x: 11, y: 5 }, { left: 0, right: 10, top: 0, bottom: 10 }),
    ).to.be.false;
  });

  it('keeps the submenu open for a pointer heading towards it, in either direction', () => {
    const item = { left: 0, right: 100, top: 40, bottom: 80 };
    const submenuRight = { left: 100, right: 200, top: 40, bottom: 200 };
    // Left the item through its bottom edge at (50, 78); now crossing the row below, still on the
    // way to the submenu.
    expect(
      inSafeTriangle({ x: 70, y: 120 }, { x: 50, y: 78 }, submenuRight, item),
    ).to.be.true;
    // Heading away from the submenu leaves the triangle.
    expect(
      inSafeTriangle({ x: 20, y: 150 }, { x: 50, y: 78 }, submenuRight, item),
    ).to.be.false;
    // Too steep: below the triangle's lower edge.
    expect(
      inSafeTriangle({ x: 60, y: 190 }, { x: 50, y: 78 }, submenuRight, item),
    ).to.be.false;

    const submenuLeft = { left: -100, right: 0, top: 40, bottom: 200 };
    expect(
      inSafeTriangle({ x: 30, y: 120 }, { x: 50, y: 78 }, submenuLeft, item),
    ).to.be.true;
    expect(
      inSafeTriangle({ x: 80, y: 150 }, { x: 50, y: 78 }, submenuLeft, item),
    ).to.be.false;
  });
});

describe('bx-dropdown', () => {
  it('registers the tag and wires the trigger and menu ARIA', async () => {
    const { el, trigger } = await setup();
    expect(el).to.be.instanceOf(customElements.get('bx-dropdown')!);
    expect(trigger.getAttribute('aria-haspopup')).to.equal('menu');
    expect(trigger.getAttribute('aria-expanded')).to.equal('false');
    expect(menu(el).getAttribute('role')).to.equal('menu');
    const labelled = (
      menu(el) as HTMLElement & { ariaLabelledByElements?: Element[] }
    ).ariaLabelledByElements;
    if (labelled) expect(labelled).to.deep.equal([trigger]);
  });

  describe('opening and closing', () => {
    it('toggles from the trigger and fires the four lifecycle events', async () => {
      const { el, trigger } = await setup();
      const events: string[] = [];
      for (const name of [
        'bx-show',
        'bx-after-show',
        'bx-hide',
        'bx-after-hide',
      ])
        el.addEventListener(name, () => events.push(name));

      trigger.click();
      await settle(el);
      await aTimeout(30);
      expect(el.open).to.be.true;
      expect(trigger.getAttribute('aria-expanded')).to.equal('true');

      trigger.click();
      await settle(el);
      expect(el.open).to.be.false;
      expect(events).to.deep.equal([
        'bx-show',
        'bx-after-show',
        'bx-hide',
        'bx-after-hide',
      ]);
    });

    it('bx-show and bx-hide are cancelable', async () => {
      const { el } = await setup();
      const block = (e: Event) => e.preventDefault();
      el.addEventListener('bx-show', block);
      el.show();
      await settle(el);
      expect(el.open).to.be.false;
      el.removeEventListener('bx-show', block);

      await open(el);
      el.addEventListener('bx-hide', block, { once: true });
      el.hide();
      await settle(el);
      expect(el.open).to.be.true;
    });

    it('closes on an outside click but not on a click inside', async () => {
      const { el } = await setup();
      await open(el);
      menu(el).dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, composed: true }),
      );
      await settle(el);
      expect(el.open).to.be.true;

      document
        .querySelector<HTMLElement>('#outside')!
        .dispatchEvent(
          new PointerEvent('pointerdown', { bubbles: true, composed: true }),
        );
      await settle(el);
      expect(el.open).to.be.false;
    });

    it('closes when focus moves to another element', async () => {
      const { el } = await setup();
      await open(el);
      document.querySelector<HTMLElement>('#outside')!.focus();
      await settle(el);
      expect(el.open).to.be.false;
    });

    it('stops listening to the document after being removed', async () => {
      const { el } = await setup();
      await open(el);
      let hides = 0;
      el.addEventListener('bx-hide', () => hides++);
      const parent = el.parentElement!;
      el.remove();
      document
        .querySelector<HTMLElement>('#outside')!
        .dispatchEvent(
          new PointerEvent('pointerdown', { bubbles: true, composed: true }),
        );
      expect(hides).to.equal(0);
      parent.append(el);
    });
  });

  describe('keyboard', () => {
    it('ArrowDown on the trigger opens and focuses the first enabled item; ArrowUp the last', async () => {
      const { el, trigger, items } = await setup();
      trigger.focus();
      await press(el, 'ArrowDown');
      await aTimeout(50);
      expect(el.open).to.be.true;
      expect(focused(el)).to.equal(items[0]);
      el.hide();
      await settle(el);

      trigger.focus();
      await press(el, 'ArrowUp');
      await aTimeout(50);
      expect(focused(el)).to.equal(items[3]);
    });

    it('opening with Enter focuses the first item', async () => {
      const { el, trigger, items } = await setup();
      trigger.focus();
      await press(el, 'Enter');
      await aTimeout(50);
      expect(focused(el)).to.equal(items[0]);
    });

    it('arrows wrap, skip disabled items, and Home/End jump', async () => {
      const { el, trigger, items } = await setup();
      trigger.focus();
      await press(el, 'ArrowDown');
      await aTimeout(50);
      await press(el, 'ArrowDown');
      expect(focused(el)).to.equal(items[1]);
      await press(el, 'ArrowDown'); // Move is disabled
      expect(focused(el)).to.equal(items[3]);
      await press(el, 'ArrowDown'); // wraps
      expect(focused(el)).to.equal(items[0]);
      await press(el, 'ArrowUp'); // wraps back
      expect(focused(el)).to.equal(items[3]);
      await press(el, 'Home');
      expect(focused(el)).to.equal(items[0]);
      await press(el, 'End');
      expect(focused(el)).to.equal(items[3]);
    });

    it('focusable-disabled keeps disabled items reachable', async () => {
      const { el, trigger, items } = await setup(html`
        <bx-dropdown focusable-disabled>
          <button slot="trigger">Actions</button>
          <bx-dropdown-item>One</bx-dropdown-item>
          <bx-dropdown-item disabled>Two</bx-dropdown-item>
        </bx-dropdown>
      `);
      trigger.focus();
      await press(el, 'ArrowDown');
      await aTimeout(50);
      await press(el, 'ArrowDown');
      expect(focused(el)).to.equal(items[1]);
    });

    it('typeahead focuses the next item starting with the typed text', async () => {
      const { el, trigger, items } = await setup();
      trigger.focus();
      await press(el, 'ArrowDown');
      await aTimeout(50);
      await press(el, 'd');
      expect(focused(el)).to.equal(items[3]);
      await aTimeout(800);
      await press(el, 'c');
      expect(focused(el)).to.equal(items[1]);
    });

    it('Escape closes the menu and returns focus to the trigger without leaking', async () => {
      const { el, trigger } = await setup();
      let leaked = false;
      document.addEventListener(
        'keydown',
        (e) => {
          if (e.key === 'Escape') leaked = true;
        },
        { once: true },
      );
      trigger.focus();
      await press(el, 'ArrowDown');
      await aTimeout(50);
      await press(el, 'Escape');
      expect(el.open).to.be.false;
      expect(document.activeElement).to.equal(trigger);
      expect(leaked).to.be.false;
    });

    it('Tab closes the menu and leaves focus on the trigger to continue from', async () => {
      const { el, trigger } = await setup();
      trigger.focus();
      await press(el, 'ArrowDown');
      await aTimeout(50);
      await press(el, 'Tab');
      expect(el.open).to.be.false;
      expect(document.activeElement).to.not.equal(trigger); // moved on from the trigger
    });
  });

  describe('selection', () => {
    it('fires bx-select with the chosen item, closes and refocuses the trigger', async () => {
      const { el, trigger, items } = await setup();
      await open(el);
      const selected = oneEvent(el, 'bx-select');
      items[1]!.focus();
      items[1]!.shadowRoot!.querySelector<HTMLElement>('.base')!.click();
      const event = (await selected) as CustomEvent;
      await settle(el);
      expect(event.detail.item).to.equal(items[1]);
      expect(event.detail.value).to.equal('copy');
      expect(el.open).to.be.false;
      expect(document.activeElement).to.equal(trigger);
    });

    it('Enter on a focused item selects it', async () => {
      const { el, trigger } = await setup();
      let value = '';
      el.addEventListener(
        'bx-select',
        (e) => (value = (e as CustomEvent).detail.value),
      );
      trigger.focus();
      await press(el, 'ArrowDown');
      await aTimeout(50);
      await press(el, 'ArrowDown');
      await press(el, 'Enter');
      expect(value).to.equal('copy');
    });

    it('keeps the menu open for checkbox items and enforces radio groups', async () => {
      const { el } = await setup(html`
        <bx-dropdown>
          <button slot="trigger">View</button>
          <bx-dropdown-item type="checkbox" value="grid">Grid</bx-dropdown-item>
          <bx-dropdown-item type="radio" name="size" value="s" checked
            >Small</bx-dropdown-item
          >
          <bx-dropdown-item type="radio" name="size" value="l"
            >Large</bx-dropdown-item
          >
        </bx-dropdown>
      `);
      await open(el);
      const [grid, small, large] = [
        ...el.querySelectorAll('bx-dropdown-item'),
      ] as BxDropdownItem[];
      grid!.shadowRoot!.querySelector<HTMLElement>('.base')!.click();
      expect(grid!.checked).to.be.true;
      expect(el.open).to.be.true;

      large!.shadowRoot!.querySelector<HTMLElement>('.base')!.click();
      await large!.updateComplete;
      await small!.updateComplete;
      expect(large!.checked).to.be.true;
      expect(small!.checked).to.be.false;
      expect(
        large!
          .shadowRoot!.querySelector('[role="menuitemradio"]')!
          .getAttribute('aria-checked'),
      ).to.equal('true');
      expect(el.open).to.be.true;
    });
  });

  describe('submenus', () => {
    const nested = html`
      <bx-dropdown>
        <button slot="trigger">File</button>
        <bx-dropdown-item id="share">
          Share
          <bx-dropdown-item slot="submenu" value="email"
            >Email</bx-dropdown-item
          >
          <bx-dropdown-item slot="submenu" value="link">Link</bx-dropdown-item>
        </bx-dropdown-item>
        <bx-dropdown-item id="export">
          Export
          <bx-dropdown-item slot="submenu" value="pdf">PDF</bx-dropdown-item>
        </bx-dropdown-item>
        <bx-dropdown-item value="print">Print</bx-dropdown-item>
      </bx-dropdown>
    `;

    it('ArrowRight opens the submenu and focuses its first item; ArrowLeft closes it', async () => {
      const { el, trigger } = await setup(nested);
      const share = el.querySelector('#share') as BxDropdownItem;
      trigger.focus();
      await press(el, 'ArrowDown');
      await aTimeout(50);
      expect(focused(el)).to.equal(share);
      await press(el, 'ArrowRight');
      await aTimeout(80);
      expect(share.submenuOpen).to.be.true;
      expect(focused(el)).to.equal(share.querySelector('[value="email"]'));
      expect(
        share.shadowRoot!.querySelector('.base')!.getAttribute('aria-expanded'),
      ).to.equal('true');

      await press(el, 'ArrowDown');
      expect(focused(el)).to.equal(share.querySelector('[value="link"]'));
      await press(el, 'ArrowLeft');
      expect(share.submenuOpen).to.be.false;
      expect(focused(el)).to.equal(share);
      expect(el.open).to.be.true;
    });

    it('Escape in a submenu closes only the submenu', async () => {
      const { el, trigger } = await setup(nested);
      const share = el.querySelector('#share') as BxDropdownItem;
      trigger.focus();
      await press(el, 'ArrowDown');
      await aTimeout(50);
      await press(el, 'ArrowRight');
      await aTimeout(80);
      await press(el, 'Escape');
      expect(share.submenuOpen).to.be.false;
      expect(el.open).to.be.true;
      expect(focused(el)).to.equal(share);
    });

    it('activating a submenu parent opens it instead of firing bx-select', async () => {
      const { el } = await setup(nested);
      await open(el);
      let selects = 0;
      el.addEventListener('bx-select', () => selects++);
      const share = el.querySelector('#share') as BxDropdownItem;
      share.shadowRoot!.querySelector<HTMLElement>('.base')!.click();
      await settle(el);
      expect(share.submenuOpen).to.be.true;
      expect(selects).to.equal(0);
      expect(el.open).to.be.true;
    });

    it('selecting a nested item bubbles to the dropdown, reports it, and closes everything', async () => {
      const { el } = await setup(nested);
      await open(el);
      const share = el.querySelector('#share') as BxDropdownItem;
      share.shadowRoot!.querySelector<HTMLElement>('.base')!.click();
      await settle(el);
      const selected = oneEvent(el, 'bx-select');
      const link = share.querySelector('[value="link"]') as BxDropdownItem;
      link.shadowRoot!.querySelector<HTMLElement>('.base')!.click();
      const event = (await selected) as CustomEvent;
      await settle(el);
      expect(event.detail.value).to.equal('link');
      expect(el.open).to.be.false;
      expect(share.submenuOpen).to.be.false;
    });

    it('a click on a nested item does not activate its parent', async () => {
      const { el } = await setup(nested);
      await open(el);
      const share = el.querySelector('#share') as BxDropdownItem;
      share.submenuOpen = true;
      await settle(el);
      const values: string[] = [];
      el.addEventListener('bx-select', (e) =>
        values.push((e as CustomEvent).detail.value),
      );
      (share.querySelector('[value="email"]') as BxDropdownItem)
        .shadowRoot!.querySelector<HTMLElement>('.base')!
        .click();
      expect(values).to.deep.equal(['email']);
    });

    it('opens on hover after a dwell and keeps one submenu open at a time', async () => {
      const { el } = await setup(nested);
      await open(el);
      const share = el.querySelector('#share') as BxDropdownItem;
      const exp = el.querySelector('#export') as BxDropdownItem;
      share.dispatchEvent(
        new PointerEvent('pointerenter', { pointerType: 'mouse' }),
      );
      await aTimeout(200);
      expect(share.submenuOpen).to.be.true;

      exp.dispatchEvent(
        new PointerEvent('pointerenter', { pointerType: 'mouse' }),
      );
      await aTimeout(200);
      expect(exp.submenuOpen).to.be.true;
      expect(share.submenuOpen).to.be.false;
    });

    it('closes open submenus when the dropdown closes', async () => {
      const { el } = await setup(nested);
      await open(el);
      const share = el.querySelector('#share') as BxDropdownItem;
      await share.openSubmenu();
      el.hide();
      await settle(el);
      expect(share.submenuOpen).to.be.false;
    });

    it('positions the submenu beside the parent row, not relative to it', async () => {
      const { el } = await setup(nested);
      await open(el);
      const share = el.querySelector('#share') as BxDropdownItem;
      await share.openSubmenu();
      await share.updateComplete;
      await settle(el);
      await aTimeout(50);
      const row = share.getBoundingClientRect();
      const panel = share
        .shadowRoot!.querySelector('.submenu')!
        .getBoundingClientRect();
      expect(panel.width).to.be.greaterThan(0);
      expect(Math.abs(panel.left - row.right)).to.be.lessThan(2);
      expect(Math.abs(panel.top - row.top)).to.be.lessThan(2);
    });
  });

  describe('data-driven items', () => {
    const data = [
      { label: 'Cut', value: 'cut', details: '⌘X' },
      { label: 'Copy', value: 'copy' },
      { divider: true },
      { heading: 'View' },
      { label: 'Word wrap', value: 'wrap', type: 'checkbox' as const },
      {
        label: 'Small',
        value: 's',
        type: 'radio' as const,
        name: 'size',
        checked: true,
      },
      { label: 'Large', value: 'l', type: 'radio' as const, name: 'size' },
    ];

    it('renders rows from the items array with separators and headings', async () => {
      const { el } = await setup(
        html`<bx-dropdown .items=${data}
          ><button slot="trigger">Edit</button></bx-dropdown
        >`,
      );
      await open(el);
      expect(
        el.shadowRoot!.querySelectorAll('bx-dropdown-item'),
      ).to.have.length(5);
      expect(el.shadowRoot!.querySelector('[role="separator"]')).to.exist;
      expect(el.shadowRoot!.querySelector('.heading')!.textContent).to.contain(
        'View',
      );
      const copy = el.shadowRoot!.querySelectorAll('bx-dropdown-item')[1]!;
      expect(
        copy.shadowRoot!.querySelector('.base')!.getAttribute('aria-posinset'),
      ).to.equal('2');
      expect(
        copy.shadowRoot!.querySelector('.base')!.getAttribute('aria-setsize'),
      ).to.equal('5');
    });

    it('keyboard navigation and selection work over data rows and report the data', async () => {
      const { el, trigger } = await setup(
        html`<bx-dropdown .items=${data}
          ><button slot="trigger">Edit</button></bx-dropdown
        >`,
      );
      const details: { value: string; index: number; data: unknown }[] = [];
      el.addEventListener('bx-select', (e) =>
        details.push((e as CustomEvent).detail),
      );
      trigger.focus();
      await press(el, 'ArrowDown');
      await aTimeout(80);
      expect((focused(el) as BxDropdownItem).value).to.equal('cut');
      await press(el, 'ArrowDown');
      await press(el, 'ArrowDown'); // skips the divider and heading
      expect((focused(el) as BxDropdownItem).value).to.equal('wrap');
      await press(el, 'Enter');
      expect(details[0]!.index).to.equal(4);
      expect(details[0]!.data).to.equal(data[4]);
      expect(el.open).to.be.true; // checkbox keeps it open
    });

    it('keeps checkbox and radio state across re-renders and reserves a checkmark gutter', async () => {
      const { el } = await setup(
        html`<bx-dropdown .items=${data}
          ><button slot="trigger">Edit</button></bx-dropdown
        >`,
      );
      await open(el);
      const rows = () => [
        ...el.shadowRoot!.querySelectorAll<BxDropdownItem>('bx-dropdown-item'),
      ];
      expect(rows()[0]!.hasAttribute('data-force-reserve')).to.be.true;
      rows()[4]!.shadowRoot!.querySelector<HTMLElement>('.base')!.click(); // Large
      await settle(el);
      expect(rows()[4]!.checked).to.be.true;
      expect(rows()[3]!.checked).to.be.false;
    });

    describe('virtual', () => {
      const big = Array.from({ length: 5000 }, (_, i) => ({
        label: `Action ${i}`,
        value: `a${i}`,
      }));
      const virtualMenu = () =>
        html`<bx-dropdown virtual .items=${big}
          ><button slot="trigger">Many</button></bx-dropdown
        >`;

      it('renders only a window of rows with correct aria metadata', async () => {
        const { el } = await setup(virtualMenu());
        await open(el);
        await aTimeout(60);
        const rows =
          el.shadowRoot!.querySelectorAll<BxDropdownItem>('bx-dropdown-item');
        expect(rows.length).to.be.greaterThan(0);
        expect(rows.length).to.be.lessThan(50);
        const first = rows[0]!.shadowRoot!.querySelector('.base')!;
        expect(first.getAttribute('aria-setsize')).to.equal('5000');
        // posinset comes from the data index, wherever the window starts (opening can scroll the
        // menu by a row or two in some engines), never from the DOM position.
        const index = Number(rows[0]!.dataset['index']);
        expect(index).to.be.lessThan(10);
        expect(first.getAttribute('aria-posinset')).to.equal(String(index + 1));
      });

      it('does not virtualize at or below the threshold', async () => {
        const { el } = await setup(
          html`<bx-dropdown
            virtual
            virtual-threshold="10"
            .items=${big.slice(0, 10)}
            ><button slot="trigger">x</button></bx-dropdown
          >`,
        );
        await open(el);
        expect(
          el.shadowRoot!.querySelectorAll('bx-dropdown-item'),
        ).to.have.length(10);
      });

      it('End focuses the last item without rendering everything, and keeps focus while scrolling', async () => {
        const { el, trigger } = await setup(virtualMenu());
        trigger.focus();
        await press(el, 'ArrowDown');
        await aTimeout(80);
        await press(el, 'End');
        await aTimeout(150);
        const active = focused(el) as BxDropdownItem;
        expect(active.value).to.equal('a4999');
        expect(
          el.shadowRoot!.querySelectorAll('bx-dropdown-item').length,
        ).to.be.lessThan(50);

        menu(el).scrollTop = 0; // scroll far away; the focused node must stay in the DOM
        await aTimeout(120);
        expect(el.shadowRoot!.querySelector('[data-index="4999"]')).to.exist;
      });

      it('typeahead covers the whole data set', async () => {
        const { el, trigger } = await setup(virtualMenu());
        trigger.focus();
        await press(el, 'ArrowDown');
        await aTimeout(80);
        await sendKeys({ type: 'Action 4321' });
        await aTimeout(150);
        expect((focused(el) as BxDropdownItem).value).to.equal('a4321');
      });

      it('remembers a checked row after it scrolls out of the window and back', async () => {
        const checkable = Array.from({ length: 3000 }, (_, i) => ({
          label: `Opt ${i}`,
          type: 'checkbox' as const,
        }));
        const { el } = await setup(
          html`<bx-dropdown virtual .items=${checkable}
            ><button slot="trigger">x</button></bx-dropdown
          >`,
        );
        await open(el);
        await aTimeout(60);
        const row = (i: number) =>
          el.shadowRoot!.querySelector<BxDropdownItem>(`[data-index="${i}"]`);
        row(2)!.focus();
        row(2)!.shadowRoot!.querySelector<HTMLElement>('.base')!.click();
        await settle(el);
        // The activated row is the focused one, so it stays pinned; move focus far away to free it.
        await press(el, 'End');
        await aTimeout(150);
        menu(el).scrollTop = 0;
        await aTimeout(150);
        // (compare to null directly: chai would try to pretty-print a failing DOM node)
        expect(row(2) === null, 'row 2 is rendered again after scrolling back')
          .to.be.false;
        expect(row(2)!.checked).to.be.true;
        expect(row(3)!.checked).to.be.false;
      });

      it('opens a 100k-row menu quickly', async () => {
        const huge = Array.from({ length: 100_000 }, (_, i) => ({
          label: `Row ${i}`,
        }));
        const { el } = await setup(
          html`<bx-dropdown virtual
            ><button slot="trigger">x</button></bx-dropdown
          >`,
        );
        const shown = oneEvent(el, 'bx-after-show');
        const start = performance.now();
        el.items = huge;
        el.show();
        await shown;
        const elapsed = performance.now() - start;
        console.log(
          `bx-dropdown: 100k items, set + open in ${elapsed.toFixed(1)}ms`,
        );
        expect(elapsed).to.be.lessThan(250);
        expect(
          el.shadowRoot!.querySelectorAll('bx-dropdown-item').length,
        ).to.be.lessThan(50);
      });
    });
  });

  describe('accessibility', () => {
    it('has no axe violations closed, open, with submenu open, and in data mode', async () => {
      const { el } = await setup(html`
        <bx-dropdown>
          <button slot="trigger">Actions</button>
          <bx-dropdown-item>One</bx-dropdown-item>
          <bx-dropdown-item type="checkbox" checked>Two</bx-dropdown-item>
          <bx-dropdown-item>
            Three
            <bx-dropdown-item slot="submenu">Nested</bx-dropdown-item>
          </bx-dropdown-item>
        </bx-dropdown>
      `);
      await expect(el).to.be.accessible();
      await open(el);
      await expect(el).to.be.accessible();
      await (
        el.querySelectorAll('bx-dropdown-item')[2] as BxDropdownItem
      ).openSubmenu();
      await settle(el);
      await expect(el).to.be.accessible();

      const data = await setup(
        html`<bx-dropdown
          virtual
          .items=${[{ label: 'A' }, { label: 'B', type: 'checkbox' as const }]}
          ><button slot="trigger">Data</button></bx-dropdown
        >`,
      );
      await open(data.el);
      await expect(data.el).to.be.accessible();
    });
  });
});
