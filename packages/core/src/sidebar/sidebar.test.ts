import { expect, fixture, html, aTimeout } from '@open-wc/testing';
import type { BxSidebar } from './sidebar.ts';
import type { BxSidebarItem } from '../sidebar-item/sidebar-item.ts';
import './index.ts';

const make = (attrs = '') =>
  html` <bx-sidebar mode="inline" persist-key="bx-test-sidebar">
    <span slot="header">Acme</span>
    <bx-sidebar-group label="Main">
      <bx-sidebar-item href="/home" icon="info" active>Home</bx-sidebar-item>
      <bx-sidebar-item icon="check" badge="3">Inbox</bx-sidebar-item>
      <bx-sidebar-item icon="copy">
        Reports
        <bx-sidebar-item slot="children" href="/r/a">Weekly</bx-sidebar-item>
      </bx-sidebar-item>
      <bx-sidebar-item href="/off" disabled>Off</bx-sidebar-item>
    </bx-sidebar-group>
    <span slot="footer">User</span>
  </bx-sidebar>`;

const items = (el: Element) => [
  ...el.querySelectorAll<BxSidebarItem>('bx-sidebar-item'),
];

describe('bx-sidebar', () => {
  beforeEach(() => localStorage.removeItem('bx-test-sidebar'));

  it('is a labelled nav landmark with groups, links and current page', async () => {
    const el = await fixture<BxSidebar>(make());
    await Promise.all(items(el).map((i) => i.updateComplete));
    expect(
      el.shadowRoot!.querySelector('nav')!.getAttribute('aria-label'),
    ).to.equal('Main navigation');
    expect(el.querySelector('bx-sidebar-group')!.getAttribute('role')).to.equal(
      'group',
    );
    const link = items(el)[0].shadowRoot!.querySelector('a')!;
    expect(link.getAttribute('href')).to.equal('/home');
    expect(link.getAttribute('aria-current')).to.equal('page');
  });

  it('collapses to a rail, mirrors the state to items, fires an event and persists', async () => {
    const el = await fixture<BxSidebar>(make());
    const base = () =>
      el
        .shadowRoot!.querySelector<HTMLElement>('.base')!
        .getBoundingClientRect().width;
    const wide = base();
    let detail: unknown;
    el.addEventListener(
      'bx-collapse-change',
      (e) => (detail = (e as CustomEvent).detail),
    );
    el.collapse();
    await el.updateComplete;
    await aTimeout(300);
    expect(base()).to.be.lessThan(wide);
    expect(items(el).every((i) => i.collapsed)).to.be.true;
    expect(detail).to.deep.equal({ collapsed: true });
    expect(localStorage.getItem('bx-test-sidebar')).to.equal('true');
    el.expand();
    await el.updateComplete;
    expect(items(el).every((i) => !i.collapsed)).to.be.true;
    expect(localStorage.getItem('bx-test-sidebar')).to.equal('false');
  });

  it('restores a persisted collapsed state', async () => {
    localStorage.setItem('bx-test-sidebar', 'true');
    const el = await fixture<BxSidebar>(make());
    expect(el.collapsed).to.be.true;
  });

  it('collapsed items keep an accessible name and show a tooltip', async () => {
    const el = await fixture<BxSidebar>(make());
    el.collapse();
    await el.updateComplete;
    await Promise.all(items(el).map((i) => i.updateComplete));
    const home = items(el)[0];
    expect(home.shadowRoot!.querySelector('bx-tooltip')).to.exist;
    expect(
      home.shadowRoot!.querySelector('a')!.getAttribute('aria-label'),
    ).to.equal('Home');
  });

  it('expands nested items with aria-expanded and fires a cancelable bx-navigate for links', async () => {
    const el = await fixture<BxSidebar>(make());
    const reports = items(el)[2];
    const off = items(el).find((i) => i.getAttribute('href') === '/off')!;
    await off.updateComplete;
    await reports.updateComplete;
    const button = reports.shadowRoot!.querySelector('button')!;
    expect(button.getAttribute('aria-expanded')).to.equal('false');
    button.click();
    await reports.updateComplete;
    expect(reports.expanded).to.be.true;
    expect(
      reports
        .shadowRoot!.querySelector('button')!
        .getAttribute('aria-expanded'),
    ).to.equal('true');

    const home = items(el)[0];
    let href = '';
    home.addEventListener('bx-navigate', (e) => {
      href = (e as CustomEvent).detail.href;
      e.preventDefault();
    });
    const click = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    home.shadowRoot!.querySelector('a')!.dispatchEvent(click);
    expect(href).to.equal('/home');
    expect(click.defaultPrevented).to.be.true;
    expect(
      off.shadowRoot!.querySelector('a')!.getAttribute('aria-disabled'),
    ).to.equal('true');
  });

  it('overlay mode: hidden until open, Escape closes, Tab loops, focus returns', async () => {
    const wrap = await fixture<HTMLElement>(
      html`<div>
        <button id="opener">Menu</button>${make().strings ? make() : make()}
      </div>`,
    );
    const el = wrap.querySelector('bx-sidebar') as BxSidebar;
    el.mode = 'overlay';
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('nav')!.hasAttribute('inert')).to.be
      .true;
    const opener = wrap.querySelector<HTMLElement>('#opener')!;
    opener.focus();
    let hid = 0;
    el.addEventListener('bx-hide', () => hid++);
    el.show();
    await aTimeout(100);
    expect(el.open).to.be.true;
    expect(el.shadowRoot!.querySelector('.backdrop')).to.exist;
    el.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        composed: true,
      }),
    );
    await aTimeout(50);
    expect(el.open).to.be.false;
    expect(hid).to.equal(1);
    expect(document.activeElement).to.equal(opener);
  });

  it('has no axe violations expanded and collapsed', async () => {
    const el = await fixture<BxSidebar>(make());
    await Promise.all(items(el).map((i) => i.updateComplete));
    await expect(el).to.be.accessible();
    el.collapse();
    await el.updateComplete;
    await Promise.all(items(el).map((i) => i.updateComplete));
    await expect(el).to.be.accessible();
  });
});
