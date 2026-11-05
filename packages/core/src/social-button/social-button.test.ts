import { expect, fixture, html } from '@open-wc/testing';
import type { BxSocialButton } from './social-button.ts';
import { registerSocialProvider, socialLabels } from './social-button.ts';
import './index.ts';

describe('bx-social-button', () => {
  before(() => {
    registerSocialProvider('acme', {
      label: 'Acme',
      svg: '<svg viewBox="0 0 10 10"><circle r="5" cx="5" cy="5"/></svg>',
      brandColor: '#123456',
    });
  });

  it('generates the label from mode and provider', async () => {
    const el = await fixture<BxSocialButton>(
      html`<bx-social-button provider="acme"></bx-social-button>`,
    );
    expect(
      el.shadowRoot!.querySelector('[part=label]')!.textContent!.trim(),
    ).to.equal('Continue with Acme');
    el.mode = 'signin';
    await el.updateComplete;
    expect(
      el.shadowRoot!.querySelector('[part=label]')!.textContent!.trim(),
    ).to.equal('Sign in with Acme');
  });

  it('renders the registered mark, aria-hidden, and a monogram otherwise', async () => {
    const el = await fixture<BxSocialButton>(
      html`<bx-social-button provider="acme"></bx-social-button>`,
    );
    const logo = el.shadowRoot!.querySelector('.logo')!;
    expect(logo.getAttribute('aria-hidden')).to.equal('true');
    expect(logo.querySelector('circle')).to.exist;
    const unknown = await fixture<BxSocialButton>(
      html`<bx-social-button provider="zork"></bx-social-button>`,
    );
    expect(
      unknown.shadowRoot!.querySelector('.monogram')!.textContent,
    ).to.equal('Z');
  });

  it('uses the brand colour for appearance=brand and lets the slot override the label', async () => {
    const el = await fixture<BxSocialButton>(
      html`<bx-social-button provider="acme" appearance="brand"
        >Log in</bx-social-button
      >`,
    );
    expect(
      el.shadowRoot!.querySelector('bx-button')!.getAttribute('style'),
    ).to.contain('#123456');
    expect(el.textContent).to.equal('Log in');
  });

  it('honours localised label templates', async () => {
    const original = socialLabels['share'];
    socialLabels['share'] = 'Teilen auf {provider}';
    const el = await fixture<BxSocialButton>(
      html`<bx-social-button provider="acme" mode="share"></bx-social-button>`,
    );
    expect(
      el.shadowRoot!.querySelector('[part=label]')!.textContent!.trim(),
    ).to.equal('Teilen auf Acme');
    socialLabels['share'] = original!;
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxSocialButton>(
      html`<bx-social-button provider="acme"></bx-social-button>`,
    );
    await expect(el).to.be.accessible();
  });
});
