import { expect, fixture, html, oneEvent, aTimeout } from '@open-wc/testing';
import type { BxTooltip } from './tooltip.ts';
import './index.ts';

describe('bx-tooltip', () => {
  it('registers the tag and renders an inner bx-popup', async () => {
    const el = await fixture<BxTooltip>(html`
      <bx-tooltip for="trigger">Help text</bx-tooltip>
      <button id="trigger">Hover</button>
    `);
    expect(el).to.be.instanceOf(customElements.get('bx-tooltip')!);
    expect(el.shadowRoot!.querySelector('bx-popup')).to.exist;
  });

  it('show()/hide() toggle open and fire bx-show/bx-after-show/bx-hide/bx-after-hide', async () => {
    const el = await fixture<BxTooltip>(html`<bx-tooltip trigger="manual">Help</bx-tooltip>`);
    const showPromise = oneEvent(el, 'bx-show');
    el.show();
    await showPromise;
    expect(el.open).to.be.true;

    const hidePromise = oneEvent(el, 'bx-hide');
    el.hide();
    await hidePromise;
    expect(el.open).to.be.false;
  });

  it('bx-show is cancelable', async () => {
    const el = await fixture<BxTooltip>(html`<bx-tooltip trigger="manual">Help</bx-tooltip>`);
    el.addEventListener('bx-show', (event) => event.preventDefault());
    el.show();
    expect(el.open).to.be.false;
  });

  it('does not show when disabled', async () => {
    const el = await fixture<BxTooltip>(
      html`<bx-tooltip trigger="manual" disabled>Help</bx-tooltip>`,
    );
    el.show();
    expect(el.open).to.be.false;
  });

  it('click trigger toggles open on click', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <bx-tooltip for="trigger" trigger="click">Help</bx-tooltip>
        <button id="trigger">Click</button>
      </div>
    `);
    const el = wrapper.querySelector('bx-tooltip') as BxTooltip;
    const button = wrapper.querySelector('#trigger') as HTMLButtonElement;
    button.click();
    expect(el.open).to.be.true;
    button.click();
    expect(el.open).to.be.false;
  });

  it('hover trigger shows after show-delay and hides after hide-delay', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <bx-tooltip for="trigger" show-delay="10" hide-delay="10">Help</bx-tooltip>
        <button id="trigger">Hover</button>
      </div>
    `);
    const el = wrapper.querySelector('bx-tooltip') as BxTooltip;
    const button = wrapper.querySelector('#trigger') as HTMLButtonElement;

    button.dispatchEvent(new MouseEvent('mouseenter'));
    expect(el.open).to.be.false;
    await aTimeout(30);
    expect(el.open).to.be.true;

    button.dispatchEvent(new MouseEvent('mouseleave'));
    await aTimeout(30);
    expect(el.open).to.be.false;
  });

  it('Escape dismisses an open tooltip', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <bx-tooltip for="trigger" trigger="manual">Help</bx-tooltip>
        <button id="trigger">Anchor</button>
      </div>
    `);
    const el = wrapper.querySelector('bx-tooltip') as BxTooltip;
    const button = wrapper.querySelector('#trigger') as HTMLButtonElement;
    el.show();
    expect(el.open).to.be.true;
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(el.open).to.be.false;
  });

  it('sets role=tooltip on the popup', async () => {
    const el = await fixture<BxTooltip>(html`<bx-tooltip trigger="manual">Help</bx-tooltip>`);
    expect(el.shadowRoot!.querySelector('bx-popup')!.getAttribute('role')).to.equal('tooltip');
  });
});
