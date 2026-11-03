// Side-effect: registers `<bx-drawer>` under its default tag name. Import
// `@bixboards/core/drawer/define` instead if a custom tag name/prefix is needed.
import { defineDrawer } from './define.ts';
import '../button/index.ts';
import '../icon/index.ts';

defineDrawer();

export { BxDrawer } from './drawer.ts';
export { defineDrawer } from './define.ts';
