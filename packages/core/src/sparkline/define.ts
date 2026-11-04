import { BxSparkline } from './sparkline.ts';

/**
 * Registers {@link BxSparkline} under `tagName` (default `bx-sparkline`).
 *
 * Use this instead of importing `@bixboards/core/sparkline` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineSparkline(tagName?: string): void {
  BxSparkline.define(tagName);
}
