// Side-effect: registers `<bx-step>` under its default tag name. Import
// `@bixboards/core/step/define` instead if a custom tag name/prefix is needed.
import { defineStep } from './define.ts';

defineStep();

export { BxStep } from './step.ts';
export { defineStep } from './define.ts';
