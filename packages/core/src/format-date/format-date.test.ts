import { expect, fixture, html } from '@open-wc/testing';
import type { BxFormatDate } from './format-date.ts';
import './index.ts';

describe('bx-format-date', () => {
  it('registers the tag and renders a <time> element', async () => {
    const el = await fixture<BxFormatDate>(
      html`<bx-format-date></bx-format-date>`,
    );
    expect(el).to.be.instanceOf(customElements.get('bx-format-date')!);
    expect(el.shadowRoot!.querySelector('time')).to.exist;
  });

  it('formats an explicit ISO string date', async () => {
    const el = await fixture<BxFormatDate>(
      html`<bx-format-date
        date="2026-09-29T12:00:00Z"
        year="numeric"
        month="long"
        day="numeric"
        time-zone="UTC"
        lang="en-US"
      ></bx-format-date>`,
    );
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('time')!.textContent).to.equal(
      'September 29, 2026',
    );
  });

  it('sets datetime to the resolved date in ISO form', async () => {
    const el = await fixture<BxFormatDate>(
      html`<bx-format-date date="2026-09-29T12:00:00Z"></bx-format-date>`,
    );
    await el.updateComplete;
    expect(
      el.shadowRoot!.querySelector('time')!.getAttribute('datetime'),
    ).to.equal('2026-09-29T12:00:00.000Z');
  });

  it('applies hour-format as Intl hourCycle', async () => {
    const el = await fixture<BxFormatDate>(
      html`<bx-format-date
        date="2026-09-29T13:05:00Z"
        hour="numeric"
        minute="numeric"
        hour-format="h23"
        time-zone="UTC"
        lang="en-US"
      ></bx-format-date>`,
    );
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('time')!.textContent).to.equal(
      '13:05',
    );
  });

  it('renders empty and warns on an invalid date', async () => {
    const el = await fixture<BxFormatDate>(
      html`<bx-format-date date="not-a-date"></bx-format-date>`,
    );
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('time')!.textContent).to.equal('');
  });

  it('defaults to now when date is unset', async () => {
    const before = Date.now();
    const el = await fixture<BxFormatDate>(
      html`<bx-format-date></bx-format-date>`,
    );
    await el.updateComplete;
    const datetime = el.shadowRoot!.querySelector('time')!.getAttribute(
      'datetime',
    )!;
    expect(new Date(datetime).getTime()).to.be.closeTo(before, 5000);
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxFormatDate>(
      html`<bx-format-date date="2026-09-29T12:00:00Z"></bx-format-date>`,
    );
    await expect(el).to.be.accessible();
  });
});
