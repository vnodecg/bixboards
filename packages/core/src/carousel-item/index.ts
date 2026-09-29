// Side-effect: registers `<bx-carousel-item>` under its default tag name. Import
// `@bixant/core/carousel-item/define` instead if a custom tag name/prefix is needed.
import { defineCarouselItem } from './define.ts';

defineCarouselItem();

export { BxCarouselItem } from './carousel-item.ts';
export { defineCarouselItem } from './define.ts';
