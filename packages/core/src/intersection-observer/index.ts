// Side-effect: registers `<bx-intersection-observer>` under its default tag name. Import
// `@bixboards/core/intersection-observer/define` instead if a custom tag name/prefix is needed.
import { defineIntersectionObserver } from './define.ts';

defineIntersectionObserver();

export { BxIntersectionObserver } from './intersection-observer.ts';
export { defineIntersectionObserver } from './define.ts';
