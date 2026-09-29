// Side-effect: registers `<bx-resize-observer>` under its default tag name. Import
// `@bixant/core/resize-observer/define` instead if a custom tag name/prefix is needed.
import { defineResizeObserver } from './define.ts';

defineResizeObserver();

export { BxResizeObserver } from './resize-observer.ts';
export { defineResizeObserver } from './define.ts';
