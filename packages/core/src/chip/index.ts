// Side-effect: registers `<bx-chip>` under its default tag name. Import
// `@bixboards/core/chip/define` instead if a custom tag name/prefix is needed.
import { defineChip } from './define.ts';
import '../close-button/index.ts';
import '../badge/index.ts';

defineChip();

export { BxChip } from './chip.ts';
export { defineChip } from './define.ts';
