import { aTimeout, expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxAnimation } from './animation.ts';
import './index.ts';

const BOX_KEYFRAMES = [{ opacity: 0 }, { opacity: 1 }];

function box(el: BxAnimation): HTMLDivElement {
  return el.querySelector('div')!;
}

describe('bx-animation', () => {
  it('registers the tag and passes through slotted content', async () => {
    const el = await fixture<BxAnimation>(
      html`<bx-animation><div>Content</div></bx-animation>`,
    );
    expect(el).to.be.instanceOf(customElements.get('bx-animation')!);
    expect(box(el).textContent).to.equal('Content');
  });

  it('does not animate while `play` is unset', async () => {
    const el = await fixture<BxAnimation>(
      html`<bx-animation .keyframes=${BOX_KEYFRAMES}
        ><div>Content</div></bx-animation
      >`,
    );
    expect(el.getAnimation()).to.be.undefined;
  });

  it('starts the animation on the slotted element when `play` is set', async () => {
    const el = await fixture<BxAnimation>(
      html`<bx-animation .keyframes=${BOX_KEYFRAMES} duration="20"
        ><div>Content</div></bx-animation
      >`,
    );
    const startPromise = oneEvent(el, 'bx-start');
    el.play = true;
    await startPromise;

    const animation = el.getAnimation();
    expect(animation).to.exist;
    expect(animation!.effect).to.exist;
  });

  it('dispatches bx-finish when the animation completes naturally', async () => {
    const el = await fixture<BxAnimation>(
      html`<bx-animation
        .keyframes=${BOX_KEYFRAMES}
        duration="10"
        iterations="1"
        ><div>Content</div></bx-animation
      >`,
    );
    el.play = true;
    const event = await oneEvent(el, 'bx-finish');
    expect(event).to.exist;
  });

  it('dispatches bx-cancel when `play` is toggled off', async () => {
    const el = await fixture<BxAnimation>(
      html`<bx-animation .keyframes=${BOX_KEYFRAMES} duration="1000"
        ><div>Content</div></bx-animation
      >`,
    );
    el.play = true;
    await oneEvent(el, 'bx-start');

    const cancelPromise = oneEvent(el, 'bx-cancel');
    el.cancel();
    await cancelPromise;

    expect(el.play).to.be.false;
    expect(el.getAnimation()).to.be.undefined;
  });

  it('finish() jumps the animation to its end state', async () => {
    const el = await fixture<BxAnimation>(
      html`<bx-animation
        .keyframes=${BOX_KEYFRAMES}
        duration="1000"
        iterations="1"
        fill="forwards"
        ><div>Content</div></bx-animation
      >`,
    );
    el.play = true;
    await oneEvent(el, 'bx-start');

    const finishPromise = oneEvent(el, 'bx-finish');
    el.finish();
    await finishPromise;
  });

  it('resolves the `bounce` preset by name once its module is imported', async () => {
    await import('./presets/bounce.ts');
    const el = await fixture<BxAnimation>(
      html`<bx-animation name="bounce" duration="10" iterations="1"
        ><div>Content</div></bx-animation
      >`,
    );
    el.play = true;
    const event = await oneEvent(el, 'bx-start');
    expect(event).to.exist;
    expect(el.getAnimation()!.effect).to.exist;
  });

  it('plays nothing for an unregistered preset name', async () => {
    const el = await fixture<BxAnimation>(
      html`<bx-animation name="does-not-exist" duration="10"
        ><div>Content</div></bx-animation
      >`,
    );
    el.play = true;
    await oneEvent(el, 'bx-start');
    expect(el.getAnimation()).to.exist;
  });

  it('reduces to a single, instant iteration under prefers-reduced-motion unless forced', async () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = ((query: string) =>
      ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        addEventListener() {},
        removeEventListener() {},
      }) as unknown as MediaQueryList) as typeof window.matchMedia;

    try {
      const el = await fixture<BxAnimation>(
        html`<bx-animation
          .keyframes=${BOX_KEYFRAMES}
          duration="10000"
          iterations="Infinity"
          ><div>Content</div></bx-animation
        >`,
      );
      el.play = true;
      const event = await oneEvent(el, 'bx-finish');
      expect(event).to.exist;

      const forced = await fixture<BxAnimation>(
        html`<bx-animation
          .keyframes=${BOX_KEYFRAMES}
          duration="10"
          iterations="1"
          force
          ><div>Content</div></bx-animation
        >`,
      );
      forced.play = true;
      await oneEvent(forced, 'bx-start');
      expect(forced.getAnimation()!.effect!.getTiming().duration).to.equal(10);
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it('restarts on an option change while playing', async () => {
    const el = await fixture<BxAnimation>(
      html`<bx-animation .keyframes=${BOX_KEYFRAMES} duration="1000"
        ><div>Content</div></bx-animation
      >`,
    );
    el.play = true;
    await oneEvent(el, 'bx-start');
    const first = el.getAnimation();

    const startPromise = oneEvent(el, 'bx-start');
    el.duration = 500;
    await startPromise;

    expect(el.getAnimation()).to.not.equal(first);
  });

  it('cancels on disconnect without throwing', async () => {
    const el = await fixture<BxAnimation>(
      html`<bx-animation .keyframes=${BOX_KEYFRAMES} duration="1000"
        ><div>Content</div></bx-animation
      >`,
    );
    el.play = true;
    await oneEvent(el, 'bx-start');

    const parent = el.parentNode!;
    parent.removeChild(el);
    await aTimeout(0);

    expect(el.getAnimation()).to.be.undefined;
  });

  it('has no axe violations while idle or playing', async () => {
    const el = await fixture<BxAnimation>(
      html`<bx-animation .keyframes=${BOX_KEYFRAMES} duration="1000"
        ><div>Content</div></bx-animation
      >`,
    );
    await expect(el).to.be.accessible();

    el.play = true;
    await oneEvent(el, 'bx-start');
    await expect(el).to.be.accessible();
  });
});
