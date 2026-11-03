// Root entry: package-wide utilities only. Import a component's own subpath
// (e.g. `@bixboards/core/animated-image`) to use it — this entry point registers nothing.
export { BixElement } from './bix-element.ts';
export { defineCustomElement } from './internal/register.ts';
export {
  VirtualizerController,
  type ScrollToOptions,
  type VirtualItem,
  type VirtualizerOptions,
} from './virtualizer/index.ts';
export {
  observeIntersection,
  observeResize,
} from './internal/shared-observers.ts';
export {
  textFamily,
  textStyle,
  type TextGroup,
  type TextStyle,
  type TextStyleOverrides,
} from './internal/text-style.ts';
