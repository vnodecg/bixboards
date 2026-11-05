// Side-effect: registers `<bx-date-picker>` under its default tag name. Import
// `@bixboards/core/date-picker/define` instead if a custom tag name/prefix is needed.
import { defineDatePicker } from './define.ts';
import '../calendar/index.ts';
import '../popup/index.ts';
import '../input/index.ts';
import '../icon-button/index.ts';

defineDatePicker();

export { BxDatePicker } from './date-picker.ts';
export { parseTypedDate } from './date-picker.ts';
export { defineDatePicker } from './define.ts';
