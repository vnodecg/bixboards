// Side-effect: registers `<bx-input>` under its default tag name. Import
// `@bixboards/core/input/define` instead if a custom tag name/prefix is needed.
import { defineInput } from './define.ts';

defineInput();

export { BxInput } from './input.ts';
export { defineInput } from './define.ts';
