import { BxCalendar } from './calendar.ts';

/**
 * Registers {@link BxCalendar} under `tagName` (default `bx-calendar`).
 *
 * Use this instead of importing `@bixboards/core/calendar` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineCalendar(tagName?: string): void {
  BxCalendar.define(tagName);
}
