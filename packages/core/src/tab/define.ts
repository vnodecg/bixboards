import { BxTab } from './tab.ts';

/**
 * Registers {@link BxTab} under `tagName` (default `bx-tab`).
 *
 * Use this instead of importing `@bixant/core/tab` when the app needs a custom tag name/prefix
 * (docs/features/_conventions.md §1).
 */
export function defineTab(tagName?: string): void {
  BxTab.define(tagName);
}
