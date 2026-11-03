import { aTimeout, expect } from '@open-wc/testing';
import { flushSync, mount, unmount } from 'svelte';
import Harness from './harness/Harness.svelte';

let target: HTMLDivElement;
let app: Record<string, () => unknown> | undefined;

async function setup(log: string[] = []) {
  target = document.createElement('div');
  document.body.append(target);
  app = mount(Harness, { target, props: { log } }) as unknown as Record<
    string,
    () => unknown
  >;
  flushSync();
  await aTimeout(60);
  return app as unknown as {
    getState: () => { country: string; text: string; dropdownOpen: boolean };
    setCountry: (v: string) => void;
    getSelect: () =>
      (HTMLElement & { value: string; options: unknown[] }) | undefined;
  };
}

afterEach(() => {
  if (app) unmount(app);
  app = undefined;
  target?.remove();
});

describe('@bixboards/svelte', () => {
  it('compiles and mounts wrappers that register the custom elements', async () => {
    await setup();
    for (const tag of [
      'bx-select',
      'bx-input',
      'bx-dropdown',
      'bx-button',
      'bx-virtual-tree',
    ])
      expect(target.querySelector(tag), tag).to.be.instanceOf(
        customElements.get(tag)!,
      );
  });

  it('sets properties by reference (options) and exposes the element through bind:element', async () => {
    const harness = await setup();
    const select = harness.getSelect()!;
    expect(select).to.equal(target.querySelector('bx-select'));
    expect(select.options).to.have.length(2);
    expect(select.value).to.equal('b'); // initial bound value flows into the element
  });

  it('bind:value is two-way (component -> element, element -> component)', async () => {
    const harness = await setup();
    const select = harness.getSelect()!;
    harness.setCountry('a');
    flushSync();
    await aTimeout(30);
    expect(select.value).to.equal('a');

    select.value = 'b';
    select.dispatchEvent(
      new Event('change', { bubbles: true, composed: true }),
    );
    await aTimeout(30);
    expect(harness.getState().country).to.equal('b');

    const input = target.querySelector('bx-input') as HTMLElement & {
      value: string;
    };
    const inner = input.shadowRoot!.querySelector('input')!;
    inner.value = 'hello';
    inner.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    await aTimeout(30);
    expect(harness.getState().text).to.equal('hello');
  });

  it('maps onBx* callback props to bx-* events', async () => {
    const log: string[] = [];
    const harness = await setup(log);
    harness
      .getSelect()!
      .dispatchEvent(
        new CustomEvent('bx-show', { bubbles: true, composed: true }),
      );
    expect(log).to.deep.equal(['show']);

    const item = target.querySelector('bx-dropdown-item')!;
    item.shadowRoot!.querySelector<HTMLElement>('.base')!.click();
    await aTimeout(20);
    expect(log).to.include('select:one');
  });

  it('bind:open follows bx-after-show / bx-after-hide', async () => {
    const harness = await setup();
    const dropdown = target.querySelector('bx-dropdown') as HTMLElement & {
      show(): void;
      hide(): void;
      open: boolean;
    };
    dropdown.show();
    await aTimeout(80);
    expect(harness.getState().dropdownOpen).to.be.true;
    dropdown.hide();
    await aTimeout(80);
    expect(harness.getState().dropdownOpen).to.be.false;
  });

  it('passes class, data attributes and named slots through', async () => {
    await setup();
    const input = target.querySelector('bx-input')!;
    expect(input.classList.contains('field')).to.be.true;
    expect((input as HTMLElement).dataset['test']).to.equal('input');
    expect(target.querySelector('bx-dropdown > bx-button[slot="trigger"]')).to
      .exist;
  });

  it('drives the data components with object props', async () => {
    await setup();
    const tree = target.querySelector('bx-virtual-tree')!;
    await aTimeout(60);
    expect(
      tree.shadowRoot!.querySelectorAll('[role="treeitem"]'),
    ).to.have.length(2);
  });

  it('removes its listeners on unmount', async () => {
    const log: string[] = [];
    const harness = await setup(log);
    const select = harness.getSelect()!;
    unmount(app!);
    app = undefined;
    select.dispatchEvent(new CustomEvent('bx-show'));
    expect(log).to.deep.equal([]);
  });
});
