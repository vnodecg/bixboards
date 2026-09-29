import { BxScroller } from './scroller.ts';

/**
 * Registers {@link BxScroller} under `tagName` (default `bx-scroller`).
 *
 * Use this instead of importing `@bixant/core/scroller` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineScroller(tagName?: string): void {
  BxScroller.define(tagName);
}
