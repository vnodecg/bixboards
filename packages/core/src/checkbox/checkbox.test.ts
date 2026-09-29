import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxCheckbox } from './checkbox.ts';
import './index.ts';

describe('bx-checkbox', () => {
  it('registers the tag unchecked by default', async () => {
    const el = await fixture<BxCheckbox>(
      html`<bx-checkbox>Label</bx-checkbox>`,
    );
    expect(el).to.be.instanceOf(customElements.get('bx-checkbox')!);
    expect(el.checked).to.be.false;
    expect(el.value).to.equal('on');
  });

  it('renders role=checkbox with aria-checked reflecting state', async () => {
    const el = await fixture<BxCheckbox>(
      html`<bx-checkbox>Label</bx-checkbox>`,
    );
    const control = el.shadowRoot!.querySelector('.control')!;
    expect(control.getAttribute('role')).to.equal('checkbox');
    expect(control.getAttribute('aria-checked')).to.equal('false');

    el.checked = true;
    await el.updateComplete;
    expect(control.getAttribute('aria-checked')).to.equal('true');
  });

  it('reports aria-checked="mixed" when indeterminate', async () => {
    const el = await fixture<BxCheckbox>(
      html`<bx-checkbox indeterminate>Label</bx-checkbox>`,
    );
    const control = el.shadowRoot!.querySelector('.control')!;
    expect(control.getAttribute('aria-checked')).to.equal('mixed');
  });

  it('toggles on click, clears indeterminate, and fires input/change', async () => {
    const el = await fixture<BxCheckbox>(
      html`<bx-checkbox indeterminate>Label</bx-checkbox>`,
    );
    const inputPromise = oneEvent(el, 'input');
    const changePromise = oneEvent(el, 'change');
    el.click();
    await inputPromise;
    await changePromise;
    expect(el.checked).to.be.true;
    expect(el.indeterminate).to.be.false;
  });

  it('does not toggle when disabled', async () => {
    const el = await fixture<BxCheckbox>(
      html`<bx-checkbox disabled>Label</bx-checkbox>`,
    );
    el.click();
    await el.updateComplete;
    expect(el.checked).to.be.false;
  });

  it('participates in a form and resets', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <bx-checkbox name="agree" value="yes">Agree</bx-checkbox>
      </form>
    `);
    const checkbox = form.querySelector('bx-checkbox') as BxCheckbox;
    checkbox.click();
    await checkbox.updateComplete;

    const data = new FormData(form);
    expect(data.get('agree')).to.equal('yes');

    form.reset();
    await checkbox.updateComplete;
    expect(checkbox.checked).to.be.false;
  });

  it('reports required as invalid until checked', async () => {
    const el = await fixture<BxCheckbox>(
      html`<bx-checkbox required>Agree</bx-checkbox>`,
    );
    expect(el.checkValidity()).to.be.false;
    el.click();
    await el.updateComplete;
    expect(el.checkValidity()).to.be.true;
  });

  it('has no axe violations, unchecked, checked and indeterminate', async () => {
    const el = await fixture<BxCheckbox>(
      html`<bx-checkbox>Label</bx-checkbox>`,
    );
    await expect(el).to.be.accessible();

    el.checked = true;
    await el.updateComplete;
    await expect(el).to.be.accessible();

    el.checked = false;
    el.indeterminate = true;
    await el.updateComplete;
    await expect(el).to.be.accessible();
  });
});
