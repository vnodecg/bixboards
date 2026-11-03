// Side-effect: registers `<bx-copy-button>` under its default tag name. Import
// `@bixboards/core/copy-button/define` instead if a custom tag name/prefix is needed.
import { defineCopyButton } from './define.ts';
import '../button/index.ts';
import '../icon/index.ts';
import '../tooltip/index.ts';

defineCopyButton();

export { BxCopyButton } from './copy-button.ts';
export { defineCopyButton } from './define.ts';
