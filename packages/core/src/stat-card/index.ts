// Side-effect: registers `<bx-stat-card>` under its default tag name. Import
// `@bixboards/core/stat-card/define` instead if a custom tag name/prefix is needed.
import { defineStatCard } from './define.ts';
import '../card/index.ts';
import '../skeleton/index.ts';
import '../sparkline/index.ts';

defineStatCard();

export { BxStatCard } from './stat-card.ts';
export { defineStatCard } from './define.ts';
