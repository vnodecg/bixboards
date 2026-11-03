// Side-effect: registers `<bx-dropdown>` under its default tag name. Import
// `@bixboards/core/dropdown/define` instead if a custom tag name/prefix is needed.
import '../popup/index.ts';
import '../dropdown-item/index.ts';
import { defineDropdown } from './define.ts';

defineDropdown();

export { BxDropdown } from './dropdown.ts';
export { defineDropdown } from './define.ts';
export type { DropdownItemData } from './dropdown.ts';
