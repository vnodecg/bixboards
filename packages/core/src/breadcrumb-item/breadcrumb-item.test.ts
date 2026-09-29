import { expect, fixture, html } from '@open-wc/testing';
import type { BxBreadcrumbItem } from './breadcrumb-item.ts';
import './index.ts';

describe('bx-breadcrumb-item', () => {
  it('registers the tag', async () => {
    const el = await fixture<BxBreadcrumbItem>(html`<bx-breadcrumb-item></bx-breadcrumb-item>`);
    expect(el).to.be.instanceOf(customElements.get('bx-breadcrumb-item')!);
  });

  it('renders an anchor when href is set', async () => {
    const el = await fixture<BxBreadcrumbItem>(
      html`<bx-breadcrumb-item href="/home">Home</bx-breadcrumb-item>`,
    );
    const anchor = el.shadowRoot!.querySelector('a.label');
    expect(anchor).to.exist;
    expect(anchor!.getAttribute('href')).to.equal('/home');
  });

  it('renders a button when interactive with no href', async () => {
    const el = await fixture<BxBreadcrumbItem>(
      html`<bx-breadcrumb-item>Docs</bx-breadcrumb-item>`,
    );
    expect(el.shadowRoot!.querySelector('button.label')).to.exist;
  });

  it('renders text with aria-current when current', async () => {
    const el = await fixture<BxBreadcrumbItem>(
      html`<bx-breadcrumb-item current>Current</bx-breadcrumb-item>`,
    );
    const label = el.shadowRoot!.querySelector('span.label')!;
    expect(label.getAttribute('aria-current')).to.equal('page');
    expect(el.shadowRoot!.querySelector('a.label, button.label')).to.not.exist;
  });

  it('sets aria-current on the anchor when both href and current are set', async () => {
    const el = await fixture<BxBreadcrumbItem>(
      html`<bx-breadcrumb-item href="/x" current>X</bx-breadcrumb-item>`,
    );
    expect(el.shadowRoot!.querySelector('a.label')!.getAttribute('aria-current')).to.equal(
      'page',
    );
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxBreadcrumbItem>(
      html`<bx-breadcrumb-item href="/home">Home</bx-breadcrumb-item>`,
    );
    await expect(el).to.be.accessible();
  });
});
