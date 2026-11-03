import { BxRating } from './rating.ts';

/**
 * Registers {@link BxRating} under `tagName` (default `bx-rating`).
 *
 * Use this instead of importing `@bixboards/core/rating` when the app needs a custom tag name/prefix
 * (docs/features/_conventions.md §1).
 */
export function defineRating(tagName?: string): void {
  BxRating.define(tagName);
}
