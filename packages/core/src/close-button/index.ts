// Side-effect: registers `<bx-close-button>` under its default tag name. Import
// `@bixboards/core/close-button/define` instead if a custom tag name/prefix is needed.
import { defineCloseButton } from './define.ts';
import '../icon-button/index.ts';

defineCloseButton();

export { BxCloseButton } from './close-button.ts';
export { defineCloseButton } from './define.ts';
