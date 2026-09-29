// Side-effect: registers `<bx-tab-panel>` under its default tag name. Import
// `@bixant/core/tab-panel/define` instead if a custom tag name/prefix is needed.
import { defineTabPanel } from './define.ts';

defineTabPanel();

export { BxTabPanel } from './tab-panel.ts';
export { defineTabPanel } from './define.ts';
