import { expect, fixture, html } from '@open-wc/testing';
import type { BxTagInput } from './tag-input.ts';
import './index.ts';

const input = (el: BxTagInput) => el.shadowRoot!.querySelector('input')!;
const type = async (el: BxTagInput, text: string) => {
  const i = input(el);
  i.focus();
  i.value = text;
  i.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  await el.updateComplete;
};
const key = async (el: BxTagInput, k: string) => {
  input(el).dispatchEvent(
    new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }),
  );
  await el.updateComplete;
};
const tags = (el: BxTagInput) =>
  [...el.shadowRoot!.querySelectorAll('bx-chip')].map((c) =>
    c.textContent!.trim(),
  );

describe('bx-tag-input', () => {
  it('turns text into tags on a comma and on Enter', async () => {
    const el = await fixture<BxTagInput>(
      html`<bx-tag-input label="Tags"></bx-tag-input>`,
    );
    await type(el, 'one,');
    expect(el.value).to.deep.equal(['one']);
    expect(input(el).value).to.equal('');
    await type(el, 'two');
    await key(el, 'Enter');
    expect(el.value).to.deep.equal(['one', 'two']);
    expect(tags(el)).to.deep.equal(['one', 'two']);
  });

  it('commits typed text on blur', async () => {
    const el = await fixture<BxTagInput>(html`<bx-tag-input></bx-tag-input>`);
    await type(el, 'tail');
    input(el).dispatchEvent(new FocusEvent('blur'));
    await el.updateComplete;
    expect(el.value).to.deep.equal(['tail']);
  });

  it('splits pasted text on delimiters', async () => {
    const el = await fixture<BxTagInput>(html`<bx-tag-input></bx-tag-input>`);
    const data = new DataTransfer();
    data.setData('text', 'a,b,c');
    input(el).dispatchEvent(
      new ClipboardEvent('paste', {
        clipboardData: data,
        bubbles: true,
        cancelable: true,
      }),
    );
    await el.updateComplete;
    expect(el.value).to.deep.equal(['a', 'b']);
    expect(input(el).value).to.equal('c');
  });

  it('rejects duplicates, over-limit and invalid tags with a reason', async () => {
    const el = await fixture<BxTagInput>(
      html`<bx-tag-input max="2" value="a"></bx-tag-input>`,
    );
    el.validate = (v) => !v.includes('!');
    const reasons: string[] = [];
    el.addEventListener('bx-reject', (e) =>
      reasons.push((e as CustomEvent).detail.reason),
    );
    el.add('A');
    el.add('bad!');
    el.add('b');
    el.add('c');
    expect(el.value).to.deep.equal(['a', 'b']);
    expect(reasons).to.deep.equal(['duplicate', 'invalid', 'max']);
  });

  it('Backspace marks then removes the last tag', async () => {
    const el = await fixture<BxTagInput>(
      html`<bx-tag-input value="a,b"></bx-tag-input>`,
    );
    await el.updateComplete;
    const removed: string[] = [];
    el.addEventListener('bx-remove', (e) =>
      removed.push((e as CustomEvent).detail.value),
    );
    await key(el, 'Backspace');
    expect(
      el.shadowRoot!.querySelectorAll('bx-chip[data-marked]'),
    ).to.have.length(1);
    expect(el.value).to.deep.equal(['a', 'b']);
    await key(el, 'Backspace');
    expect(el.value).to.deep.equal(['a']);
    expect(removed).to.deep.equal(['b']);
  });

  it('removes a tag from its chip button and submits one form entry per tag', async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form><bx-tag-input name="t" value="x,y"></bx-tag-input></form>`,
    );
    const el = form.querySelector('bx-tag-input') as BxTagInput;
    await el.updateComplete;
    expect(new FormData(form).getAll('t')).to.deep.equal(['x', 'y']);
    el.shadowRoot!.querySelector('bx-chip')!.dispatchEvent(
      new CustomEvent('bx-remove', { cancelable: true }),
    );
    await el.updateComplete;
    expect(el.value).to.deep.equal(['y']);
    form.reset();
    await el.updateComplete;
    expect(el.value).to.deep.equal(['x', 'y']);
  });

  it('required needs at least one tag', async () => {
    const el = await fixture<BxTagInput>(
      html`<bx-tag-input required></bx-tag-input>`,
    );
    expect(el.checkValidity()).to.be.false;
    el.add('x');
    await el.updateComplete;
    expect(el.checkValidity()).to.be.true;
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxTagInput>(
      html`<bx-tag-input label="Tags" value="a,b"></bx-tag-input>`,
    );
    await expect(el).to.be.accessible();
  });
});
