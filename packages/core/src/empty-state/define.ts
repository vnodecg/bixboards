import { BxEmptyState } from './empty-state.ts';

/**
 * Registers {@link BxEmptyState} under `tagName` (default `bx-empty-state`).
 *
 * Use this instead of importing `@bixboards/core/empty-state` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineEmptyState(tagName?: string): void {
  BxEmptyState.define(tagName);
}
