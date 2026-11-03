import { BxProgressRing } from './progress-ring.ts';

/**
 * Registers {@link BxProgressRing} under `tagName` (default `bx-progress-ring`).
 *
 * Use this instead of importing `@bixboards/core/progress-ring` when the app needs a custom tag
 * name or prefix (docs/features/_conventions.md §1).
 */
export function defineProgressRing(tagName?: string): void {
  BxProgressRing.define(tagName);
}
