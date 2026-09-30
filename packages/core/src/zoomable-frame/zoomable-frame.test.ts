import { expect, fixture, html } from '@open-wc/testing';
import type { BxZoomableFrame } from './zoomable-frame.ts';
import './index.ts';

describe('bx-zoomable-frame', () => {
  it('registers the tag with zoom 1 by default', async () => {
    const el = await fixture<BxZoomableFrame>(
      html`<bx-zoomable-frame></bx-zoomable-frame>`,
    );
    expect(el).to.be.instanceOf(customElements.get('bx-zoomable-frame')!);
    expect(el.zoom).to.equal(1);
  });

  it('defaults the iframe sandbox to the empty (most restrictive) value', async () => {
    const el = await fixture<BxZoomableFrame>(
      html`<bx-zoomable-frame></bx-zoomable-frame>`,
    );
    const iframe = el.shadowRoot!.querySelector('iframe')!;
    expect(iframe.getAttribute('sandbox')).to.equal('');
  });

  it('gives the iframe a title even without a label', async () => {
    const el = await fixture<BxZoomableFrame>(
      html`<bx-zoomable-frame></bx-zoomable-frame>`,
    );
    const iframe = el.shadowRoot!.querySelector('iframe')!;
    expect(iframe.getAttribute('title')).to.not.be.empty;
  });

  it('zoomIn/zoomOut step through zoom-levels and clamp at the ends', async () => {
    const el = await fixture<BxZoomableFrame>(
      html`<bx-zoomable-frame zoom-levels="0.5 1 2"></bx-zoomable-frame>`,
    );
    expect(el.zoom).to.equal(1);
    el.zoomIn();
    expect(el.zoom).to.equal(2);
    el.zoomIn();
    expect(el.zoom).to.equal(2);
    el.zoomOut();
    el.zoomOut();
    expect(el.zoom).to.equal(0.5);
    el.zoomOut();
    expect(el.zoom).to.equal(0.5);
  });

  it('zoom-in/zoom-out buttons update the zoom label', async () => {
    const el = await fixture<BxZoomableFrame>(
      html`<bx-zoomable-frame zoom-levels="0.5 1 2"></bx-zoomable-frame>`,
    );
    const zoomInButton =
      el.shadowRoot!.querySelector<HTMLButtonElement>('.zoom-in-button')!;
    zoomInButton.click();
    await el.updateComplete;
    expect(el.zoom).to.equal(2);
    expect(el.shadowRoot!.querySelector('.zoom-label')!.textContent).to.equal(
      '200%',
    );
  });

  it('toggles the collapsed menu trigger and closes on Escape', async () => {
    const el = await fixture<BxZoomableFrame>(
      html`<bx-zoomable-frame></bx-zoomable-frame>`,
    );
    const trigger =
      el.shadowRoot!.querySelector<HTMLButtonElement>('.menu-trigger')!;
    trigger.click();
    await el.updateComplete;
    expect(trigger.getAttribute('aria-expanded')).to.equal('true');

    el.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await el.updateComplete;
    expect(trigger.getAttribute('aria-expanded')).to.equal('false');
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxZoomableFrame>(
      html`<bx-zoomable-frame label="Preview"></bx-zoomable-frame>`,
    );
    await expect(el).to.be.accessible();
  });
});
