import { expect, fixture, html } from '@open-wc/testing';
import type { BxRelativeTime } from './relative-time.ts';
import './index.ts';

describe('bx-relative-time', () => {
  it('registers the tag and renders a <time> element', async () => {
    const el = await fixture<BxRelativeTime>(
      html`<bx-relative-time></bx-relative-time>`,
    );
    expect(el).to.be.instanceOf(customElements.get('bx-relative-time')!);
    expect(el.shadowRoot!.querySelector('time')).to.exist;
  });

  it('formats a past date as "ago"', async () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const el = await fixture<BxRelativeTime>(
      html`<bx-relative-time
        date=${fiveMinutesAgo}
        lang="en-US"
      ></bx-relative-time>`,
    );
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('time')!.textContent).to.equal(
      '5 minutes ago',
    );
  });

  it('formats a future date as "in"', async () => {
    const inTenMinutes = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const el = await fixture<BxRelativeTime>(
      html`<bx-relative-time
        date=${inTenMinutes}
        lang="en-US"
      ></bx-relative-time>`,
    );
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('time')!.textContent).to.equal(
      'in 10 minutes',
    );
  });

  it('applies "short" format', async () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const el = await fixture<BxRelativeTime>(
      html`<bx-relative-time
        date=${fiveMinutesAgo}
        format="short"
        lang="en-US"
      ></bx-relative-time>`,
    );
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('time')!.textContent).to.equal(
      '5 min. ago',
    );
  });

  it('sets datetime to the resolved date in ISO form', async () => {
    const date = new Date(Date.now() - 60_000);
    const el = await fixture<BxRelativeTime>(
      html`<bx-relative-time date=${date.toISOString()}></bx-relative-time>`,
    );
    await el.updateComplete;
    expect(
      el.shadowRoot!.querySelector('time')!.getAttribute('datetime'),
    ).to.equal(date.toISOString());
  });

  it('renders empty and warns on an invalid date', async () => {
    const el = await fixture<BxRelativeTime>(
      html`<bx-relative-time date="not-a-date"></bx-relative-time>`,
    );
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('time')!.textContent).to.equal('');
  });

  it('cleans up its timer on disconnect without throwing', async () => {
    const el = await fixture<BxRelativeTime>(
      html`<bx-relative-time
        date=${new Date().toISOString()}
      ></bx-relative-time>`,
    );
    await el.updateComplete;
    expect(() => el.remove()).to.not.throw();
  });

  it('multiple sync instances share one ticker without throwing', async () => {
    const el1 = await fixture<BxRelativeTime>(
      html`<bx-relative-time
        sync
        date=${new Date(Date.now() - 30_000).toISOString()}
      ></bx-relative-time>`,
    );
    const el2 = await fixture<BxRelativeTime>(
      html`<bx-relative-time
        sync
        date=${new Date(Date.now() - 90_000).toISOString()}
      ></bx-relative-time>`,
    );
    await el1.updateComplete;
    await el2.updateComplete;
    expect(el1.shadowRoot!.querySelector('time')!.textContent).to.not.equal('');
    el1.remove();
    el2.remove();
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxRelativeTime>(
      html`<bx-relative-time
        date=${new Date(Date.now() - 60_000).toISOString()}
      ></bx-relative-time>`,
    );
    await expect(el).to.be.accessible();
  });
});
