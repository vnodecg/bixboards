import { BxTabGroup } from './tab-group.ts';

/**
 * Registers {@link BxTabGroup} under `tagName` (default `bx-tab-group`).
 *
 * Use this instead of importing `@bixant/core/tab-group` when the app needs a custom tag
 * name/prefix (docs/features/_conventions.md §1).
 */
export function defineTabGroup(tagName?: string): void {
  BxTabGroup.define(tagName);
}
