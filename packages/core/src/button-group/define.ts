import { BxButtonGroup } from './button-group.ts';

/**
 * Registers {@link BxButtonGroup} under `tagName` (default `bx-button-group`).
 *
 * Use this instead of importing `@bixboards/core/button-group` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineButtonGroup(tagName?: string): void {
  BxButtonGroup.define(tagName);
}
