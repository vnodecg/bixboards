// Side-effect: registers `<bx-tab-group>` under its default tag name. Import
// `@bixboards/core/tab-group/define` instead if a custom tag name/prefix is needed.
import { defineTabGroup } from './define.ts';
import '../tab/index.ts';
import '../tab-panel/index.ts';

defineTabGroup();

export { BxTabGroup } from './tab-group.ts';
export { defineTabGroup } from './define.ts';
