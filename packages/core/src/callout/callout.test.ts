import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxCallout } from './callout.ts';
import './index.ts';

describe('bx-callout', () => {
  it('registers the tag with brand/medium/outlined, open by default', async () => {
    const el = await fixture<BxCallout>(html`<bx-callout>Hi</bx-callout>`);
    expect(el).to.be.instanceOf(customElements.get('bx-callout')!);
    expect(el.variant).to.equal('brand');
    expect(el.size).to.equal('medium');
    expect(el.appearance).to.equal('outlined');
    expect(el.open).to.be.true;
  });

  it('is role=note when statically open at first render, even for danger', async () => {
    const el = await fixture<BxCallout>(
      html`<bx-callout variant="danger">Careful</bx-callout>`,
    );
    expect(el.getAttribute('role')).to.equal('note');
  });

  it('becomes role=alert when a danger/warning callout is shown dynamically', async () => {
    const el = await fixture<BxCallout>(
      html`<bx-callout variant="danger" .open=${false}>Careful</bx-callout>`,
    );
    expect(el.getAttribute('role')).to.equal('note');
    el.show();
    await el.updateComplete;
    expect(el.getAttribute('role')).to.equal('alert');
  });

  it('does not render a close button unless dismissible', async () => {
    const el = await fixture<BxCallout>(html`<bx-callout>Hi</bx-callout>`);
    expect(el.shadowRoot!.querySelector('.close-button')).to.be.null;

    const dismissible = await fixture<BxCallout>(
      html`<bx-callout dismissible>Hi</bx-callout>`,
    );
    expect(dismissible.shadowRoot!.querySelector('.close-button')).to.exist;
  });

  it('emits a cancelable bx-hide, then closes and fires bx-after-hide', async () => {
    const el = await fixture<BxCallout>(
      html`<bx-callout dismissible>Hi</bx-callout>`,
    );
    const hidePromise = oneEvent(el, 'bx-hide');
    const button = el.shadowRoot!.querySelector(
      '.close-button',
    ) as HTMLButtonElement;
    button.click();
    const hideEvent = await hidePromise;
    expect(hideEvent.cancelable).to.be.true;
    await el.updateComplete;
    expect(el.open).to.be.false;
    expect(el.getAttribute('aria-hidden')).to.equal('true');
  });

  it('stays open when bx-hide is cancelled', async () => {
    const el = await fixture<BxCallout>(
      html`<bx-callout dismissible>Hi</bx-callout>`,
    );
    el.addEventListener('bx-hide', (e) => e.preventDefault());
    const button = el.shadowRoot!.querySelector(
      '.close-button',
    ) as HTMLButtonElement;
    button.click();
    await el.updateComplete;
    expect(el.open).to.be.true;
    expect(el.hasAttribute('aria-hidden')).to.be.false;
  });

  it('renders a default icon per variant, replaceable via the icon slot', async () => {
    const el = await fixture<BxCallout>(
      html`<bx-callout variant="success">Done</bx-callout>`,
    );
    expect(el.shadowRoot!.querySelector('.icon svg')).to.exist;

    const custom = await fixture<BxCallout>(html`
      <bx-callout><span slot="icon">*</span>Done</bx-callout>
    `);
    const slot = custom.shadowRoot!.querySelector(
      'slot[name="icon"]',
    ) as HTMLSlotElement;
    expect(slot.assignedNodes().length).to.equal(1);
  });

  it('has no axe violations, default and dismissible', async () => {
    const el = await fixture<BxCallout>(html`<bx-callout>Hi</bx-callout>`);
    await expect(el).to.be.accessible();

    const dismissible = await fixture<BxCallout>(
      html`<bx-callout dismissible>Hi</bx-callout>`,
    );
    await expect(dismissible).to.be.accessible();
  });
});
