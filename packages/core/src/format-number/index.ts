// Side-effect: registers `<bx-format-number>` under its default tag name. Import
// `@bixboards/core/format-number/define` instead if a custom tag name/prefix is needed.
import { defineFormatNumber } from './define.ts';

defineFormatNumber();

export { BxFormatNumber } from './format-number.ts';
export { defineFormatNumber } from './define.ts';
