// Side-effect: registers `<bx-radio>` under its default tag name. Import
// `@bixant/core/radio/define` instead if a custom tag name/prefix is needed.
import { defineRadio } from './define.ts';

defineRadio();

export { BxRadio } from './radio.ts';
export { defineRadio } from './define.ts';
