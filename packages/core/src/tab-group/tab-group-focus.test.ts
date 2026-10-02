import { expect, fixture, html, nextFrame } from '@open-wc/testing';
import type { BxTabGroup } from './tab-group.ts';
import type { BxTab } from '../tab/tab.ts';
import '../tab/index.ts';
import '../tab-panel/index.ts';
import './index.ts';

const tabs = () => html`
  <bx-tab-group>
    <bx-tab slot="nav" panel="a">A</bx-tab>
    <bx-tab slot="nav" panel="b">B</bx-tab>
    <bx-tab slot="nav" panel="c" disabled>C</bx-tab>
    <bx-tab slot="nav" panel="d">D</bx-tab>
    <bx-tab-panel name="a">A</bx-tab-panel>
    <bx-tab-panel name="b">B</bx-tab-panel>
    <bx-tab-panel name="c">C</bx-tab-panel>
    <bx-tab-panel name="d">D</bx-tab-panel>
  </bx-tab-group>
`;

const press = (el: Element, key: string) =>
  (el.shadowRoot!.activeElement ?? el).dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, composed: true }),
  );

describe('bx-tab-group keyboard focus and indicator', () => {
  it('keyboard focus follows the selection (roving focus, skipping disabled tabs)', async () => {
    const group = await fixture<BxTabGroup>(tabs());
    const [a, b, , d] = [...group.querySelectorAll('bx-tab')] as BxTab[];
    a!.focus();
    expect(document.activeElement).to.equal(a);

    press(a!, 'ArrowRight');
    await nextFrame();
    expect(document.activeElement).to.equal(b);
    expect(group.active).to.equal('b');

    press(b!, 'ArrowRight'); // disabled C is skipped
    await nextFrame();
    expect(document.activeElement).to.equal(d);
    expect(group.active).to.equal('d');

    press(d!, 'Home');
    await nextFrame();
    expect(document.activeElement).to.equal(a);
  });

  it('places the selection indicator under the active tab and moves it with the selection', async () => {
    const group = await fixture<BxTabGroup>(tabs());
    await nextFrame();
    await nextFrame();
    const indicator =
      group.shadowRoot!.querySelector<HTMLElement>('.indicator')!;
    const [a, b] = [...group.querySelectorAll('bx-tab')];
    expect(indicator.hasAttribute('data-ready')).to.be.true;
    const listLeft = group
      .shadowRoot!.querySelector('.tabs')!
      .getBoundingClientRect().left;
    expect(parseFloat(indicator.style.getPropertyValue('--_x'))).to.be.closeTo(
      a!.getBoundingClientRect().left - listLeft,
      1,
    );

    group.show('b');
    await nextFrame();
    await nextFrame();
    expect(parseFloat(indicator.style.getPropertyValue('--_x'))).to.be.closeTo(
      b!.getBoundingClientRect().left - listLeft,
      1,
    );
    expect(parseFloat(indicator.style.getPropertyValue('--_w'))).to.be.closeTo(
      b!.getBoundingClientRect().width,
      1,
    );
  });
});
