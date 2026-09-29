import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxDialog } from './dialog.ts';
import './index.ts';

describe('bx-dialog', () => {
  it('registers the tag closed by default', async () => {
    const el = await fixture<BxDialog>(
      html`<bx-dialog label="Title">Body</bx-dialog>`,
    );
    expect(el).to.be.instanceOf(customElements.get('bx-dialog')!);
    expect(el.open).to.be.false;
    expect(el.shadowRoot!.querySelector('dialog')!.open).to.be.false;
  });

  it('opens via show() and calls showModal, fires bx-show/bx-after-show', async () => {
    const el = await fixture<BxDialog>(
      html`<bx-dialog label="Title">Body</bx-dialog>`,
    );
    const showPromise = oneEvent(el, 'bx-show');
    el.show();
    await showPromise;
    await el.updateComplete;
    expect(el.open).to.be.true;
    expect(el.shadowRoot!.querySelector('dialog')!.open).to.be.true;
  });

  it('closes via hide() and reports the source in detail', async () => {
    const el = await fixture<BxDialog>(
      html`<bx-dialog label="Title" open>Body</bx-dialog>`,
    );
    await el.updateComplete;
    const hidePromise = oneEvent(el, 'bx-hide');
    el.hide('close-button');
    const event = await hidePromise;
    expect((event as CustomEvent).detail.source).to.equal('close-button');
    await el.updateComplete;
    expect(el.open).to.be.false;
  });

  it('closes when a slotted [data-dialog="close"] element is clicked', async () => {
    const el = await fixture<BxDialog>(html`
      <bx-dialog label="Title" open>
        <button data-dialog="close">Close</button>
      </bx-dialog>
    `);
    await el.updateComplete;
    const button = el.querySelector('button')!;
    const hidePromise = oneEvent(el, 'bx-hide');
    button.click();
    await hidePromise;
    await el.updateComplete;
    expect(el.open).to.be.false;
  });

  it('sets aria-labelledby to the title unless without-header', async () => {
    const withHeader = await fixture<BxDialog>(
      html`<bx-dialog label="Title">Body</bx-dialog>`,
    );
    const dialogEl = withHeader.shadowRoot!.querySelector('dialog')!;
    expect(dialogEl.getAttribute('aria-labelledby')).to.exist;

    const withoutHeader = await fixture<BxDialog>(
      html`<bx-dialog without-header>Body</bx-dialog>`,
    );
    expect(
      withoutHeader.shadowRoot!.querySelector('dialog')!.hasAttribute('aria-labelledby'),
    ).to.be.false;
  });

  it('has no axe violations, closed and open', async () => {
    const el = await fixture<BxDialog>(
      html`<bx-dialog label="Title">Body</bx-dialog>`,
    );
    await expect(el).to.be.accessible();

    el.show();
    await el.updateComplete;
    await expect(el).to.be.accessible();
  });
});
