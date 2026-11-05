import { BxSegment } from './segment.ts';

/**
 * Registers {@link BxSegment} under `tagName` (default `bx-segment`).
 *
 * Use this instead of importing `@bixboards/core/segment` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineSegment(tagName?: string): void {
  BxSegment.define(tagName);
}
