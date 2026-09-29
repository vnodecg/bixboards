// Side-effect: registers `<bx-breadcrumb>` under its default tag name. Import
// `@bixant/core/breadcrumb/define` instead if a custom tag name/prefix is needed.
import { defineBreadcrumb } from './define.ts';
import '../breadcrumb-item/index.ts';

defineBreadcrumb();

export { BxBreadcrumb } from './breadcrumb.ts';
export { defineBreadcrumb } from './define.ts';
