// Side-effect: registers `<bx-tag-input>` under its default tag name. Import
// `@bixboards/core/tag-input/define` instead if a custom tag name/prefix is needed.
import { defineTagInput } from './define.ts';
import '../chip/index.ts';
import '../input/index.ts';

defineTagInput();

export { BxTagInput } from './tag-input.ts';
export { defineTagInput } from './define.ts';
