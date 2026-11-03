import { BxRelativeTime } from './relative-time.ts';

/**
 * Registers {@link BxRelativeTime} under `tagName` (default `bx-relative-time`).
 *
 * Use this instead of importing `@bixboards/core/relative-time` when the app needs a custom tag name
 * or prefix (docs/features/_conventions.md §1).
 */
export function defineRelativeTime(tagName?: string): void {
  BxRelativeTime.define(tagName);
}
