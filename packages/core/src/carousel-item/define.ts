import { BxCarouselItem } from './carousel-item.ts';

/**
 * Registers {@link BxCarouselItem} under `tagName` (default `bx-carousel-item`).
 *
 * Use this instead of importing `@bixant/core/carousel-item` when the app needs a custom tag
 * name/prefix (docs/features/_conventions.md §1).
 */
export function defineCarouselItem(tagName?: string): void {
  BxCarouselItem.define(tagName);
}
