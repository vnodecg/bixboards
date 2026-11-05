// Side-effect: registers `<bx-toast-region>` under its default tag name. Import
// `@bixboards/core/toast-region/define` instead if a custom tag name/prefix is needed.
import { defineToastRegion } from './define.ts';
import '../toast/index.ts';

defineToastRegion();

export { BxToastRegion } from './toast-region.ts';
export { defineToastRegion } from './define.ts';
