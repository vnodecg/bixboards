import { BxDivider } from './divider.ts';

/**
 * Registers {@link BxDivider} under `tagName` (default `bx-divider`).
 *
 * Use this instead of importing `@bixboards/core/divider` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineDivider(tagName?: string): void {
  BxDivider.define(tagName);
}
