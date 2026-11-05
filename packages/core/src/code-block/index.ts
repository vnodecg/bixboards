// Side-effect: registers `<bx-code-block>` under its default tag name. Import
// `@bixboards/core/code-block/define` instead if a custom tag name/prefix is needed.
import { defineCodeBlock } from './define.ts';
import '../copy-button/index.ts';

defineCodeBlock();

export { BxCodeBlock } from './code-block.ts';
export {
  registerHighlighter,
  parseLineRanges,
  splitLines,
  type CodeToken,
  type Highlighter,
} from './code-block.ts';
export { defineCodeBlock } from './define.ts';
