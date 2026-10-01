import { BxPage } from './page.ts';

/**
 * Registers {@link BxPage} under `tagName` (default `bx-page`).
 *
 * Use this instead of importing `@bixant/core/page` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function definePage(tagName?: string): void {
  BxPage.define(tagName);
}
