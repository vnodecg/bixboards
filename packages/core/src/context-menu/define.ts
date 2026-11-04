import { BxContextMenu } from './context-menu.ts';

/**
 * Registers {@link BxContextMenu} under `tagName` (default `bx-context-menu`).
 *
 * Use this instead of importing `@bixboards/core/context-menu` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineContextMenu(tagName?: string): void {
  BxContextMenu.define(tagName);
}
