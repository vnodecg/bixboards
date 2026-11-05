// Side-effect: registers `<bx-context-menu>` under its default tag name. Import
// `@bixboards/core/context-menu/define` instead if a custom tag name/prefix is needed.
import { defineContextMenu } from './define.ts';
import '../dropdown/index.ts';
import '../dropdown-item/index.ts';

defineContextMenu();

export { BxContextMenu } from './context-menu.ts';
export { defineContextMenu } from './define.ts';
