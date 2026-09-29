import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxMutationObserver } from './mutation-observer.ts';
import './index.ts';

describe('bx-mutation-observer', () => {
  it('registers the tag and renders its slot', async () => {
    const el = await fixture<BxMutationObserver>(
      html`<bx-mutation-observer><p>content</p></bx-mutation-observer>`,
    );
    expect(el).to.be.instanceOf(customElements.get('bx-mutation-observer')!);
    expect(el.querySelector('p')).to.exist;
  });

  it('fires bx-mutation on a child-list change', async () => {
    const el = await fixture<BxMutationObserver>(
      html`<bx-mutation-observer child-list></bx-mutation-observer>`,
    );
    const eventPromise = oneEvent(el, 'bx-mutation');
    const child = document.createElement('span');
    el.appendChild(child);
    const event = await eventPromise;
    expect(event.detail.mutationList).to.have.lengthOf.at.least(1);
    expect(event.detail.mutationList[0].type).to.equal('childList');
  });

  it('fires bx-mutation with old value on an attribute change', async () => {
    const el = await fixture<BxMutationObserver>(
      html`<bx-mutation-observer
        attr="data-foo"
        attr-old-value
      ></bx-mutation-observer>`,
    );
    el.setAttribute('data-foo', 'initial');
    await new Promise((resolve) => setTimeout(resolve, 0));

    const eventPromise = oneEvent(el, 'bx-mutation');
    el.setAttribute('data-foo', 'changed');
    const event = await eventPromise;
    const record = event.detail.mutationList[0];
    expect(record.type).to.equal('attributes');
    expect(record.attributeName).to.equal('data-foo');
    expect(record.oldValue).to.equal('initial');
  });

  it('does not observe when disabled', async () => {
    const el = await fixture<BxMutationObserver>(
      html`<bx-mutation-observer disabled child-list></bx-mutation-observer>`,
    );
    let fired = false;
    el.addEventListener('bx-mutation', () => {
      fired = true;
    });
    el.appendChild(document.createElement('span'));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(fired).to.be.false;
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxMutationObserver>(
      html`<bx-mutation-observer><p>content</p></bx-mutation-observer>`,
    );
    await expect(el).to.be.accessible();
  });
});
