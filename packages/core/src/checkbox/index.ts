// Side-effect: registers `<bx-checkbox>` under its default tag name. Import
// `@bixboards/core/checkbox/define` instead if a custom tag name/prefix is needed.
import { defineCheckbox } from './define.ts';

defineCheckbox();

export { BxCheckbox } from './checkbox.ts';
export { defineCheckbox } from './define.ts';
