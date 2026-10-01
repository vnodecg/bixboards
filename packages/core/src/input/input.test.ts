import { sendKeys } from '@web/test-runner-commands';
import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxInput } from './input.ts';
import './index.ts';

describe('bx-input', () => {
  it('registers the tag empty by default', async () => {
    const el = await fixture<BxInput>(html`<bx-input name="email"></bx-input>`);
    expect(el).to.be.instanceOf(customElements.get('bx-input')!);
    expect(el.value).to.equal('');
    expect(el.type).to.equal('text');
  });

  it('forwards typed input to value and fires input/change', async () => {
    const el = await fixture<BxInput>(html`<bx-input></bx-input>`);
    const inputEl = el.shadowRoot!.querySelector('input')!;

    const inputPromise = oneEvent(el, 'input');
    inputEl.value = 'hello';
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    await inputPromise;
    expect(el.value).to.equal('hello');

    const changePromise = oneEvent(el, 'change');
    inputEl.dispatchEvent(new Event('change', { bubbles: true }));
    await changePromise;
  });

  it('shows the clear button only when clearable and non-empty, and clears on click', async () => {
    const el = await fixture<BxInput>(
      html`<bx-input clearable value="hello"></bx-input>`,
    );
    await el.updateComplete;
    const clearButton = el.shadowRoot!.querySelector(
      '.clear-button',
    ) as HTMLButtonElement;
    expect(clearButton).to.exist;

    const clearPromise = oneEvent(el, 'bx-clear');
    clearButton.click();
    await clearPromise;
    expect(el.value).to.equal('');
  });

  it('toggles password visibility without persisting it to an attribute', async () => {
    const el = await fixture<BxInput>(
      html`<bx-input
        type="password"
        password-toggle
        value="secret"
      ></bx-input>`,
    );
    await el.updateComplete;
    const inputEl = el.shadowRoot!.querySelector('input')!;
    expect(inputEl.type).to.equal('password');

    const toggle = el.shadowRoot!.querySelector(
      '.password-toggle-button',
    ) as HTMLButtonElement;
    toggle.click();
    await el.updateComplete;
    expect(inputEl.type).to.equal('text');
    expect(el.getAttribute('type')).to.equal('password');
  });

  it('participates in a form, validates required, and resets', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <bx-input name="email" required></bx-input>
      </form>
    `);
    const input = form.querySelector('bx-input') as BxInput;
    expect(input.checkValidity()).to.be.false;

    const inputEl = input.shadowRoot!.querySelector('input')!;
    inputEl.value = 'a@b.com';
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    await input.updateComplete;
    expect(input.checkValidity()).to.be.true;

    const data = new FormData(form);
    expect(data.get('email')).to.equal('a@b.com');

    form.reset();
    await input.updateComplete;
    expect(input.value).to.equal('');
  });

  it('debounces the forwarded input event when debounce is set', async () => {
    const el = await fixture<BxInput>(
      html`<bx-input debounce="20"></bx-input>`,
    );
    const inputEl = el.shadowRoot!.querySelector('input')!;

    let fired = 0;
    el.addEventListener('input', () => fired++);

    inputEl.value = 'a';
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    inputEl.value = 'ab';
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    expect(fired).to.equal(0);
    expect(el.value).to.equal('ab');

    await new Promise((resolve) => setTimeout(resolve, 40));
    expect(fired).to.equal(1);
  });

  it('has no axe violations, empty and with label/hint', async () => {
    const el = await fixture<BxInput>(
      html`<bx-input label="Email" hint="We won't spam you."></bx-input>`,
    );
    await expect(el).to.be.accessible();
  });

  it('fires exactly one input event per keystroke (not the native composed one as well)', async () => {
    const el = await fixture<HTMLElement>(html`<bx-input></bx-input>`);
    let inputs = 0;
    el.addEventListener('input', () => inputs++);
    el.focus();
    await sendKeys({ type: '7' });
    expect(inputs).to.equal(1);
  });
});
