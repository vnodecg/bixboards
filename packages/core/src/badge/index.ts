// Side-effect: registers `<bx-badge>` under its default tag name. Import
// `@bixboards/core/badge/define` instead if a custom tag name/prefix is needed.
import { defineBadge } from './define.ts';

defineBadge();

export { BxBadge } from './badge.ts';
export { defineBadge } from './define.ts';
