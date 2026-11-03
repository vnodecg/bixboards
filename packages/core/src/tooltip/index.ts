// Side-effect: registers `<bx-tooltip>` under its default tag name. Import
// `@bixboards/core/tooltip/define` instead if a custom tag name/prefix is needed.
import { defineTooltip } from './define.ts';
import '../popup/index.ts';

defineTooltip();

export { BxTooltip } from './tooltip.ts';
export { defineTooltip } from './define.ts';
