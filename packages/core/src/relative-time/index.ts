// Side-effect: registers `<bx-relative-time>` under its default tag name. Import
// `@bixboards/core/relative-time/define` instead if a custom tag name/prefix is needed.
import { defineRelativeTime } from './define.ts';

defineRelativeTime();

export { BxRelativeTime } from './relative-time.ts';
export { defineRelativeTime } from './define.ts';
