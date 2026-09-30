// Side-effect: registers `<bx-popover>` under its default tag name. Import
// `@bixant/core/popover/define` instead if a custom tag name/prefix is needed.
import { definePopover } from './define.ts';
import '../popup/index.ts';

definePopover();

export { BxPopover } from './popover.ts';
export { definePopover } from './define.ts';
