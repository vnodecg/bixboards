// Side-effect: registers `<bx-number-input>` under its default tag name. Import
// `@bixant/core/number-input/define` instead if a custom tag name/prefix is needed.
import { defineNumberInput } from './define.ts';

defineNumberInput();

export { BxNumberInput } from './number-input.ts';
export { defineNumberInput } from './define.ts';
