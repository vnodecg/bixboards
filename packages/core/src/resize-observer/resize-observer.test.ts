import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxResizeObserver } from './resize-observer.ts';
import './index.ts';

describe('bx-resize-observer', () => {
  it('registers the tag and renders its slot', async () => {
    const el = await fixture<BxResizeObserver>(
      html`<bx-resize-observer><p>content</p></bx-resize-observer>`,
    );
    expect(el).to.be.instanceOf(customElements.get('bx-resize-observer')!);
    expect(el.querySelector('p')).to.exist;
  });

  it('fires bx-resize with entries in detail', async () => {
    const el = await fixture<BxResizeObserver>(
      html`<bx-resize-observer
        style="display: block; width: 50px;"
      ></bx-resize-observer>`,
    );
    const event = await oneEvent(el, 'bx-resize');
    expect(event.detail.entries).to.have.lengthOf(1);
    expect(event.detail.entries[0]).to.have.property('contentRect');
  });

  it('does not observe when disabled', async () => {
    const el = await fixture<BxResizeObserver>(
      html`<bx-resize-observer
        disabled
        style="display: block; width: 50px;"
      ></bx-resize-observer>`,
    );
    let fired = false;
    el.addEventListener('bx-resize', () => {
      fired = true;
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(fired).to.be.false;
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxResizeObserver>(
      html`<bx-resize-observer><p>content</p></bx-resize-observer>`,
    );
    await expect(el).to.be.accessible();
  });
});
