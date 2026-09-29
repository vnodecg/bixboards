import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxInclude } from './include.ts';
import './index.ts';

function stubFetch(body: string, ok = true): () => void {
  const original = window.fetch;
  window.fetch = (async () =>
    ({
      ok,
      status: ok ? 200 : 500,
      statusText: ok ? 'OK' : 'Internal Server Error',
      text: async () => body,
    }) as Response) as typeof fetch;
  return () => {
    window.fetch = original;
  };
}

/** Creates a disconnected `<bx-include>`, attaches listeners, then sets `src` to trigger the fetch. */
async function loadInclude(src: string): Promise<BxInclude> {
  const el = await fixture<BxInclude>(html`<bx-include></bx-include>`);
  const eventPromise = Promise.race([
    oneEvent(el, 'bx-load'),
    oneEvent(el, 'bx-error'),
  ]);
  el.src = src;
  await eventPromise;
  return el;
}

describe('bx-include', () => {
  it('registers the tag', async () => {
    const el = await fixture<BxInclude>(html`<bx-include></bx-include>`);
    expect(el).to.be.instanceOf(customElements.get('bx-include')!);
  });

  it('fetches and inlines HTML, firing bx-load', async () => {
    const restore = stubFetch('<p>hello</p>');
    try {
      const el = await fixture<BxInclude>(html`<bx-include></bx-include>`);
      const eventPromise = oneEvent(el, 'bx-load');
      el.src = '/fragment.html';
      const event = await eventPromise;
      expect(event.detail.url).to.equal('/fragment.html');
      expect(el.shadowRoot!.querySelector('p')!.textContent).to.equal('hello');
    } finally {
      restore();
    }
  });

  it('strips <script> tags by default', async () => {
    const restore = stubFetch(
      '<p>safe</p><script>window.__bxIncludeHacked = true;</script>',
    );
    try {
      const el = await loadInclude('/fragment.html');
      expect(el.shadowRoot!.querySelector('script')).to.not.exist;
      expect((window as unknown as Record<string, unknown>).__bxIncludeHacked)
        .to.be.undefined;
    } finally {
      restore();
    }
  });

  it('strips on* attributes by default', async () => {
    const restore = stubFetch('<button onclick="alert(1)">x</button>');
    try {
      const el = await loadInclude('/fragment.html');
      expect(el.shadowRoot!.querySelector('button')!.hasAttribute('onclick')).to
        .be.false;
    } finally {
      restore();
    }
  });

  it('executes scripts when allow-scripts is set', async () => {
    const restore = stubFetch('<script>window.__bxIncludeRan = true;</script>');
    try {
      const el = await fixture<BxInclude>(
        html`<bx-include allow-scripts></bx-include>`,
      );
      const eventPromise = oneEvent(el, 'bx-load');
      el.src = '/fragment.html';
      await eventPromise;
      expect((window as unknown as Record<string, unknown>).__bxIncludeRan).to
        .be.true;
    } finally {
      delete (window as unknown as Record<string, unknown>).__bxIncludeRan;
      restore();
    }
  });

  it('fires bx-error on a failed fetch', async () => {
    const restore = stubFetch('', false);
    try {
      const el = await fixture<BxInclude>(html`<bx-include></bx-include>`);
      const eventPromise = oneEvent(el, 'bx-error');
      el.src = '/missing.html';
      const event = await eventPromise;
      expect(event.detail.url).to.equal('/missing.html');
    } finally {
      restore();
    }
  });

  it('has no axe violations', async () => {
    const restore = stubFetch('<p>content</p>');
    try {
      const el = await loadInclude('/fragment.html');
      await expect(el).to.be.accessible();
    } finally {
      restore();
    }
  });
});
