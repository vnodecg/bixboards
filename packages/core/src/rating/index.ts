// Side-effect: registers `<bx-rating>` under its default tag name. Import
// `@bixant/core/rating/define` instead if a custom tag name/prefix is needed.
import { defineRating } from './define.ts';

defineRating();

export { BxRating } from './rating.ts';
export { defineRating } from './define.ts';
