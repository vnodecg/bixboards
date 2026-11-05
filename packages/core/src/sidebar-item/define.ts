import { BxSidebarItem } from './sidebar-item.ts';

/**
 * Registers {@link BxSidebarItem} under `tagName` (default `bx-sidebar-item`).
 *
 * Use this instead of importing `@bixboards/core/sidebar-item` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineSidebarItem(tagName?: string): void {
  BxSidebarItem.define(tagName);
}
