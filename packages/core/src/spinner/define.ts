import { BxSpinner } from './spinner.ts';

/**
 * Registers {@link BxSpinner} under `tagName` (default `bx-spinner`).
 *
 * Use this instead of importing `@bixant/core/spinner` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineSpinner(tagName?: string): void {
  BxSpinner.define(tagName);
}
