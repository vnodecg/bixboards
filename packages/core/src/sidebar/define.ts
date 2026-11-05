import { BxSidebar } from './sidebar.ts';

/**
 * Registers {@link BxSidebar} under `tagName` (default `bx-sidebar`).
 *
 * Use this instead of importing `@bixboards/core/sidebar` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineSidebar(tagName?: string): void {
  BxSidebar.define(tagName);
}
