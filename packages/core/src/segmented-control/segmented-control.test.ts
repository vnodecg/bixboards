import { expect, fixture, html } from '@open-wc/testing';
import type { BxSegmentedControl } from './segmented-control.ts';
import type { BxSegment } from '../segment/segment.ts';
import './index.ts';

const make = () =>
  html` <bx-segmented-control label="View" value="b" name="view">
    <bx-segment value="a" label="Day"></bx-segment>
    <bx-segment value="b" label="Week"></bx-segment>
    <bx-segment value="c" label="Month" disabled></bx-segment>
    <bx-segment value="d" label="Year"></bx-segment>
  </bx-segmented-control>`;

const segs = (el: Element) => [...el.querySelectorAll<BxSegment>('bx-segment')];

describe('bx-segmented-control', () => {
  it('is a radiogroup of radios with a roving tabindex', async () => {
    const el = await fixture<BxSegmentedControl>(make());
    await el.updateComplete;
    expect(el.getAttribute('role')).to.equal('radiogroup');
    expect(segs(el).map((s) => s.getAttribute('role'))).to.deep.equal([
      'radio',
      'radio',
      'radio',
      'radio',
    ]);
    expect(segs(el).map((s) => s.tabIndex)).to.deep.equal([-1, 0, -1, -1]);
    await Promise.all(segs(el).map((s) => s.updateComplete));
    expect(segs(el).map((s) => s.getAttribute('aria-checked'))).to.deep.equal([
      'false',
      'true',
      'false',
      'false',
    ]);
  });

  it('selects on click and fires input then change with the value', async () => {
    const el = await fixture<BxSegmentedControl>(make());
    const events: string[] = [];
    el.addEventListener('input', () => events.push('input'));
    el.addEventListener('change', (e) =>
      events.push(`change:${(e as CustomEvent).detail.value}`),
    );
    segs(el)[0]!.click();
    await el.updateComplete;
    expect(el.value).to.equal('a');
    expect(events).to.deep.equal(['input', 'change:a']);
  });

  it('moves and selects with arrows, skipping disabled, wrapping, plus Home/End', async () => {
    const el = await fixture<BxSegmentedControl>(make());
    const key = (k: string) =>
      segs(el)
        .find((s) => s.tabIndex === 0)!
        .dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    key('ArrowRight');
    await el.updateComplete;
    expect(el.value).to.equal('d');
    key('ArrowRight');
    await el.updateComplete;
    expect(el.value).to.equal('a');
    key('End');
    await el.updateComplete;
    expect(el.value).to.equal('d');
    key('Home');
    await el.updateComplete;
    expect(el.value).to.equal('a');
  });

  it('ignores disabled segments and a disabled group', async () => {
    const el = await fixture<BxSegmentedControl>(make());
    segs(el)[2]!.click();
    expect(el.value).to.equal('b');
    el.disabled = true;
    await el.updateComplete;
    segs(el)[0]!.click();
    expect(el.value).to.equal('b');
  });

  it('positions the indicator on the selected segment using transform', async () => {
    const el = await fixture<BxSegmentedControl>(make());
    await el.updateComplete;
    const base = el.shadowRoot!.querySelector<HTMLElement>('.base')!;
    expect(parseFloat(base.style.getPropertyValue('--_w'))).to.be.greaterThan(
      0,
    );
    expect(parseFloat(base.style.getPropertyValue('--_x'))).to.be.greaterThan(
      0,
    );
  });

  it('submits the value in a form and resets', async () => {
    const form = await fixture<HTMLFormElement>(html`<form>${make()}</form>`);
    const el = form.querySelector('bx-segmented-control') as BxSegmentedControl;
    await el.updateComplete;
    expect(new FormData(form).get('view')).to.equal('b');
    segs(el)[3]!.click();
    await el.updateComplete;
    expect(new FormData(form).get('view')).to.equal('d');
    form.reset();
    await el.updateComplete;
    expect(el.value).to.equal('b');
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxSegmentedControl>(make());
    await el.updateComplete;
    await Promise.all(segs(el).map((s) => s.updateComplete));
    await expect(el).to.be.accessible();
  });
});
