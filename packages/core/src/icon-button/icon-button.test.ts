import { expect, fixture, html } from '@open-wc/testing';
import type { BxIconButton } from './icon-button.ts';
import './index.ts';

describe('bx-icon-button', () => {
  it('registers and renders the icon inside a bx-button', async () => {
    const el = await fixture<BxIconButton>(
      html`<bx-icon-button label="Copy" name="copy"></bx-icon-button>`,
    );
    expect(el).to.be.instanceOf(customElements.get('bx-icon-button')!);
    const base = el.shadowRoot!.querySelector('bx-button')!;
    expect(base.getAttribute('aria-label')).to.equal('Copy');
    expect(
      el.shadowRoot!.querySelector('bx-icon')!.getAttribute('name'),
    ).to.equal('copy');
  });

  it('is square, and never smaller than the minimum target', async () => {
    const el = await fixture<BxIconButton>(
      html`<bx-icon-button label="Close" name="close"></bx-icon-button>`,
    );
    const rect = el
      .shadowRoot!.querySelector('bx-button')!
      .getBoundingClientRect();
    expect(Math.round(rect.width)).to.equal(Math.round(rect.height));
    expect(rect.height).to.be.greaterThan(20);
  });

  it('suppresses click while disabled or loading, emits it otherwise', async () => {
    const el = await fixture<BxIconButton>(
      html`<bx-icon-button label="Go" name="check"></bx-icon-button>`,
    );
    let clicks = 0;
    el.addEventListener('click', () => clicks++);
    el.click();
    expect(clicks).to.equal(1);
    el.disabled = true;
    await el.updateComplete;
    el.click();
    expect(clicks).to.equal(1);
    el.disabled = false;
    el.loading = true;
    await el.updateComplete;
    el.click();
    expect(clicks).to.equal(1);
  });

  it('warns when the label is missing', async () => {
    const original = console.warn;
    let warned = false;
    console.warn = () => (warned = true);
    try {
      await fixture(html`<bx-icon-button name="check"></bx-icon-button>`);
    } finally {
      console.warn = original;
    }
    expect(warned).to.be.true;
  });

  it('supports link mode and the circle shape', async () => {
    const el = await fixture<BxIconButton>(
      html`<bx-icon-button
        label="Home"
        name="check"
        href="/x"
        shape="circle"
      ></bx-icon-button>`,
    );
    expect(
      el.shadowRoot!.querySelector('bx-button')!.getAttribute('href'),
    ).to.equal('/x');
    expect(el.getAttribute('shape')).to.equal('circle');
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxIconButton>(
      html`<bx-icon-button label="Settings" name="info"></bx-icon-button>`,
    );
    await expect(el).to.be.accessible();
  });
});
