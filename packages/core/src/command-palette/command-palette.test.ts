import { expect, fixture, html, aTimeout } from '@open-wc/testing';
import type { BxCommandPalette, Command } from './command-palette.ts';
import { fuzzyScore } from './command-palette.ts';
import './index.ts';

const commands = (log: string[] = []): Command[] => [
  {
    id: 'open',
    label: 'Open settings',
    group: 'Navigation',
    shortcut: 'mod+,',
    handler: () => log.push('open'),
  },
  {
    id: 'new',
    label: 'New document',
    group: 'File',
    keywords: ['create'],
    handler: () => log.push('new'),
  },
  {
    id: 'save',
    label: 'Save',
    group: 'File',
    shortcut: 'mod+s',
    handler: () => log.push('save'),
  },
  { id: 'off', label: 'Disabled thing', group: 'File', disabled: true },
];

const input = (el: BxCommandPalette) => el.shadowRoot!.querySelector('input')!;
const type = async (el: BxCommandPalette, text: string) => {
  input(el).value = text;
  input(el).dispatchEvent(
    new Event('input', { bubbles: true, composed: true }),
  );
  await el.updateComplete;
};
const key = async (el: BxCommandPalette, k: string) => {
  input(el).dispatchEvent(
    new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }),
  );
  await el.updateComplete;
};
const options = (el: BxCommandPalette) => [
  ...el.shadowRoot!.querySelectorAll('[role=option]'),
];
const labels = (el: BxCommandPalette) =>
  options(el).map((o) => o.querySelector('.label')!.textContent);

describe('fuzzyScore', () => {
  it('ranks exact > prefix > word-start > substring > subsequence > none', () => {
    const exact = fuzzyScore('save', 'Save');
    const prefix = fuzzyScore('sav', 'Save as');
    const word = fuzzyScore('set', 'Open settings');
    const sub = fuzzyScore('ttin', 'Open settings');
    const subseq = fuzzyScore('ops', 'Open settings');
    expect(exact).to.be.greaterThan(prefix);
    expect(prefix).to.be.greaterThan(word);
    expect(word).to.be.greaterThan(sub);
    expect(sub).to.be.greaterThan(subseq);
    expect(subseq).to.be.greaterThan(0);
    expect(fuzzyScore('zzz', 'Open settings')).to.equal(0);
  });
  it('is deterministic and handles multi-word queries', () => {
    expect(fuzzyScore('op se', 'Open settings')).to.equal(
      fuzzyScore('op se', 'Open settings'),
    );
    expect(fuzzyScore('op se', 'Open settings')).to.be.greaterThan(
      fuzzyScore('op se', 'Stop everything'),
    );
    expect(fuzzyScore('', 'anything')).to.be.greaterThan(0);
  });
});

