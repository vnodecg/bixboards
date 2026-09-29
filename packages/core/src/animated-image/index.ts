// Side-effect: registers `<bx-animated-image>` under its default tag name. Import
// `@bixant/core/animated-image/define` instead if a custom tag name/prefix is needed.
import { defineAnimatedImage } from './define.ts';

defineAnimatedImage();

export { BxAnimatedImage } from './animated-image.ts';
export { defineAnimatedImage } from './define.ts';
