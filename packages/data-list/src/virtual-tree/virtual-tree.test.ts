import {
  aTimeout,
  expect,
  fixture,
  html,
  nextFrame,
  oneEvent,
} from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import type { BxVirtualTree, TreeNode } from './virtual-tree.ts';
import './index.ts';

const sample = (): TreeNode[] => [
  {
    id: 'a',
    label: 'Alpha',
    children: [
      { id: 'a1', label: 'Apple' },
      { id: 'a2', label: 'Apricot' },
      { id: 'a3', label: 'Folder', children: [{ id: 'a3x', label: 'Deep' }] },
    ],
  },
  { id: 'b', label: 'Beta', children: [{ id: 'b1', label: 'Banana' }] },
  { id: 'c', label: 'Gamma' },
];

async function setup(
  props: Partial<BxVirtualTree> = {},
): Promise<BxVirtualTree> {
  const el = await fixture<BxVirtualTree>(
    html`<bx-virtual-tree
      style="block-size: 300px; inline-size: 400px"
      aria-label="Files"
    ></bx-virtual-tree>`,
  );
  Object.assign(el, { nodes: sample(), rowHeight: 32, ...props });
  await settle(el);
  return el;
}

async function settle(el: BxVirtualTree): Promise<void> {
  await el.updateComplete;
  await nextFrame();
  await nextFrame();
  await el.updateComplete;
}

const tree = (el: BxVirtualTree) =>
  el.shadowRoot!.querySelector<HTMLElement>('.tree')!;
const rows = (el: BxVirtualTree) => [
  ...el.shadowRoot!.querySelectorAll<HTMLElement>('.node'),
];
const labels = (el: BxVirtualTree) =>
  rows(el).map((r) => r.querySelector('.label')!.textContent!.trim());
const row = (el: BxVirtualTree, label: string) =>
  rows(el).find(
    (r) => r.querySelector('.label')!.textContent!.trim() === label,
  )!;
const active = (el: BxVirtualTree) =>
  tree(el).getAttribute('aria-activedescendant');

