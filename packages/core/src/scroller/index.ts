// Side-effect: registers `<bx-scroller>` under its default tag name. Import
// `@bixant/core/scroller/define` instead if a custom tag name/prefix is needed.
import { defineScroller } from './define.ts';

defineScroller();

export { BxScroller } from './scroller.ts';
export { defineScroller } from './define.ts';
