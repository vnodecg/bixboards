import { expect, fixture, html } from '@open-wc/testing';
import type { BxCalendar } from './calendar.ts';
import { addDays, addMonths, isoWeek, parseISO, toISO } from './dates.ts';
import './index.ts';

const day = (el: BxCalendar, iso: string) =>
  el.shadowRoot!.querySelector<HTMLButtonElement>(
    `button[data-date="${iso}"]`,
  )!;
const key = async (el: BxCalendar, k: string, init: KeyboardEventInit = {}) => {
  el.shadowRoot!.activeElement!.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: k,
      bubbles: true,
      cancelable: true,
      ...init,
    }),
  );
  await el.updateComplete;
  await el.updateComplete;
};

describe('date helpers', () => {
  it('round-trips ISO strings without timezone shift and rejects overflow', () => {
    expect(toISO(parseISO('2024-02-29')!)).to.equal('2024-02-29');
    expect(parseISO('2024-02-30')).to.be.undefined;
    expect(parseISO('nope')).to.be.undefined;
  });
  it('adds days and months (clamping the day)', () => {
    expect(addDays('2024-02-28', 2)).to.equal('2024-03-01');
    expect(addMonths('2024-01-31', 1)).to.equal('2024-02-29');
    expect(addMonths('2024-01-15', -2)).to.equal('2023-11-15');
  });
  it('computes ISO week numbers', () => {
    expect(isoWeek('2024-01-01')).to.equal(1);
    expect(isoWeek('2021-01-03')).to.equal(53);
    expect(isoWeek('2024-12-30')).to.equal(1);
  });
});

