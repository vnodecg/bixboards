/**
 * Defines `ctor` under `tagName`, unless something is already registered there.
 *
 * Re-registering under the same name throws in the browser (double bundling, HMR, a second
 * copy of the package); silently skipping keeps a second import idempotent instead of fatal.
 */
export function defineCustomElement(
  tagName: string,
  ctor: CustomElementConstructor,
): void {
  if (typeof customElements === 'undefined') return; // SSR / no DOM.
  if (!customElements.get(tagName)) customElements.define(tagName, ctor);
}
