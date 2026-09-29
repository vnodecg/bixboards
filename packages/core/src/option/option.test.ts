import { expect, fixture, html } from '@open-wc/testing';
import type { BxOption } from './option.ts';
import './index.ts';

describe('bx-option', () => {
  it('registers the tag with unselected/enabled defaults', async () => {
    const el = await fixture<BxOption>(html`<bx-option>Item</bx-option>`);
    expect(el).to.be.instanceOf(customElements.get('bx-option')!);
    expect(el.selected).to.be.false;
    expect(el.disabled).to.be.false;
  });

  it('reflects selected/disabled to attributes and ARIA', async () => {
    const el = await fixture<BxOption>(
      html`<bx-option selected disabled value="a" label="A"
        >A</bx-option
      >`,
    );
    expect(el.hasAttribute('selected')).to.be.true;
    expect(el.hasAttribute('disabled')).to.be.true;
    const base = el.shadowRoot!.querySelector('.base')!;
    expect(base.getAttribute('role')).to.equal('option');
    expect(base.getAttribute('aria-selected')).to.equal('true');
    expect(base.getAttribute('aria-disabled')).to.equal('true');
  });

  it('shows the checked icon only when selected', async () => {
    const unselected = await fixture<BxOption>(
      html`<bx-option>Item</bx-option>`,
    );
    expect(unselected.shadowRoot!.querySelector('.checked-icon svg')).to.be
      .null;

    const selected = await fixture<BxOption>(
      html`<bx-option selected>Item</bx-option>`,
    );
    expect(selected.shadowRoot!.querySelector('.checked-icon svg')).to.exist;
  });

  it('attaches no listeners of its own (FR-OPTION-01: state owned by parent)', async () => {
    const el = await fixture<BxOption>(html`<bx-option>Item</bx-option>`);
    el.click();
    expect(el.selected).to.be.false;
  });

  it('has no axe violations, plain and selected', async () => {
    // role="option" requires a role="listbox"/"group" ancestor per the APG pattern; that parent
    // is the future bx-select, so the axe check here supplies a bare one (FR-OPTION-01).
    const listbox = await fixture<HTMLDivElement>(
      html`<div role="listbox" aria-label="Options">
        <bx-option>Item</bx-option>
        <bx-option selected>Item</bx-option>
      </div>`,
    );
    await expect(listbox).to.be.accessible();
  });
});
