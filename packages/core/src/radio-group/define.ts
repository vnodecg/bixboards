import { BxRadioGroup } from './radio-group.ts';

/**
 * Registers {@link BxRadioGroup} under `tagName` (default `bx-radio-group`).
 *
 * Use this instead of importing `@bixboards/core/radio-group` when the app needs a custom tag
 * name/prefix (docs/features/_conventions.md §1).
 */
export function defineRadioGroup(tagName?: string): void {
  BxRadioGroup.define(tagName);
}
