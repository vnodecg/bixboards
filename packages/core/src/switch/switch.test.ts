import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxSwitch } from './switch.ts';
import './index.ts';

describe('bx-switch', () => {
  it('registers the tag off by default', async () => {
    const el = await fixture<BxSwitch>(html`<bx-switch>Label</bx-switch>`);
    expect(el).to.be.instanceOf(customElements.get('bx-switch')!);
    expect(el.checked).to.be.false;
    expect(el.value).to.equal('on');
  });

  it('renders role=switch with aria-checked reflecting state', async () => {
    const el = await fixture<BxSwitch>(html`<bx-switch>Label</bx-switch>`);
    const control = el.shadowRoot!.querySelector('.control')!;
    expect(control.getAttribute('role')).to.equal('switch');
    expect(control.getAttribute('aria-checked')).to.equal('false');

    el.checked = true;
    await el.updateComplete;
    expect(control.getAttribute('aria-checked')).to.equal('true');
  });

  it('toggles on click and fires input/change', async () => {
    const el = await fixture<BxSwitch>(html`<bx-switch>Label</bx-switch>`);
    const inputPromise = oneEvent(el, 'input');
    const changePromise = oneEvent(el, 'change');
    el.click();
    await inputPromise;
    await changePromise;
    expect(el.checked).to.be.true;
  });

  it('toggles on Space/Enter keydown', async () => {
    const el = await fixture<BxSwitch>(html`<bx-switch>Label</bx-switch>`);
    const control = el.shadowRoot!.querySelector('.control')!;
    control.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    await el.updateComplete;
    expect(el.checked).to.be.true;
  });

  it('does not toggle when disabled', async () => {
    const el = await fixture<BxSwitch>(
      html`<bx-switch disabled>Label</bx-switch>`,
    );
    el.click();
    await el.updateComplete;
    expect(el.checked).to.be.false;
  });

  it('participates in a form and resets', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <bx-switch name="notifications" value="yes">Notify me</bx-switch>
      </form>
    `);
    const switchEl = form.querySelector('bx-switch') as BxSwitch;
    switchEl.click();
    await switchEl.updateComplete;

    const data = new FormData(form);
    expect(data.get('notifications')).to.equal('yes');

    form.reset();
    await switchEl.updateComplete;
    expect(switchEl.checked).to.be.false;
  });

  it('reports required as invalid until checked', async () => {
    const el = await fixture<BxSwitch>(
      html`<bx-switch required>Enable</bx-switch>`,
    );
    expect(el.checkValidity()).to.be.false;
    el.click();
    await el.updateComplete;
    expect(el.checkValidity()).to.be.true;
  });

  it('has no axe violations, off and on', async () => {
    const el = await fixture<BxSwitch>(html`<bx-switch>Label</bx-switch>`);
    await expect(el).to.be.accessible();

    el.checked = true;
    await el.updateComplete;
    await expect(el).to.be.accessible();
  });
});
