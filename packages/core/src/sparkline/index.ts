// Side-effect: registers `<bx-sparkline>` under its default tag name. Import
// `@bixboards/core/sparkline/define` instead if a custom tag name/prefix is needed.
import { defineSparkline } from './define.ts';

defineSparkline();

export { BxSparkline } from './sparkline.ts';
export { decimate } from './sparkline.ts';
export { defineSparkline } from './define.ts';
