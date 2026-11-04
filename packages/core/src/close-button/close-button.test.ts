import { expect, fixture, html } from '@open-wc/testing';
import type { BxCloseButton } from './close-button.ts';
import './index.ts';

describe('bx-close-button', () => {
  it('renders a labelled close icon button', async () => {
    const el = await fixture<BxCloseButton>(
      html`<bx-close-button></bx-close-button>`,
    );
    const inner = el.shadowRoot!.querySelector('bx-icon-button')!;
    expect(inner.getAttribute('label')).to.equal('Close');
    expect(inner.getAttribute('name')).to.equal('close');
  });

  it('emits a cancelable bx-close on activation, not when disabled', async () => {
    const el = await fixture<BxCloseButton>(
      html`<bx-close-button></bx-close-button>`,
    );
    let closes = 0;
    let cancelable = false;
    el.addEventListener('bx-close', (e) => {
      closes++;
      cancelable = e.cancelable;
    });
    el.shadowRoot!.querySelector<HTMLElement>('bx-icon-button')!.click();
    expect(closes).to.equal(1);
    expect(cancelable).to.be.true;
    el.disabled = true;
    await el.updateComplete;
    el.shadowRoot!.querySelector<HTMLElement>('bx-icon-button')!.click();
    expect(closes).to.equal(1);
  });

  it('accepts a localized label and has no axe violations', async () => {
    const el = await fixture<BxCloseButton>(
      html`<bx-close-button label="Fermer"></bx-close-button>`,
    );
    await expect(el).to.be.accessible();
  });
});
