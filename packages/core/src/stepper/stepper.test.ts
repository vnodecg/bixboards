import { expect, fixture, html } from '@open-wc/testing';
import type { BxStepper } from './stepper.ts';
import type { BxStep } from '../step/step.ts';
import './index.ts';

const make = (attrs = '') =>
  html` <bx-stepper current="1" style="inline-size: 50rem">
    <bx-step label="Account"></bx-step>
    <bx-step label="Profile"></bx-step>
    <bx-step label="Billing" status="error"></bx-step>
    <bx-step label="Done"></bx-step>
  </bx-stepper>`;

const steps = (el: Element) => [...el.querySelectorAll<BxStep>('bx-step')];

describe('bx-stepper', () => {
  it('derives complete/current/upcoming and keeps explicit error', async () => {
    const el = await fixture<BxStepper>(make());
    await el.updateComplete;
    await Promise.all(steps(el).map((s) => s.updateComplete));
    expect(steps(el).map((s) => s.status)).to.deep.equal([
      'complete',
      'current',
      'error',
      'upcoming',
    ]);
    expect(steps(el).map((s) => s.last)).to.deep.equal([
      false,
      false,
      false,
      true,
    ]);
  });

  it('marks the current step with aria-current=step and speaks status', async () => {
    const el = await fixture<BxStepper>(make());
    await Promise.all(steps(el).map((s) => s.updateComplete));
    const current = steps(el)[1].shadowRoot!.querySelector(
      '[aria-current=step]',
    )!;
    expect(current).to.exist;
    expect(steps(el)[0].shadowRoot!.textContent).to.contain('completed');
    expect(steps(el)[2].shadowRoot!.textContent).to.contain('has an error');
  });

  it('fires a cancelable bx-step-change and moves current unless cancelled', async () => {
    const el = await fixture<BxStepper>(make());
    await Promise.all(steps(el).map((s) => s.updateComplete));
    let detail: unknown;
    el.addEventListener(
      'bx-step-change',
      (e) => (detail = (e as CustomEvent).detail),
      { once: true },
    );
    steps(el)[0].shadowRoot!.querySelector('button')!.click();
    expect(detail).to.deep.equal({ from: 1, to: 0 });
    expect(el.current).to.equal(0);
    el.addEventListener('bx-step-change', (e) => e.preventDefault(), {
      once: true,
    });
    await Promise.all(steps(el).map((s) => s.updateComplete));
    steps(el)[3].shadowRoot!.querySelector('button')!.click();
    expect(el.current).to.equal(0);
  });

  it('blocks jumping ahead when linear, and disables navigation when not clickable', async () => {
    const el = await fixture<BxStepper>(make());
    el.linear = true;
    await el.updateComplete;
    await Promise.all(steps(el).map((s) => s.updateComplete));
    expect(steps(el).map((s) => s.navigable)).to.deep.equal([
      true,
      false,
      false,
      false,
    ]);
    el.clickable = false;
    await el.updateComplete;
    expect(steps(el).some((s) => s.navigable)).to.be.false;
  });

  it('renders the collapsed summary text', async () => {
    const el = await fixture<BxStepper>(make());
    await el.updateComplete;
    expect(
      el.shadowRoot!.querySelector('.summary')!.textContent!.trim(),
    ).to.equal('Step 2 of 4');
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxStepper>(make());
    await el.updateComplete;
    await Promise.all(steps(el).map((s) => s.updateComplete));
    await expect(el).to.be.accessible();
  });
});
