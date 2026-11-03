import { BxTree } from './tree.ts';

/**
 * Registers {@link BxTree} under `tagName` (default `bx-tree`).
 *
 * Use this instead of importing `@bixboards/core/tree` when the app needs a custom tag name/prefix
 * (docs/features/_conventions.md §1).
 */
export function defineTree(tagName?: string): void {
  BxTree.define(tagName);
}