describe('bx-command-palette', () => {
  afterEach(() =>
    document.querySelectorAll('bx-command-palette').forEach((e) => e.remove()),
  );

  it('opens as a modal dialog with the combobox pattern and focuses the input', async () => {
    const el = await fixture<BxCommandPalette>(
      html`<bx-command-palette></bx-command-palette>`,
    );
    el.commands = commands();
    el.show();
    await el.updateComplete;
    const dialog = el.shadowRoot!.querySelector('dialog')!;
    expect(dialog.open).to.be.true;
    expect(el.shadowRoot!.activeElement).to.equal(input(el));
    expect(input(el).getAttribute('role')).to.equal('combobox');
    expect(el.shadowRoot!.querySelector('[role=listbox]')).to.exist;
    expect(input(el).getAttribute('aria-activedescendant')).to.exist;
  });

  it('groups commands (and Recent first) when there is no query', async () => {
    const el = await fixture<BxCommandPalette>(
      html`<bx-command-palette></bx-command-palette>`,
    );
    el.commands = commands();
    el.recent = ['save'];
    el.show();
    await el.updateComplete;
    const groups = [...el.shadowRoot!.querySelectorAll('.group-label')].map(
      (g) => g.textContent,
    );
    expect(groups).to.deep.equal(['Recent', 'Navigation', 'File']);
    expect(labels(el)[0]).to.equal('Save');
  });

  it('filters and ranks by query, matching keywords, and shows the empty state', async () => {
    const el = await fixture<BxCommandPalette>(
      html`<bx-command-palette></bx-command-palette>`,
    );
    el.commands = commands();
    el.show();
    await el.updateComplete;
    await type(el, 'set');
    // Word-start match ranks first; a looser subsequence match may follow it.
    expect(labels(el)[0]).to.equal('Open settings');
    await type(el, 'create');
    expect(labels(el)[0]).to.equal('New document');
    await type(el, 'qqqq');
    expect(options(el)).to.have.length(0);
    expect(el.shadowRoot!.querySelector('.empty')).to.exist;
  });

  it('navigates with arrows (skipping disabled), selects with Enter, runs the handler and closes', async () => {
    const log: string[] = [];
    const el = await fixture<BxCommandPalette>(
      html`<bx-command-palette></bx-command-palette>`,
    );
    el.commands = commands(log);
    el.show();
    await el.updateComplete;
    await key(el, 'ArrowDown');
    await key(el, 'ArrowDown');
    expect(
      el.shadowRoot!.querySelector('[data-active] .label')!.textContent,
    ).to.equal('Save');
    await key(el, 'ArrowDown'); // skips the disabled row and wraps
    expect(
      el.shadowRoot!.querySelector('[data-active] .label')!.textContent,
    ).to.equal('Open settings');
    await key(el, 'Enter');
    expect(log).to.deep.equal(['open']);
    expect(el.open).to.be.false;
  });

  it('lets bx-select be cancelled', async () => {
    const log: string[] = [];
    const el = await fixture<BxCommandPalette>(
      html`<bx-command-palette></bx-command-palette>`,
    );
    el.commands = commands(log);
    el.addEventListener('bx-select', (e) => e.preventDefault());
    el.show();
    await el.updateComplete;
    await key(el, 'Enter');
    expect(log).to.deep.equal([]);
    expect(el.open).to.be.true;
  });

  it('toggles from the global shortcut, ignoring chords without a modifier inside inputs', async () => {
    const wrap = await fixture<HTMLElement>(
      html`<div>
        <input id="field" /><bx-command-palette></bx-command-palette>
      </div>`,
    );
    const el = wrap.querySelector('bx-command-palette') as BxCommandPalette;
    el.commands = commands();
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    await el.updateComplete;
    expect(el.open).to.be.true;
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    await el.updateComplete;
    expect(el.open).to.be.false;

    el.shortcut = '/';
    await el.updateComplete;
    wrap.querySelector<HTMLInputElement>('#field')!.focus();
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: '/',
        bubbles: true,
        cancelable: true,
      }),
    );
    await el.updateComplete;
    expect(el.open).to.be.false;
    (document.activeElement as HTMLElement).blur();
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: '/',
        bubbles: true,
        cancelable: true,
      }),
    );
    await el.updateComplete;
    expect(el.open).to.be.true;
  });

  it('renders shortcut chords with bx-kbd and emits input with the query', async () => {
    const el = await fixture<BxCommandPalette>(
      html`<bx-command-palette></bx-command-palette>`,
    );
    el.commands = commands();
    let query = '';
    el.addEventListener(
      'input',
      (e) => (query = (e as CustomEvent).detail.query),
    );
    el.show();
    await el.updateComplete;
    expect(
      el.shadowRoot!.querySelector('[part=item] bx-kbd')!.getAttribute('keys'),
    ).to.equal('mod+,');
    await type(el, 'sav');
    expect(query).to.equal('sav');
  });

  it('closes with Escape (cancel) and restores state', async () => {
    const el = await fixture<BxCommandPalette>(
      html`<bx-command-palette></bx-command-palette>`,
    );
    el.commands = commands();
    el.show();
    await el.updateComplete;
    await type(el, 'sav');
    el.shadowRoot!.querySelector('dialog')!.dispatchEvent(
      new Event('cancel', { cancelable: true }),
    );
    await aTimeout(20);
    expect(el.open).to.be.false;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('dialog')!.open).to.be.false;
  });

  it('has no axe violations while open', async () => {
    const el = await fixture<BxCommandPalette>(
      html`<bx-command-palette></bx-command-palette>`,
    );
    el.commands = commands();
    el.show();
    await aTimeout(50);
    await expect(el).to.be.accessible();
  });
});
