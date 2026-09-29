// Side-effect: registers `<bx-dialog>` under its default tag name. Import
// `@bixant/core/dialog/define` instead if a custom tag name/prefix is needed.
import { defineDialog } from './define.ts';

defineDialog();

export { BxDialog } from './dialog.ts';
export { defineDialog } from './define.ts';
