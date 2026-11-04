import { BxToastRegion } from './toast-region.ts';

/**
 * Registers {@link BxToastRegion} under `tagName` (default `bx-toast-region`).
 *
 * Use this instead of importing `@bixboards/core/toast-region` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineToastRegion(tagName?: string): void {
  BxToastRegion.define(tagName);
}
