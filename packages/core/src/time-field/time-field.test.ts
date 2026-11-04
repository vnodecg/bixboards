import { expect, fixture, html } from '@open-wc/testing';
import type { BxTimeField } from './time-field.ts';
import { localeIs12h, parseTime } from './time-field.ts';
import './index.ts';

const seg = (el: BxTimeField, i: number) =>
  el.shadowRoot!.querySelectorAll<HTMLElement>('.segment')[i];
const press = async (el: BxTimeField, i: number, key: string) => {
  seg(el, i).focus();
  seg(el, i).dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
  );
  await el.updateComplete;
};
const texts = (el: BxTimeField) =>
  [...el.shadowRoot!.querySelectorAll('.segment')].map((s) =>
    s.textContent!.trim(),
  );

describe('time helpers', () => {
  it('parses HH:mm[:ss] and rejects the rest', () => {
    expect(parseTime('09:05')).to.deep.equal({ h: 9, m: 5, s: 0 });
    expect(parseTime('23:59:58')).to.deep.equal({ h: 23, m: 59, s: 58 });
    expect(parseTime('24:00')).to.be.undefined;
    expect(parseTime('nope')).to.be.undefined;
  });
  it('detects 12h locales', () => {
    expect(localeIs12h('en-US')).to.be.true;
    expect(localeIs12h('de-DE')).to.be.false;
  });
});

describe('bx-time-field', () => {
  it('shows a 24-hour value as spinbutton segments', async () => {
    const el = await fixture<BxTimeField>(
      html`<bx-time-field
        hour-cycle="h23"
        value="14:05"
        label="Start"
      ></bx-time-field>`,
    );
    expect(texts(el)).to.deep.equal(['14', '05']);
    const hour = seg(el, 0);
    expect(hour.getAttribute('role')).to.equal('spinbutton');
    expect(hour.getAttribute('aria-valuemin')).to.equal('0');
    expect(hour.getAttribute('aria-valuemax')).to.equal('23');
    expect(hour.getAttribute('aria-valuenow')).to.equal('14');
  });

  it('shows 12-hour time with AM/PM and keeps the value in 24-hour form', async () => {
    const el = await fixture<BxTimeField>(
      html`<bx-time-field hour-cycle="h12" value="14:05"></bx-time-field>`,
    );
    expect(texts(el)).to.deep.equal(['02', '05', 'PM']);
    await press(el, 2, 'a');
    expect(el.value).to.equal('02:05');
    await press(el, 2, 'p');
    expect(el.value).to.equal('14:05');
  });

  it('types digits with auto-advance and commits a complete value', async () => {
    const el = await fixture<BxTimeField>(
      html`<bx-time-field hour-cycle="h23"></bx-time-field>`,
    );
    let changes = 0;
    el.addEventListener('change', () => changes++);
    await press(el, 0, '1');
    expect(el.value).to.equal('');
    await press(el, 0, '4');
    expect(el.shadowRoot!.activeElement).to.equal(seg(el, 1));
    await press(el, 1, '3');
    await press(el, 1, '0');
    expect(el.value).to.equal('14:30');
    expect(changes).to.be.greaterThan(0);
  });

  it('advances immediately when a digit cannot be extended (hour 3 -> 03)', async () => {
    const el = await fixture<BxTimeField>(
      html`<bx-time-field hour-cycle="h23"></bx-time-field>`,
    );
    await press(el, 0, '3');
    expect(texts(el)[0]).to.equal('03');
    expect(el.shadowRoot!.activeElement).to.equal(seg(el, 1));
  });

  it('steps with arrows (minutes by step), wraps, and supports Home/End/PageUp', async () => {
    const el = await fixture<BxTimeField>(
      html`<bx-time-field
        hour-cycle="h23"
        value="23:55"
        step="5"
      ></bx-time-field>`,
    );
    await press(el, 1, 'ArrowUp');
    expect(el.value).to.equal('23:00');
    await press(el, 0, 'ArrowUp');
    expect(el.value).to.equal('00:00');
    await press(el, 0, 'End');
    expect(el.value).to.equal('23:00');
    await press(el, 1, 'PageUp');
    expect(el.value).to.equal('23:10');
    await press(el, 1, 'Home');
    expect(el.value).to.equal('23:00');
  });

  it('clears a segment with Backspace, emptying the value, and moves with arrows', async () => {
    const el = await fixture<BxTimeField>(
      html`<bx-time-field hour-cycle="h23" value="10:20"></bx-time-field>`,
    );
    await press(el, 1, 'Backspace');
    expect(el.value).to.equal('');
    expect(texts(el)).to.deep.equal(['10', '––']);
    await press(el, 0, 'ArrowRight');
    expect(el.shadowRoot!.activeElement).to.equal(seg(el, 1));
  });

  it('supports seconds granularity and min/max validity', async () => {
    const el = await fixture<BxTimeField>(
      html`<bx-time-field
        hour-cycle="h23"
        granularity="second"
        value="09:00:30"
        min="10:00"
      ></bx-time-field>`,
    );
    expect(texts(el)).to.deep.equal(['09', '00', '30']);
    expect(el.checkValidity()).to.be.false;
    expect(el.validity.rangeUnderflow).to.be.true;
  });

  it('is form-associated, required-aware, and resets', async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form>
        <bx-time-field
          name="t"
          required
          hour-cycle="h23"
          value="08:15"
        ></bx-time-field>
      </form>`,
    );
    const el = form.querySelector('bx-time-field') as BxTimeField;
    await el.updateComplete;
    expect(new FormData(form).get('t')).to.equal('08:15');
    await press(el, 0, 'Backspace');
    expect(el.checkValidity()).to.be.false;
    form.reset();
    await el.updateComplete;
    expect(el.value).to.equal('08:15');
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxTimeField>(
      html`<bx-time-field
        label="Start time"
        hour-cycle="h12"
        value="09:30"
      ></bx-time-field>`,
    );
    await expect(el).to.be.accessible();
  });
});
