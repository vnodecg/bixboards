// Side-effect: registers `<bx-callout>` under its default tag name. Import
// `@bixboards/core/callout/define` instead if a custom tag name/prefix is needed.
import { defineCallout } from './define.ts';

defineCallout();

export { BxCallout } from './callout.ts';
export { defineCallout } from './define.ts';
