// Side-effect: registers `<bx-toggle-button>` under its default tag name. Import
// `@bixboards/core/toggle-button/define` instead if a custom tag name/prefix is needed.
import { defineToggleButton } from './define.ts';

defineToggleButton();

export { BxToggleButton } from './toggle-button.ts';
export { defineToggleButton } from './define.ts';
