import { expect, fixture, html, aTimeout } from '@open-wc/testing';
import { BxToast } from './toast.ts';
import type { BxToastRegion } from '../toast-region/toast-region.ts';
import './index.ts';

describe('bx-toast', () => {
  afterEach(() =>
    document.querySelectorAll('bx-toast-region').forEach((r) => r.remove()),
  );

  it('is hidden until open, with a status role (alert for errors)', async () => {
    const el = await fixture<BxToast>(html`<bx-toast>Saved</bx-toast>`);
    expect(getComputedStyle(el).display).to.equal('none');
    expect(el.getAttribute('role')).to.equal('status');
    await el.show();
    expect(getComputedStyle(el).display).to.equal('block');
    el.variant = 'error';
    await el.updateComplete;
    expect(el.getAttribute('role')).to.equal('alert');
  });

  it('fires the lifecycle events in order and hides', async () => {
    const el = await fixture<BxToast>(
      html`<bx-toast duration="0">Hi</bx-toast>`,
    );
    const log: string[] = [];
    for (const name of ['bx-show', 'bx-after-show', 'bx-hide', 'bx-after-hide'])
      el.addEventListener(name, () => log.push(name));
    await el.show();
    await el.hide();
    expect(log).to.deep.equal([
      'bx-show',
      'bx-after-show',
      'bx-hide',
      'bx-after-hide',
    ]);
    expect(el.open).to.be.false;
  });

  it('can be prevented from showing or hiding', async () => {
    const el = await fixture<BxToast>(
      html`<bx-toast duration="0">Hi</bx-toast>`,
    );
    el.addEventListener('bx-show', (e) => e.preventDefault(), { once: true });
    await el.show();
    expect(el.open).to.be.false;
    await el.show();
    el.addEventListener('bx-hide', (e) => e.preventDefault(), { once: true });
    await el.hide();
    expect(el.open).to.be.true;
  });

  it('auto-dismisses after duration but stays while hovered', async () => {
    const el = await fixture<BxToast>(
      html`<bx-toast duration="1200">Hi</bx-toast>`,
    );
    await el.show();
    el.dispatchEvent(new MouseEvent('mouseenter'));
    await aTimeout(1500);
    expect(el.open).to.be.true;
    el.dispatchEvent(new MouseEvent('mouseleave'));
    await aTimeout(1500);
    expect(el.open).to.be.false;
  });

  it('is sticky with duration 0, and closes from its close button', async () => {
    const el = await fixture<BxToast>(
      html`<bx-toast duration="0">Hi</bx-toast>`,
    );
    await el.show();
    await aTimeout(300);
    expect(el.open).to.be.true;
    el.shadowRoot!.querySelector('bx-close-button')!.dispatchEvent(
      new CustomEvent('bx-close', { bubbles: true, composed: true }),
    );
    await aTimeout(300);
    expect(el.open).to.be.false;
  });

  it('BxToast.toast() uses one shared region, caps the stack and replaces the oldest', async () => {
    const a = await BxToast.toast({ message: 'one', duration: 60000 });
    await BxToast.toast({ message: 'two', duration: 60000 });
    await BxToast.toast({ message: 'three', duration: 60000 });
    await BxToast.toast({ message: 'four', duration: 60000 });
    await aTimeout(400);
    const regions = document.querySelectorAll<BxToastRegion>('bx-toast-region');
    expect(regions).to.have.length(1);
    expect(regions[0]!.getAttribute('role')).to.equal('region');
    expect(a.isConnected).to.be.false;
    expect(regions[0]!.querySelectorAll('bx-toast[open]')).to.have.length(3);
  });

  it('shows an action and fires bx-action', async () => {
    let acted = false;
    const toast = await BxToast.toast({
      message: 'Deleted',
      action: 'Undo',
      duration: 0,
      onAction: () => (acted = true),
    });
    toast.querySelector<HTMLElement>('[slot=action]')!.click();
    expect(acted).to.be.true;
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxToast>(
      html`<bx-toast duration="0" variant="success">Saved</bx-toast>`,
    );
    await el.show();
    await expect(el).to.be.accessible();
  });
});
