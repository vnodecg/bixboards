// Side-effect: registers `<bx-command-palette>` under its default tag name. Import
// `@bixboards/core/command-palette/define` instead if a custom tag name/prefix is needed.
import { defineCommandPalette } from './define.ts';
import '../icon/index.ts';
import '../kbd/index.ts';
import '../spinner/index.ts';

defineCommandPalette();

export { BxCommandPalette } from './command-palette.ts';
export { fuzzyScore, type Command } from './command-palette.ts';
export { defineCommandPalette } from './define.ts';
