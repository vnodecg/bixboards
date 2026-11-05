// Side-effect: registers `<bx-sidebar-group>` under its default tag name. Import
// `@bixboards/core/sidebar-group/define` instead if a custom tag name/prefix is needed.
import { defineSidebarGroup } from './define.ts';

defineSidebarGroup();

export { BxSidebarGroup } from './sidebar-group.ts';
export { defineSidebarGroup } from './define.ts';
