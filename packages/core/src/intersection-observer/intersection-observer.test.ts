import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxIntersectionObserver } from './intersection-observer.ts';
import './index.ts';

describe('bx-intersection-observer', () => {
  it('registers the tag and renders its slot', async () => {
    const el = await fixture<BxIntersectionObserver>(
      html`<bx-intersection-observer><p>content</p></bx-intersection-observer>`,
    );
    expect(el).to.be.instanceOf(
      customElements.get('bx-intersection-observer')!,
    );
    expect(el.querySelector('p')).to.exist;
  });

  it('fires bx-intersect with entries in detail', async () => {
    const el = await fixture<BxIntersectionObserver>(
      html`<bx-intersection-observer threshold="0"></bx-intersection-observer>`,
    );
    const event = await oneEvent(el, 'bx-intersect');
    expect(event.detail.entries).to.have.lengthOf(1);
    expect(event.detail.entries[0]).to.have.property('isIntersecting');
  });

  it('does not observe when disabled', async () => {
    const el = await fixture<BxIntersectionObserver>(
      html`<bx-intersection-observer disabled></bx-intersection-observer>`,
    );
    let fired = false;
    el.addEventListener('bx-intersect', () => {
      fired = true;
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(fired).to.be.false;
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxIntersectionObserver>(
      html`<bx-intersection-observer><p>content</p></bx-intersection-observer>`,
    );
    await expect(el).to.be.accessible();
  });
});
