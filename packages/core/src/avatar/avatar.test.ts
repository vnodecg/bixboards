import { aTimeout, expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxAvatarGroup } from './avatar-group.ts';
import type { BxAvatar } from './avatar.ts';
import './index.ts';

describe('bx-avatar', () => {
  it('registers the tag, circle shape by default', async () => {
    const el = await fixture<BxAvatar>(html`<bx-avatar></bx-avatar>`);
    expect(el).to.be.instanceOf(customElements.get('bx-avatar')!);
    expect(el.shape).to.equal('circle');
  });

  it('shows initials when there is no image', async () => {
    const el = await fixture<BxAvatar>(
      html`<bx-avatar initials="VC"></bx-avatar>`,
    );
    const initials = el.shadowRoot!.querySelector('[part="initials"]');
    expect(initials?.textContent).to.equal('VC');
  });

  it('falls back from image to initials on load error', async () => {
    const el = await fixture<BxAvatar>(
      html`<bx-avatar
        image="https://does-not-exist.invalid/x.png"
        initials="VC"
      ></bx-avatar>`,
    );
    expect(el.shadowRoot!.querySelector('img')).to.exist;

    const errorPromise = oneEvent(el, 'bx-error');
    const img = el.shadowRoot!.querySelector('img')!;
    img.dispatchEvent(new Event('error'));
    await errorPromise;
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('img')).to.be.null;
    expect(
      el.shadowRoot!.querySelector('[part="initials"]')?.textContent,
    ).to.equal('VC');
  });

  it('resets the error state when `image` changes', async () => {
    const el = await fixture<BxAvatar>(
      html`<bx-avatar image="a.png" initials="VC"></bx-avatar>`,
    );
    el.shadowRoot!.querySelector('img')!.dispatchEvent(new Event('error'));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('img')).to.be.null;

    el.image = 'b.png';
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('img')).to.exist;
  });

  it('prefers slotted custom content over image/initials/icon', async () => {
    const el = await fixture<BxAvatar>(
      html`<bx-avatar initials="VC"><span>Custom</span></bx-avatar>`,
    );
    await aTimeout(0);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('[part="initials"]')).to.be.null;
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxAvatar>(
      html`<bx-avatar initials="VC" label="Vinod C G"></bx-avatar>`,
    );
    await expect(el).to.be.accessible();
  });
});

describe('bx-avatar-group', () => {
  it('collapses avatars beyond `max` into a +N indicator', async () => {
    const el = await fixture<BxAvatarGroup>(html`
      <bx-avatar-group max="2">
        <bx-avatar initials="A"></bx-avatar>
        <bx-avatar initials="B"></bx-avatar>
        <bx-avatar initials="C"></bx-avatar>
        <bx-avatar initials="D"></bx-avatar>
      </bx-avatar-group>
    `);
    await aTimeout(0);
    await el.updateComplete;

    const overflow = el.shadowRoot!.querySelector('[part="overflow"]');
    expect(overflow?.textContent).to.equal('+2');

    const avatars = el.querySelectorAll('bx-avatar');
    expect(avatars[0]!.hasAttribute('hidden')).to.be.false;
    expect(avatars[1]!.hasAttribute('hidden')).to.be.false;
    expect(avatars[2]!.hasAttribute('hidden')).to.be.true;
    expect(avatars[3]!.hasAttribute('hidden')).to.be.true;
  });

  it('shows every avatar with no overflow indicator when under `max`', async () => {
    const el = await fixture<BxAvatarGroup>(html`
      <bx-avatar-group max="5">
        <bx-avatar initials="A"></bx-avatar>
        <bx-avatar initials="B"></bx-avatar>
      </bx-avatar-group>
    `);
    await aTimeout(0);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('[part="overflow"]')).to.be.null;
  });
});
