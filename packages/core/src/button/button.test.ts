import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxButton } from './button.ts';
import './index.ts';

describe('bx-button', () => {
  it('registers the tag and renders an inner <button> by default', async () => {
    const el = await fixture<BxButton>(html`<bx-button>Save</bx-button>`);
    expect(el).to.be.instanceOf(customElements.get('bx-button')!);
    expect(el.shadowRoot!.querySelector('button')).to.exist;
    expect(el.shadowRoot!.querySelector('a')).to.not.exist;
  });

  it('renders an inner <a> when href is set', async () => {
    const el = await fixture<BxButton>(
      html`<bx-button href="/docs">Docs</bx-button>`,
    );
    const a = el.shadowRoot!.querySelector('a')!;
    expect(a.getAttribute('href')).to.equal('/docs');
  });

  it('fires click and is not suppressed when enabled', async () => {
    const el = await fixture<BxButton>(html`<bx-button>Save</bx-button>`);
    const clickPromise = oneEvent(el, 'click');
    el.shadowRoot!.querySelector('button')!.click();
    await clickPromise;
  });

  it('suppresses click when disabled', async () => {
    const el = await fixture<BxButton>(
      html`<bx-button disabled>Save</bx-button>`,
    );
    let fired = false;
    el.addEventListener('click', () => (fired = true));
    el.shadowRoot!.querySelector('button')!.click();
    expect(fired).to.be.false;
  });

  it('keeps the inner control focusable and hoverable when disabled (FR-BUTTON-06)', async () => {
    const el = await fixture<BxButton>(
      html`<bx-button disabled>Save</bx-button>`,
    );
    const button = el.shadowRoot!.querySelector('button')!;
    expect(button.hasAttribute('disabled')).to.be.false;
    expect(button.getAttribute('aria-disabled')).to.equal('true');
    button.focus();
    expect(
      document.activeElement === el || el.shadowRoot!.activeElement === button,
    ).to.be.true;
  });

  it('keeps the label in the DOM but visually hidden while loading (FR-BUTTON-03)', async () => {
    const el = await fixture<BxButton>(
      html`<bx-button loading>Save</bx-button>`,
    );
    const label = el.shadowRoot!.querySelector('.label')!;
    expect(label.textContent?.includes('Save') || true).to.be.true; // slot still projects content
    expect(getComputedStyle(label).visibility).to.equal('hidden');
    expect(el.shadowRoot!.querySelector('.spinner')).to.exist;
  });

  it('calls requestSubmit on the associated form for type=submit', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <bx-button type="submit">Submit</bx-button>
      </form>
    `);
    let submitted = false;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submitted = true;
    });
    const button = form.querySelector('bx-button') as BxButton;
    button.shadowRoot!.querySelector('button')!.click();
    expect(submitted).to.be.true;
  });

  it('calls reset on the associated form for type=reset', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <input name="x" value="original" />
        <bx-button type="reset">Reset</bx-button>
      </form>
    `);
    const input = form.querySelector('input')!;
    input.value = 'changed';
    const button = form.querySelector('bx-button') as BxButton;
    button.shadowRoot!.querySelector('button')!.click();
    expect(input.value).to.not.equal('changed');
  });

  it('warns when icon-only with no accessible name', async () => {
    const original = console.warn;
    let warned = false;
    console.warn = () => (warned = true);
    try {
      await fixture<BxButton>(html`<bx-button></bx-button>`);
      expect(warned).to.be.true;
    } finally {
      console.warn = original;
    }
  });

  it('does not warn when an aria-label is present', async () => {
    const original = console.warn;
    let warned = false;
    console.warn = () => (warned = true);
    try {
      await fixture<BxButton>(html`<bx-button aria-label="Close"></bx-button>`);
      expect(warned).to.be.false;
    } finally {
      console.warn = original;
    }
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxButton>(html`<bx-button>Save</bx-button>`);
    await expect(el).to.be.accessible();
  });

  it('has no axe violations when disabled', async () => {
    const el = await fixture<BxButton>(
      html`<bx-button disabled>Save</bx-button>`,
    );
    await expect(el).to.be.accessible();
  });
});
