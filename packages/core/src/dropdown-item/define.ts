import { BxDropdownItem } from './dropdown-item.ts';

/**
 * Registers {@link BxDropdownItem} under `tagName` (default `bx-dropdown-item`).
 *
 * Use this instead of importing `@bixboards/core/dropdown-item` when the app needs a custom tag
 * name/prefix (docs/features/_conventions.md §1).
 */
export function defineDropdownItem(tagName?: string): void {
  BxDropdownItem.define(tagName);
}
