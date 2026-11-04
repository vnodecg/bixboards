// Side-effect: registers `<bx-time-field>` under its default tag name. Import
// `@bixboards/core/time-field/define` instead if a custom tag name/prefix is needed.
import { defineTimeField } from './define.ts';

defineTimeField();

export { BxTimeField } from './time-field.ts';
export { parseTime, localeIs12h } from './time-field.ts';
export { defineTimeField } from './define.ts';
