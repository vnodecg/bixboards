// Side-effect: registers `<bx-option>` under its default tag name. Import
// `@bixboards/core/option/define` instead if a custom tag name/prefix is needed.
import { defineOption } from './define.ts';

defineOption();

export { BxOption } from './option.ts';
export { defineOption } from './define.ts';
