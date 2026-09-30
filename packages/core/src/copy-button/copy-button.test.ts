import { aTimeout, expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxButton } from '../button/button.ts';
import type { BxCopyButton } from './copy-button.ts';
import './index.ts';

function stubClipboard(impl?: (text: string) => Promise<void>) {
  const written: string[] = [];
  const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: (text: string) => {
        written.push(text);
        return impl ? impl(text) : Promise.resolve();
      },
    },
  });
  return {
    written,
    restore: () => {
      if (original) Object.defineProperty(navigator, 'clipboard', original);
      else
        delete (navigator as unknown as Record<string, unknown>)['clipboard'];
    },
  };
}

const buttonOf = (el: BxCopyButton) =>
  el.shadowRoot!.querySelector<BxButton>('bx-button')!;
const liveOf = (el: BxCopyButton) =>
  el.shadowRoot!.querySelector('[role="status"]')!;

describe('bx-copy-button', () => {
  let clipboard: ReturnType<typeof stubClipboard>;
  beforeEach(() => (clipboard = stubClipboard()));
  afterEach(() => clipboard.restore());

  it('registers the tag and composes a bx-button inside a bx-tooltip', async () => {
    const el = await fixture<BxCopyButton>(
      html`<bx-copy-button value="x"></bx-copy-button>`,
    );
    expect(el).to.be.instanceOf(customElements.get('bx-copy-button')!);
    expect(el.shadowRoot!.querySelector('bx-tooltip bx-button')).to.exist;
    expect(el.shadowRoot!.querySelector('bx-icon[name="copy"]')).to.exist;
  });

  it('copies `value` and fires bx-copy with detail.value', async () => {
    const el = await fixture<BxCopyButton>(
      html`<bx-copy-button value="hello"></bx-copy-button>`,
    );
    const copied = oneEvent(el, 'bx-copy');
    buttonOf(el).click();
    expect(((await copied) as CustomEvent).detail.value).to.equal('hello');
    expect(clipboard.written).to.deep.equal(['hello']);
  });

  it('resolves `from` as id, id[attr] and id.prop', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <span id="text">plain text</span>
        <a id="link" href="/somewhere" data-token="abc"></a>
        <input id="field" value="typed" />
        <bx-copy-button from="text"></bx-copy-button>
        <bx-copy-button from="link[data-token]"></bx-copy-button>
        <bx-copy-button from="field.value"></bx-copy-button>
        <bx-copy-button from="field"></bx-copy-button>
      </div>
    `);
    for (const el of wrapper.querySelectorAll('bx-copy-button')) {
      const copied = oneEvent(el, 'bx-copy');
      buttonOf(el as BxCopyButton).click();
      await copied;
    }
    expect(clipboard.written).to.deep.equal([
      'plain text',
      'abc',
      'typed',
      'typed',
    ]);
  });

  it('resolves `from` inside a shadow root', async () => {
    const host = await fixture<HTMLDivElement>(html`<div></div>`);
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML =
      '<span id="inner">from shadow</span><bx-copy-button from="inner"></bx-copy-button>';
    const inShadow = root.querySelector('bx-copy-button') as BxCopyButton;
    await inShadow.updateComplete;
    const copied = oneEvent(inShadow, 'bx-copy');
    buttonOf(inShadow).click();
    await copied;
    expect(clipboard.written.at(-1)).to.equal('from shadow');
  });

  it('fires bx-error with a reason when the source cannot be resolved', async () => {
    const el = await fixture<BxCopyButton>(
      html`<bx-copy-button from="missing"></bx-copy-button>`,
    );
    const error = oneEvent(el, 'bx-error');
    buttonOf(el).click();
    expect(((await error) as CustomEvent).detail.reason).to.contain('missing');
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector<HTMLElement>('.error')!.hidden).to.be
      .false;
  });

  it('fires bx-error when the clipboard rejects', async () => {
    clipboard.restore();
    clipboard = stubClipboard(() => Promise.reject(new Error('denied')));
    const el = await fixture<BxCopyButton>(
      html`<bx-copy-button value="x"></bx-copy-button>`,
    );
    const error = oneEvent(el, 'bx-error');
    buttonOf(el).click();
    expect(((await error) as CustomEvent).detail.reason).to.equal('denied');
  });

  it('shows success feedback, announces it, then returns to idle', async () => {
    const el = await fixture<BxCopyButton>(html`
      <bx-copy-button value="x" feedback-duration="40"></bx-copy-button>
    `);
    expect(buttonOf(el).getAttribute('aria-label')).to.equal('Copy');
    expect(liveOf(el).textContent!.trim()).to.equal('');

    buttonOf(el).click();
    await oneEvent(el, 'bx-copy');
    await el.updateComplete;
    expect(buttonOf(el).getAttribute('aria-label')).to.equal('Copied');
    expect(liveOf(el).textContent!.trim()).to.equal('Copied');
    const success = el.shadowRoot!.querySelector<HTMLElement>('.success')!;
    expect(success.hidden).to.be.false;

    await aTimeout(80);
    expect(buttonOf(el).getAttribute('aria-label')).to.equal('Copy');
    expect(success.hidden).to.be.true;
  });

  it('honors custom labels', async () => {
    const el = await fixture<BxCopyButton>(html`
      <bx-copy-button
        value="x"
        copy-label="Copy link"
        success-label="Link copied"
      ></bx-copy-button>
    `);
    expect(buttonOf(el).getAttribute('aria-label')).to.equal('Copy link');
    buttonOf(el).click();
    await oneEvent(el, 'bx-copy');
    await el.updateComplete;
    expect(buttonOf(el).getAttribute('aria-label')).to.equal('Link copied');
  });

  it('does nothing when disabled', async () => {
    const el = await fixture<BxCopyButton>(
      html`<bx-copy-button value="x" disabled></bx-copy-button>`,
    );
    buttonOf(el).click();
    await el.copy();
    expect(clipboard.written).to.deep.equal([]);
  });

  it('lets slotted icons replace the defaults', async () => {
    const el = await fixture<BxCopyButton>(html`
      <bx-copy-button value="x"><span slot="copy-icon">C</span></bx-copy-button>
    `);
    const slot = el.shadowRoot!.querySelector<HTMLSlotElement>(
      'slot[name="copy-icon"]',
    )!;
    expect(slot.assignedElements()[0]!.textContent).to.equal('C');
  });

  it('is accessible at rest and after copying', async () => {
    const el = await fixture<BxCopyButton>(
      html`<bx-copy-button value="x"></bx-copy-button>`,
    );
    await expect(el).to.be.accessible();
    buttonOf(el).click();
    await oneEvent(el, 'bx-copy');
    await el.updateComplete;
    await expect(el).to.be.accessible();
  });
});
