import { BxAnimatedImage } from './animated-image.ts';

/**
 * Registers {@link BxAnimatedImage} under `tagName` (default `bx-animated-image`).
 *
 * Use this instead of importing `@bixboards/core/animated-image` when the app needs a custom tag
 * name or prefix (docs/features/_conventions.md §1).
 */
export function defineAnimatedImage(tagName?: string): void {
  BxAnimatedImage.define(tagName);
}
