import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxDetails } from './details.ts';
import './index.ts';

describe('bx-details', () => {
  it('registers the tag closed, outlined, icon at the end by default', async () => {
    const el = await fixture<BxDetails>(
      html`<bx-details summary="Title">Body</bx-details>`,
    );
    expect(el).to.be.instanceOf(customElements.get('bx-details')!);
    expect(el.open).to.be.false;
    expect(el.appearance).to.equal('outlined');
    expect(el.iconPlacement).to.equal('end');
  });

  it('renders aria-expanded/aria-controls on the header button', async () => {
    const el = await fixture<BxDetails>(
      html`<bx-details summary="Title">Body</bx-details>`,
    );
    const header = el.shadowRoot!.querySelector('.header') as HTMLButtonElement;
    const content = el.shadowRoot!.querySelector('.content') as HTMLElement;
    expect(header.getAttribute('aria-expanded')).to.equal('false');
    expect(header.getAttribute('aria-controls')).to.equal(content.id);
  });

  it('toggles open on header click and fires bx-show/bx-hide', async () => {
    const el = await fixture<BxDetails>(
      html`<bx-details summary="Title">Body</bx-details>`,
    );
    const header = el.shadowRoot!.querySelector('.header') as HTMLButtonElement;

    const showPromise = oneEvent(el, 'bx-show');
    header.click();
    await showPromise;
    expect(el.open).to.be.true;
    expect(header.getAttribute('aria-expanded')).to.equal('true');

    const hidePromise = oneEvent(el, 'bx-hide');
    header.click();
    await hidePromise;
    expect(el.open).to.be.false;
  });

  it('does not toggle when disabled', async () => {
    const el = await fixture<BxDetails>(
      html`<bx-details summary="Title" disabled>Body</bx-details>`,
    );
    const header = el.shadowRoot!.querySelector('.header') as HTMLButtonElement;
    expect(header.disabled).to.be.true;
    header.click();
    await el.updateComplete;
    expect(el.open).to.be.false;
  });

  it('closes other open members of the same named group when one opens', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <bx-details name="group" open summary="A">A</bx-details>
        <bx-details name="group" summary="B">B</bx-details>
      </div>
    `);
    const [a, b] = Array.from(
      wrapper.querySelectorAll('bx-details'),
    ) as BxDetails[];
    expect(a.open).to.be.true;

    b.show();
    await a.updateComplete;
    await b.updateComplete;
    expect(b.open).to.be.true;
    expect(a.open).to.be.false;
  });

  it('defers default-slot rendering until first opened when lazy', async () => {
    const el = await fixture<BxDetails>(
      html`<bx-details summary="Title" lazy>Heavy content</bx-details>`,
    );
    expect(el.shadowRoot!.querySelector('.content slot:not([name])')).to.be
      .null;

    el.show();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.content slot:not([name])')).to
      .exist;
  });

  it('swaps between expand-icon and collapse-icon slots based on open state', async () => {
    const el = await fixture<BxDetails>(
      html`<bx-details summary="Title">Body</bx-details>`,
    );
    expect(el.shadowRoot!.querySelector('slot[name="expand-icon"]')).to.exist;
    expect(el.shadowRoot!.querySelector('slot[name="collapse-icon"]')).to.be
      .null;

    el.show();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('slot[name="collapse-icon"]')).to
      .exist;
    expect(el.shadowRoot!.querySelector('slot[name="expand-icon"]')).to.be
      .null;
  });

  it('has no axe violations, closed and open', async () => {
    const el = await fixture<BxDetails>(
      html`<bx-details summary="Title">Body</bx-details>`,
    );
    await expect(el).to.be.accessible();

    el.show();
    await el.updateComplete;
    await expect(el).to.be.accessible();
  });
});
