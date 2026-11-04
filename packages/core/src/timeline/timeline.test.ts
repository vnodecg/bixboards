import { expect, fixture, html } from '@open-wc/testing';
import type { BxTimeline } from './timeline.ts';
import type { BxTimelineItem } from '../timeline-item/timeline-item.ts';
import './index.ts';

const make = (layout = 'start') =>
  html` <bx-timeline layout=${layout} style="inline-size: 50rem">
    <bx-timeline-item
      heading="Created"
      time="2024-01-02T10:00:00Z"
      description="Order placed"
    ></bx-timeline-item>
    <bx-timeline-item heading="Shipped" status="default" icon="check"
      >On its way</bx-timeline-item
    >
    <bx-timeline-item heading="Delivered" status="error"></bx-timeline-item>
  </bx-timeline>`;

describe('bx-timeline', () => {
  it('is a list of listitems and marks the last item', async () => {
    const el = await fixture<BxTimeline>(make());
    const items = [...el.querySelectorAll<BxTimelineItem>('bx-timeline-item')];
    await Promise.all(items.map((i) => i.updateComplete));
    expect(el.getAttribute('role')).to.equal('list');
    expect(items.every((i) => i.getAttribute('role') === 'listitem')).to.be
      .true;
    expect(items.map((i) => i.last)).to.deep.equal([false, false, true]);
  });

  it('alternates item positions in alternate layout only', async () => {
    const el = await fixture<BxTimeline>(make('alternate'));
    const items = [...el.querySelectorAll<BxTimelineItem>('bx-timeline-item')];
    expect(items.map((i) => i.position)).to.deep.equal(['end', 'start', 'end']);
    el.layout = 'start';
    await el.updateComplete;
    await items[0].updateComplete;
    expect(items.every((i) => !i.hasAttribute('position'))).to.be.true;
  });

  it('formats the time with bx-format-date, or bx-relative-time when relative', async () => {
    const el = await fixture<BxTimeline>(make());
    const first = el.querySelector<BxTimelineItem>('bx-timeline-item')!;
    await first.updateComplete;
    expect(first.shadowRoot!.querySelector('bx-format-date')).to.exist;
    first.relative = true;
    await first.updateComplete;
    expect(first.shadowRoot!.querySelector('bx-relative-time')).to.exist;
  });

  it('keeps a marker (hidden from AT) and the content on every item', async () => {
    const el = await fixture<BxTimeline>(make());
    const item = el.querySelector<BxTimelineItem>('bx-timeline-item')!;
    await item.updateComplete;
    expect(
      item.shadowRoot!.querySelector('.marker')!.getAttribute('aria-hidden'),
    ).to.equal('true');
    expect(item.shadowRoot!.querySelector('.heading')!.textContent).to.equal(
      'Created',
    );
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxTimeline>(make());
    await Promise.all(
      [...el.querySelectorAll<BxTimelineItem>('bx-timeline-item')].map(
        (i) => i.updateComplete,
      ),
    );
    await expect(el).to.be.accessible();
  });
});
