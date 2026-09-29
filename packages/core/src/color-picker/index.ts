// Side-effect: registers `<bx-color-picker>` under its default tag name. Import
// `@bixant/core/color-picker/define` instead if a custom tag name/prefix is needed.
import { defineColorPicker } from './define.ts';
import '../popup/index.ts';

defineColorPicker();

export { BxColorPicker } from './color-picker.ts';
export { defineColorPicker } from './define.ts';
