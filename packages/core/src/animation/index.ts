// Side-effect: registers `<bx-animation>` under its default tag name. Import
// `@bixboards/core/animation/define` instead if a custom tag name/prefix is needed.
import { defineAnimation } from './define.ts';

defineAnimation();

export { BxAnimation } from './animation.ts';
export { defineAnimation } from './define.ts';
