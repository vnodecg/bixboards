import { BxDatePicker } from './date-picker.ts';

/**
 * Registers {@link BxDatePicker} under `tagName` (default `bx-date-picker`).
 *
 * Use this instead of importing `@bixboards/core/date-picker` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineDatePicker(tagName?: string): void {
  BxDatePicker.define(tagName);
}
