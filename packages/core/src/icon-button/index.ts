// Side-effect: registers `<bx-icon-button>` under its default tag name. Import
// `@bixboards/core/icon-button/define` instead if a custom tag name/prefix is needed.
import { defineIconButton } from './define.ts';
import '../button/index.ts';
import '../icon/index.ts';

defineIconButton();

export { BxIconButton } from './icon-button.ts';
export { defineIconButton } from './define.ts';
