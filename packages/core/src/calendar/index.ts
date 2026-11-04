// Side-effect: registers `<bx-calendar>` under its default tag name. Import
// `@bixboards/core/calendar/define` instead if a custom tag name/prefix is needed.
import { defineCalendar } from './define.ts';
import '../icon-button/index.ts';

defineCalendar();

export { BxCalendar } from './calendar.ts';
export * from './dates.ts';
export { defineCalendar } from './define.ts';
