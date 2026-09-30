import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxDrawer } from './drawer.ts';
import './index.ts';

const dialogOf = (el: BxDrawer) => el.shadowRoot!.querySelector('dialog')!;
const settled = async (el: BxDrawer) => {
  await el.updateComplete;
  await Promise.all(
    dialogOf(el)
      .getAnimations()
      .map((a) => a.finished),
  );
};

describe('bx-drawer', () => {
  it('registers the tag and renders a native dialog with defaults', async () => {
    const el = await fixture<BxDrawer>(
      html`<bx-drawer label="Settings">Body</bx-drawer>`,
    );
    expect(el).to.be.instanceOf(customElements.get('bx-drawer')!);
    expect(el.placement).to.equal('end');
    expect(el.lightDismiss).to.be.true;
    expect(dialogOf(el).open).to.be.false;
  });

  it('show() opens it modally and fires bx-after-show', async () => {
    const el = await fixture<BxDrawer>(
      html`<bx-drawer label="Settings">Body</bx-drawer>`,
    );
    const shown = oneEvent(el, 'bx-after-show');
    el.show();
    await shown;
    expect(dialogOf(el).open).to.be.true;
    expect(dialogOf(el).matches(':modal')).to.be.true;
  });

  it('bx-show is cancelable', async () => {
    const el = await fixture<BxDrawer>(html`<bx-drawer>Body</bx-drawer>`);
    el.addEventListener('bx-show', (event) => event.preventDefault());
    el.show();
    await el.updateComplete;
    expect(el.open).to.be.false;
    expect(dialogOf(el).open).to.be.false;
  });

  it('bx-hide is cancelable and reports the source', async () => {
    const el = await fixture<BxDrawer>(html`<bx-drawer open>Body</bx-drawer>`);
    const hide = oneEvent(el, 'bx-hide');
    el.addEventListener('bx-hide', (event) => event.preventDefault());
    el.hide();
    expect(((await hide) as CustomEvent).detail.source).to.equal('method');
    expect(el.open).to.be.true;
  });

  it('the close button hides with source "close-button"', async () => {
    const el = await fixture<BxDrawer>(
      html`<bx-drawer open label="Settings">Body</bx-drawer>`,
    );
    const hide = oneEvent(el, 'bx-hide');
    el.shadowRoot!.querySelector<HTMLElement>('[data-drawer="close"]')!.click();
    expect(((await hide) as CustomEvent).detail.source).to.equal(
      'close-button',
    );
    await el.updateComplete;
    expect(el.open).to.be.false;
  });

  it('the close control is a bx-button', async () => {
    const el = await fixture<BxDrawer>(
      html`<bx-drawer open label="Settings">Body</bx-drawer>`,
    );
    expect(el.shadowRoot!.querySelector('bx-button[part="close-button"]')).to
      .exist;
  });

  it('Escape (native cancel) routes through bx-hide with source "keyboard"', async () => {
    const el = await fixture<BxDrawer>(html`<bx-drawer open>Body</bx-drawer>`);
    const hide = oneEvent(el, 'bx-hide');
    dialogOf(el).dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(((await hide) as CustomEvent).detail.source).to.equal('keyboard');
  });

  it('a click on the dialog itself light-dismisses; light-dismiss=false ignores it', async () => {
    const el = await fixture<BxDrawer>(html`<bx-drawer open>Body</bx-drawer>`);
    dialogOf(el).click();
    await el.updateComplete;
    expect(el.open).to.be.false;

    el.lightDismiss = false;
    el.open = true;
    await el.updateComplete;
    dialogOf(el).click();
    await el.updateComplete;
    expect(el.open).to.be.true;
  });

  it('omits the header with without-header', async () => {
    const el = await fixture<BxDrawer>(
      html`<bx-drawer open without-header label="x">Body</bx-drawer>`,
    );
    expect(el.shadowRoot!.querySelector('.header')).to.not.exist;
  });

  it('anchors to the inline-end edge by default and the start edge for placement="start"', async () => {
    const el = await fixture<BxDrawer>(html`<bx-drawer open>Body</bx-drawer>`);
    await settled(el);
    let rect = dialogOf(el).getBoundingClientRect();
    expect(Math.round(rect.right)).to.equal(
      document.documentElement.clientWidth,
    );

    el.placement = 'start';
    await settled(el);
    rect = dialogOf(el).getBoundingClientRect();
    expect(Math.round(rect.left)).to.equal(0);
  });

  it('mirrors start/end placements in RTL', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div dir="rtl"><bx-drawer open>Body</bx-drawer></div>
    `);
    const el = wrapper.querySelector('bx-drawer') as BxDrawer;
    await settled(el);
    expect(Math.round(dialogOf(el).getBoundingClientRect().left)).to.equal(0);
  });

  it('bottom placement spans the full inline size', async () => {
    const el = await fixture<BxDrawer>(
      html`<bx-drawer open placement="bottom">Body</bx-drawer>`,
    );
    await settled(el);
    const rect = dialogOf(el).getBoundingClientRect();
    expect(Math.round(rect.width)).to.equal(
      document.documentElement.clientWidth,
    );
    expect(Math.round(rect.bottom)).to.equal(window.innerHeight);
  });

  describe('contained', () => {
    async function contained() {
      const wrapper = await fixture<HTMLDivElement>(html`
        <div style="position: relative; width: 500px; height: 300px">
          <bx-drawer contained label="Panel"
            ><button id="in">In</button></bx-drawer
          >
        </div>
      `);
      return { wrapper, el: wrapper.querySelector('bx-drawer') as BxDrawer };
    }

    it('opens non-modally and renders an overlay', async () => {
      const { el } = await contained();
      el.show();
      await el.updateComplete;
      expect(dialogOf(el).open).to.be.true;
      expect(dialogOf(el).matches(':modal')).to.be.false;
      expect(el.shadowRoot!.querySelector('[part="overlay"]')).to.exist;
    });

    it('is sized to its parent, not the viewport', async () => {
      const { wrapper, el } = await contained();
      el.show();
      await settled(el);
      const parent = wrapper.getBoundingClientRect();
      const rect = dialogOf(el).getBoundingClientRect();
      expect(Math.round(rect.right)).to.equal(Math.round(parent.right));
      expect(Math.round(rect.height)).to.equal(Math.round(parent.height));
    });

    it('closes on Escape and on overlay click', async () => {
      const { el } = await contained();
      el.show();
      await el.updateComplete;
      dialogOf(el).dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
      await el.updateComplete;
      expect(el.open).to.be.false;

      el.show();
      await el.updateComplete;
      el.shadowRoot!.querySelector<HTMLElement>('[part="overlay"]')!.click();
      await el.updateComplete;
      expect(el.open).to.be.false;
    });
  });

  it('is accessible open (modal) and contained', async () => {
    const el = await fixture<BxDrawer>(
      html`<bx-drawer open label="Settings">Body</bx-drawer>`,
    );
    await expect(el).to.be.accessible();

    const wrapper = await fixture<HTMLDivElement>(html`
      <div style="position: relative; height: 300px">
        <bx-drawer contained open label="Panel">Body</bx-drawer>
      </div>
    `);
    await expect(wrapper).to.be.accessible();
  });
});
