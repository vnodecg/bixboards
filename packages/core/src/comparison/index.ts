// Side-effect: registers `<bx-comparison>` under its default tag name. Import
// `@bixboards/core/comparison/define` instead if a custom tag name/prefix is needed.
import { defineComparison } from './define.ts';

defineComparison();

export { BxComparison } from './comparison.ts';
export { defineComparison } from './define.ts';
