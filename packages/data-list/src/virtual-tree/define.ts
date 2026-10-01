import { BxVirtualTree } from './virtual-tree.ts';

/** Registers {@link BxVirtualTree} under `tagName` (default `bx-virtual-tree`). */
export function defineVirtualTree(tagName?: string): void {
  BxVirtualTree.define(tagName);
}
