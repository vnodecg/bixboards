import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxBadge } from './badge.ts';
import './index.ts';

describe('bx-badge', () => {
  it('registers the tag with neutral/medium/filled-outlined defaults', async () => {
    const el = await fixture<BxBadge>(html`<bx-badge>Beta</bx-badge>`);
    expect(el).to.be.instanceOf(customElements.get('bx-badge')!);
    expect(el.variant).to.equal('neutral');
    expect(el.size).to.equal('medium');
    expect(el.appearance).to.equal('filled outlined');
  });

  it('renders numeric content above `max` as `max+`', async () => {
    const el = await fixture<BxBadge>(html`<bx-badge max="99">150</bx-badge>`);
    await el.updateComplete;
    const overflow = el.shadowRoot!.querySelector('.content > span');
    expect(overflow?.textContent).to.equal('99+');
    const slot = el.shadowRoot!.querySelector(
      '.content > slot:not([name])',
    ) as HTMLSlotElement;
    expect(slot.hidden).to.be.true;
  });

  it('leaves non-overflowing numeric content untouched', async () => {
    const el = await fixture<BxBadge>(html`<bx-badge max="99">42</bx-badge>`);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.content > span')).to.be.null;
  });

  it('emits a cancelable bx-remove and removes itself when not cancelled', async () => {
    const el = await fixture<BxBadge>(
      html`<bx-badge with-remove>Item</bx-badge>`,
    );
    const button = el.shadowRoot!.querySelector(
      '.remove-button',
    ) as HTMLButtonElement;
    expect(button).to.exist;

    const removePromise = oneEvent(el, 'bx-remove');
    button.click();
    const event = await removePromise;
    expect(event.cancelable).to.be.true;
    expect(el.isConnected).to.be.false;
  });

  it('keeps the badge when bx-remove is cancelled', async () => {
    const el = await fixture<BxBadge>(
      html`<bx-badge with-remove>Item</bx-badge>`,
    );
    el.addEventListener('bx-remove', (e) => e.preventDefault());
    const button = el.shadowRoot!.querySelector(
      '.remove-button',
    ) as HTMLButtonElement;
    button.click();
    await el.updateComplete;
    expect(el.isConnected).to.be.true;
  });

  it('requests removal on Backspace/Delete when focused and with-remove', async () => {
    const el = await fixture<BxBadge>(
      html`<bx-badge with-remove>Item</bx-badge>`,
    );
    expect(el.tabIndex).to.equal(0);
    const removePromise = oneEvent(el, 'bx-remove');
    const base = el.shadowRoot!.querySelector('.base') as HTMLElement;
    base.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }),
    );
    await removePromise;
  });

  it('sets role=status only when live', async () => {
    const el = await fixture<BxBadge>(html`<bx-badge>Beta</bx-badge>`);
    expect(el.shadowRoot!.querySelector('.base')!.getAttribute('role')).to.be
      .null;

    const live = await fixture<BxBadge>(html`<bx-badge live>3</bx-badge>`);
    expect(
      live.shadowRoot!.querySelector('.base')!.getAttribute('role'),
    ).to.equal('status');
  });

  it('has no axe violations, plain and removable', async () => {
    const el = await fixture<BxBadge>(html`<bx-badge>Beta</bx-badge>`);
    await expect(el).to.be.accessible();

    const chip = await fixture<BxBadge>(
      html`<bx-badge with-remove>Item</bx-badge>`,
    );
    await expect(chip).to.be.accessible();
  });
});
