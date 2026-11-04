import { expect, fixture, html } from '@open-wc/testing';
import type { BxCodeBlock } from './code-block.ts';
import {
  parseLineRanges,
  registerHighlighter,
  splitLines,
} from './code-block.ts';
import './index.ts';

describe('bx-code-block', () => {
  it('renders slotted text as lines', async () => {
    const el = await fixture<BxCodeBlock>(
      html`<bx-code-block> const a = 1; const b = 2; </bx-code-block>`,
    );
    await el.updateComplete;
    const lines = el.shadowRoot!.querySelectorAll('.line');
    expect(lines).to.have.length(2);
    expect(lines[0].textContent).to.contain('const a = 1;');
  });

  it('shows line numbers (aria-hidden) and highlights ranges', async () => {
    const el = await fixture<BxCodeBlock>(
      html`<bx-code-block
        code="a&#10;b&#10;c&#10;d"
        line-numbers
        highlight-lines="2,4"
      ></bx-code-block>`,
    );
    const lines = [...el.shadowRoot!.querySelectorAll('.line')];
    expect(
      lines.map((l) => l.querySelector('.line-number')!.textContent),
    ).to.deep.equal(['1', '2', '3', '4']);
    expect(lines.map((l) => l.hasAttribute('data-highlight'))).to.deep.equal([
      false,
      true,
      false,
      true,
    ]);
    expect(
      lines[0].querySelector('.line-number')!.getAttribute('aria-hidden'),
    ).to.equal('true');
  });

  it('applies a registered highlighter as styled tokens, without injecting HTML', async () => {
    registerHighlighter('toy', (code) =>
      code
        .split(/(\bconst\b)/)
        .map((text) =>
          text === 'const' ? { text, type: 'keyword' } : { text },
        ),
    );
    const el = await fixture<BxCodeBlock>(
      html`<bx-code-block
        language="toy"
        code="const <img src=x onerror=1>"
      ></bx-code-block>`,
    );
    expect(el.shadowRoot!.querySelector('.t-keyword')!.textContent).to.equal(
      'const',
    );
    expect(el.shadowRoot!.querySelector('img')).to.be.null;
  });

  it('has a focusable, labelled scroll region and a copy button', async () => {
    const el = await fixture<BxCodeBlock>(
      html`<bx-code-block filename="app.ts" code="x"></bx-code-block>`,
    );
    const pre = el.shadowRoot!.querySelector('pre')!;
    expect(pre.getAttribute('tabindex')).to.equal('0');
    expect(pre.getAttribute('aria-label')).to.equal('app.ts');
    expect(el.shadowRoot!.querySelector('bx-copy-button')).to.exist;
    el.copyable = false;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('bx-copy-button')).to.be.null;
  });

  it('parses line ranges and splits tokens across newlines', () => {
    expect([...parseLineRanges('1, 3-5, x')]).to.deep.equal([1, 3, 4, 5]);
    expect(
      splitLines([{ text: 'a\nb', type: 'x' }, { text: 'c' }]),
    ).to.deep.equal([
      [{ text: 'a', type: 'x' }],
      [
        { text: 'b', type: 'x' },
        { text: 'c', type: undefined },
      ],
    ]);
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxCodeBlock>(
      html`<bx-code-block
        code="const a = 1;"
        line-numbers
        filename="a.js"
      ></bx-code-block>`,
    );
    await expect(el).to.be.accessible();
  });
});
