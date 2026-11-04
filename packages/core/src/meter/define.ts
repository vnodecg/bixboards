import { BxMeter } from './meter.ts';

/**
 * Registers {@link BxMeter} under `tagName` (default `bx-meter`).
 *
 * Use this instead of importing `@bixboards/core/meter` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineMeter(tagName?: string): void {
  BxMeter.define(tagName);
}
