// Side-effect: registers `<bx-qr-code>` under its default tag name. Import
// `@bixboards/core/qr-code/define` instead if a custom tag name/prefix is needed.
import { defineQrCode } from './define.ts';

defineQrCode();

export { BxQrCode } from './qr-code.ts';
export { qrMatrix } from './qr-code.ts';
export { defineQrCode } from './define.ts';
