import { expect, fixture, html } from '@open-wc/testing';
import type { BxToggleButton } from './toggle-button.ts';
import './index.ts';

describe('bx-toggle-button', () => {
  it('toggles pressed on click and fires input then change', async () => {
    const el = await fixture<BxToggleButton>(
      html`<bx-toggle-button>Bold</bx-toggle-button>`,
    );
    const events: string[] = [];
    el.addEventListener('input', () => events.push('input'));
    el.addEventListener('change', () => events.push('change'));
    el.click();
    await el.updateComplete;
    expect(el.pressed).to.be.true;
    expect(
      el.shadowRoot!.querySelector('button')!.getAttribute('aria-pressed'),
    ).to.equal('true');
    expect(events).to.deep.equal(['input', 'change']);
    el.click();
    expect(el.pressed).to.be.false;
  });

  it('does not toggle when disabled', async () => {
    const el = await fixture<BxToggleButton>(
      html`<bx-toggle-button disabled>Bold</bx-toggle-button>`,
    );
    el.shadowRoot!.querySelector('button')!.click();
    expect(el.pressed).to.be.false;
  });

  it('submits name=value only while pressed, and resets', async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form>
        <bx-toggle-button name="bold" value="yes" pressed>B</bx-toggle-button>
      </form>`,
    );
    const el = form.querySelector('bx-toggle-button') as BxToggleButton;
    await el.updateComplete;
    expect(new FormData(form).get('bold')).to.equal('yes');
    el.click();
    await el.updateComplete;
    expect(new FormData(form).has('bold')).to.be.false;
    form.reset();
    await el.updateComplete;
    expect(el.pressed).to.be.true;
  });

  it('shows a check glyph when pressed (not colour alone)', async () => {
    const el = await fixture<BxToggleButton>(
      html`<bx-toggle-button pressed>On</bx-toggle-button>`,
    );
    expect(el.shadowRoot!.querySelector('.check')).to.exist;
  });

  it('has no axe violations, pressed or not', async () => {
    const el = await fixture<BxToggleButton>(
      html`<bx-toggle-button>Bold</bx-toggle-button>`,
    );
    await expect(el).to.be.accessible();
    el.pressed = true;
    await el.updateComplete;
    await expect(el).to.be.accessible();
  });
});
