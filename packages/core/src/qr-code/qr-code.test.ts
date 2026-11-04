import { expect, fixture, html } from '@open-wc/testing';
import type { BxQrCode } from './qr-code.ts';
import { qrMatrix } from './qr-code.ts';
import './index.ts';

describe('qrMatrix', () => {
  it('produces a square matrix with the three finder patterns', () => {
    const m = qrMatrix('https://example.com', 'M');
    const n = m.length;
    expect(n).to.be.greaterThan(20);
    expect(m.every((row) => row.length === n)).to.be.true;
    for (const [r, c] of [
      [0, 0],
      [0, n - 7],
      [n - 7, 0],
    ]) {
      expect(m[r][c] && m[r][c + 6] && m[r + 6][c] && m[r + 6][c + 6]).to.be
        .true;
      expect(m[r + 3][c + 3]).to.be.true;
      expect(m[r + 1][c + 1]).to.be.false;
    }
  });
  it('grows with the data and with error correction', () => {
    expect(qrMatrix('a'.repeat(200), 'L').length).to.be.greaterThan(
      qrMatrix('a', 'L').length,
    );
    expect(qrMatrix('hello', 'H').length).to.be.at.least(
      qrMatrix('hello', 'L').length,
    );
  });
});

describe('bx-qr-code', () => {
  it('renders an svg image labelled with the value by default', async () => {
    const el = await fixture<BxQrCode>(
      html`<bx-qr-code value="https://bixboards.dev"></bx-qr-code>`,
    );
    const svg = el.shadowRoot!.querySelector('svg')!;
    expect(svg.getAttribute('role')).to.equal('img');
    expect(svg.getAttribute('aria-label')).to.equal('https://bixboards.dev');
    expect(svg.getAttribute('width')).to.equal('128');
    expect(
      svg.querySelector('path')!.getAttribute('d')!.length,
    ).to.be.greaterThan(50);
  });

  it('uses a custom label, size and colors', async () => {
    const el = await fixture<BxQrCode>(
      html`<bx-qr-code
        value="x"
        label="Join"
        size="200"
        fill="#123456"
        background="#fff"
      ></bx-qr-code>`,
    );
    const svg = el.shadowRoot!.querySelector('svg')!;
    expect(svg.getAttribute('aria-label')).to.equal('Join');
    expect(svg.getAttribute('width')).to.equal('200');
    expect(svg.querySelector('path')!.getAttribute('fill')).to.equal('#123456');
    expect(svg.querySelector('rect')!.getAttribute('fill')).to.equal('#fff');
  });

  it('fills the container with size="fill"', async () => {
    const el = await fixture<BxQrCode>(
      html`<div style="inline-size: 240px">
        <bx-qr-code value="x" size="fill"></bx-qr-code>
      </div>`,
    );
    const qr = el.querySelector('bx-qr-code')!;
    expect(Math.round(qr.getBoundingClientRect().width)).to.equal(240);
  });

  it('regenerates only when the value or error correction changes', async () => {
    const el = await fixture<BxQrCode>(
      html`<bx-qr-code value="one"></bx-qr-code>`,
    );
    const first = el.shadowRoot!.querySelector('path')!.getAttribute('d');
    el.fill = 'red';
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('path')!.getAttribute('d')).to.equal(
      first,
    );
    el.value = 'two';
    await el.updateComplete;
    expect(
      el.shadowRoot!.querySelector('path')!.getAttribute('d'),
    ).to.not.equal(first);
  });

  it('renders nothing for an empty value and fires bx-error when it cannot encode', async () => {
    const empty = await fixture<BxQrCode>(html`<bx-qr-code></bx-qr-code>`);
    expect(empty.shadowRoot!.querySelector('svg')).to.be.null;
    const big = document.createElement('bx-qr-code') as BxQrCode;
    let errored = false;
    big.addEventListener('bx-error', () => (errored = true));
    big.value = 'x'.repeat(5000);
    document.body.append(big);
    await big.updateComplete;
    big.remove();
    expect(errored).to.be.true;
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxQrCode>(
      html`<bx-qr-code value="hello" label="Scan to open"></bx-qr-code>`,
    );
    await expect(el).to.be.accessible();
  });
});
