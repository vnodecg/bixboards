import { BxColorPicker } from './color-picker.ts';

/**
 * Registers {@link BxColorPicker} under `tagName` (default `bx-color-picker`).
 *
 * Use this instead of importing `@bixant/core/color-picker` when the app needs a custom tag
 * name/prefix (docs/features/_conventions.md §1).
 */
export function defineColorPicker(tagName?: string): void {
  BxColorPicker.define(tagName);
}
