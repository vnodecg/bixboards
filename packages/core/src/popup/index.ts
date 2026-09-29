// Side-effect: registers `<bx-popup>` under its default tag name. Import
// `@bixant/core/popup/define` instead if a custom tag name/prefix is needed.
import { definePopup } from './define.ts';

definePopup();

export { BxPopup, type Placement } from './popup.ts';
export { definePopup } from './define.ts';
