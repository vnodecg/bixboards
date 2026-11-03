// Side-effect: registers `<bx-button-group>` under its default tag name. Import
// `@bixboards/core/button-group/define` instead if a custom tag name/prefix is needed.
import { defineButtonGroup } from './define.ts';
import '../button/index.ts';

defineButtonGroup();

export { BxButtonGroup } from './button-group.ts';
export { defineButtonGroup } from './define.ts';
