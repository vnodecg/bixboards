// Side-effect: registers `<bx-card>` under its default tag name. Import
// `@bixboards/core/card/define` instead if a custom tag name/prefix is needed.
import { defineCard } from './define.ts';

defineCard();

export { BxCard } from './card.ts';
export { defineCard } from './define.ts';
