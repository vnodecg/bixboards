import { expect } from '@open-wc/testing';
import { html } from 'lit';
import { BixElement } from './bix-element.ts';

let uid = 0;
/** A fresh subclass + unique tag name per test, so registrations never collide. */
function uniqueSubclass(): { Ctor: typeof BixElement; tag: string } {
  const tag = `bx-test-element-${++uid}`;
  class TestElement extends BixElement {
    static override tagName = tag;
    protected override render() {
      return html`<span>ok</span>`;
    }
  }
  return { Ctor: TestElement, tag };
}

/** Creates, appends and upgrades an element by tag name (dynamic tags aren't expressible in `html`). */
async function mount(tag: string): Promise<HTMLElement> {
  const el = document.createElement(tag);
  document.body.appendChild(el);
  if ('updateComplete' in el)
    await (el as unknown as { updateComplete: Promise<unknown> })
      .updateComplete;
  return el;
}

describe('BixElement', () => {
  it('define() registers the class under its static tagName', () => {
    const { Ctor, tag } = uniqueSubclass();
    Ctor.define();
    expect(customElements.get(tag)).to.equal(Ctor);
  });

  it('define() is idempotent when called more than once', () => {
    const { Ctor, tag } = uniqueSubclass();
    Ctor.define();
    expect(() => Ctor.define()).to.not.throw();
    expect(customElements.get(tag)).to.equal(Ctor);
  });

  it('define(tagName) registers under a custom name instead', () => {
    const { Ctor } = uniqueSubclass();
    const customTag = `bx-custom-${++uid}`;
    Ctor.define(customTag);
    expect(customElements.get(customTag)).to.equal(Ctor);
    // The class's own static tagName is untouched by a one-off custom registration.
    expect(customElements.get(Ctor.tagName)).to.be.undefined;
  });

  it('throws when neither tagName nor an argument is given', () => {
    class NoTag extends BixElement {
      protected override render() {
        return html``;
      }
    }
    expect(() => NoTag.define()).to.throw(/no default tag name/);
  });

  it('an element registered via define() renders and upgrades normally', async () => {
    const { Ctor, tag } = uniqueSubclass();
    Ctor.define();
    const el = await mount(tag);
    expect(el.shadowRoot?.textContent?.trim()).to.equal('ok');
    el.remove();
  });

  it('reflects prefers-reduced-motion via the protected getter', async () => {
    const tag = `bx-test-reduced-motion-${++uid}`;
    let observed: boolean | undefined;
    class ReducedMotionProbe extends BixElement {
      static override tagName = tag;
      protected override render() {
        observed = this.prefersReducedMotion;
        return html``;
      }
    }
    ReducedMotionProbe.define();

    const originalMatchMedia = window.matchMedia;
    window.matchMedia = ((query: string) =>
      ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        addEventListener() {},
        removeEventListener() {},
      }) as unknown as MediaQueryList) as typeof window.matchMedia;

    try {
      const el = await mount(tag);
      expect(observed).to.be.true;
      el.remove();
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it('baseStyles resets box-sizing to border-box on the host', async () => {
    const tag = `bx-test-boxsizing-${++uid}`;
    class BoxSizingTest extends BixElement {
      static override tagName = tag;
      static override styles = [BixElement.baseStyles];
      protected override render() {
        return html`<div></div>`;
      }
    }
    BoxSizingTest.define();
    const el = await mount(tag);
    expect(getComputedStyle(el).boxSizing).to.equal('border-box');
    el.remove();
  });
});
