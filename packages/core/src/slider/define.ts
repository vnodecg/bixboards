import { BxSlider } from './slider.ts';

/**
 * Registers {@link BxSlider} under `tagName` (default `bx-slider`).
 *
 * Use this instead of importing `@bixant/core/slider` when the app needs a custom tag name/prefix
 * (docs/features/_conventions.md §1).
 */
export function defineSlider(tagName?: string): void {
  BxSlider.define(tagName);
}
