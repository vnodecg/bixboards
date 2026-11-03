import { BxTreeItem } from './tree-item.ts';

/**
 * Registers {@link BxTreeItem} under `tagName` (default `bx-tree-item`).
 *
 * Use this instead of importing `@bixboards/core/tree-item` when the app needs a custom tag
 * name/prefix (docs/features/_conventions.md §1).
 */
export function defineTreeItem(tagName?: string): void {
  BxTreeItem.define(tagName);
}
