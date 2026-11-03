// Side-effect: registers `<bx-format-bytes>` under its default tag name. Import
// `@bixboards/core/format-bytes/define` instead if a custom tag name/prefix is needed.
import { defineFormatBytes } from './define.ts';

defineFormatBytes();

export { BxFormatBytes } from './format-bytes.ts';
export { defineFormatBytes } from './define.ts';
