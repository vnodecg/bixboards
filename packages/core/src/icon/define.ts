import { BxIcon } from './icon.ts';

/**
 * Registers {@link BxIcon} under `tagName` (default `bx-icon`).
 *
 * Use this instead of importing `@bixant/core/icon` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineIcon(tagName?: string): void {
  BxIcon.define(tagName);
}
