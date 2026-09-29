import { expect, fixture, html } from '@open-wc/testing';
import type { BxBreadcrumb } from './breadcrumb.ts';
import type { BxBreadcrumbItem } from '../breadcrumb-item/breadcrumb-item.ts';
import './index.ts';

describe('bx-breadcrumb', () => {
  it('renders a nav with the label as its accessible name', async () => {
    const el = await fixture<BxBreadcrumb>(html`
      <bx-breadcrumb>
        <bx-breadcrumb-item href="/">Home</bx-breadcrumb-item>
      </bx-breadcrumb>
    `);
    const nav = el.shadowRoot!.querySelector('nav')!;
    expect(nav.getAttribute('aria-label')).to.equal('Breadcrumb');
  });

  it('sets role=listitem on every item and current on the last one', async () => {
    const el = await fixture<BxBreadcrumb>(html`
      <bx-breadcrumb>
        <bx-breadcrumb-item href="/">Home</bx-breadcrumb-item>
        <bx-breadcrumb-item href="/a">A</bx-breadcrumb-item>
        <bx-breadcrumb-item>B</bx-breadcrumb-item>
      </bx-breadcrumb>
    `);
    const items = [...el.querySelectorAll('bx-breadcrumb-item')] as BxBreadcrumbItem[];
    for (const item of items) expect(item.getAttribute('role')).to.equal('listitem');
    expect(items[0]!.current).to.be.false;
    expect(items[1]!.current).to.be.false;
    expect(items[2]!.current).to.be.true;
  });

  it('does not collapse when items fit', async () => {
    const el = await fixture<BxBreadcrumb>(html`
      <bx-breadcrumb>
        <bx-breadcrumb-item href="/">A</bx-breadcrumb-item>
        <bx-breadcrumb-item href="/">B</bx-breadcrumb-item>
        <bx-breadcrumb-item>C</bx-breadcrumb-item>
      </bx-breadcrumb>
    `);
    const items = [...el.querySelectorAll('bx-breadcrumb-item')] as BxBreadcrumbItem[];
    expect(items.every((item) => !item.hidden)).to.be.true;
    expect(el.querySelector('.bx-breadcrumb-ellipsis')).to.not.exist;
  });

  it('collapses middle items into an ellipsis when the container is too narrow', async () => {
    const container = await fixture<HTMLDivElement>(html`
      <div style="inline-size: 160px">
        <bx-breadcrumb>
          <bx-breadcrumb-item href="/">Home</bx-breadcrumb-item>
          <bx-breadcrumb-item href="/a">Category</bx-breadcrumb-item>
          <bx-breadcrumb-item href="/a/b">Subcategory</bx-breadcrumb-item>
          <bx-breadcrumb-item href="/a/b/c">Product</bx-breadcrumb-item>
          <bx-breadcrumb-item>Current page</bx-breadcrumb-item>
        </bx-breadcrumb>
      </div>
    `);
    const el = container.querySelector('bx-breadcrumb') as BxBreadcrumb;
    await el.updateComplete;

    const ellipsis = el.querySelector('.bx-breadcrumb-ellipsis') as HTMLButtonElement;
    expect(ellipsis).to.exist;

    const items = [...el.querySelectorAll('bx-breadcrumb-item')] as BxBreadcrumbItem[];
    expect(items[0]!.hidden).to.be.false;
    expect(items[items.length - 1]!.hidden).to.be.false;
    expect(items.some((item) => item.hidden)).to.be.true;
  });

  it('clicking the ellipsis reveals every item', async () => {
    const container = await fixture<HTMLDivElement>(html`
      <div style="inline-size: 160px">
        <bx-breadcrumb>
          <bx-breadcrumb-item href="/">Home</bx-breadcrumb-item>
          <bx-breadcrumb-item href="/a">Category</bx-breadcrumb-item>
          <bx-breadcrumb-item href="/a/b">Subcategory</bx-breadcrumb-item>
          <bx-breadcrumb-item href="/a/b/c">Product</bx-breadcrumb-item>
          <bx-breadcrumb-item>Current page</bx-breadcrumb-item>
        </bx-breadcrumb>
      </div>
    `);
    const el = container.querySelector('bx-breadcrumb') as BxBreadcrumb;
    await el.updateComplete;

    const ellipsis = el.querySelector('.bx-breadcrumb-ellipsis') as HTMLButtonElement;
    ellipsis.click();

    const items = [...el.querySelectorAll('bx-breadcrumb-item')] as BxBreadcrumbItem[];
    expect(items.every((item) => !item.hidden)).to.be.true;
    expect(el.querySelector('.bx-breadcrumb-ellipsis')).to.not.exist;
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxBreadcrumb>(html`
      <bx-breadcrumb>
        <bx-breadcrumb-item href="/">Home</bx-breadcrumb-item>
        <bx-breadcrumb-item>Current page</bx-breadcrumb-item>
      </bx-breadcrumb>
    `);
    await expect(el).to.be.accessible();
  });
});
