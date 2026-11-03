import { BxCheckbox } from './checkbox.ts';

/**
 * Registers {@link BxCheckbox} under `tagName` (default `bx-checkbox`).
 *
 * Use this instead of importing `@bixboards/core/checkbox` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineCheckbox(tagName?: string): void {
  BxCheckbox.define(tagName);
}
