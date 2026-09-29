// Side-effect: registers `<bx-radio-group>` under its default tag name. Import
// `@bixant/core/radio-group/define` instead if a custom tag name/prefix is needed.
import { defineRadioGroup } from './define.ts';
import '../radio/index.ts';

defineRadioGroup();

export { BxRadioGroup } from './radio-group.ts';
export { defineRadioGroup } from './define.ts';
