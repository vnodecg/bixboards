import { BxSelect } from './select.ts';

/**
 * Registers {@link BxSelect} under `tagName` (default `bx-select`).
 *
 * Use this instead of importing `@bixant/core/select` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1). The internal `bx-popup`, `bx-option`, `bx-badge` and
 * `bx-spinner` are referenced by their default tag names, so register those too (importing
 * `@bixant/core/select` does this for you).
 */
export function defineSelect(tagName?: string): void {
  BxSelect.define(tagName);
}
