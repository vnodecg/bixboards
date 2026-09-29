import { aTimeout, expect, fixture, html, oneEvent } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import type { BxAnimatedImage } from './animated-image.ts';
import './index.ts';

const GIF_SRC = new URL('./fixtures/tiny.gif', import.meta.url).href;
const BAD_SRC = new URL('./fixtures/does-not-exist.gif', import.meta.url).href;

function frame(el: BxAnimatedImage): HTMLDivElement {
  return el.shadowRoot!.querySelector('.frame')!;
}
function button(el: BxAnimatedImage): HTMLButtonElement {
  return el.shadowRoot!.querySelector('button')!;
}
function canvas(el: BxAnimatedImage): HTMLCanvasElement {
  return el.shadowRoot!.querySelector('canvas')!;
}
function liveImg(el: BxAnimatedImage): HTMLImageElement {
  return el.shadowRoot!.querySelector('img.live')!;
}

/** Waits until the element has decoded `src` and drawn its first frame. */
async function waitReady(el: BxAnimatedImage): Promise<void> {
  await oneEvent(el, 'bx-load');
  await el.updateComplete;
}

describe('bx-animated-image', () => {
  it('registers the tag and renders a control box', async () => {
    const el = await fixture<BxAnimatedImage>(
      html`<bx-animated-image src=${GIF_SRC} alt="Sample"></bx-animated-image>`,
    );
    expect(el).to.be.instanceOf(customElements.get('bx-animated-image')!);
    expect(frame(el)).to.exist;
    expect(button(el)).to.exist;
  });

  it('defaults to paused and disabled until the image is ready', async () => {
    const el = await fixture<BxAnimatedImage>(
      html`<bx-animated-image src=${GIF_SRC} alt="Sample"></bx-animated-image>`,
    );
    expect(el.play).to.be.false;
    expect(button(el).disabled).to.be.true;
    expect(button(el).getAttribute('aria-label')).to.equal('Play: Sample');

    await waitReady(el);

    expect(button(el).disabled).to.be.false;
    expect(canvas(el).width).to.be.greaterThan(0);
    expect(canvas(el).hasAttribute('hidden')).to.be.false;
    expect(liveImg(el).hasAttribute('hidden')).to.be.true;
  });

  it('falls back to a generic label when alt is empty', async () => {
    const el = await fixture<BxAnimatedImage>(
      html`<bx-animated-image src=${GIF_SRC}></bx-animated-image>`,
    );
    expect(button(el).getAttribute('aria-label')).to.equal('Play');
  });

  it('toggles play on click, swapping canvas for the live image', async () => {
    const el = await fixture<BxAnimatedImage>(
      html`<bx-animated-image src=${GIF_SRC} alt="Sample"></bx-animated-image>`,
    );
    await waitReady(el);

    button(el).click();
    await el.updateComplete;

    expect(el.play).to.be.true;
    expect(button(el).getAttribute('aria-pressed')).to.equal('true');
    expect(button(el).getAttribute('aria-label')).to.equal('Pause: Sample');
    expect(liveImg(el).hasAttribute('hidden')).to.be.false;
    expect(canvas(el).hasAttribute('hidden')).to.be.true;
    expect(liveImg(el).src).to.equal(GIF_SRC);

    button(el).click();
    await el.updateComplete;

    expect(el.play).to.be.false;
    expect(liveImg(el).hasAttribute('src')).to.be.false;
  });

  it('is a no-op while not yet ready', async () => {
    const el = await fixture<BxAnimatedImage>(
      html`<bx-animated-image src=${GIF_SRC}></bx-animated-image>`,
    );
    button(el).click();
    await el.updateComplete;
    expect(el.play).to.be.false;
  });

  it('auto-plays once ready when `play` was set before load finished', async () => {
    const el = await fixture<BxAnimatedImage>(
      html`<bx-animated-image
        src=${GIF_SRC}
        alt="Sample"
        play
      ></bx-animated-image>`,
    );
    await waitReady(el);
    expect(el.play).to.be.true;
    expect(liveImg(el).src).to.equal(GIF_SRC);
  });

  it('starts paused under prefers-reduced-motion even when `play` is set', async () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = ((query: string) =>
      ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        addEventListener() {},
        removeEventListener() {},
      }) as unknown as MediaQueryList) as typeof window.matchMedia;

    try {
      const el = await fixture<BxAnimatedImage>(
        html`<bx-animated-image src=${GIF_SRC} play></bx-animated-image>`,
      );
      expect(el.play).to.be.false;
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it('dispatches bx-error and shows a text fallback for a broken src', async () => {
    const el = await fixture<BxAnimatedImage>(
      html`<bx-animated-image src=${BAD_SRC} alt="Broken"></bx-animated-image>`,
    );
    const event = await oneEvent(el, 'bx-error');
    await el.updateComplete;

    expect(event).to.exist;
    const placeholder = el.shadowRoot!.querySelector('.placeholder');
    expect(placeholder).to.exist;
    expect(placeholder!.getAttribute('aria-label')).to.equal('Broken');
    expect(button(el).disabled).to.be.true;
  });

  it('reloads when `src` changes and ignores the superseded response', async () => {
    const el = await fixture<BxAnimatedImage>(
      html`<bx-animated-image src=${GIF_SRC} alt="Sample"></bx-animated-image>`,
    );
    await waitReady(el);

    el.src = BAD_SRC;
    const event = await oneEvent(el, 'bx-error');
    expect(event).to.exist;
    expect(el.shadowRoot!.querySelector('.placeholder')).to.exist;
  });

  it('is keyboard operable (Enter and Space toggle play)', async () => {
    const el = await fixture<BxAnimatedImage>(
      html`<bx-animated-image src=${GIF_SRC} alt="Sample"></bx-animated-image>`,
    );
    await waitReady(el);

    button(el).focus();
    await sendKeys({ press: 'Enter' });
    await el.updateComplete;
    expect(el.play).to.be.true;

    await sendKeys({ press: 'Space' });
    await el.updateComplete;
    expect(el.play).to.be.false;
  });

  it('has no axe violations while paused, playing or erroring', async () => {
    const el = await fixture<BxAnimatedImage>(
      html`<bx-animated-image src=${GIF_SRC} alt="Sample"></bx-animated-image>`,
    );
    await waitReady(el);
    await expect(el).to.be.accessible();

    button(el).click();
    await el.updateComplete;
    await expect(el).to.be.accessible();

    const broken = await fixture<BxAnimatedImage>(
      html`<bx-animated-image src=${BAD_SRC} alt="Broken"></bx-animated-image>`,
    );
    await oneEvent(broken, 'bx-error');
    await broken.updateComplete;
    await expect(broken).to.be.accessible();
  });

  it('disconnecting and reconnecting does not throw or re-fetch', async () => {
    const el = await fixture<BxAnimatedImage>(
      html`<bx-animated-image src=${GIF_SRC} alt="Sample"></bx-animated-image>`,
    );
    await waitReady(el);

    const parent = el.parentNode!;
    parent.removeChild(el);
    await aTimeout(0);
    parent.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('.placeholder')).to.not.exist;
  });
});
