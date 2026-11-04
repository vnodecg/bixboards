import { BxTimelineItem } from './timeline-item.ts';

/**
 * Registers {@link BxTimelineItem} under `tagName` (default `bx-timeline-item`).
 *
 * Use this instead of importing `@bixboards/core/timeline-item` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineTimelineItem(tagName?: string): void {
  BxTimelineItem.define(tagName);
}