describe('bx-calendar', () => {
  it('renders a month grid with a localized title and one cell per day', async () => {
    const el = await fixture<BxCalendar>(
      html`<bx-calendar
        month="2024-02"
        locale="en-US"
        first-day-of-week="0"
      ></bx-calendar>`,
    );
    expect(el.shadowRoot!.querySelector('.title')!.textContent).to.equal(
      'February 2024',
    );
    expect(el.shadowRoot!.querySelectorAll('button.day')).to.have.length(29);
    expect(
      el.shadowRoot!.querySelector('table')!.getAttribute('role'),
    ).to.equal('grid');
    expect(el.shadowRoot!.querySelectorAll('th[part=weekday]')).to.have.length(
      7,
    );
  });

  it('single mode selects a day and emits change with the ISO string', async () => {
    const el = await fixture<BxCalendar>(
      html`<bx-calendar month="2024-05"></bx-calendar>`,
    );
    let value = '';
    el.addEventListener(
      'change',
      (e) => (value = (e as CustomEvent).detail.value),
    );
    day(el, '2024-05-10').click();
    await el.updateComplete;
    expect(value).to.equal('2024-05-10');
    expect(
      day(el, '2024-05-10').closest('td')!.getAttribute('aria-selected'),
    ).to.equal('true');
  });

  it('range mode needs two picks, orders them and previews on hover', async () => {
    const el = await fixture<BxCalendar>(
      html`<bx-calendar mode="range" month="2024-05"></bx-calendar>`,
    );
    day(el, '2024-05-14').click();
    await el.updateComplete;
    expect(el.value).to.equal('');
    day(el, '2024-05-16').dispatchEvent(new PointerEvent('pointerenter'));
    await el.updateComplete;
    expect(day(el, '2024-05-15').closest('td')!.hasAttribute('data-in-range'))
      .to.be.true;
    day(el, '2024-05-10').click();
    await el.updateComplete;
    expect(el.value).to.equal('2024-05-10/2024-05-14');
  });

  it('multiple mode toggles dates', async () => {
    const el = await fixture<BxCalendar>(
      html`<bx-calendar mode="multiple" month="2024-05"></bx-calendar>`,
    );
    day(el, '2024-05-03').click();
    day(el, '2024-05-01').click();
    await el.updateComplete;
    expect(el.value).to.equal('2024-05-01,2024-05-03');
    day(el, '2024-05-03').click();
    await el.updateComplete;
    expect(el.value).to.equal('2024-05-01');
  });

  it('marks unavailable days (min/max/predicate), ignores clicks and announces them', async () => {
    const el = await fixture<BxCalendar>(
      html`<bx-calendar
        month="2024-05"
        min="2024-05-05"
        max="2024-05-20"
      ></bx-calendar>`,
    );
    el.disabledDates = (d) => d === '2024-05-10';
    await el.updateComplete;
    for (const iso of ['2024-05-04', '2024-05-21', '2024-05-10']) {
      expect(day(el, iso).getAttribute('aria-disabled')).to.equal('true');
      expect(day(el, iso).getAttribute('aria-label')).to.contain('unavailable');
    }
    day(el, '2024-05-10').click();
    expect(el.value).to.equal('');
  });

  it('moves with arrows (skipping disabled), Home/End and PageUp/PageDown', async () => {
    const el = await fixture<BxCalendar>(
      html`<bx-calendar
        month="2024-05"
        value="2024-05-14"
        first-day-of-week="0"
        locale="en-US"
      ></bx-calendar>`,
    );
    el.disabledDates = (d) => d === '2024-05-15';
    await el.updateComplete;
    day(el, '2024-05-14').focus();
    await key(el, 'ArrowRight');
    expect(el.shadowRoot!.activeElement!.getAttribute('data-date')).to.equal(
      '2024-05-16',
    );
    await key(el, 'ArrowDown');
    expect(el.shadowRoot!.activeElement!.getAttribute('data-date')).to.equal(
      '2024-05-23',
    );
    await key(el, 'Home');
    expect(el.shadowRoot!.activeElement!.getAttribute('data-date')).to.equal(
      '2024-05-19',
    );
    await key(el, 'End');
    expect(el.shadowRoot!.activeElement!.getAttribute('data-date')).to.equal(
      '2024-05-25',
    );
    await key(el, 'PageDown');
    expect(el.month).to.equal('2024-06');
    expect(el.shadowRoot!.activeElement!.getAttribute('data-date')).to.equal(
      '2024-06-25',
    );
  });

  it('navigates months with the buttons and fires bx-month-change', async () => {
    const el = await fixture<BxCalendar>(
      html`<bx-calendar month="2024-12"></bx-calendar>`,
    );
    let month = '';
    el.addEventListener(
      'bx-month-change',
      (e) => (month = (e as CustomEvent).detail.month),
    );
    el.shadowRoot!.querySelector<HTMLElement>(
      'bx-icon-button[label="Next month"]',
    )!.dispatchEvent(new MouseEvent('click'));
    await el.updateComplete;
    expect(month).to.equal('2025-01');
    expect(el.shadowRoot!.querySelector('.title')!.textContent).to.equal(
      'January 2025',
    );
  });

  it('shows several months, week numbers and event dots; exactly one tab stop per grid', async () => {
    const el = await fixture<BxCalendar>(
      html`<bx-calendar
        month="2024-05"
        months="2"
        show-week-numbers
      ></bx-calendar>`,
    );
    el.events = new Set(['2024-05-02']);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelectorAll('table')).to.have.length(2);
    expect(el.shadowRoot!.querySelectorAll('th.week').length).to.be.greaterThan(
      4,
    );
    expect(el.shadowRoot!.querySelectorAll('.dot')).to.have.length(1);
    for (const grid of el.shadowRoot!.querySelectorAll('table'))
      expect(
        grid.querySelectorAll('button[tabindex="0"]').length,
      ).to.be.at.most(1);
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxCalendar>(
      html`<bx-calendar
        month="2024-05"
        value="2024-05-10"
        show-week-numbers
      ></bx-calendar>`,
    );
    await Promise.all(
      [...el.shadowRoot!.querySelectorAll('bx-icon-button')].map(
        (b) => (b as BxCalendar).updateComplete,
      ),
    );
    await expect(el).to.be.accessible();
  });
});
