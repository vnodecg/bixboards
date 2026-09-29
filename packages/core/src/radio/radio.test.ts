import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxRadio } from './radio.ts';
import './index.ts';

describe('bx-radio', () => {
  it('registers the tag unchecked by default', async () => {
    const el = await fixture<BxRadio>(html`<bx-radio>Label</bx-radio>`);
    expect(el).to.be.instanceOf(customElements.get('bx-radio')!);
    expect(el.checked).to.be.false;
    expect(el.value).to.equal('on');
  });

  it('renders role=radio with aria-checked reflecting state', async () => {
    const el = await fixture<BxRadio>(html`<bx-radio>Label</bx-radio>`);
    const control = el.shadowRoot!.querySelector('.control')!;
    expect(control.getAttribute('role')).to.equal('radio');
    expect(control.getAttribute('aria-checked')).to.equal('false');

    el.checked = true;
    await el.updateComplete;
    expect(control.getAttribute('aria-checked')).to.equal('true');
  });

  it('selects on click and fires input/change', async () => {
    const el = await fixture<BxRadio>(html`<bx-radio>Label</bx-radio>`);
    const inputPromise = oneEvent(el, 'input');
    const changePromise = oneEvent(el, 'change');
    el.click();
    await inputPromise;
    await changePromise;
    expect(el.checked).to.be.true;
  });

  it('does not select when disabled', async () => {
    const el = await fixture<BxRadio>(html`<bx-radio disabled>Label</bx-radio>`);
    el.click();
    await el.updateComplete;
    expect(el.checked).to.be.false;
  });

  it('enforces mutual exclusion within a name group', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <bx-radio name="fruit" value="apple">Apple</bx-radio>
        <bx-radio name="fruit" value="pear">Pear</bx-radio>
      </div>
    `);
    const [apple, pear] = [...wrapper.querySelectorAll('bx-radio')] as BxRadio[];
    apple!.click();
    await apple!.updateComplete;
    expect(apple!.checked).to.be.true;

    pear!.click();
    await Promise.all([apple!.updateComplete, pear!.updateComplete]);
    expect(pear!.checked).to.be.true;
    expect(apple!.checked).to.be.false;
  });

  it('moves focus and selection with arrow keys within a group', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <bx-radio name="size" value="s">S</bx-radio>
        <bx-radio name="size" value="m">M</bx-radio>
        <bx-radio name="size" value="l">L</bx-radio>
      </div>
    `);
    const [s, m] = [...wrapper.querySelectorAll('bx-radio')] as BxRadio[];
    s!.focus();
    s!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await Promise.all([s!.updateComplete, m!.updateComplete]);
    expect(m!.checked).to.be.true;
    expect(document.activeElement).to.equal(m);
  });

  it('participates in a form and resets', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <bx-radio name="fruit" value="apple">Apple</bx-radio>
        <bx-radio name="fruit" value="pear">Pear</bx-radio>
      </form>
    `);
    const [apple] = [...form.querySelectorAll('bx-radio')] as BxRadio[];
    apple!.click();
    await apple!.updateComplete;

    const data = new FormData(form);
    expect(data.get('fruit')).to.equal('apple');

    form.reset();
    await apple!.updateComplete;
    expect(apple!.checked).to.be.false;
  });

  it('has no axe violations, unchecked and checked', async () => {
    const el = await fixture<BxRadio>(html`<bx-radio>Label</bx-radio>`);
    await expect(el).to.be.accessible();

    el.checked = true;
    await el.updateComplete;
    await expect(el).to.be.accessible();
  });
});
