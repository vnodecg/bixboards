// Side-effect: registers `<bx-spinner>` under its default tag name. Import
// `@bixboards/core/spinner/define` instead if a custom tag name/prefix is needed.
import { defineSpinner } from './define.ts';

defineSpinner();

export { BxSpinner } from './spinner.ts';
export { defineSpinner } from './define.ts';
