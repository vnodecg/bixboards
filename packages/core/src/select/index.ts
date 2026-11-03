// Side-effect: registers `<bx-select>` under its default tag name. Import
// `@bixboards/core/select/define` instead if a custom tag name/prefix is needed.
import '../popup/index.ts';
import '../option/index.ts';
import '../badge/index.ts';
import '../spinner/index.ts';
import { defineSelect } from './define.ts';

defineSelect();

export { BxSelect } from './select.ts';
export { defineSelect } from './define.ts';
export type { SelectOption } from './select-model.ts';
