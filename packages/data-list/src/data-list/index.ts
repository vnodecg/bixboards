// Side-effect: registers <bx-data-list>. Import `@bixboards/data-list/data-list/define` for a custom tag.
import { defineDataList } from './define.ts';

defineDataList();

export { BxDataList, type DataSource } from './data-list.ts';
export { defineDataList } from './define.ts';
