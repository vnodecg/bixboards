import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxTabGroup } from './tab-group.ts';
import type { BxTab } from '../tab/tab.ts';
import type { BxTabPanel } from '../tab-panel/tab-panel.ts';
import './index.ts';

async function fixtureGroup() {
  return fixture<BxTabGroup>(html`
    <bx-tab-group>
      <bx-tab slot="nav" panel="one">One</bx-tab>
      <bx-tab slot="nav" panel="two">Two</bx-tab>
      <bx-tab slot="nav" panel="three" disabled>Three</bx-tab>
      <bx-tab-panel name="one">Panel one</bx-tab-panel>
      <bx-tab-panel name="two">Panel two</bx-tab-panel>
      <bx-tab-panel name="three">Panel three</bx-tab-panel>
    </bx-tab-group>
  `);
}

describe('bx-tab-group', () => {
  it('activates the first tab/panel by default', async () => {
    const el = await fixtureGroup();
    const [one] = el.querySelectorAll('bx-tab') as unknown as BxTab[];
    const [panelOne] = el.querySelectorAll(
      'bx-tab-panel',
    ) as unknown as BxTabPanel[];
    expect(el.active).to.equal('one');
    expect(one!.active).to.be.true;
    expect(panelOne!.active).to.be.true;
  });

  it('renders role=tablist on the nav element', async () => {
    const el = await fixtureGroup();
    expect(el.shadowRoot!.querySelector('.tabs')!.getAttribute('role')).to.equal(
      'tablist',
    );
  });

  it('show() activates the matching tab and panel and fires bx-tab-show/bx-tab-hide', async () => {
    const el = await fixtureGroup();
    const showPromise = oneEvent(el, 'bx-tab-show');
    const hidePromise = oneEvent(el, 'bx-tab-hide');
    el.show('two');
    const [showEvent, hideEvent] = await Promise.all([showPromise, hidePromise]);
    expect((showEvent as CustomEvent).detail.name).to.equal('two');
    expect((hideEvent as CustomEvent).detail.name).to.equal('one');

    const [, two] = el.querySelectorAll('bx-tab') as unknown as BxTab[];
    expect(two!.active).to.be.true;
  });

  it('clicking a tab activates it', async () => {
    const el = await fixtureGroup();
    const [, two] = el.querySelectorAll('bx-tab') as unknown as BxTab[];
    two!.click();
    await el.updateComplete;
    expect(el.active).to.equal('two');
  });

  it('roving tabindex: only the active tab is a tab stop', async () => {
    const el = await fixtureGroup();
    const [one, two] = el.querySelectorAll('bx-tab') as unknown as BxTab[];
    await one!.updateComplete;
    await two!.updateComplete;
    expect(one!.tabStop).to.be.true;
    expect(two!.tabStop).to.be.false;
  });

  it('ArrowRight moves focus to the next enabled tab and activates it (auto activation)', async () => {
    const el = await fixtureGroup();
    const [one, two] = el.querySelectorAll('bx-tab') as unknown as BxTab[];
    one!.focus();
    one!.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        composed: true,
      }),
    );
    await el.updateComplete;
    expect(el.active).to.equal('two');
    expect(two!.tabStop).to.be.true;
  });

  it('ArrowRight skips a disabled tab and wraps around', async () => {
    const el = await fixtureGroup();
    const [, two] = el.querySelectorAll('bx-tab') as unknown as BxTab[];
    two!.focus();
    two!.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        composed: true,
      }),
    );
    await el.updateComplete;
    expect(el.active).to.equal('one');
  });

  it('manual activation moves focus without activating until Enter/Space', async () => {
    const el = await fixture<BxTabGroup>(html`
      <bx-tab-group activation="manual">
        <bx-tab slot="nav" panel="one">One</bx-tab>
        <bx-tab slot="nav" panel="two">Two</bx-tab>
        <bx-tab-panel name="one">Panel one</bx-tab-panel>
        <bx-tab-panel name="two">Panel two</bx-tab-panel>
      </bx-tab-group>
    `);
    const [one, two] = el.querySelectorAll('bx-tab') as unknown as BxTab[];
    one!.focus();
    one!.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        composed: true,
      }),
    );
    await el.updateComplete;
    expect(el.active).to.equal('one');

    two!.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        composed: true,
      }),
    );
    await el.updateComplete;
    expect(el.active).to.equal('two');
  });

  it('placement=start flips the arrow-key axis to vertical', async () => {
    const el = await fixture<BxTabGroup>(html`
      <bx-tab-group placement="start">
        <bx-tab slot="nav" panel="one">One</bx-tab>
        <bx-tab slot="nav" panel="two">Two</bx-tab>
        <bx-tab-panel name="one">Panel one</bx-tab-panel>
        <bx-tab-panel name="two">Panel two</bx-tab-panel>
      </bx-tab-group>
    `);
    const [one] = el.querySelectorAll('bx-tab') as unknown as BxTab[];
    one!.focus();
    one!.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        composed: true,
      }),
    );
    await el.updateComplete;
    expect(el.active).to.equal('two');
    expect(
      el.shadowRoot!.querySelector('.tabs')!.getAttribute('aria-orientation'),
    ).to.equal('vertical');
  });

  it('has no axe violations', async () => {
    const el = await fixtureGroup();
    await expect(el).to.be.accessible();
  });
});
