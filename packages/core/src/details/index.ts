// Side-effect: registers `<bx-details>` under its default tag name. Import
// `@bixboards/core/details/define` instead if a custom tag name/prefix is needed.
import { defineDetails } from './define.ts';

defineDetails();

export { BxDetails } from './details.ts';
export { defineDetails } from './define.ts';
