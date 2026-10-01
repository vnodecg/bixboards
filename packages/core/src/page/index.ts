// Side-effect: registers `<bx-page>` under its default tag name. Import
// `@bixant/core/page/define` instead if a custom tag name/prefix is needed.
import { definePage } from './define.ts';

definePage();

export { BxPage } from './page.ts';
export { definePage } from './define.ts';
