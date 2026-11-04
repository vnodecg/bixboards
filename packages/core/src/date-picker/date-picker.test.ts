import { expect, fixture, html, aTimeout } from '@open-wc/testing';
import type { BxDatePicker } from './date-picker.ts';
import { parseTypedDate } from './date-picker.ts';
import './index.ts';

const input = (el: BxDatePicker) => el.shadowRoot!.querySelector('input')!;
const type = async (el: BxDatePicker, text: string) => {
  const i = input(el);
  i.focus();
  i.value = text;
  i.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  await el.updateComplete;
};
const enter = async (el: BxDatePicker) => {
  input(el).dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
  );
  await el.updateComplete;
};
const cal = (el: BxDatePicker) => el.shadowRoot!.querySelector('bx-calendar')!;
const dayBtn = (el: BxDatePicker, iso: string) =>
  cal(el).shadowRoot!.querySelector<HTMLButtonElement>(
    `button[data-date="${iso}"]`,
  )!;

describe('parseTypedDate', () => {
  it('reads ISO and locale-ordered numeric dates', () => {
    expect(parseTypedDate('2024-05-09', 'en-US')).to.equal('2024-05-09');
    expect(parseTypedDate('5/9/2024', 'en-US')).to.equal('2024-05-09');
    expect(parseTypedDate('9/5/2024', 'en-GB')).to.equal('2024-05-09');
    expect(parseTypedDate('09.05.2024', 'de-DE')).to.equal('2024-05-09');
  });
  it('rejects non-dates', () => {
    expect(parseTypedDate('2/30/2024', 'en-US')).to.be.undefined;
    expect(parseTypedDate('tomorrow', 'en-US')).to.be.undefined;
    expect(parseTypedDate('', 'en-US')).to.be.undefined;
  });
});

describe('bx-date-picker', () => {
  it('formats the value for display', async () => {
    const el = await fixture<BxDatePicker>(
      html`<bx-date-picker
        locale="en-US"
        value="2024-05-09"
        label="Due"
      ></bx-date-picker>`,
    );
    expect(input(el).value).to.equal('May 9, 2024');
  });

  it('commits typed dates on Enter (emitting change) and reverts invalid ones', async () => {
    const el = await fixture<BxDatePicker>(
      html`<bx-date-picker locale="en-US"></bx-date-picker>`,
    );
    let changes = 0;
    let invalid = 0;
    el.addEventListener('change', () => changes++);
    el.addEventListener('bx-invalid', () => invalid++);
    await type(el, '5/9/2024');
    await enter(el);
    expect(el.value).to.equal('2024-05-09');
    expect(changes).to.equal(1);
    await type(el, 'garbage');
    await enter(el);
    expect(el.value).to.equal('2024-05-09');
    expect(invalid).to.equal(1);
    expect(el.invalid).to.be.true;
    expect(input(el).value).to.equal('May 9, 2024');
  });

  it('enforces min/max on typed entry', async () => {
    const el = await fixture<BxDatePicker>(
      html`<bx-date-picker locale="en-US" min="2024-05-10"></bx-date-picker>`,
    );
    await type(el, '5/9/2024');
    await enter(el);
    expect(el.value).to.equal('');
    expect(el.invalid).to.be.true;
  });

  it('opens the calendar from the button, picks a day, closes and returns focus', async () => {
    const el = await fixture<BxDatePicker>(
      html`<bx-date-picker locale="en-US" value="2024-05-09"></bx-date-picker>`,
    );
    el.shadowRoot!.querySelector<HTMLElement>('.trigger')!.click();
    await aTimeout(100);
    expect(el.open).to.be.true;
    expect(
      el.shadowRoot!.querySelector('.trigger')!.getAttribute('aria-expanded'),
    ).to.equal('true');
    dayBtn(el, '2024-05-20').click();
    await aTimeout(50);
    expect(el.value).to.equal('2024-05-20');
    expect(el.open).to.be.false;
    expect(input(el).value).to.equal('May 20, 2024');
    expect(el.shadowRoot!.activeElement).to.equal(input(el));
  });

  it('range mode needs both ends before closing', async () => {
    const el = await fixture<BxDatePicker>(
      html`<bx-date-picker
        range
        locale="en-US"
        value="2024-05-01/2024-05-03"
      ></bx-date-picker>`,
    );
    el.show();
    await aTimeout(100);
    dayBtn(el, '2024-05-10').click();
    await aTimeout(30);
    expect(el.open).to.be.true;
    dayBtn(el, '2024-05-12').click();
    await aTimeout(30);
    expect(el.value).to.equal('2024-05-10/2024-05-12');
    expect(el.open).to.be.false;
    await type(el, 'May 20, 2024 – May 18, 2024');
    expect(input(el).value.length).to.be.greaterThan(5);
  });

  it('closes on Escape and ArrowDown opens it', async () => {
    const el = await fixture<BxDatePicker>(
      html`<bx-date-picker></bx-date-picker>`,
    );
    input(el).dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    await aTimeout(50);
    expect(el.open).to.be.true;
    input(el).dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    await el.updateComplete;
    expect(el.open).to.be.false;
  });

  it('is form-associated, required-aware and resets', async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form>
        <bx-date-picker name="d" required value="2024-05-09"></bx-date-picker>
      </form>`,
    );
    const el = form.querySelector('bx-date-picker') as BxDatePicker;
    await el.updateComplete;
    expect(new FormData(form).get('d')).to.equal('2024-05-09');
    el.value = '';
    await el.updateComplete;
    expect(el.checkValidity()).to.be.false;
    form.reset();
    await el.updateComplete;
    expect(el.value).to.equal('2024-05-09');
  });

  it('has no axe violations closed and open', async () => {
    const el = await fixture<BxDatePicker>(
      html`<bx-date-picker
        label="Start date"
        locale="en-US"
        value="2024-05-09"
      ></bx-date-picker>`,
    );
    await expect(el).to.be.accessible();
    el.show();
    await aTimeout(150);
    await expect(el).to.be.accessible();
  });
});
