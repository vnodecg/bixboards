// Side-effect: registers `<bx-sidebar-item>` under its default tag name. Import
// `@bixboards/core/sidebar-item/define` instead if a custom tag name/prefix is needed.
import { defineSidebarItem } from './define.ts';
import '../icon/index.ts';
import '../badge/index.ts';
import '../tooltip/index.ts';

defineSidebarItem();

export { BxSidebarItem } from './sidebar-item.ts';
export { defineSidebarItem } from './define.ts';
