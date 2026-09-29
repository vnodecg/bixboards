import { expect, fixture, html } from '@open-wc/testing';
import type { BxFormatNumber } from './format-number.ts';
import './index.ts';

describe('bx-format-number', () => {
  it('registers the tag with decimal/USD defaults and no shadow root', async () => {
    const el = await fixture<BxFormatNumber>(
      html`<bx-format-number></bx-format-number>`,
    );
    expect(el).to.be.instanceOf(customElements.get('bx-format-number')!);
    expect(el.type).to.equal('decimal');
    expect(el.currency).to.equal('USD');
    expect(el.shadowRoot).to.be.null;
  });

  it('formats decimals with grouping by default', async () => {
    const el = await fixture<BxFormatNumber>(
      html`<bx-format-number value="1234.5" lang="en-US"></bx-format-number>`,
    );
    await el.updateComplete;
    expect(el.textContent).to.equal('1,234.5');
  });

  it('disables grouping with no-grouping', async () => {
    const el = await fixture<BxFormatNumber>(
      html`<bx-format-number
        value="1234.5"
        no-grouping
        lang="en-US"
      ></bx-format-number>`,
    );
    await el.updateComplete;
    expect(el.textContent).to.equal('1234.5');
  });

  it('formats currency using currency/currency-display', async () => {
    const el = await fixture<BxFormatNumber>(
      html`<bx-format-number
        type="currency"
        value="1234.5"
        currency="USD"
        lang="en-US"
      ></bx-format-number>`,
    );
    await el.updateComplete;
    expect(el.textContent).to.equal('$1,234.50');
  });

  it('formats percent', async () => {
    const el = await fixture<BxFormatNumber>(
      html`<bx-format-number
        type="percent"
        value="0.1"
        lang="en-US"
      ></bx-format-number>`,
    );
    await el.updateComplete;
    expect(el.textContent).to.equal('10%');
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxFormatNumber>(
      html`<bx-format-number value="42"></bx-format-number>`,
    );
    await expect(el).to.be.accessible();
  });
});
