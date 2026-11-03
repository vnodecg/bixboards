import { BxFormatDate } from './format-date.ts';

/**
 * Registers {@link BxFormatDate} under `tagName` (default `bx-format-date`).
 *
 * Use this instead of importing `@bixboards/core/format-date` when the app needs a custom tag name
 * or prefix (docs/features/_conventions.md §1).
 */
export function defineFormatDate(tagName?: string): void {
  BxFormatDate.define(tagName);
}
