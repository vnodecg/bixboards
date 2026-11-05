// Side-effect: registers `<bx-toast>` under its default tag name. Import
// `@bixboards/core/toast/define` instead if a custom tag name/prefix is needed.
import { defineToast } from './define.ts';
import '../close-button/index.ts';
import '../icon/index.ts';
import '../button/index.ts';

defineToast();

export { BxToast } from './toast.ts';
export { type ToastOptions } from './toast.ts';
export { defineToast } from './define.ts';
