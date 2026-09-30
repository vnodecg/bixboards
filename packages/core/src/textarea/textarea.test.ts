import { expect, fixture, html, oneEvent, aTimeout } from '@open-wc/testing';
import type { BxTextarea } from './textarea.ts';
import './index.ts';

describe('bx-textarea', () => {
  it('registers the tag and wraps a native textarea', async () => {
    const el = await fixture<BxTextarea>(html`<bx-textarea></bx-textarea>`);
    expect(el).to.be.instanceOf(customElements.get('bx-textarea')!);
    expect(el.shadowRoot!.querySelector('textarea')).to.exist;
  });

  it('reflects value into the native textarea and back out on input', async () => {
    const el = await fixture<BxTextarea>(
      html`<bx-textarea value="hello"></bx-textarea>`,
    );
    const textarea = el.shadowRoot!.querySelector('textarea')!;
    expect(textarea.value).to.equal('hello');

    textarea.value = 'world';
    const inputPromise = oneEvent(el, 'input');
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    await inputPromise;
    expect(el.value).to.equal('world');
  });

  it('shows label/hint from attributes', async () => {
    const el = await fixture<BxTextarea>(
      html`<bx-textarea
        label="Bio"
        hint="Tell us about yourself"
      ></bx-textarea>`,
    );
    expect(el.shadowRoot!.querySelector('.label')!.textContent).to.include(
      'Bio',
    );
    expect(el.shadowRoot!.querySelector('.hint')!.textContent).to.include(
      'Tell us about yourself',
    );
  });

  it('participates in form submission and resets to the default value', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><bx-textarea name="bio" value="original"></bx-textarea></form>
    `);
    const el = form.querySelector('bx-textarea') as BxTextarea;
    el.value = 'changed';
    await el.updateComplete;
    expect(new FormData(form).get('bio')).to.equal('changed');

    form.reset();
    await el.updateComplete;
    expect(el.value).to.equal('original');
  });

  it('is invalid when required and empty, valid once filled', async () => {
    const el = await fixture<BxTextarea>(
      html`<bx-textarea required></bx-textarea>`,
    );
    expect(el.checkValidity()).to.be.false;
    el.value = 'x';
    const textarea = el.shadowRoot!.querySelector('textarea')!;
    textarea.value = 'x';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    await el.updateComplete;
    expect(el.checkValidity()).to.be.true;
  });

  it('shows a character count when show-count is set', async () => {
    const el = await fixture<BxTextarea>(
      html`<bx-textarea show-count maxlength="10" value="abc"></bx-textarea>`,
    );
    expect(el.shadowRoot!.querySelector('.count')!.textContent).to.equal('7');
  });

  it('marks the count as over-limit when negative', async () => {
    const el = await fixture<BxTextarea>(
      html`<bx-textarea show-count maxlength="3" value="abcdef"></bx-textarea>`,
    );
    const count = el.shadowRoot!.querySelector('.count')!;
    expect(count.hasAttribute('data-over-limit')).to.be.true;
  });

  it('resize=auto disables the native resize handle', async () => {
    const el = await fixture<BxTextarea>(
      html`<bx-textarea resize="auto" rows="2"></bx-textarea>`,
    );
    const textarea = el.shadowRoot!.querySelector('textarea')!;
    expect(getComputedStyle(textarea).resize).to.equal('none');
  });

  it('grows with content when resize=auto and field-sizing is unsupported (JS fallback)', async () => {
    const el = await fixture<BxTextarea>(
      html`<bx-textarea resize="auto" rows="2"></bx-textarea>`,
    );
    const textarea = el.shadowRoot!.querySelector('textarea')!;
    if (getComputedStyle(textarea).fieldSizing === 'content') return; // native path, nothing to assert here
    const before = textarea.style.height;
    textarea.value = 'line1\nline2\nline3\nline4\nline5\nline6';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    await aTimeout(50);
    expect(textarea.style.height).to.not.equal(before);
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxTextarea>(
      html`<bx-textarea
        label="Bio"
        hint="Tell us about yourself"
      ></bx-textarea>`,
    );
    await expect(el).to.be.accessible();
  });
});
