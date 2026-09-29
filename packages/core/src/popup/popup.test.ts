import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxPopup } from './popup.ts';
import './index.ts';

async function withAnchor() {
  const wrapper = await fixture<HTMLDivElement>(html`
    <div style="position: relative;">
      <button id="anchor" style="position: absolute; top: 300px; left: 300px; width: 80px; height: 30px;">
        Anchor
      </button>
      <bx-popup anchor="anchor" style="position: fixed;">
        <div style="width: 100px; height: 40px;">Content</div>
      </bx-popup>
    </div>
  `);
  const popup = wrapper.querySelector('bx-popup') as BxPopup;
  return { wrapper, popup };
}

describe('bx-popup', () => {
  it('registers the tag with default placement/strategy', async () => {
    const el = await fixture<BxPopup>(html`<bx-popup></bx-popup>`);
    expect(el).to.be.instanceOf(customElements.get('bx-popup')!);
    expect(el.placement).to.equal('top');
    expect(el.strategy).to.equal('absolute');
  });

  it('stays hidden while inactive', async () => {
    const { popup } = await withAnchor();
    expect(getComputedStyle(popup).display).to.equal('none');
  });

  it('positions above the anchor by default when active', async () => {
    const { popup } = await withAnchor();
    popup.strategy = 'fixed'; // strategy="absolute" is relative to the nearest positioned
    // ancestor (here the fixture's `position: relative` wrapper), not the viewport — see the
    // component's own doc comment. "fixed" is unaffected by that and is what this test asserts.
    popup.active = true;
    await popup.updateComplete;
    const anchorRect = document.getElementById('anchor')!.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    expect(popupRect.bottom).to.be.closeTo(anchorRect.top, 1);
  });

  it('applies distance as a gap from the anchor', async () => {
    const { popup } = await withAnchor();
    popup.strategy = 'fixed';
    popup.active = true;
    popup.distance = 10;
    await popup.updateComplete;
    const anchorRect = document.getElementById('anchor')!.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    expect(anchorRect.top - popupRect.bottom).to.be.closeTo(10, 1);
  });

  it('flips to bottom when there is no room above', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <button id="anchor2" style="position: fixed; top: 5px; left: 5px; width: 60px; height: 20px;">
          Anchor
        </button>
        <bx-popup anchor="anchor2" placement="top" flip style="position: fixed;">
          <div style="width: 100px; height: 40px;">Content</div>
        </bx-popup>
      </div>
    `);
    const popup = wrapper.querySelector('bx-popup') as BxPopup;
    popup.active = true;
    await popup.updateComplete;
    const anchorRect = document.getElementById('anchor2')!.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    expect(popupRect.top).to.be.closeTo(anchorRect.bottom, 1);
  });

  it('syncs width to the anchor when sync=width', async () => {
    const { popup } = await withAnchor();
    popup.sync = 'width';
    popup.active = true;
    await popup.updateComplete;
    const anchorRect = document.getElementById('anchor')!.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    expect(popupRect.width).to.be.closeTo(anchorRect.width, 1);
  });

  it('fires bx-reposition on reposition()', async () => {
    const { popup } = await withAnchor();
    popup.active = true;
    await popup.updateComplete;
    const repositionPromise = oneEvent(popup, 'bx-reposition');
    popup.reposition();
    await repositionPromise;
  });

  it('has no axe violations while active', async () => {
    const { popup } = await withAnchor();
    popup.active = true;
    await popup.updateComplete;
    await expect(popup).to.be.accessible();
  });

  // Regression: `updated()` repositions on every update while active, and used to call an
  // unconditional `requestUpdate()` from inside the arrow-offset calculation, re-triggering
  // `updated()` forever whenever `arrow` and `active` were both set (found via `bx-tooltip`,
  // which renders exactly that combination by default).
  it('settles instead of looping when arrow and active are both set', async () => {
    const { popup } = await withAnchor();
    popup.arrow = true;
    popup.active = true;
    await popup.updateComplete;
    // If this hangs, the update loop regressed.
    await popup.updateComplete;
    expect(getComputedStyle(popup).display).to.equal('block');
  });
});
