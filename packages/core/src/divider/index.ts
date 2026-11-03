// Side-effect: registers `<bx-divider>` under its default tag name. Import
// `@bixboards/core/divider/define` instead if a custom tag name/prefix is needed.
import { defineDivider } from './define.ts';

defineDivider();

export { BxDivider } from './divider.ts';
export { defineDivider } from './define.ts';
