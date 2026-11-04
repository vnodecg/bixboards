// Side-effect: registers `<bx-empty-state>` under its default tag name. Import
// `@bixboards/core/empty-state/define` instead if a custom tag name/prefix is needed.
import { defineEmptyState } from './define.ts';
import '../icon/index.ts';
import '../button/index.ts';

defineEmptyState();

export { BxEmptyState } from './empty-state.ts';
export { emptyStateCopy } from './empty-state.ts';
export { defineEmptyState } from './define.ts';
