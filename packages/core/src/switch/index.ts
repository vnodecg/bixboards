// Side-effect: registers `<bx-switch>` under its default tag name. Import
// `@bixboards/core/switch/define` instead if a custom tag name/prefix is needed.
import { defineSwitch } from './define.ts';

defineSwitch();

export { BxSwitch } from './switch.ts';
export { defineSwitch } from './define.ts';
