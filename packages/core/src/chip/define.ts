import { BxChip } from './chip.ts';

/**
 * Registers {@link BxChip} under `tagName` (default `bx-chip`).
 *
 * Use this instead of importing `@bixboards/core/chip` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineChip(tagName?: string): void {
  BxChip.define(tagName);
}
