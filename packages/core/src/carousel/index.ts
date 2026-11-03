// Side-effect: registers `<bx-carousel>` under its default tag name. Import
// `@bixboards/core/carousel/define` instead if a custom tag name/prefix is needed.
import { defineCarousel } from './define.ts';
import '../carousel-item/index.ts';

defineCarousel();

export { BxCarousel } from './carousel.ts';
export { defineCarousel } from './define.ts';
