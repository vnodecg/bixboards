import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxRadioGroup } from './radio-group.ts';
import type { BxRadio } from '../radio/radio.ts';
import './index.ts';

describe('bx-radio-group', () => {
  it('cascades name to slotted radios and reads the checked value', async () => {
    const el = await fixture<BxRadioGroup>(html`
      <bx-radio-group name="plan">
        <bx-radio value="free" checked>Free</bx-radio>
        <bx-radio value="pro">Pro</bx-radio>
      </bx-radio-group>
    `);
    const [free, pro] = [...el.querySelectorAll('bx-radio')] as BxRadio[];
    expect(free!.name).to.equal('plan');
    expect(pro!.name).to.equal('plan');
    expect(el.value).to.equal('free');
  });

  it('renders role=radiogroup', async () => {
    const el = await fixture<BxRadioGroup>(html`
      <bx-radio-group name="plan"><bx-radio value="a">A</bx-radio></bx-radio-group>
    `);
    const group = el.shadowRoot!.querySelector('.radio-group')!;
    expect(group.getAttribute('role')).to.equal('radiogroup');
  });

  it('updates value and fires input/change when a member is selected', async () => {
    const el = await fixture<BxRadioGroup>(html`
      <bx-radio-group name="plan">
        <bx-radio value="free">Free</bx-radio>
        <bx-radio value="pro">Pro</bx-radio>
      </bx-radio-group>
    `);
    const pro = el.querySelectorAll('bx-radio')[1] as BxRadio;
    const inputPromise = oneEvent(el, 'input');
    pro.click();
    await inputPromise;
    expect(el.value).to.equal('pro');
  });

  it('only the group submits a form value, not each radio', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <bx-radio-group name="plan">
          <bx-radio value="free" checked>Free</bx-radio>
          <bx-radio value="pro">Pro</bx-radio>
        </bx-radio-group>
      </form>
    `);
    const data = new FormData(form);
    expect(data.getAll('plan')).to.deep.equal(['free']);
  });

  it('cascades disabled to members', async () => {
    const el = await fixture<BxRadioGroup>(html`
      <bx-radio-group name="plan" disabled>
        <bx-radio value="a">A</bx-radio>
      </bx-radio-group>
    `);
    const radio = el.querySelector('bx-radio') as BxRadio;
    expect(radio.disabled).to.be.true;
  });

  it('Home/End move focus and selection to the first/last enabled member', async () => {
    const el = await fixture<BxRadioGroup>(html`
      <bx-radio-group name="plan">
        <bx-radio value="a">A</bx-radio>
        <bx-radio value="b">B</bx-radio>
        <bx-radio value="c" checked>C</bx-radio>
      </bx-radio-group>
    `);
    const [a, , c] = [...el.querySelectorAll('bx-radio')] as BxRadio[];
    c!.focus();
    c!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true, composed: true }),
    );
    await a!.updateComplete;
    expect(a!.checked).to.be.true;
  });

  it('is required-invalid with no value and valid once one is set', async () => {
    const el = await fixture<BxRadioGroup>(html`
      <bx-radio-group name="plan" required>
        <bx-radio value="a">A</bx-radio>
      </bx-radio-group>
    `);
    expect(el.checkValidity()).to.be.false;
    (el.querySelector('bx-radio') as BxRadio).click();
    await el.updateComplete;
    expect(el.checkValidity()).to.be.true;
  });

  it('formResetCallback clears value and unchecks members', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <bx-radio-group name="plan">
          <bx-radio value="free" checked>Free</bx-radio>
          <bx-radio value="pro">Pro</bx-radio>
        </bx-radio-group>
      </form>
    `);
    const group = form.querySelector('bx-radio-group') as BxRadioGroup;
    form.reset();
    await group.updateComplete;
    expect(group.value).to.equal('');
    expect((group.querySelector('bx-radio') as BxRadio).checked).to.be.false;
  });

  it('focus() focuses the checked member', async () => {
    const el = await fixture<BxRadioGroup>(html`
      <bx-radio-group name="plan">
        <bx-radio value="a">A</bx-radio>
        <bx-radio value="b" checked>B</bx-radio>
      </bx-radio-group>
    `);
    el.focus();
    const b = el.querySelectorAll('bx-radio')[1] as BxRadio;
    expect(el.shadowRoot!.activeElement ?? document.activeElement).to.exist;
    expect(b.matches(':focus-within') || document.activeElement === b).to.be
      .true;
  });
});
