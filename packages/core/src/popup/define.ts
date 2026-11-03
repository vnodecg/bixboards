import { BxPopup } from './popup.ts';

/**
 * Registers {@link BxPopup} under `tagName` (default `bx-popup`).
 *
 * Use this instead of importing `@bixboards/core/popup` when the app needs a custom tag name/prefix
 * (docs/features/_conventions.md §1).
 */
export function definePopup(tagName?: string): void {
  BxPopup.define(tagName);
}
