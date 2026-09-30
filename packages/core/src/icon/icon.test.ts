import { expect, oneEvent } from '@open-wc/testing';
import type { BxIcon } from './icon.ts';
import { registerIconLibrary } from './registry.ts';
import './index.ts';

const mounted: Element[] = [];
afterEach(() => {
  for (const el of mounted.splice(0)) el.remove();
});

/**
 * Attaches the event listener before connecting the element, unlike `fixture()` + `oneEvent()`.
 * The default library resolves synchronously (no network), so `bx-load`/`bx-error` can fire
 * before a listener added after `fixture()` returns ever attaches.
 */
function mount(attrs: Record<string, string>): {
  el: BxIcon;
  loaded: Promise<Event>;
} {
  const el = document.createElement('bx-icon') as BxIcon;
  for (const [name, value] of Object.entries(attrs))
    el.setAttribute(name, value);
  const loaded = Promise.race([
    oneEvent(el, 'bx-load'),
    oneEvent(el, 'bx-error'),
  ]);
  document.body.append(el);
  mounted.push(el);
  return { el, loaded };
}

describe('bx-icon', () => {
  it('registers the tag and renders a bundled default-library icon', async () => {
    const { el, loaded } = mount({ name: 'check' });
    await loaded;
    expect(el).to.be.instanceOf(customElements.get('bx-icon')!);
    expect(el.shadowRoot!.querySelector('svg')).to.exist;
  });

  it('is aria-hidden with no label, role=img with one', async () => {
    const { el, loaded } = mount({ name: 'check' });
    await loaded;
    const wrapper = el.shadowRoot!.querySelector('.svg')!;
    expect(wrapper.getAttribute('aria-hidden')).to.equal('true');
    expect(wrapper.getAttribute('role')).to.be.null;

    const { el: labelled, loaded: labelledLoaded } = mount({
      name: 'check',
      label: 'Done',
    });
    await labelledLoaded;
    const labelledWrapper = labelled.shadowRoot!.querySelector('.svg')!;
    expect(labelledWrapper.getAttribute('role')).to.equal('img');
    expect(labelledWrapper.getAttribute('aria-label')).to.equal('Done');
  });

  it('dispatches bx-error for an unknown icon name', async () => {
    const el = document.createElement('bx-icon') as BxIcon;
    el.setAttribute('name', 'does-not-exist');
    const errorPromise = oneEvent(el, 'bx-error');
    document.body.append(el);
    mounted.push(el);
    const event = await errorPromise;
    expect(event).to.exist;
    await el.updateComplete;
    const fallback = el.shadowRoot!.querySelector('svg[data-fallback]');
    expect(fallback).to.exist;
    expect(fallback!.querySelector('title')!.textContent).to.contain(
      'does-not-exist',
    );
  });

  it('resolves through a custom registered library', async () => {
    registerIconLibrary('test-lib', {
      resolver: () =>
        '<svg viewBox="0 0 10 10"><circle r="5" cx="5" cy="5"/></svg>',
    });
    const { el, loaded } = mount({ library: 'test-lib', name: 'dot' });
    await loaded;
    expect(el.shadowRoot!.querySelector('circle')).to.exist;
  });

  it('strips <script> tags from resolved markup', async () => {
    registerIconLibrary('unsafe-lib', {
      resolver: () =>
        '<svg viewBox="0 0 10 10"><script>window.__pwned = true;</script><circle r="5"/></svg>',
    });
    const { el, loaded } = mount({ library: 'unsafe-lib', name: 'x' });
    await loaded;
    expect(el.shadowRoot!.querySelector('script')).to.be.null;
    expect((window as unknown as { __pwned?: boolean }).__pwned).to.be
      .undefined;
  });

  it('has no axe violations, decorative or labelled', async () => {
    const { el, loaded } = mount({ name: 'check' });
    await loaded;
    await expect(el).to.be.accessible();

    const { el: labelled, loaded: labelledLoaded } = mount({
      name: 'check',
      label: 'Done',
    });
    await labelledLoaded;
    await expect(labelled).to.be.accessible();
  });
});
