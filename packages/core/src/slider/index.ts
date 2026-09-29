// Side-effect: registers `<bx-slider>` under its default tag name. Import
// `@bixant/core/slider/define` instead if a custom tag name/prefix is needed.
import { defineSlider } from './define.ts';

defineSlider();

export { BxSlider } from './slider.ts';
export { defineSlider } from './define.ts';
