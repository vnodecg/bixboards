// Side-effect: registers `<bx-sidebar>` under its default tag name. Import
// `@bixboards/core/sidebar/define` instead if a custom tag name/prefix is needed.
import { defineSidebar } from './define.ts';
import '../sidebar-group/index.ts';
import '../sidebar-item/index.ts';
import '../icon-button/index.ts';

defineSidebar();

export { BxSidebar } from './sidebar.ts';
export { defineSidebar } from './define.ts';
