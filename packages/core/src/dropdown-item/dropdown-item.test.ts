import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxDropdownItem } from './dropdown-item.ts';
import './index.ts';

describe('bx-dropdown-item', () => {
  it('registers the tag with role=menuitem by default', async () => {
    const el = await fixture<BxDropdownItem>(
      html`<bx-dropdown-item>Item</bx-dropdown-item>`,
    );
    expect(el).to.be.instanceOf(customElements.get('bx-dropdown-item')!);
    expect(el.shadowRoot!.querySelector('[role="menuitem"]')).to.exist;
  });

  it('uses role=menuitemcheckbox and aria-checked for checkbox items', async () => {
    const el = await fixture<BxDropdownItem>(
      html`<bx-dropdown-item type="checkbox" checked>Item</bx-dropdown-item>`,
    );
    const base = el.shadowRoot!.querySelector('[role="menuitemcheckbox"]')!;
    expect(base.getAttribute('aria-checked')).to.equal('true');
  });

  it('reserves checkmark space on plain siblings when one is a checkbox item', async () => {
    const parent = await fixture<HTMLDivElement>(html`
      <div>
        <bx-dropdown-item>Plain</bx-dropdown-item>
        <bx-dropdown-item type="checkbox">Checkbox</bx-dropdown-item>
      </div>
    `);
    const [plain] = [...parent.children] as BxDropdownItem[];
    expect(plain!.hasAttribute('data-reserve-checkmark')).to.be.true;
  });

  it('does not reserve checkmark space when no sibling is a checkbox item', async () => {
    const parent = await fixture<HTMLDivElement>(html`
      <div>
        <bx-dropdown-item>One</bx-dropdown-item>
        <bx-dropdown-item>Two</bx-dropdown-item>
      </div>
    `);
    const [one] = [...parent.children] as BxDropdownItem[];
    expect(one!.hasAttribute('data-reserve-checkmark')).to.be.false;
  });

  it('fires bx-select on click, toggling checked for checkbox type', async () => {
    const el = await fixture<BxDropdownItem>(
      html`<bx-dropdown-item type="checkbox" value="x">Item</bx-dropdown-item>`,
    );
    const selectPromise = oneEvent(el, 'bx-select');
    el.shadowRoot!.querySelector<HTMLElement>('.base')!.click();
    const event = (await selectPromise) as CustomEvent;
    expect(el.checked).to.be.true;
    expect(event.detail.checked).to.be.true;
  });

  it('does not fire bx-select when disabled', async () => {
    const el = await fixture<BxDropdownItem>(
      html`<bx-dropdown-item disabled>Item</bx-dropdown-item>`,
    );
    let fired = false;
    el.addEventListener('bx-select', () => (fired = true));
    el.shadowRoot!.querySelector<HTMLElement>('.base')!.click();
    expect(fired).to.be.false;
  });

  it('remains focusable when disabled and an ancestor sets focusable-disabled', async () => {
    const parent = await fixture<HTMLDivElement>(html`
      <div focusable-disabled>
        <bx-dropdown-item disabled>Item</bx-dropdown-item>
      </div>
    `);
    const item = parent.querySelector('bx-dropdown-item') as BxDropdownItem;
    expect(
      item.shadowRoot!.querySelector('.base')!.getAttribute('tabindex'),
    ).to.equal('0');
  });

  it('sets aria-haspopup when a submenu is assigned', async () => {
    const el = await fixture<BxDropdownItem>(html`
      <bx-dropdown-item>
        Item
        <bx-dropdown-item slot="submenu">Nested</bx-dropdown-item>
      </bx-dropdown-item>
    `);
    await el.updateComplete;
    expect(
      el.shadowRoot!.querySelector('.base')!.getAttribute('aria-haspopup'),
    ).to.equal('menu');
  });

  it('has no axe violations (role=menuitem requires a menu ancestor per the ARIA spec)', async () => {
    const wrapper = await fixture<HTMLDivElement>(
      html`<div role="menu"><bx-dropdown-item>Item</bx-dropdown-item></div>`,
    );
    await expect(wrapper).to.be.accessible();
  });

  it('reports itself as detail.item on bx-select', async () => {
    const el = await fixture<BxDropdownItem>(
      html`<bx-dropdown-item value="x">Item</bx-dropdown-item>`,
    );
    const selected = oneEvent(el, 'bx-select');
    el.shadowRoot!.querySelector<HTMLElement>('.base')!.click();
    expect(((await selected) as CustomEvent).detail.item).to.equal(el);
  });

  it('focus() moves focus to the row', async () => {
    const el = await fixture<BxDropdownItem>(
      html`<bx-dropdown-item>Item</bx-dropdown-item>`,
    );
    el.focus();
    expect(el.shadowRoot!.activeElement).to.equal(
      el.shadowRoot!.querySelector('.base'),
    );
  });

  it('makes same-name radio items mutually exclusive within one parent', async () => {
    const parent = await fixture<HTMLDivElement>(html`
      <div role="menu">
        <bx-dropdown-item type="radio" name="a" checked>One</bx-dropdown-item>
        <bx-dropdown-item type="radio" name="a">Two</bx-dropdown-item>
        <bx-dropdown-item type="radio" name="b" checked
          >Other group</bx-dropdown-item
        >
      </div>
    `);
    const [one, two, other] = [...parent.children] as BxDropdownItem[];
    two!.shadowRoot!.querySelector<HTMLElement>('.base')!.click();
    expect(two!.checked).to.be.true;
    expect(one!.checked).to.be.false;
    expect(other!.checked).to.be.true;
    await two!.updateComplete;
    expect(
      two!
        .shadowRoot!.querySelector('[role="menuitemradio"]')!
        .getAttribute('aria-checked'),
    ).to.equal('true');
    // Radio items reserve the checkmark gutter just like checkbox items.
    expect(one!.hasAttribute('data-reserve-checkmark')).to.be.true;
  });

  it('opens and closes a submenu, opening one at a time per menu', async () => {
    const parent = await fixture<HTMLDivElement>(html`
      <div role="menu">
        <bx-dropdown-item id="a"
          >A<bx-dropdown-item slot="submenu"
            >A1</bx-dropdown-item
          ></bx-dropdown-item
        >
        <bx-dropdown-item id="b"
          >B<bx-dropdown-item slot="submenu"
            >B1</bx-dropdown-item
          ></bx-dropdown-item
        >
      </div>
    `);
    const a = parent.querySelector('#a') as BxDropdownItem;
    const b = parent.querySelector('#b') as BxDropdownItem;
    await a.updateComplete;
    await b.updateComplete;
    expect(a.hasSubmenu).to.be.true;

    await a.openSubmenu();
    await a.updateComplete;
    expect(a.hasAttribute('submenu-open')).to.be.true;
    expect(a.shadowRoot!.querySelector('bx-popup')!.hasAttribute('active')).to
      .be.true;

    await b.openSubmenu();
    await a.updateComplete;
    expect(b.submenuOpen).to.be.true;
    expect(a.submenuOpen).to.be.false;

    b.closeSubmenu();
    expect(b.submenuOpen).to.be.false;
  });

  it('does not open a submenu while disabled', async () => {
    const el = await fixture<BxDropdownItem>(html`
      <bx-dropdown-item disabled
        >A<bx-dropdown-item slot="submenu"
          >A1</bx-dropdown-item
        ></bx-dropdown-item
      >
    `);
    await el.updateComplete;
    await el.openSubmenu();
    expect(el.submenuOpen).to.be.false;
  });

  it('forwards set-size/pos-in-set to aria-setsize/aria-posinset on the row', async () => {
    const el = await fixture<BxDropdownItem>(
      html`<bx-dropdown-item set-size="500" pos-in-set="42"
        >Item</bx-dropdown-item
      >`,
    );
    const base = el.shadowRoot!.querySelector('.base')!;
    expect(base.getAttribute('aria-setsize')).to.equal('500');
    expect(base.getAttribute('aria-posinset')).to.equal('42');
  });

  it('textLabel is the item text without icon/details/submenu content', async () => {
    const el = await fixture<BxDropdownItem>(html`
      <bx-dropdown-item>
        <span slot="icon">★</span>
        Rename
        <span slot="details">F2</span>
        <bx-dropdown-item slot="submenu">Nested</bx-dropdown-item>
      </bx-dropdown-item>
    `);
    expect(el.textLabel).to.equal('Rename');
  });
});
