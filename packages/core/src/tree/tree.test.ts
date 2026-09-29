import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxTree } from './tree.ts';
import type { BxTreeItem } from '../tree-item/tree-item.ts';
import './index.ts';

async function fixtureTree(selection: 'single' | 'multiple' | 'leaf' = 'single') {
  return fixture<BxTree>(html`
    <bx-tree selection=${selection}>
      <bx-tree-item with-checkbox>
        Fruit
        <bx-tree-item slot="children" with-checkbox>Apple</bx-tree-item>
        <bx-tree-item slot="children" with-checkbox>Pear</bx-tree-item>
      </bx-tree-item>
      <bx-tree-item with-checkbox>Vegetable</bx-tree-item>
    </bx-tree>
  `);
}

describe('bx-tree', () => {
  it('sets role=tree and role=treeitem with aria-level/setsize/posinset', async () => {
    const el = await fixtureTree();
    expect(el.shadowRoot!.querySelector('.base')!.getAttribute('role')).to.equal('tree');

    const [fruit, apple, , vegetable] = el.querySelectorAll(
      'bx-tree-item',
    ) as unknown as BxTreeItem[];
    expect(fruit!.getAttribute('role')).to.equal('treeitem');
    expect(fruit!.getAttribute('aria-level')).to.equal('1');
    expect(apple!.getAttribute('aria-level')).to.equal('2');
    expect(fruit!.getAttribute('aria-setsize')).to.equal('2');
    expect(vegetable!.getAttribute('aria-posinset')).to.equal('2');
  });

  it('single selection: clicking a row selects it exclusively', async () => {
    const el = await fixtureTree('single');
    const [fruit, , , vegetable] = el.querySelectorAll(
      'bx-tree-item',
    ) as unknown as BxTreeItem[];
    fruit!.click();
    await el.updateComplete;
    expect(fruit!.selected).to.be.true;

    vegetable!.click();
    await el.updateComplete;
    expect(vegetable!.selected).to.be.true;
    expect(fruit!.selected).to.be.false;
  });

  it('multiple selection: checking a parent selects all descendants', async () => {
    const el = await fixtureTree('multiple');
    const [fruit, apple, pear] = el.querySelectorAll(
      'bx-tree-item',
    ) as unknown as BxTreeItem[];
    fruit!.shadowRoot!.querySelector<HTMLElement>('[role="checkbox"]')!.click();
    await el.updateComplete;
    expect(fruit!.selected).to.be.true;
    expect(apple!.selected).to.be.true;
    expect(pear!.selected).to.be.true;
  });

  it('multiple selection: partially selecting children makes the parent indeterminate', async () => {
    const el = await fixtureTree('multiple');
    const [fruit, apple] = el.querySelectorAll('bx-tree-item') as unknown as BxTreeItem[];
    apple!.shadowRoot!.querySelector<HTMLElement>('[role="checkbox"]')!.click();
    await el.updateComplete;
    expect(fruit!.indeterminate).to.be.true;
    expect(fruit!.selected).to.be.false;
  });

  it('fires bx-selection-change with the selected items', async () => {
    const el = await fixtureTree('single');
    const [fruit] = el.querySelectorAll('bx-tree-item') as unknown as BxTreeItem[];
    const changePromise = oneEvent(el, 'bx-selection-change');
    fruit!.click();
    const event = (await changePromise) as CustomEvent;
    expect(event.detail.selection).to.deep.equal([fruit]);
  });

  it('leaf selection: clicking a parent expands instead of selecting', async () => {
    const el = await fixtureTree('leaf');
    const [fruit, apple] = el.querySelectorAll('bx-tree-item') as unknown as BxTreeItem[];
    fruit!.click();
    await el.updateComplete;
    expect(fruit!.selected).to.be.false;
    expect(fruit!.expanded).to.be.true;

    apple!.click();
    await el.updateComplete;
    expect(apple!.selected).to.be.true;
  });

  it('ArrowDown moves the active item to the next visible item', async () => {
    const el = await fixtureTree('single');
    const [fruit, , , vegetable] = el.querySelectorAll(
      'bx-tree-item',
    ) as unknown as BxTreeItem[];
    fruit!.focus();
    fruit!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }),
    );
    // Fruit is collapsed, so its children aren't visible: next visible item is Vegetable.
    expect(document.activeElement === vegetable || vegetable!.matches(':focus-within')).to.be
      .true;
  });

  it('ArrowRight expands a collapsed parent; ArrowLeft collapses it', async () => {
    const el = await fixtureTree('single');
    const [fruit] = el.querySelectorAll('bx-tree-item') as unknown as BxTreeItem[];
    fruit!.focus();
    fruit!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }),
    );
    await fruit!.updateComplete;
    expect(fruit!.expanded).to.be.true;

    fruit!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, composed: true }),
    );
    await fruit!.updateComplete;
    expect(fruit!.expanded).to.be.false;
  });

  it('roving tabindex: only one item is a tab stop', async () => {
    const el = await fixtureTree('single');
    const items = [...el.querySelectorAll('bx-tree-item')] as unknown as BxTreeItem[];
    const tabbable = items.filter((item) => item.tabIndex === 0);
    expect(tabbable.length).to.equal(1);
  });

  it('warns once when the tree is very large', async () => {
    const tree = document.createElement('bx-tree') as BxTree;
    tree.innerHTML = Array.from(
      { length: 501 },
      (_, index) => `<bx-tree-item>Item ${index}</bx-tree-item>`,
    ).join('');

    const original = console.warn;
    let warned = 0;
    console.warn = () => warned++;
    try {
      document.body.append(tree);
      await tree.updateComplete;
      expect(warned).to.equal(1);
    } finally {
      console.warn = original;
      tree.remove();
    }
  });

  it('has no axe violations', async () => {
    const el = await fixtureTree('multiple');
    await expect(el).to.be.accessible();
  });
});
