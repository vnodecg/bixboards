import { aTimeout, expect } from '@open-wc/testing';
import { createRef, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import {
  BxButton,
  BxDataTable,
  BxDropdown,
  BxDropdownItem,
  BxInput,
  BxSelect,
  BxVirtualTree,
  type BxButtonElement,
  type BxDataTableElement,
  type BxDropdownElement,
  type BxInputElement,
  type BxSelectElement,
  type BxVirtualTreeElement,
} from './index.ts';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  root.unmount();
  host.remove();
});

const render = async (node: React.ReactNode): Promise<void> => {
  flushSync(() => root.render(<StrictMode>{node}</StrictMode>));
  await aTimeout(30);
};

describe('@bixboards/react', () => {
  it('registers the element and forwards a ref to it', async () => {
    const ref = createRef<BxButtonElement>();
    await render(<BxButton ref={ref}>Save</BxButton>);
    expect(ref.current).to.be.instanceOf(customElements.get('bx-button')!);
    expect(ref.current!.textContent).to.equal('Save');
  });

  it('binds properties (not attributes): arrays, objects, false and 0 arrive by reference', async () => {
    const options = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
    ];
    const ref = createRef<BxSelectElement>();
    await render(
      <BxSelect
        ref={ref}
        options={options}
        multiple
        value={['a']}
        placeholder="Pick"
      />,
    );
    const el = ref.current!;
    expect(el.options).to.equal(options); // same reference, not a stringified attribute
    expect(el.multiple).to.be.true;
    expect(el.value).to.deep.equal(['a']);
    expect(el.placeholder).to.equal('Pick');

    await render(
      <BxSelect ref={ref} options={options} multiple={false} value="b" />,
    );
    expect(el.multiple).to.be.false; // false is assigned, not dropped
    expect(el.value).to.equal('b');
  });

  it('maps onBx* props to bx-* events and keeps handlers current across renders', async () => {
    const calls: string[] = [];
    const ref = createRef<BxSelectElement>();
    const options = [{ value: 'a', label: 'A' }];
    await render(
      <BxSelect
        ref={ref}
        options={options}
        onBxShow={() => calls.push('first')}
      />,
    );
    ref.current!.show();
    await aTimeout(30);
    expect(calls).to.deep.equal(['first']);
    ref.current!.hide();
    await render(
      <BxSelect
        ref={ref}
        options={options}
        onBxShow={() => calls.push('second')}
      />,
    );
    ref.current!.show();
    await aTimeout(30);
    expect(calls).to.deep.equal(['first', 'second']); // latest handler, one listener
  });

  it('binds native input/change as onInput/onChange exactly once and exposes event detail', async () => {
    const seen: string[] = [];
    const ref = createRef<BxInputElement>();
    await render(
      <BxInput
        ref={ref}
        label="Name"
        onInput={() => seen.push('input')}
        onChange={() => seen.push('change')}
      />,
    );
    const inner = ref.current!.shadowRoot!.querySelector('input')!;
    inner.value = 'x';
    inner.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    inner.dispatchEvent(new Event('change', { bubbles: true }));
    await aTimeout(20);
    expect(seen).to.deep.equal(['input', 'change']);
    expect(ref.current!.value).to.equal('x');
  });

  it('round-trips a controlled value and reads detail from custom events', async () => {
    let selected: unknown;
    const ref = createRef<BxDropdownElement>();
    await render(
      <BxDropdown ref={ref} onBxSelect={(e) => (selected = e.detail)}>
        <BxButton slot="trigger">Menu</BxButton>
        <BxDropdownItem value="one">One</BxDropdownItem>
      </BxDropdown>,
    );
    const item = ref.current!.querySelector('bx-dropdown-item')!;
    item.shadowRoot!.querySelector<HTMLElement>('.base')!.click();
    await aTimeout(20);
    expect((selected as { value: string }).value).to.equal('one');
    // `slot` on a child assigns it to the element's named slot.
    expect(ref.current!.querySelector('[slot="trigger"]')).to.exist;
  });

  it('turns className into class and passes style, id, aria and data attributes through', async () => {
    const ref = createRef<BxButtonElement>();
    await render(
      <BxButton
        ref={ref}
        className="primary wide"
        id="save"
        style={{ color: 'red' }}
        aria-label="Save it"
        data-test="x"
      >
        S
      </BxButton>,
    );
    const el = ref.current!;
    expect(el.getAttribute('class')).to.equal('primary wide');
    expect(el.id).to.equal('save');
    expect(el.style.color).to.equal('red');
    expect(el.getAttribute('aria-label')).to.equal('Save it');
    expect(el.dataset['test']).to.equal('x');
  });

  it('drives the data components with object props', async () => {
    const ref = createRef<BxVirtualTreeElement>();
    const nodes = [
      { id: 'a', label: 'Alpha', children: [{ id: 'a1', label: 'Child' }] },
    ];
    await render(
      <BxVirtualTree
        ref={ref}
        nodes={nodes}
        expandedKeys={['a']}
        style={{ blockSize: 200 }}
      />,
    );
    await aTimeout(60);
    expect(
      ref.current!.shadowRoot!.querySelectorAll('[role="treeitem"]'),
    ).to.have.length(2);

    const tableRef = createRef<BxDataTableElement>();
    await render(
      <BxDataTable
        ref={tableRef}
        style={{ blockSize: 200, inlineSize: 400 }}
        columns={[{ field: 'n', header: 'N' }]}
        data={[{ n: 1 }, { n: 2 }]}
        rowHeight={30}
      />,
    );
    await aTimeout(60);
    expect(
      tableRef.current!.shadowRoot!.querySelectorAll('[role="row"][data-row]'),
    ).to.have.length(2);
  });

  it('unmounts without leaking listeners', async () => {
    let shows = 0;
    const ref = createRef<BxSelectElement>();
    await render(<BxSelect ref={ref} options={[]} onBxShow={() => shows++} />);
    const el = ref.current!;
    root.unmount();
    el.dispatchEvent(new CustomEvent('bx-show'));
    expect(shows).to.equal(0);
    root = createRoot(host);
  });
});
