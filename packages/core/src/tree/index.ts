// Side-effect: registers `<bx-tree>` under its default tag name. Import
// `@bixant/core/tree/define` instead if a custom tag name/prefix is needed.
import { defineTree } from './define.ts';
import '../tree-item/index.ts';

defineTree();

export { BxTree } from './tree.ts';
export { defineTree } from './define.ts';
