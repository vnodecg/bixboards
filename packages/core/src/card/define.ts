import { BxCard } from './card.ts';

/**
 * Registers {@link BxCard} under `tagName` (default `bx-card`).
 *
 * Use this instead of importing `@bixboards/core/card` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineCard(tagName?: string): void {
  BxCard.define(tagName);
}
