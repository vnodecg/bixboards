import { BxTimeline } from './timeline.ts';

/**
 * Registers {@link BxTimeline} under `tagName` (default `bx-timeline`).
 *
 * Use this instead of importing `@bixboards/core/timeline` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineTimeline(tagName?: string): void {
  BxTimeline.define(tagName);
}
