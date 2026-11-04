// Side-effect: registers `<bx-kbd>` under its default tag name. Import
// `@bixboards/core/kbd/define` instead if a custom tag name/prefix is needed.
import { defineKbd } from './define.ts';

defineKbd();

export { BxKbd } from './kbd.ts';
export { parseChord } from './kbd.ts';
export { defineKbd } from './define.ts';
