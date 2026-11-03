import { BxInput } from './input.ts';

/**
 * Registers {@link BxInput} under `tagName` (default `bx-input`).
 *
 * Use this instead of importing `@bixboards/core/input` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineInput(tagName?: string): void {
  BxInput.define(tagName);
}
