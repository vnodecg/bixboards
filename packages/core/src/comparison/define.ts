import { BxComparison } from './comparison.ts';

/**
 * Registers {@link BxComparison} under `tagName` (default `bx-comparison`).
 *
 * Use this instead of importing `@bixant/core/comparison` when the app needs a custom tag
 * name/prefix (docs/features/_conventions.md §1).
 */
export function defineComparison(tagName?: string): void {
  BxComparison.define(tagName);
}
