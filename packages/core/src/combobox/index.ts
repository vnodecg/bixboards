// Side-effect: registers `<bx-combobox>` under its default tag name. Import
// `@bixboards/core/combobox/define` instead if a custom tag name/prefix is needed.
import { defineCombobox } from './define.ts';
import '../select/index.ts';
import '../option/index.ts';
import '../popup/index.ts';
import '../input/index.ts';
import '../spinner/index.ts';
import '../chip/index.ts';

defineCombobox();

export { BxCombobox } from './combobox.ts';
export { defineCombobox } from './define.ts';
