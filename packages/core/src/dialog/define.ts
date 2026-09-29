import { BxDialog } from './dialog.ts';

/**
 * Registers {@link BxDialog} under `tagName` (default `bx-dialog`).
 *
 * Use this instead of importing `@bixant/core/dialog` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineDialog(tagName?: string): void {
  BxDialog.define(tagName);
}
