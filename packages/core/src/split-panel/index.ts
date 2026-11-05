// Side-effect: registers `<bx-split-panel>` under its default tag name. Import
// `@bixboards/core/split-panel/define` instead if a custom tag name/prefix is needed.
import { defineSplitPanel } from './define.ts';

defineSplitPanel();

export { BxSplitPanel } from './split-panel.ts';
export { defineSplitPanel } from './define.ts';
