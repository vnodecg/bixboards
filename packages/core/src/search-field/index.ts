// Side-effect: registers `<bx-search-field>` under its default tag name. Import
// `@bixboards/core/search-field/define` instead if a custom tag name/prefix is needed.
import { defineSearchField } from './define.ts';
import '../input/index.ts';
import '../spinner/index.ts';

defineSearchField();

export { BxSearchField } from './search-field.ts';
export { matchesShortcut } from './search-field.ts';
export { defineSearchField } from './define.ts';
