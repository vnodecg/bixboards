// Side-effect: registers `<bx-include>` under its default tag name. Import
// `@bixboards/core/include/define` instead if a custom tag name/prefix is needed.
import { defineInclude } from './define.ts';

defineInclude();

export { BxInclude } from './include.ts';
export { defineInclude } from './define.ts';
