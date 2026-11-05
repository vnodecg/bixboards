// Side-effect: registers `<bx-input-otp>` under its default tag name. Import
// `@bixboards/core/input-otp/define` instead if a custom tag name/prefix is needed.
import { defineInputOtp } from './define.ts';
import '../input/index.ts';

defineInputOtp();

export { BxInputOtp } from './input-otp.ts';
export { defineInputOtp } from './define.ts';
