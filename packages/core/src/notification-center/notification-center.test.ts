import { expect, fixture, html, aTimeout } from '@open-wc/testing';
import type {
  BxNotificationCenter,
  NotificationItem,
} from './notification-center.ts';
import { dayLabel } from './notification-center.ts';
import './index.ts';

const now = new Date();
const iso = (daysAgo: number) =>
  new Date(now.getTime() - daysAgo * 86400000).toISOString();
const items = (): NotificationItem[] => [
  { id: 'a', title: 'Build finished', body: 'main passed', time: iso(0) },
  {
    id: 'b',
    title: 'New comment',
    time: iso(0),
    read: true,
    actions: [{ id: 'reply', label: 'Reply' }],
  },
  { id: 'c', title: 'Invite', time: iso(1) },
  { id: 'd', title: 'Old news', time: iso(10), read: true },
];
const make = () =>
  html`<bx-notification-center
    style="margin: 14rem 0 0 20rem"
  ></bx-notification-center>`;
const rows = (el: BxNotificationCenter) => [
  ...el.shadowRoot!.querySelectorAll('.item'),
];

describe('dayLabel', () => {
  it('names today, yesterday and older days', () => {
    const d = new Date(2024, 4, 10, 15);
    expect(dayLabel('2024-05-10', d, 'en-US')).to.equal('Today');
    expect(dayLabel('2024-05-09', d, 'en-US')).to.equal('Yesterday');
    expect(dayLabel('2024-05-01', d, 'en-US')).to.equal('May 1, 2024');
  });
});

describe('bx-notification-center', () => {
  it('shows a bell with the derived unread count in its accessible name', async () => {
    const el = await fixture<BxNotificationCenter>(make());
    el.items = items();
    await el.updateComplete;
    expect(el.unread).to.equal(2);
    expect(
      el.shadowRoot!.querySelector('bx-badge')!.textContent!.trim(),
    ).to.equal('2');
    expect(
      el.shadowRoot!.querySelector('.trigger')!.getAttribute('label'),
    ).to.equal('Notifications, 2 unread');
  });

  it('prefers an explicit unread-count and caps the badge', async () => {
    const el = await fixture<BxNotificationCenter>(
      html`<bx-notification-center
        unread-count="150"
      ></bx-notification-center>`,
    );
    expect(
      el.shadowRoot!.querySelector('bx-badge')!.textContent!.trim(),
    ).to.equal('99+');
  });

  it('opens a panel grouped by day with relative times, and Escape closes it', async () => {
    const el = await fixture<BxNotificationCenter>(make());
    el.items = items();
    el.show();
    await aTimeout(60);
    expect(el.open).to.be.true;
    const headings = [...el.shadowRoot!.querySelectorAll('.group-heading')].map(
      (h) => h.textContent!.trim(),
    );
    expect(headings.slice(0, 2)).to.deep.equal(['Today', 'Yesterday']);
    expect(el.shadowRoot!.querySelector('bx-relative-time')).to.exist;
    el.shadowRoot!.querySelector('.panel')!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await el.updateComplete;
    expect(el.open).to.be.false;
  });

  it('marks an item read on click (bx-item-click then bx-mark-read) and applies it locally', async () => {
    const el = await fixture<BxNotificationCenter>(make());
    el.items = items();
    el.show();
    await aTimeout(60);
    const log: string[] = [];
    el.addEventListener('bx-item-click', (e) =>
      log.push(`click:${(e as CustomEvent).detail.item.id}`),
    );
    el.addEventListener('bx-mark-read', (e) =>
      log.push(`read:${(e as CustomEvent).detail.ids}`),
    );
    rows(el)[0]!.querySelector<HTMLElement>('.main')!.click();
    await el.updateComplete;
    expect(log).to.deep.equal(['click:a', 'read:a']);
    expect(el.unread).to.equal(1);
  });

  it('lets mark-all-read and dismiss be cancelled (controlled mode)', async () => {
    const el = await fixture<BxNotificationCenter>(make());
    el.items = items();
    el.show();
    await aTimeout(60);
    el.addEventListener('bx-mark-all-read', (e) => e.preventDefault(), {
      once: true,
    });
    el.shadowRoot!.querySelector<HTMLElement>('.head bx-button')!.click();
    await el.updateComplete;
    expect(el.unread).to.equal(2);
    el.shadowRoot!.querySelector<HTMLElement>('.head bx-button')!.click();
    await el.updateComplete;
    expect(el.unread).to.equal(0);

    let dismissed = '';
    el.addEventListener(
      'bx-dismiss',
      (e) => (dismissed = (e as CustomEvent).detail.id),
    );
    await aTimeout(30);
    rows(el)[0]!.querySelector<HTMLElement>('bx-icon-button')!.click();
    await el.updateComplete;
    expect(dismissed).to.equal('a');
    expect(el.items.some((i) => i.id === 'a')).to.be.false;
  });

  it('fires bx-action for item actions and shows the empty state', async () => {
    const el = await fixture<BxNotificationCenter>(make());
    el.items = items();
    el.show();
    await aTimeout(60);
    let action = '';
    el.addEventListener(
      'bx-action',
      (e) => (action = (e as CustomEvent).detail.action.id),
    );
    rows(el)[1]!.querySelector<HTMLElement>('.actions bx-button')!.click();
    expect(action).to.equal('reply');
    el.items = [];
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.empty')!.textContent).to.contain(
      'No notifications',
    );
  });

  it('fires bx-load-more once when the end of the list is in view', async () => {
    const el = await fixture<BxNotificationCenter>(make());
    el.items = items();
    let more = 0;
    el.addEventListener('bx-load-more', () => more++);
    el.show();
    await aTimeout(250);
    expect(more).to.equal(1);
    el.items = [...el.items, { id: 'n', title: 'Newer', time: iso(0) }];
    await aTimeout(100);
    const list = el.shadowRoot!.querySelector<HTMLElement>('.list')!;
    list.scrollTop = list.scrollHeight; // a longer list only asks again once scrolled to its end
    list.dispatchEvent(new Event('scroll'));
    await aTimeout(50);
    expect(more).to.equal(2);
  });

  it('announces unread changes politely', async () => {
    const el = await fixture<BxNotificationCenter>(make());
    el.items = items();
    await el.updateComplete;
    el.items = [...el.items, { id: 'z', title: 'Another', time: iso(0) }];
    await el.updateComplete;
    expect(
      el.shadowRoot!.querySelector('[aria-live=polite]')!.textContent,
    ).to.contain('3 unread notifications');
  });

  it('has no axe violations closed and open', async () => {
    const el = await fixture<BxNotificationCenter>(make());
    el.items = items();
    await el.updateComplete;
    await expect(el).to.be.accessible();
    el.show();
    await aTimeout(120);
    await expect(el).to.be.accessible();
  });
});
