// Side-effect: registers `<bx-progress-ring>` under its default tag name. Import
// `@bixboards/core/progress-ring/define` instead if a custom tag name/prefix is needed.
import { defineProgressRing } from './define.ts';

defineProgressRing();

export { BxProgressRing } from './progress-ring.ts';
export { defineProgressRing } from './define.ts';
