// Side-effect: registers `<bx-tree-item>` under its default tag name. Import
// `@bixant/core/tree-item/define` instead if a custom tag name/prefix is needed.
import { defineTreeItem } from './define.ts';

defineTreeItem();

export { BxTreeItem } from './tree-item.ts';
export { defineTreeItem } from './define.ts';
