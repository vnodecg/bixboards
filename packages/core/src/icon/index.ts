// Side-effect: registers `<bx-icon>` under its default tag name. Import
// `@bixboards/core/icon/define` instead if a custom tag name/prefix is needed.
import { defineIcon } from './define.ts';

defineIcon();

export { BxIcon } from './icon.ts';
export { defineIcon } from './define.ts';
export { registerIconLibrary, type IconLibrary } from './registry.ts';
