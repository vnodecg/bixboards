import { expect, fixture, html } from '@open-wc/testing';
import type { BxKbd } from './kbd.ts';
import { parseChord } from './kbd.ts';
import './index.ts';

describe('bx-kbd', () => {
  it('renders one <kbd> per key', async () => {
    const el = await fixture<BxKbd>(
      html`<bx-kbd keys="mod+shift+k" platform="mac"></bx-kbd>`,
    );
    const caps = [...el.shadowRoot!.querySelectorAll('kbd')].map(
      (k) => k.textContent,
    );
    expect(caps).to.deep.equal(['⌘', '⇧', 'K']);
  });

  it('resolves mod to Ctrl on non-Apple platforms', async () => {
    const el = await fixture<BxKbd>(
      html`<bx-kbd keys="mod+k" platform="windows"></bx-kbd>`,
    );
    expect(el.shadowRoot!.querySelector('kbd')!.textContent).to.equal('Ctrl');
  });

  it('labels the chord for assistive tech', async () => {
    const el = await fixture<BxKbd>(
      html`<bx-kbd keys="mod+esc" platform="mac"></bx-kbd>`,
    );
    expect(
      el.shadowRoot!.querySelector('.base')!.getAttribute('aria-label'),
    ).to.equal('Command Escape');
  });

  it('falls back to the slot without keys', async () => {
    const el = await fixture<BxKbd>(html`<bx-kbd>Ctrl K</bx-kbd>`);
    expect(el.shadowRoot!.querySelector('slot')).to.exist;
    expect(el.shadowRoot!.querySelector('kbd')).to.be.null;
  });

  it('parseChord keeps unknown keys and uppercases letters', () => {
    expect(parseChord('g+F5', false).map((p) => p.glyph)).to.deep.equal([
      'G',
      'F5',
    ]);
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxKbd>(html`<bx-kbd keys="mod+k"></bx-kbd>`);
    await expect(el).to.be.accessible();
  });
});
