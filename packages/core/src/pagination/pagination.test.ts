import { expect, fixture, html } from '@open-wc/testing';
import type { BxPagination } from './pagination.ts';
import { pageRange } from './pagination.ts';
import './index.ts';

describe('pageRange', () => {
  it('lists every page when there are few', () => {
    expect(pageRange(1, 5)).to.deep.equal([1, 2, 3, 4, 5]);
    expect(pageRange(1, 7)).to.deep.equal([1, 2, 3, 4, 5, 6, 7]);
  });

  it('collapses with ellipses and keeps a constant width', () => {
    expect(pageRange(1, 20)).to.deep.equal([1, 2, 3, 4, 5, 'ellipsis-end', 20]);
    expect(pageRange(10, 20)).to.deep.equal([
      1,
      'ellipsis-start',
      9,
      10,
      11,
      'ellipsis-end',
      20,
    ]);
    expect(pageRange(20, 20)).to.deep.equal([
      1,
      'ellipsis-start',
      16,
      17,
      18,
      19,
      20,
    ]);
    for (let p = 1; p <= 50; p++) expect(pageRange(p, 50)).to.have.length(7);
  });

  it('honours sibling and boundary counts and never exceeds the slot budget', () => {
    for (const [s, b] of [
      [2, 1],
      [1, 2],
      [0, 1],
      [2, 2],
    ])
      for (let p = 1; p <= 40; p++)
        expect(pageRange(p, 40, s!, b!).length).to.be.at.most(
          2 * s! + 2 * b! + 3,
        );
  });
});

describe('bx-pagination', () => {
  it('renders a labelled nav with the current page marked', async () => {
    const el = await fixture<BxPagination>(
      html`<bx-pagination page="3" page-count="10"></bx-pagination>`,
    );
    expect(
      el.shadowRoot!.querySelector('nav')!.getAttribute('aria-label'),
    ).to.equal('Pagination');
    const current = el.shadowRoot!.querySelector('[aria-current=page]')!;
    expect(current.textContent!.trim()).to.equal('3');
  });

  it('changes page on click, on next/prev, and disables the edges', async () => {
    const el = await fixture<BxPagination>(
      html`<bx-pagination page="1" page-count="5"></bx-pagination>`,
    );
    const pages: number[] = [];
    el.addEventListener('change', (e) =>
      pages.push((e as CustomEvent).detail.page),
    );
    const prev = el.shadowRoot!.querySelector<HTMLElement>('[part=prev]')!;
    expect(prev.getAttribute('aria-disabled')).to.equal('true');
    el.shadowRoot!.querySelector<HTMLElement>('[part=next]')!.click();
    await el.updateComplete;
    expect(el.page).to.equal(2);
    el.shadowRoot!.querySelector<HTMLElement>('[aria-label="Page 4"]')!.click();
    await el.updateComplete;
    expect(pages).to.deep.equal([2, 4]);
  });

  it('derives the page count from total and page-size, and clamps the page', async () => {
    const el = await fixture<BxPagination>(
      html`<bx-pagination total="95" page-size="10" page="99"></bx-pagination>`,
    );
    expect(el.totalPages).to.equal(10);
    expect(el.page).to.equal(10);
  });

  it('renders real links with href-template', async () => {
    const el = await fixture<BxPagination>(
      html`<bx-pagination
        page="2"
        page-count="3"
        href-template="?page={page}"
      ></bx-pagination>`,
    );
    const links = [...el.shadowRoot!.querySelectorAll('a.page')].map((a) =>
      a.getAttribute('href'),
    );
    expect(links).to.deep.equal(['?page=1', '?page=2', '?page=3']);
  });

  it('shows "N of M" in compact mode and a page-size selector', async () => {
    const el = await fixture<BxPagination>(
      html`<bx-pagination compact page="3" page-count="20"></bx-pagination>`,
    );
    expect(
      el.shadowRoot!.querySelector('.compact')!.textContent!.trim(),
    ).to.equal('3 of 20');
    const sized = await fixture<BxPagination>(
      html`<bx-pagination
        page-count="3"
        .pageSizes=${[10, 25]}
      ></bx-pagination>`,
    );
    let size = 0;
    sized.addEventListener(
      'bx-page-size-change',
      (e) => (size = (e as CustomEvent).detail.pageSize),
    );
    const select = sized.shadowRoot!.querySelector('select')!;
    select.value = '25';
    select.dispatchEvent(new Event('change'));
    expect(size).to.equal(25);
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxPagination>(
      html`<bx-pagination
        page="5"
        page-count="20"
        .pageSizes=${[10, 25]}
      ></bx-pagination>`,
    );
    await expect(el).to.be.accessible();
  });
});
