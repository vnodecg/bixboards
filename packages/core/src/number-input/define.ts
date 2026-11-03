import { BxNumberInput } from './number-input.ts';

/**
 * Registers {@link BxNumberInput} under `tagName` (default `bx-number-input`).
 *
 * Use this instead of importing `@bixboards/core/number-input` when the app needs a custom tag
 * name/prefix (docs/features/_conventions.md §1).
 */
export function defineNumberInput(tagName?: string): void {
  BxNumberInput.define(tagName);
}
