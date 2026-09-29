import { BxAnimation } from './animation.ts';

/**
 * Registers {@link BxAnimation} under `tagName` (default `bx-animation`).
 *
 * Use this instead of importing `@bixant/core/animation` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineAnimation(tagName?: string): void {
  BxAnimation.define(tagName);
}
