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
});
