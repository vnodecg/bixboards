// Side-effect: registers `<bx-button>` under its default tag name. Import
// `@bixboards/core/button/define` instead if a custom tag name/prefix is needed.
import { defineButton } from './define.ts';
import '../spinner/index.ts';

defineButton();

export { BxButton } from './button.ts';
export { defineButton } from './define.ts';
