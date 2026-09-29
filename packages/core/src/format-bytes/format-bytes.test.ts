import { expect, fixture, html } from '@open-wc/testing';
import type { BxFormatBytes } from './format-bytes.ts';
import './index.ts';

describe('bx-format-bytes', () => {
  it('registers the tag with byte/short defaults', async () => {
    const el = await fixture<BxFormatBytes>(html`<bx-format-bytes></bx-format-bytes>`);
    expect(el).to.be.instanceOf(customElements.get('bx-format-bytes')!);
    expect(el.unit).to.equal('byte');
    expect(el.display).to.equal('short');
  });

  it('picks the largest binary unit for byte values', async () => {
    const el = await fixture<BxFormatBytes>(
      html`<bx-format-bytes value="1536" lang="en-US"></bx-format-bytes>`,
    );
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.equal('1.5 kB');
  });

  it('renders sub-KB values in the base unit', async () => {
    const el = await fixture<BxFormatBytes>(
      html`<bx-format-bytes value="512" lang="en-US"></bx-format-bytes>`,
    );
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.equal('512 byte');
  });

  it('scales bits in decimal (1000) multiples', async () => {
    const el = await fixture<BxFormatBytes>(
      html`<bx-format-bytes
        value="1000"
        unit="bit"
        lang="en-US"
      ></bx-format-bytes>`,
    );
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.equal('1 kb');
  });

  it('re-formats when value changes', async () => {
    const el = await fixture<BxFormatBytes>(
      html`<bx-format-bytes value="0" lang="en-US"></bx-format-bytes>`,
    );
    el.value = 1048576;
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.equal('1 MB');
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxFormatBytes>(
      html`<bx-format-bytes value="2048"></bx-format-bytes>`,
    );
    await expect(el).to.be.accessible();
  });
});
