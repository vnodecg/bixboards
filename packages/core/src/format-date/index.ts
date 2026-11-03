// Side-effect: registers `<bx-format-date>` under its default tag name. Import
// `@bixboards/core/format-date/define` instead if a custom tag name/prefix is needed.
import { defineFormatDate } from './define.ts';

defineFormatDate();

export { BxFormatDate } from './format-date.ts';
export { defineFormatDate } from './define.ts';
