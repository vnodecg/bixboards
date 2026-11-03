// Side-effect: registers <bx-virtual-tree>. Import `@bixboards/data-list/virtual-tree/define` for a custom tag.
import { defineVirtualTree } from './define.ts';

defineVirtualTree();

export {
  BxVirtualTree,
  type TreeDataSource,
  type TreeNode,
  type TreeNodeContext,
} from './virtual-tree.ts';
export { defineVirtualTree } from './define.ts';
