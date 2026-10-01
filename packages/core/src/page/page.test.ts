import {
  aTimeout,
  expect,
  fixture,
  html,
  nextFrame,
  oneEvent,
} from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import type { BxPage } from './page.ts';
import './index.ts';

async function setup(width: number, attrs = ''): Promise<BxPage> {
  const wrapper = await fixture<HTMLDivElement>(
    html`<div style="inline-size: ${width}px; block-size: 400px">
      <bx-page style="block-size: 100%">
        <span slot="header">App</span>
        <ul slot="navigation">
          <li><a href="#a" id="nav-link">Link</a></li>
        </ul>
        <p>Main content</p>
        <span slot="aside">Aside</span>
        <span slot="footer">Footer</span>
      </bx-page>
    </div>`,
  );
  const el = wrapper.querySelector('bx-page') as BxPage;
  if (attrs) for (const a of attrs.split(' ')) el.setAttribute(a, '');
  await el.updateComplete;
  await nextFrame();
  await nextFrame();
  await el.updateComplete;
  return el;
}

const q = (el: BxPage, sel: string) =>
  el.shadowRoot!.querySelector<HTMLElement>(sel)!;

describe('bx-page', () => {
  it('registers and renders landmark elements', async () => {
    const el = await setup(1000);
    expect(el).to.be.instanceOf(customElements.get('bx-page')!);
    for (const sel of ['header', 'nav', 'main', 'aside', 'footer'])
      expect(q(el, sel), sel).to.exist;
  });

  it('is desktop above the breakpoint, based on its own width', async () => {
    const el = await setup(1000);
    expect(el.view).to.equal('desktop');
  });

  it('is mobile below the breakpoint and fires bx-page-view-change both ways', async () => {
    const el = await setup(1000);
    const changed = oneEvent(el, 'bx-page-view-change');
    (el.parentElement as HTMLElement).style.inlineSize = '400px';
    expect(((await changed) as CustomEvent).detail.view).to.equal('mobile');
    expect(el.getAttribute('view')).to.equal('mobile');
    const back = oneEvent(el, 'bx-page-view-change');
    (el.parentElement as HTMLElement).style.inlineSize = '1000px';
    expect(((await back) as CustomEvent).detail.view).to.equal('desktop');
  });

  it('honours mobile-breakpoint in any CSS length', async () => {
    const el = await setup(1000);
    el.mobileBreakpoint = '80rem'; // 1280px at the default root size
    await aTimeout(60);
    await el.updateComplete;
    expect(el.view).to.equal('mobile');
  });

  it('shows the navigation as a column on desktop and an inert off-canvas drawer on mobile', async () => {
    const el = await setup(1000);
    expect(q(el, '.navigation').inert).to.be.false;
    const mobile = await setup(400);
    expect(mobile.view).to.equal('mobile');
    await aTimeout(300); // visibility transition
    expect(q(mobile, '.navigation').inert).to.be.true;
    expect(getComputedStyle(q(mobile, '.navigation')).visibility).to.equal(
      'hidden',
    );
  });

  it('opens the drawer, focuses into it, makes the rest inert, and closes with Escape returning focus', async () => {
    const el = await setup(400);
    const toggled: boolean[] = [];
    el.addEventListener('bx-page-nav-toggle', (e) =>
      toggled.push((e as CustomEvent).detail.open),
    );
    const menu = q(el, '.menu-button');
    menu.focus();
    menu.click();
    await el.updateComplete;
    await aTimeout(60);
    expect(el.navOpen).to.be.true;
    expect(q(el, '.content').inert).to.be.true;
    expect(q(el, '.navigation').inert).to.be.false;
    expect(document.activeElement).to.equal(el.querySelector('#nav-link'));

    await sendKeys({ press: 'Escape' });
    await el.updateComplete;
    expect(el.navOpen).to.be.false;
    expect(el.shadowRoot!.activeElement).to.equal(menu);
    expect(q(el, '.content').inert).to.be.false;
    expect(toggled).to.deep.equal([true, false]);
  });

  it('closes from the scrim and the hide button, and on switching to desktop', async () => {
    const el = await setup(400);
    el.showNavigation();
    await el.updateComplete;
    q(el, '.scrim').click();
    await el.updateComplete;
    expect(el.navOpen).to.be.false;

    el.toggleNavigation();
    await el.updateComplete;
    q(el, '.hide-menu-button').click();
    await el.updateComplete;
    expect(el.navOpen).to.be.false;

    el.showNavigation();
    await el.updateComplete;
    (el.parentElement as HTMLElement).style.inlineSize = '1000px';
    await aTimeout(80);
    await el.updateComplete;
    expect(el.view).to.equal('desktop');
    expect(el.navOpen).to.be.false;
  });

  it('can hide the default menu button', async () => {
    const el = await setup(400, 'disable-navigation-toggle');
    expect(el.shadowRoot!.querySelector('.menu-button')).to.be.null;
  });

  it('skip link is first in tab order and focuses main', async () => {
    const el = await setup(1000);
    const link = q(el, '.skip a');
    link.click();
    expect(el.shadowRoot!.activeElement).to.equal(q(el, 'main'));
  });

  it('drops the aside below main in the mobile view', async () => {
    const desktop = await setup(1000);
    const mobile = await setup(400);
    const main = (e: BxPage) => q(e, 'main').getBoundingClientRect();
    const aside = (e: BxPage) => q(e, 'aside').getBoundingClientRect();
    expect(aside(desktop).left).to.be.greaterThan(main(desktop).left);
    expect(aside(mobile).top).to.be.at.least(main(mobile).bottom - 1);
  });

  it('has no axe violations on desktop', async () => {
    await expect(await setup(1000)).to.be.accessible();
  });

  it('has no axe violations on mobile, closed', async () => {
    await expect(await setup(400)).to.be.accessible();
  });

  it('has no axe violations on mobile, drawer open', async () => {
    const mobile = await setup(400);
    mobile.showNavigation();
    await mobile.updateComplete;
    await aTimeout(250);
    // axe measures the inert page content through the 40% scrim, which is by design not readable.
    await expect(mobile).to.be.accessible({ ignoredRules: ['color-contrast'] });
  });

  it('releases its observer on disconnect', async () => {
    const el = await setup(1000);
    const parent = el.parentElement!;
    el.remove();
    parent.style.inlineSize = '300px';
    await aTimeout(50);
    expect(el.view).to.equal('desktop');
  });
});
