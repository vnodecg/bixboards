import { expect, fixture, html, aTimeout } from '@open-wc/testing';
import type { BxContextMenu } from './context-menu.ts';
import '../dropdown-item/index.ts';
import './index.ts';

const make = () =>
  html` <div id="area" style="inline-size: 20rem; block-size: 10rem">
    Area
    <bx-context-menu>
      <bx-dropdown-item value="cut">Cut</bx-dropdown-item>
      <bx-dropdown-item value="copy">Copy</bx-dropdown-item>
    </bx-context-menu>
  </div>`;

const contextmenu = (el: Element, x = 40, y = 30) =>
  el.dispatchEvent(
    new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
    }),
  );

describe('bx-context-menu', () => {
  it('opens on contextmenu on its parent and suppresses the native menu', async () => {
    const area = await fixture<HTMLElement>(make());
    const menu = area.querySelector<BxContextMenu>('bx-context-menu')!;
    await menu.updateComplete;
    const event = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      clientX: 50,
      clientY: 40,
    });
    area.dispatchEvent(event);
    expect(event.defaultPrevented).to.be.true;
    await aTimeout(250);
    expect(menu.open).to.be.true;
    menu.hide();
    await aTimeout(250);
    expect(menu.open).to.be.false;
  });

  it('positions the virtual anchor at the pointer', async () => {
    const area = await fixture<HTMLElement>(make());
    const menu = area.querySelector<BxContextMenu>('bx-context-menu')!;
    await menu.updateComplete;
    contextmenu(area, 77, 66);
    const anchor = menu.shadowRoot!.querySelector<HTMLElement>('.anchor')!;
    expect(anchor.style.left).to.equal('77px');
    expect(anchor.style.top).to.equal('66px');
  });

  it('does nothing and leaves the native menu when disabled', async () => {
    const area = await fixture<HTMLElement>(make());
    const menu = area.querySelector<BxContextMenu>('bx-context-menu')!;
    menu.disabled = true;
    await menu.updateComplete;
    const event = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
    });
    area.dispatchEvent(event);
    expect(event.defaultPrevented).to.be.false;
    await aTimeout(100);
    expect(menu.open).to.be.false;
  });

  it('opens from the keyboard with Shift+F10 and the Menu key', async () => {
    const area = await fixture<HTMLElement>(make());
    const menu = area.querySelector<BxContextMenu>('bx-context-menu')!;
    await menu.updateComplete;
    area.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'F10',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    await aTimeout(250);
    expect(menu.open).to.be.true;
    menu.hide();
    await aTimeout(250);
    area.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ContextMenu',
        bubbles: true,
        cancelable: true,
      }),
    );
    await aTimeout(250);
    expect(menu.open).to.be.true;
  });

  it('can target another element with `for`, and emits bx-select', async () => {
    const wrap = await fixture<HTMLElement>(
      html` <div>
        <p id="elsewhere">Right-click me</p>
        <bx-context-menu for="elsewhere">
          <bx-dropdown-item value="a">A</bx-dropdown-item>
        </bx-context-menu>
      </div>`,
    );
    const menu = wrap.querySelector<BxContextMenu>('bx-context-menu')!;
    await menu.updateComplete;
    let picked: string | undefined;
    menu.addEventListener(
      'bx-select',
      (e) => (picked = (e as CustomEvent).detail.item.value),
    );
    contextmenu(wrap.querySelector('#elsewhere')!);
    await aTimeout(250);
    expect(menu.open).to.be.true;
    wrap.querySelector<HTMLElement>('bx-dropdown-item')!.click();
    await aTimeout(250);
    expect(picked).to.equal('a');
  });

  it('has no axe violations while open', async () => {
    const area = await fixture<HTMLElement>(make());
    const menu = area.querySelector<BxContextMenu>('bx-context-menu')!;
    await menu.updateComplete;
    contextmenu(area);
    await aTimeout(250);
    await expect(area).to.be.accessible();
  });
});
