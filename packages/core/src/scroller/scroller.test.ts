import { expect, fixture, html, aTimeout } from '@open-wc/testing';
import type { BxScroller } from './scroller.ts';
import './index.ts';

describe('bx-scroller', () => {
  it('registers the tag with horizontal orientation by default', async () => {
    const el = await fixture<BxScroller>(
      html`<bx-scroller>content</bx-scroller>`,
    );
    expect(el).to.be.instanceOf(customElements.get('bx-scroller')!);
    expect(el.orientation).to.equal('horizontal');
  });

  it('is not a tab stop when content does not overflow', async () => {
    const el = await fixture<BxScroller>(
      html`<bx-scroller style="inline-size: 300px">short</bx-scroller>`,
    );
    await aTimeout(50);
    const content = el.shadowRoot!.querySelector('.content') as HTMLElement;
    expect(content.hasAttribute('tabindex')).to.be.false;
  });

  it('becomes a focusable tab stop once content overflows', async () => {
    const el = await fixture<BxScroller>(html`
      <bx-scroller style="inline-size: 100px">
        <div style="inline-size: 1000px; flex-shrink: 0">wide content</div>
      </bx-scroller>
    `);
    await aTimeout(50);
    const content = el.shadowRoot!.querySelector('.content') as HTMLElement;
    expect(content.getAttribute('tabindex')).to.equal('0');
  });

  it('only adds role=region once an accessible name is present', async () => {
    const el = await fixture<BxScroller>(html`
      <bx-scroller style="inline-size: 100px">
        <div style="inline-size: 1000px; flex-shrink: 0">wide content</div>
      </bx-scroller>
    `);
    await aTimeout(50);
    const content = el.shadowRoot!.querySelector('.content') as HTMLElement;
    expect(content.hasAttribute('role')).to.be.false;

    const labelled = await fixture<BxScroller>(html`
      <bx-scroller aria-label="Files" style="inline-size: 100px">
        <div style="inline-size: 1000px; flex-shrink: 0">wide content</div>
      </bx-scroller>
    `);
    await aTimeout(50);
    const labelledContent = labelled.shadowRoot!.querySelector(
      '.content',
    ) as HTMLElement;
    expect(labelledContent.getAttribute('role')).to.equal('region');
  });

  it('hides the start shadow at the scroll start and reveals it after scrolling', async () => {
    const el = await fixture<BxScroller>(html`
      <bx-scroller style="inline-size: 100px">
        <div style="inline-size: 1000px; flex-shrink: 0">wide content</div>
      </bx-scroller>
    `);
    await aTimeout(50);
    const content = el.shadowRoot!.querySelector('.content') as HTMLElement;
    expect(
      el
        .shadowRoot!.querySelector('.shadow-start')!
        .classList.contains('visible'),
    ).to.be.false;

    content.scrollLeft = 50;
    content.dispatchEvent(new Event('scroll'));
    await aTimeout(50);
    expect(
      el
        .shadowRoot!.querySelector('.shadow-start')!
        .classList.contains('visible'),
    ).to.be.true;
  });

  it('renders no shadow elements when without-shadow is set', async () => {
    const el = await fixture<BxScroller>(
      html`<bx-scroller without-shadow>content</bx-scroller>`,
    );
    expect(el.shadowRoot!.querySelector('.shadow')).to.be.null;
  });

  it('has no axe violations, scrollable and labelled', async () => {
    const el = await fixture<BxScroller>(html`
      <bx-scroller aria-label="Files" style="inline-size: 100px">
        <div style="inline-size: 1000px; flex-shrink: 0">wide content</div>
      </bx-scroller>
    `);
    await aTimeout(50);
    await expect(el).to.be.accessible();
  });
});
