import { BxDropdown } from './dropdown.ts';

/**
 * Registers {@link BxDropdown} under `tagName` (default `bx-dropdown`).
 *
 * Use this instead of importing `@bixboards/core/dropdown` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1). The internal `bx-popup` and `bx-dropdown-item` are
 * referenced by their default tag names, so register those too (importing
 * `@bixboards/core/dropdown` does this for you).
 */
export function defineDropdown(tagName?: string): void {
  BxDropdown.define(tagName);
}
