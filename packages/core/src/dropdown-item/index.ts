// Side-effect: registers `<bx-dropdown-item>` under its default tag name. Import
// `@bixant/core/dropdown-item/define` instead if a custom tag name/prefix is needed.
import '../popup/index.ts';
import { defineDropdownItem } from './define.ts';

defineDropdownItem();

export { BxDropdownItem } from './dropdown-item.ts';
export { defineDropdownItem } from './define.ts';
