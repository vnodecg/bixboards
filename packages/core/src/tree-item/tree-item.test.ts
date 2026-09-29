import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxTreeItem } from './tree-item.ts';
import './index.ts';

describe('bx-tree-item', () => {
  it('registers the tag, collapsed by default, with no spurious lazy-change on mount', async () => {
    const el = await fixture<BxTreeItem>(html`<bx-tree-item>Node</bx-tree-item>`);
    expect(el).to.be.instanceOf(customElements.get('bx-tree-item')!);
    expect(el.expanded).to.be.false;
  });

  it('does not fire bx-lazy-change or auto-expand on mount', async () => {
    const el = await fixture<BxTreeItem>(html`<bx-tree-item lazy>Node</bx-tree-item>`);
    let fired = false;
    el.addEventListener('bx-lazy-change', () => (fired = true));
    await el.updateComplete;
    expect(fired).to.be.false;
    expect(el.expanded).to.be.false;
  });

  it('shows no expand button for a leaf, non-lazy item', async () => {
    const el = await fixture<BxTreeItem>(html`<bx-tree-item>Leaf</bx-tree-item>`);
    const button = el.shadowRoot!.querySelector('.expand-button')!;
    expect(button.classList.contains('placeholder')).to.be.true;
  });

  it('shows an expand button when children are slotted', async () => {
    const el = await fixture<BxTreeItem>(html`
      <bx-tree-item>
        Parent
        <bx-tree-item slot="children">Child</bx-tree-item>
      </bx-tree-item>
    `);
    await el.updateComplete;
    const button = el.shadowRoot!.querySelector('.expand-button')!;
    expect(button.classList.contains('placeholder')).to.be.false;
  });

  it('expands and collapses via the expand button, firing the expand/collapse event pairs', async () => {
    const el = await fixture<BxTreeItem>(html`
      <bx-tree-item>
        Parent
        <bx-tree-item slot="children">Child</bx-tree-item>
      </bx-tree-item>
    `);
    await el.updateComplete;
    const button = el.shadowRoot!.querySelector<HTMLButtonElement>('.expand-button')!;

    const expandPromise = oneEvent(el, 'bx-expand');
    const afterExpandPromise = oneEvent(el, 'bx-after-expand');
    button.click();
    await expandPromise;
    await afterExpandPromise;
    expect(el.expanded).to.be.true;

    const collapsePromise = oneEvent(el, 'bx-collapse');
    button.click();
    await collapsePromise;
    expect(el.expanded).to.be.false;
  });

  it('hides the children wrapper when collapsed', async () => {
    const el = await fixture<BxTreeItem>(html`
      <bx-tree-item>
        Parent
        <bx-tree-item slot="children">Child</bx-tree-item>
      </bx-tree-item>
    `);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.children')!.hasAttribute('hidden')).to.be.true;
  });

  it('does not expand a lazy item immediately, instead firing cancelable bx-lazy-load', async () => {
    const el = await fixture<BxTreeItem>(html`<bx-tree-item lazy>Node</bx-tree-item>`);
    const lazyLoadPromise = oneEvent(el, 'bx-lazy-load');
    el.shadowRoot!.querySelector<HTMLButtonElement>('.expand-button')!.click();
    await lazyLoadPromise;
    expect(el.loading).to.be.true;
    expect(el.expanded).to.be.false;
  });

  it('expands once loading resolves successfully, firing bx-lazy-change', async () => {
    const el = await fixture<BxTreeItem>(html`<bx-tree-item lazy>Node</bx-tree-item>`);
    el.shadowRoot!.querySelector<HTMLButtonElement>('.expand-button')!.click();
    await el.updateComplete;
    const lazyChangePromise = oneEvent(el, 'bx-lazy-change');
    const expandPromise = oneEvent(el, 'bx-expand');
    el.loading = false;
    const [lazyChangeEvent] = await Promise.all([lazyChangePromise, expandPromise]);
    expect((lazyChangeEvent as CustomEvent).detail).to.deep.equal({ loading: false, error: false });
    expect(el.expanded).to.be.true;
  });

  it('retries after a failed lazy load instead of expanding', async () => {
    const el = await fixture<BxTreeItem>(html`<bx-tree-item lazy>Node</bx-tree-item>`);
    el.shadowRoot!.querySelector<HTMLButtonElement>('.expand-button')!.click();
    await el.updateComplete;
    el.lazyError = true;
    el.loading = false;
    await el.updateComplete;
    expect(el.expanded).to.be.false;

    const retryPromise = oneEvent(el, 'bx-lazy-load');
    el.shadowRoot!.querySelector<HTMLButtonElement>('.expand-button')!.click();
    await retryPromise;
    expect(el.loading).to.be.true;
  });

  it('toggles selected via the checkbox when with-checkbox is set', async () => {
    const el = await fixture<BxTreeItem>(
      html`<bx-tree-item with-checkbox>Node</bx-tree-item>`,
    );
    const checkbox = el.shadowRoot!.querySelector<HTMLElement>('[role="checkbox"]')!;
    checkbox.click();
    await el.updateComplete;
    expect(el.selected).to.be.true;
    expect(checkbox.getAttribute('aria-checked')).to.equal('true');
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxTreeItem>(
      html`<bx-tree-item with-checkbox>Node</bx-tree-item>`,
    );
    await expect(el).to.be.accessible();
  });
});
