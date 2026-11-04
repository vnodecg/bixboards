import { expect, fixture, html } from '@open-wc/testing';
import type { BxChip } from './chip.ts';
import './index.ts';

describe('bx-chip', () => {
  it('is static text by default', async () => {
    const el = await fixture<BxChip>(html`<bx-chip>Tag</bx-chip>`);
    expect(el.shadowRoot!.querySelector('button.label')).to.be.null;
    expect(el.shadowRoot!.querySelector('.text')!.textContent).to.exist;
  });

  it('selectable toggles selected, reflects aria-pressed and fires change', async () => {
    const el = await fixture<BxChip>(html`<bx-chip selectable>Tag</bx-chip>`);
    let changes = 0;
    el.addEventListener('change', () => changes++);
    const button = el.shadowRoot!.querySelector('button')!;
    expect(button.getAttribute('aria-pressed')).to.equal('false');
    button.click();
    await el.updateComplete;
    expect(el.selected).to.be.true;
    expect(button.getAttribute('aria-pressed')).to.equal('true');
    expect(el.shadowRoot!.querySelector('.check')).to.exist;
    expect(changes).to.equal(1);
  });

  it('removes itself on bx-remove unless cancelled', async () => {
    const wrap = await fixture<HTMLDivElement>(
      html`<div>
        <bx-chip removable value="a">A</bx-chip
        ><bx-chip removable value="b">B</bx-chip>
      </div>`,
    );
    const [a, b] = [...wrap.querySelectorAll<BxChip>('bx-chip')];
    b.addEventListener('bx-remove', (e) => e.preventDefault());
    a.shadowRoot!.querySelector('bx-close-button')!
      .shadowRoot!.querySelector('bx-icon-button')!
      .click();
    expect(wrap.contains(a)).to.be.false;
    b.shadowRoot!.querySelector('bx-close-button')!
      .shadowRoot!.querySelector('bx-icon-button')!
      .click();
    expect(wrap.contains(b)).to.be.true;
  });

  it('requests removal on Delete/Backspace from the focused chip', async () => {
    const wrap = await fixture<HTMLDivElement>(
      html`<div><bx-chip removable>A</bx-chip></div>`,
    );
    const chip = wrap.querySelector<BxChip>('bx-chip')!;
    let detail: unknown;
    chip.addEventListener('bx-remove', (e) => {
      detail = (e as CustomEvent).detail;
      e.preventDefault();
    });
    chip.shadowRoot!.querySelector<HTMLElement>('.label')!.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Backspace',
        bubbles: true,
        composed: true,
      }),
    );
    expect(detail).to.exist;
  });

  it('ignores interaction when disabled', async () => {
    const el = await fixture<BxChip>(
      html`<bx-chip selectable disabled>Tag</bx-chip>`,
    );
    el.shadowRoot!.querySelector('button')!.click();
    expect(el.selected).to.be.false;
  });

  it('has no axe violations across states', async () => {
    const el = await fixture<BxChip>(
      html`<bx-chip selectable removable>Tag</bx-chip>`,
    );
    await expect(el).to.be.accessible();
    el.selected = true;
    await el.updateComplete;
    await expect(el).to.be.accessible();
  });
});
