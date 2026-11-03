// Side-effect: registers `<bx-progress-bar>` under its default tag name. Import
// `@bixboards/core/progress-bar/define` instead if a custom tag name/prefix is needed.
import { defineProgressBar } from './define.ts';

defineProgressBar();

export { BxProgressBar } from './progress-bar.ts';
export { defineProgressBar } from './define.ts';
