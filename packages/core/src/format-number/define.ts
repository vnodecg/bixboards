import { BxFormatNumber } from './format-number.ts';

/**
 * Registers {@link BxFormatNumber} under `tagName` (default `bx-format-number`).
 *
 * Use this instead of importing `@bixant/core/format-number` when the app needs a custom tag name
 * or prefix (docs/features/_conventions.md §1).
 */
export function defineFormatNumber(tagName?: string): void {
  BxFormatNumber.define(tagName);
}
