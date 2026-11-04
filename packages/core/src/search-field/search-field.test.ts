import { expect, fixture, html, aTimeout } from '@open-wc/testing';
import type { BxSearchField } from './search-field.ts';
import { matchesShortcut } from './search-field.ts';
import './index.ts';

const inner = (el: BxSearchField) =>
  el.shadowRoot!.querySelector('bx-input')! as HTMLElement & { value: string };
const type = async (el: BxSearchField, text: string) => {
  const input = inner(el);
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  await el.updateComplete;
};

describe('bx-search-field', () => {
  it('composes a search-type bx-input with a leading icon and a default placeholder', async () => {
    const el = await fixture<BxSearchField>(
      html`<bx-search-field></bx-search-field>`,
    );
    const input = inner(el);
    expect(input.getAttribute('type')).to.equal('search');
    expect(input.getAttribute('placeholder')).to.equal('Search');
    expect(el.shadowRoot!.querySelector('[part=icon] svg')).to.exist;
  });

  it('fires bx-search debounced after typing, once with the final query', async () => {
    const el = await fixture<BxSearchField>(
      html`<bx-search-field debounce="60"></bx-search-field>`,
    );
    const queries: string[] = [];
    el.addEventListener('bx-search', (e) =>
      queries.push((e as CustomEvent).detail.query),
    );
    await type(el, 'a');
    await type(el, 'ab');
    expect(queries).to.deep.equal([]);
    await aTimeout(150);
    expect(queries).to.deep.equal(['ab']);
  });

  it('fires bx-search immediately on Enter', async () => {
    const el = await fixture<BxSearchField>(
      html`<bx-search-field debounce="5000"></bx-search-field>`,
    );
    const queries: string[] = [];
    el.addEventListener('bx-search', (e) =>
      queries.push((e as CustomEvent).detail.query),
    );
    await type(el, 'hello');
    inner(el).dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        composed: true,
      }),
    );
    expect(queries).to.deep.equal(['hello']);
  });

  it('Escape clears first (with bx-clear), then blurs', async () => {
    const el = await fixture<BxSearchField>(
      html`<bx-search-field value="abc"></bx-search-field>`,
    );
    let cleared = 0;
    el.addEventListener('bx-clear', () => cleared++);
    const esc = () =>
      inner(el).dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          composed: true,
          cancelable: true,
        }),
      );
    el.focus();
    esc();
    await el.updateComplete;
    expect(el.value).to.equal('');
    expect(cleared).to.equal(1);
    esc();
    expect(cleared).to.equal(1);
  });

  it('focuses on its shortcut unless another editable has focus', async () => {
    const wrap = await fixture<HTMLElement>(
      html`<div>
        <input id="other" /><bx-search-field shortcut="mod+k"></bx-search-field>
      </div>`,
    );
    const el = wrap.querySelector('bx-search-field') as BxSearchField;
    await el.updateComplete;
    const press = () =>
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'k',
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        }),
      );
    wrap.querySelector<HTMLInputElement>('#other')!.focus();
    press();
    expect(document.activeElement!.id).to.equal('other');
    (document.activeElement as HTMLElement).blur();
    press();
    await aTimeout(20);
    expect(document.activeElement).to.equal(el);
  });

  it('matches shortcut chords', () => {
    const e = (init: KeyboardEventInit) => new KeyboardEvent('keydown', init);
    expect(matchesShortcut(e({ key: 'k', metaKey: true }), 'mod+k')).to.be.true;
    expect(matchesShortcut(e({ key: 'k', ctrlKey: true }), 'mod+k')).to.be.true;
    expect(matchesShortcut(e({ key: 'k' }), 'mod+k')).to.be.false;
    expect(matchesShortcut(e({ key: '/' }), '/')).to.be.true;
    expect(
      matchesShortcut(
        e({ key: 'K', ctrlKey: true, shiftKey: true }),
        'ctrl+shift+k',
      ),
    ).to.be.true;
  });

  it('is form-associated and resets', async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form><bx-search-field name="q" value="x"></bx-search-field></form>`,
    );
    const el = form.querySelector('bx-search-field') as BxSearchField;
    await el.updateComplete;
    expect(new FormData(form).get('q')).to.equal('x');
    await type(el, 'y');
    expect(new FormData(form).get('q')).to.equal('y');
    form.reset();
    await el.updateComplete;
    expect(el.value).to.equal('x');
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxSearchField>(
      html`<bx-search-field label="Search products"></bx-search-field>`,
    );
    await expect(el).to.be.accessible();
  });
});
