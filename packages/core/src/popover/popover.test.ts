import { aTimeout, expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxPopover } from './popover.ts';
import './index.ts';
import '../button/index.ts';

async function setup(open = false) {
  const wrapper = await fixture<HTMLDivElement>(html`
    <div>
      <button id="trigger">Open</button>
      <bx-popover for="trigger" label="Details" ?open=${open}>
        <button id="inside">Inside</button>
      </bx-popover>
      <button id="outside">Outside</button>
    </div>
  `);
  const el = wrapper.querySelector('bx-popover') as BxPopover;
  await el.updateComplete;
  return {
    el,
    trigger: wrapper.querySelector('#trigger') as HTMLButtonElement,
    inside: wrapper.querySelector('#inside') as HTMLButtonElement,
    outside: wrapper.querySelector('#outside') as HTMLButtonElement,
  };
}

describe('bx-popover', () => {
  it('registers the tag and renders a labelled non-modal dialog popup', async () => {
    const { el } = await setup();
    expect(el).to.be.instanceOf(customElements.get('bx-popover')!);
    const popup = el.shadowRoot!.querySelector('bx-popup')!;
    expect(popup.getAttribute('role')).to.equal('dialog');
    expect(popup.getAttribute('aria-label')).to.equal('Details');
  });

  it('show()/hide() toggle open and fire the four lifecycle events', async () => {
    const { el } = await setup();
    const events: string[] = [];
    for (const name of ['bx-show', 'bx-after-show', 'bx-hide', 'bx-after-hide'])
      el.addEventListener(name, () => events.push(name));

    el.show();
    await el.updateComplete;
    expect(el.open).to.be.true;
    el.hide();
    await el.updateComplete;
    expect(el.open).to.be.false;
    expect(events).to.deep.equal([
      'bx-show',
      'bx-after-show',
      'bx-hide',
      'bx-after-hide',
    ]);
  });

  it('bx-show is cancelable', async () => {
    const { el } = await setup();
    el.addEventListener('bx-show', (event) => event.preventDefault());
    el.show();
    await el.updateComplete;
    expect(el.open).to.be.false;
  });

  it('bx-hide is cancelable and reports its source', async () => {
    const { el } = await setup(true);
    const source = oneEvent(el, 'bx-hide');
    el.addEventListener('bx-hide', (event) => event.preventDefault());
    el.hide('keyboard');
    expect(((await source) as CustomEvent).detail.source).to.equal('keyboard');
    expect(el.open).to.be.true;
  });

  it('clicking the anchor toggles it and keeps aria-expanded in sync', async () => {
    const { el, trigger } = await setup();
    expect(trigger.getAttribute('aria-haspopup')).to.equal('dialog');
    expect(trigger.getAttribute('aria-expanded')).to.equal('false');
    trigger.click();
    await el.updateComplete;
    expect(el.open).to.be.true;
    expect(trigger.getAttribute('aria-expanded')).to.equal('true');
    trigger.click();
    await el.updateComplete;
    expect(el.open).to.be.false;
    expect(trigger.getAttribute('aria-expanded')).to.equal('false');
  });

  it('moves focus in on open when the content is interactive', async () => {
    const { el, inside } = await setup();
    el.show();
    await el.updateComplete;
    expect(document.activeElement).to.equal(inside);
  });

  it('does not steal focus when there is nothing interactive inside', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <button id="trigger">Open</button>
        <bx-popover for="trigger">Just text</bx-popover>
      </div>
    `);
    const el = wrapper.querySelector('bx-popover') as BxPopover;
    const trigger = wrapper.querySelector('#trigger') as HTMLButtonElement;
    trigger.focus();
    el.show();
    await el.updateComplete;
    expect(document.activeElement).to.equal(trigger);
  });

  it('Escape closes it and returns focus to the anchor', async () => {
    const { el, trigger, inside } = await setup();
    el.show();
    await el.updateComplete;
    expect(document.activeElement).to.equal(inside);
    inside.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await el.updateComplete;
    expect(el.open).to.be.false;
    expect(document.activeElement).to.equal(trigger);
  });

  it('light-dismisses on an outside pointerdown but not an inside one', async () => {
    const { el, inside, outside } = await setup();
    el.show();
    await el.updateComplete;
    inside.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, composed: true }),
    );
    expect(el.open).to.be.true;
    outside.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, composed: true }),
    );
    await el.updateComplete;
    expect(el.open).to.be.false;
  });

  it('works with a slotted bx-button anchor', async () => {
    const el = await fixture<BxPopover>(html`
      <bx-popover>
        <bx-button slot="anchor">Open</bx-button>
        Content
      </bx-popover>
    `);
    el.querySelector<HTMLElement>('bx-button')!.click();
    await el.updateComplete;
    expect(el.open).to.be.true;
  });

  it('focus-in skips a slotted anchor and lands on the content', async () => {
    const el = await fixture<BxPopover>(html`
      <bx-popover>
        <bx-button slot="anchor">Open</bx-button>
        <bx-button id="content-button">Content</bx-button>
      </bx-popover>
    `);
    el.show();
    await el.updateComplete;
    expect(document.activeElement).to.equal(
      el.querySelector('#content-button'),
    );
  });

  it('resolves `for` when the anchor is declared after the popover', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <bx-popover for="late">Content</bx-popover>
        <button id="late">Anchor</button>
      </div>
    `);
    const el = wrapper.querySelector('bx-popover') as BxPopover;
    await aTimeout(0);
    (wrapper.querySelector('#late') as HTMLButtonElement).click();
    await el.updateComplete;
    expect(el.open).to.be.true;
  });

  it('removes its anchor wiring when disconnected', async () => {
    const { el, trigger } = await setup(true);
    el.remove();
    expect(trigger.hasAttribute('aria-expanded')).to.be.false;
    expect(trigger.hasAttribute('aria-haspopup')).to.be.false;
  });

  it('is accessible while open', async () => {
    const { el } = await setup(true);
    await expect(el).to.be.accessible();
  });

  it('scales to many instances', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        ${Array.from(
          { length: 200 },
          (_, i) => html`
            <button id=${`t${i}`}>a</button>
            <bx-popover for=${`t${i}`}>Content ${i}</bx-popover>
          `,
        )}
      </div>
    `);
    const popovers = wrapper.querySelectorAll('bx-popover');
    expect(popovers.length).to.equal(200);
    (wrapper.querySelector('#t199') as HTMLButtonElement).click();
    await (popovers[199] as BxPopover).updateComplete;
    expect([...popovers].filter((p) => (p as BxPopover).open).length).to.equal(
      1,
    );
  });
});
