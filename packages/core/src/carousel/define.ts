import { BxCarousel } from './carousel.ts';

/**
 * Registers {@link BxCarousel} under `tagName` (default `bx-carousel`).
 *
 * Use this instead of importing `@bixboards/core/carousel` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineCarousel(tagName?: string): void {
  BxCarousel.define(tagName);
}
