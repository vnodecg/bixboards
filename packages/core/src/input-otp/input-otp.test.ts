import { expect, fixture, html } from '@open-wc/testing';
import type { BxInputOtp } from './input-otp.ts';
import './index.ts';

const type = async (el: BxInputOtp, text: string) => {
  const input = el.shadowRoot!.querySelector('input')!;
  input.focus();
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  await el.updateComplete;
};

describe('bx-input-otp', () => {
  it('renders one cell per character and a single real one-time-code input', async () => {
    const el = await fixture<BxInputOtp>(
      html`<bx-input-otp length="4" label="Code"></bx-input-otp>`,
    );
    expect(el.shadowRoot!.querySelectorAll('.cell')).to.have.length(4);
    const input = el.shadowRoot!.querySelector('input')!;
    expect(input.getAttribute('autocomplete')).to.equal('one-time-code');
    expect(input.getAttribute('inputmode')).to.equal('numeric');
  });

  it('strips disallowed characters, truncates paste and fires bx-complete', async () => {
    const el = await fixture<BxInputOtp>(
      html`<bx-input-otp length="4"></bx-input-otp>`,
    );
    let completed = '';
    el.addEventListener(
      'bx-complete',
      (e) => (completed = (e as CustomEvent).detail.value),
    );
    await type(el, '12 a3-4567');
    expect(el.value).to.equal('1234');
    expect(completed).to.equal('1234');
    const cells = [...el.shadowRoot!.querySelectorAll('.cell')].map((c) =>
      c.textContent!.trim(),
    );
    expect(cells).to.deep.equal(['1', '2', '3', '4']);
  });

  it('allows letters for alphanumeric and masks characters', async () => {
    const el = await fixture<BxInputOtp>(
      html`<bx-input-otp length="3" type="alphanumeric" mask></bx-input-otp>`,
    );
    await type(el, 'a1!');
    expect(el.value).to.equal('a1');
    expect(el.shadowRoot!.querySelector('.cell')!.textContent!.trim()).to.equal(
      '•',
    );
  });

  it('groups cells with separators and keeps LTR order', async () => {
    const el = await fixture<BxInputOtp>(
      html`<bx-input-otp length="6" group-size="3"></bx-input-otp>`,
    );
    expect(el.shadowRoot!.querySelectorAll('.group')).to.have.length(2);
    expect(el.shadowRoot!.querySelectorAll('.separator')).to.have.length(1);
    expect(
      el.shadowRoot!.querySelector('.cells')!.getAttribute('dir'),
    ).to.equal('ltr');
  });

  it('participates in forms; required needs every cell filled; reset restores', async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form>
        <bx-input-otp name="otp" length="4" required value="12"></bx-input-otp>
      </form>`,
    );
    const el = form.querySelector('bx-input-otp') as BxInputOtp;
    await el.updateComplete;
    expect(el.checkValidity()).to.be.false;
    await type(el, '1234');
    expect(el.checkValidity()).to.be.true;
    expect(new FormData(form).get('otp')).to.equal('1234');
    form.reset();
    await el.updateComplete;
    expect(el.value).to.equal('12');
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxInputOtp>(
      html`<bx-input-otp label="Verification code"></bx-input-otp>`,
    );
    await expect(el).to.be.accessible();
  });
});
