import { expect, fixture, html, aTimeout } from '@open-wc/testing';
import type { BxCombobox } from './combobox.ts';
import '../option/index.ts';
import './index.ts';

const make = (attrs = '') =>
  html` <bx-combobox label="Fruit" name="fruit">
    <bx-option value="apple">Apple</bx-option>
    <bx-option value="apricot">Apricot</bx-option>
    <bx-option value="banana">Banana</bx-option>
    <bx-option value="cherry" disabled>Cherry</bx-option>
  </bx-combobox>`;

const input = (el: BxCombobox) => el.shadowRoot!.querySelector('input')!;
const type = async (el: BxCombobox, text: string) => {
  const i = input(el);
  i.focus();
  i.value = text;
  i.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  await el.updateComplete;
};
const key = async (el: BxCombobox, k: string) => {
  input(el).dispatchEvent(
    new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }),
  );
  await el.updateComplete;
};
const visible = (el: BxCombobox) =>
  [...el.querySelectorAll<HTMLElement>('bx-option')]
    .filter((o) => !o.hidden)
    .map((o) => o.getAttribute('value'));

describe('bx-combobox', () => {
  it('exposes the combobox pattern on a real input', async () => {
    const el = await fixture<BxCombobox>(make());
    const i = input(el);
    expect(i.getAttribute('role')).to.equal('combobox');
    expect(i.getAttribute('aria-expanded')).to.equal('false');
    expect(i.getAttribute('aria-autocomplete')).to.equal('list');
    expect(el.shadowRoot!.querySelector('[role=listbox]')).to.exist;
  });

  it('opens on typing and filters options without moving focus', async () => {
    const el = await fixture<BxCombobox>(make());
    await type(el, 'ap');
    expect(el.open).to.be.true;
    expect(visible(el)).to.deep.equal(['apple', 'apricot']);
    expect(el.shadowRoot!.activeElement).to.equal(input(el));
    await type(el, 'nan');
    expect(visible(el)).to.deep.equal(['banana']);
  });

  it('supports starts-with and a custom filter function', async () => {
    const el = await fixture<BxCombobox>(make());
    el.filter = 'starts-with';
    await type(el, 'ana');
    expect(visible(el)).to.deep.equal([]);
    el.filter = (label, q) => label.length === q.length;
    await type(el, 'abcde');
    expect(visible(el)).to.deep.equal(
      ['apple', 'banana'].filter((v) => v.length === 5),
    );
  });

  it('navigates with arrows (skipping disabled) and selects with Enter', async () => {
    const el = await fixture<BxCombobox>(make());
    await key(el, 'ArrowDown');
    expect(el.open).to.be.true;
    const active = () =>
      el.querySelector('bx-option[data-active]')?.getAttribute('value');
    expect(active()).to.equal('apple');
    await key(el, 'ArrowDown');
    await key(el, 'ArrowDown');
    expect(active()).to.equal('banana');
    await key(el, 'ArrowDown');
    expect(active()).to.equal('apple');
    let changes = 0;
    el.addEventListener('change', () => changes++);
    await key(el, 'ArrowDown');
    await key(el, 'Enter');
    expect(el.value).to.equal('apricot');
    expect(input(el).value).to.equal('Apricot');
    expect(el.open).to.be.false;
    expect(changes).to.equal(1);
  });

  it('selects on click, ignores disabled options and closes on Escape', async () => {
    const el = await fixture<BxCombobox>(make());
    await key(el, 'ArrowDown');
    el.querySelector<HTMLElement>('bx-option[value=cherry]')!.click();
    expect(el.value).to.equal('');
    el.querySelector<HTMLElement>('bx-option[value=banana]')!.click();
    expect(el.value).to.equal('banana');
    await key(el, 'ArrowDown');
    await key(el, 'Escape');
    expect(el.open).to.be.false;
  });

  it('only accepts custom text with allow-custom (Enter and blur)', async () => {
    const strict = await fixture<BxCombobox>(make());
    await type(strict, 'zzz');
    await key(strict, 'Enter');
    expect(strict.value).to.equal('');
    const el = await fixture<BxCombobox>(
      html`<bx-combobox allow-custom></bx-combobox>`,
    );
    await type(el, 'Kiwi');
    await key(el, 'Enter');
    expect(el.value).to.equal('Kiwi');
    await type(el, 'Plum');
    input(el).dispatchEvent(new FocusEvent('blur'));
    await el.updateComplete;
    expect(el.value).to.equal('Plum');
  });

  it('multiple: tokens, removal by Backspace, and one form entry per value', async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form>
        <bx-combobox multiple name="f" label="Fruit"
          ><bx-option value="a">A</bx-option
          ><bx-option value="b">B</bx-option></bx-combobox
        >
      </form>`,
    );
    const el = form.querySelector('bx-combobox') as BxCombobox;
    await el.updateComplete;
    el.querySelector<HTMLElement>('bx-option[value=a]')!.click();
    el.querySelector<HTMLElement>('bx-option[value=b]')!.click();
    await el.updateComplete;
    expect(el.value).to.deep.equal(['a', 'b']);
    expect(el.shadowRoot!.querySelectorAll('bx-chip')).to.have.length(2);
    expect(new FormData(form).getAll('f')).to.deep.equal(['a', 'b']);
    await key(el, 'Backspace');
    expect(el.value).to.deep.equal(['a']);
  });

  it('emits a debounced input event with the query and shows loading', async () => {
    const el = await fixture<BxCombobox>(
      html`<bx-combobox debounce="50" loading></bx-combobox>`,
    );
    const queries: string[] = [];
    el.addEventListener('input', (e) =>
      queries.push((e as unknown as CustomEvent).detail.query),
    );
    await type(el, 'a');
    await type(el, 'ab');
    expect(queries).to.deep.equal([]);
    await aTimeout(120);
    expect(queries).to.deep.equal(['ab']);
    expect(el.shadowRoot!.querySelector('bx-spinner')).to.exist;
  });

  it('is form-associated: required validity, reset', async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form>
        <bx-combobox required name="f" value="banana"
          ><bx-option value="banana">Banana</bx-option></bx-combobox
        >
      </form>`,
    );
    const el = form.querySelector('bx-combobox') as BxCombobox;
    await el.updateComplete;
    expect(el.checkValidity()).to.be.true;
    el.value = '';
    await el.updateComplete;
    expect(el.checkValidity()).to.be.false;
    form.reset();
    await el.updateComplete;
    expect(el.value).to.equal('banana');
  });

  it('has no axe violations closed and open', async () => {
    const el = await fixture<BxCombobox>(make());
    await expect(el).to.be.accessible();
    await key(el, 'ArrowDown');
    await aTimeout(50);
    await expect(el).to.be.accessible();
  });
});
