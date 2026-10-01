import { sendKeys } from '@web/test-runner-commands';
import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxNumberInput } from './number-input.ts';
import './index.ts';

describe('bx-number-input', () => {
  it('registers the tag and wraps a native text input', async () => {
    const el = await fixture<BxNumberInput>(
      html`<bx-number-input></bx-number-input>`,
    );
    expect(el).to.be.instanceOf(customElements.get('bx-number-input')!);
    const input = el.shadowRoot!.querySelector('input')!;
    expect(input.getAttribute('type')).to.equal('text');
    expect(input.getAttribute('role')).to.equal('spinbutton');
  });

  it('stepUp/stepDown adjust value and clamp to min/max', async () => {
    const el = await fixture<BxNumberInput>(
      html`<bx-number-input
        value="5"
        min="0"
        max="6"
        step="1"
      ></bx-number-input>`,
    );
    el.stepUp();
    expect(el.value).to.equal('6');
    el.stepUp();
    expect(el.value).to.equal('6'); // clamped

    el.stepDown();
    el.stepDown();
    el.stepDown();
    el.stepDown();
    el.stepDown();
    el.stepDown();
    el.stepDown();
    expect(el.value).to.equal('0'); // clamped
  });

  it('steps in floating-point-safe increments (FR-NUMBER-INPUT-06)', async () => {
    const el = await fixture<BxNumberInput>(
      html`<bx-number-input value="0.1" step="0.2"></bx-number-input>`,
    );
    el.stepUp();
    expect(el.value).to.equal('0.3');
  });

  it('ArrowUp/ArrowDown on the input step the value', async () => {
    const el = await fixture<BxNumberInput>(
      html`<bx-number-input value="1" step="1"></bx-number-input>`,
    );
    const input = el.shadowRoot!.querySelector('input')!;
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
    );
    expect(el.value).to.equal('2');
  });

  it('PageUp steps by step * 10', async () => {
    const el = await fixture<BxNumberInput>(
      html`<bx-number-input value="0" step="1"></bx-number-input>`,
    );
    const input = el.shadowRoot!.querySelector('input')!;
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true }),
    );
    expect(el.value).to.equal('10');
  });

  it('shows the Intl.NumberFormat-formatted display when not focused', async () => {
    const el = await fixture<BxNumberInput>(
      html`<bx-number-input
        value="1234.5"
        locale="en-US"
        .format=${{ style: 'currency', currency: 'USD' }}
      ></bx-number-input>`,
    );
    const input = el.shadowRoot!.querySelector('input')!;
    expect(input.value).to.equal('$1,234.50');
  });

  it('shows the raw editable value while focused', async () => {
    const el = await fixture<BxNumberInput>(
      html`<bx-number-input
        value="1234.5"
        locale="en-US"
        .format=${{ style: 'currency', currency: 'USD' }}
      ></bx-number-input>`,
    );
    const input = el.shadowRoot!.querySelector('input')!;
    input.dispatchEvent(new Event('focus'));
    await el.updateComplete;
    expect(input.value).to.equal('1234.5');
  });

  it('parses locale-formatted input on blur and clamps/commits', async () => {
    const el = await fixture<BxNumberInput>(
      html`<bx-number-input min="0" max="100"></bx-number-input>`,
    );
    const input = el.shadowRoot!.querySelector('input')!;
    input.dispatchEvent(new Event('focus'));
    input.value = '150';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const changePromise = oneEvent(el, 'change');
    input.dispatchEvent(new Event('blur'));
    await changePromise;
    expect(el.value).to.equal('100');
  });

  it('participates in form submission and resets to the default value', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><bx-number-input name="qty" value="3"></bx-number-input></form>
    `);
    const el = form.querySelector('bx-number-input') as BxNumberInput;
    el.stepUp();
    await el.updateComplete;
    expect(new FormData(form).get('qty')).to.equal('4');

    form.reset();
    await el.updateComplete;
    expect(el.value).to.equal('3');
  });

  it('is invalid when required and empty', async () => {
    const el = await fixture<BxNumberInput>(
      html`<bx-number-input required></bx-number-input>`,
    );
    expect(el.checkValidity()).to.be.false;
    el.stepUp();
    await el.updateComplete;
    expect(el.checkValidity()).to.be.true;
  });

  it('hides steppers when without-steppers is set', async () => {
    const el = await fixture<BxNumberInput>(
      html`<bx-number-input without-steppers></bx-number-input>`,
    );
    expect(el.shadowRoot!.querySelector('.steppers')).to.not.exist;
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxNumberInput>(
      html`<bx-number-input label="Quantity" value="1"></bx-number-input>`,
    );
    await expect(el).to.be.accessible();
  });

  it('fires exactly one input event per keystroke (not the native composed one as well)', async () => {
    const el = await fixture<HTMLElement>(html`<bx-number-input></bx-number-input>`);
    let inputs = 0;
    el.addEventListener('input', () => inputs++);
    el.focus();
    await sendKeys({ type: '7' });
    expect(inputs).to.equal(1);
  });
});
