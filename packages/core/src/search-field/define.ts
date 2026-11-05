import { BxSearchField } from './search-field.ts';

/**
 * Registers {@link BxSearchField} under `tagName` (default `bx-search-field`).
 *
 * Use this instead of importing `@bixboards/core/search-field` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineSearchField(tagName?: string): void {
  BxSearchField.define(tagName);
}
