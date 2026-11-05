import { BxPagination } from './pagination.ts';

/**
 * Registers {@link BxPagination} under `tagName` (default `bx-pagination`).
 *
 * Use this instead of importing `@bixboards/core/pagination` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function definePagination(tagName?: string): void {
  BxPagination.define(tagName);
}
