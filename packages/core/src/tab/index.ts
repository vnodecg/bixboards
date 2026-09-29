// Side-effect: registers `<bx-tab>` under its default tag name. Import `@bixant/core/tab/define`
// instead if a custom tag name/prefix is needed.
import { defineTab } from './define.ts';

defineTab();

export { BxTab } from './tab.ts';
export { defineTab } from './define.ts';
