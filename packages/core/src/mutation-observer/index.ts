// Side-effect: registers `<bx-mutation-observer>` under its default tag name. Import
// `@bixant/core/mutation-observer/define` instead if a custom tag name/prefix is needed.
import { defineMutationObserver } from './define.ts';

defineMutationObserver();

export { BxMutationObserver } from './mutation-observer.ts';
export { defineMutationObserver } from './define.ts';
