import { BxSidebarGroup } from './sidebar-group.ts';

/**
 * Registers {@link BxSidebarGroup} under `tagName` (default `bx-sidebar-group`).
 *
 * Use this instead of importing `@bixboards/core/sidebar-group` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineSidebarGroup(tagName?: string): void {
  BxSidebarGroup.define(tagName);
}
