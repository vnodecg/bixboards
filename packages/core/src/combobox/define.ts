import { BxCombobox } from './combobox.ts';

/**
 * Registers {@link BxCombobox} under `tagName` (default `bx-combobox`).
 *
 * Use this instead of importing `@bixboards/core/combobox` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineCombobox(tagName?: string): void {
  BxCombobox.define(tagName);
}
