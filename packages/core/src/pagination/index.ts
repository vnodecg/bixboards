// Side-effect: registers `<bx-pagination>` under its default tag name. Import
// `@bixboards/core/pagination/define` instead if a custom tag name/prefix is needed.
import { definePagination } from './define.ts';

definePagination();

export { BxPagination } from './pagination.ts';
export { pageRange, type PageItem } from './pagination.ts';
export { definePagination } from './define.ts';
