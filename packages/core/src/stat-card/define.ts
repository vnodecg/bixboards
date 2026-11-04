import { BxStatCard } from './stat-card.ts';

/**
 * Registers {@link BxStatCard} under `tagName` (default `bx-stat-card`).
 *
 * Use this instead of importing `@bixboards/core/stat-card` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineStatCard(tagName?: string): void {
  BxStatCard.define(tagName);
}
