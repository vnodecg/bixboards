// Root entry: package-wide utilities only. Import a component's own subpath
// (e.g. `@bixant/core/animated-image`) to use it — this entry point registers nothing.
export { BixElement } from './bix-element.ts';
export { defineCustomElement } from './internal/register.ts';
