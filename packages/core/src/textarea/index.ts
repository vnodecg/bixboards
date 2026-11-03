// Side-effect: registers `<bx-textarea>` under its default tag name. Import
// `@bixboards/core/textarea/define` instead if a custom tag name/prefix is needed.
import { defineTextarea } from './define.ts';

defineTextarea();

export { BxTextarea } from './textarea.ts';
export { defineTextarea } from './define.ts';
