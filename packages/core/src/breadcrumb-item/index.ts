// Side-effect: registers `<bx-breadcrumb-item>` under its default tag name. Import
// `@bixant/core/breadcrumb-item/define` instead if a custom tag name/prefix is needed.
import { defineBreadcrumbItem } from './define.ts';

defineBreadcrumbItem();

export { BxBreadcrumbItem } from './breadcrumb-item.ts';
export { defineBreadcrumbItem } from './define.ts';