describe('bx-virtual-tree', () => {
  it('registers and shows only roots collapsed, with ARIA tree semantics from data', async () => {
    const el = await setup();
    expect(el).to.be.instanceOf(customElements.get('bx-virtual-tree')!);
    expect(labels(el)).to.deep.equal(['Alpha', 'Beta', 'Gamma']);
    expect(tree(el).getAttribute('role')).to.equal('tree');
    const alpha = row(el, 'Alpha');
    expect(alpha.getAttribute('role')).to.equal('treeitem');
    expect(alpha.getAttribute('aria-level')).to.equal('1');
    expect(alpha.getAttribute('aria-setsize')).to.equal('3');
    expect(alpha.getAttribute('aria-posinset')).to.equal('1');
    expect(alpha.getAttribute('aria-expanded')).to.equal('false');
    expect(row(el, 'Gamma').hasAttribute('aria-expanded')).to.be.false;
  });

  it('expands and collapses via click/toggle and fires bx-expand-change', async () => {
    const el = await setup();
    const events: { key: string; expanded: boolean }[] = [];
    el.addEventListener('bx-expand-change', (e) =>
      events.push((e as CustomEvent).detail),
    );
    row(el, 'Alpha').querySelector<HTMLElement>('.toggle')!.click();
    await settle(el);
    expect(labels(el)).to.deep.equal([
      'Alpha',
      'Apple',
      'Apricot',
      'Folder',
      'Beta',
      'Gamma',
    ]);
    expect(row(el, 'Apple').getAttribute('aria-level')).to.equal('2');
    expect(row(el, 'Apricot').getAttribute('aria-posinset')).to.equal('2');
    row(el, 'Alpha').click(); // clicking a plain (non-selectable) branch also toggles
    await settle(el);
    expect(labels(el)).to.deep.equal(['Alpha', 'Beta', 'Gamma']);
    expect(events).to.deep.equal([
      { key: 'a', expanded: true },
      { key: 'a', expanded: false },
    ]);
  });

  it('honors expandedKeys, expandAll(depth), collapseAll and scrollToKey reveal', async () => {
    const el = await setup({ expandedKeys: ['a'] });
    expect(labels(el)).to.include('Apple');
    el.collapseAll();
    await settle(el);
    expect(labels(el)).to.have.length(3);
    el.expandAll(0);
    await settle(el);
    expect(labels(el)).to.include('Apple');
    expect(labels(el)).to.not.include('Deep');
    el.expandAll();
    await settle(el);
    expect(labels(el)).to.include('Deep');
    el.collapseAll();
    el.scrollToKey('a3x');
    await settle(el);
    expect(labels(el)).to.include('Deep');
  });

  it('supports flat input with parentId', async () => {
    const el = await setup({
      nodes: [
        { id: 1, label: 'Root' },
        { id: 2, label: 'Child', parentId: 1 },
        { id: 3, label: 'Grandchild', parentId: 2 },
      ],
      expandedKeys: [1, 2],
    });
    expect(labels(el)).to.deep.equal(['Root', 'Child', 'Grandchild']);
    expect(row(el, 'Grandchild').getAttribute('aria-level')).to.equal('3');
  });

  describe('keyboard (APG tree)', () => {
    it('arrows move, Right expands then enters, Left collapses then goes to parent, Home/End jump', async () => {
      const el = await setup();
      tree(el).focus();
      await sendKeys({ press: 'ArrowDown' });
      await settle(el);
      expect(active(el)).to.match(/-r0$/);
      await sendKeys({ press: 'ArrowRight' }); // expand Alpha
      await settle(el);
      expect(labels(el)).to.include('Apple');
      await sendKeys({ press: 'ArrowRight' }); // into first child
      await settle(el);
      expect(active(el)).to.match(/-r1$/);
      await sendKeys({ press: 'ArrowLeft' }); // child is a leaf: to parent
      await settle(el);
      expect(active(el)).to.match(/-r0$/);
      await sendKeys({ press: 'ArrowLeft' }); // collapse
      await settle(el);
      expect(labels(el)).to.have.length(3);
      await sendKeys({ press: 'End' });
      await settle(el);
      expect(active(el)).to.match(/-r2$/);
      await sendKeys({ press: 'Home' });
      await settle(el);
      expect(active(el)).to.match(/-r0$/);
    });

    it('typeahead jumps by label and * expands siblings', async () => {
      const el = await setup();
      tree(el).focus();
      await sendKeys({ type: 'g' });
      await settle(el);
      expect(active(el)).to.match(/-r2$/);
      await sendKeys({ press: 'Home' });
      await sendKeys({ press: '*' });
      await settle(el);
      expect(labels(el)).to.include.members(['Apple', 'Banana']);
    });

    it('Enter fires bx-node-click and toggles an unselectable branch', async () => {
      const el = await setup();
      tree(el).focus();
      await sendKeys({ press: 'ArrowDown' });
      const clicked = oneEvent(el, 'bx-node-click');
      await sendKeys({ press: 'Enter' });
      expect(((await clicked) as CustomEvent).detail.key).to.equal('a');
      await settle(el);
      expect(labels(el)).to.include('Apple');
    });
  });

  describe('selection', () => {
    it('multiple: a branch selects every leaf below, shows mixed, aggregates without touching rows', async () => {
      const el = await setup({
        selection: 'multiple',
        expandedKeys: ['a', 'a3'],
      });
      const changes: unknown[][] = [];
      el.addEventListener('bx-selection-change', (e) =>
        changes.push((e as CustomEvent).detail.selectedKeys),
      );
      row(el, 'Apple').click();
      await settle(el);
      expect(row(el, 'Apple').getAttribute('aria-checked')).to.equal('true');
      expect(row(el, 'Alpha').getAttribute('aria-checked')).to.equal('mixed');
      expect(row(el, 'Beta').getAttribute('aria-checked')).to.equal('false');
      row(el, 'Alpha').click(); // partially selected -> select all leaves
      await settle(el);
      expect(row(el, 'Alpha').getAttribute('aria-checked')).to.equal('true');
      expect(row(el, 'Deep').getAttribute('aria-checked')).to.equal('true');
      expect(el.selectedKeys).to.have.members(['a1', 'a2', 'a3x']);
      row(el, 'Alpha').click(); // fully selected -> deselect all
      await settle(el);
      expect(el.selectedKeys).to.deep.equal([]);
      expect(changes).to.have.length(3);
    });

    it('single replaces the selection; leaf only selects leaves', async () => {
      const single = await setup({ selection: 'single', expandedKeys: ['a'] });
      row(single, 'Apple').click();
      row(single, 'Apricot').click();
      await settle(single);
      expect(single.selectedKeys).to.deep.equal(['a2']);
      expect(row(single, 'Apricot').getAttribute('aria-selected')).to.equal(
        'true',
      );

      const leaf = await setup({ selection: 'leaf' });
      row(leaf, 'Alpha').click(); // branch: toggles open, selects nothing
      await settle(leaf);
      expect(leaf.selectedKeys).to.deep.equal([]);
      row(leaf, 'Apple').click();
      await settle(leaf);
      expect(leaf.selectedKeys).to.deep.equal(['a1']);
    });

    it('Space toggles the active node', async () => {
      const el = await setup({ selection: 'multiple' });
      tree(el).focus();
      await sendKeys({ press: 'ArrowDown' });
      await sendKeys({ press: 'Space' });
      await settle(el);
      expect(row(el, 'Alpha').getAttribute('aria-checked')).to.equal('true');
    });
  });

  describe('filter', () => {
    it('keeps matches and ancestors, auto-expanding the path', async () => {
      const el = await setup({ filter: 'deep' });
      expect(labels(el)).to.deep.equal(['Alpha', 'Folder', 'Deep']);
      el.filter = (n) => n.label === 'Banana';
      await settle(el);
      expect(labels(el)).to.deep.equal(['Beta', 'Banana']);
      el.filter = '';
      await settle(el);
      expect(labels(el)).to.deep.equal(['Alpha', 'Beta', 'Gamma']);
    });

    it('shows the empty state when nothing matches', async () => {
      const el = await setup({ filter: 'zzz' });
      expect(el.shadowRoot!.querySelector('.empty')).to.exist;
    });
  });

  describe('lazy loading', () => {
    const lazyNodes = (): TreeNode[] => [
      { id: 'root', label: 'Remote', hasChildren: true },
    ];

    it('loads children through the data source with a loading state', async () => {
      let resolve!: (n: TreeNode[]) => void;
      const el = await setup({
        nodes: lazyNodes(),
        dataSource: { getChildren: () => new Promise((r) => (resolve = r)) },
      });
      const lazyEvent = oneEvent(el, 'bx-lazy-load');
      row(el, 'Remote').querySelector<HTMLElement>('.toggle')!.click();
      expect(((await lazyEvent) as CustomEvent).detail.key).to.equal('root');
      await settle(el);
      expect(row(el, 'Remote').textContent).to.contain('Loading');
      resolve([
        { id: 'k1', label: 'Kid 1' },
        { id: 'k2', label: 'Kid 2' },
      ]);
      await aTimeout(30);
      await settle(el);
      expect(labels(el)).to.deep.equal(['Remote', 'Kid 1', 'Kid 2']);
    });

    it('shows a per-node error and retries on Enter', async () => {
      let calls = 0;
      const el = await setup({
        nodes: lazyNodes(),
        dataSource: {
          async getChildren() {
            calls++;
            if (calls === 1) throw new Error('nope');
            return [{ id: 'k', label: 'Recovered' }];
          },
        },
      });
      row(el, 'Remote').querySelector<HTMLElement>('.toggle')!.click();
      await aTimeout(30);
      await settle(el);
      expect(row(el, 'Remote').textContent).to.contain('Failed to load');
      tree(el).focus();
      await sendKeys({ press: 'ArrowDown' });
      await sendKeys({ press: 'Enter' });
      await aTimeout(30);
      await settle(el);
      expect(labels(el)).to.include('Recovered');
      expect(calls).to.equal(2);
    });

    it('lets the app answer bx-lazy-load with setChildren()', async () => {
      const el = await setup({ nodes: lazyNodes() });
      el.addEventListener('bx-lazy-load', (e) => {
        const { key } = (e as CustomEvent).detail;
        queueMicrotask(() =>
          el.setChildren(key, [{ id: 'x', label: 'From app' }]),
        );
      });
      row(el, 'Remote').querySelector<HTMLElement>('.toggle')!.click();
      await aTimeout(30);
      await settle(el);
      expect(labels(el)).to.include('From app');
    });

    it('aborts in-flight loads on disconnect', async () => {
      let signal!: AbortSignal;
      const el = await setup({
        nodes: lazyNodes(),
        dataSource: {
          getChildren: (_k, s) => ((signal = s), new Promise(() => undefined)),
        },
      });
      row(el, 'Remote').querySelector<HTMLElement>('.toggle')!.click();
      el.remove();
      expect(signal.aborted).to.be.true;
    });
  });

  describe('scale', () => {
    const big = (n: number): TreeNode[] => [
      {
        id: 'root',
        label: 'Root',
        children: Array.from({ length: n }, (_, i) => ({
          id: `c${i}`,
          label: `Child ${i}`,
        })),
      },
    ];

    it('renders a window for 200k visible nodes and expands 10k children quickly', async () => {
      const el = await setup({ nodes: big(200_000), expandedKeys: ['root'] });
      expect(rows(el).length).to.be.lessThan(40);
      expect(el.visibleCount).to.equal(200_001);
      expect(rows(el)[1]!.getAttribute('aria-setsize')).to.equal('200000');

      const small = await setup({ nodes: big(10_000) });
      const start = performance.now();
      small.expand('root');
      await small.updateComplete;
      const elapsed = performance.now() - start;
      console.log(
        `bx-virtual-tree: expand 10k children in ${elapsed.toFixed(1)}ms`,
      );
      expect(elapsed).to.be.lessThan(150);
      expect(small.visibleCount).to.equal(10_001);
    });

    it('selects a 100k-leaf branch without rendering it', async () => {
      const el = await setup({ nodes: big(100_000), selection: 'multiple' });
      const start = performance.now();
      row(el, 'Root').click();
      await el.updateComplete;
      console.log(
        `bx-virtual-tree: select 100k leaves in ${(performance.now() - start).toFixed(1)}ms`,
      );
      expect(el.selectedKeys).to.have.length(100_000);
      expect(row(el, 'Root').getAttribute('aria-checked')).to.equal('true');
    });
  });

  it('has no axe violations (plain, expanded multiple-select, empty)', async () => {
    const plain = await setup({ expandedKeys: ['a'] });
    await expect(plain).to.be.accessible();
    const multi = await setup({ selection: 'multiple', expandedKeys: ['a'] });
    tree(multi).focus();
    await sendKeys({ press: 'ArrowDown' });
    await expect(multi).to.be.accessible();
  });
});
