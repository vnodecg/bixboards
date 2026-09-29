import { BxProgressBar } from './progress-bar.ts';

/**
 * Registers {@link BxProgressBar} under `tagName` (default `bx-progress-bar`).
 *
 * Use this instead of importing `@bixant/core/progress-bar` when the app needs a custom tag name
 * or prefix (docs/features/_conventions.md §1).
 */
export function defineProgressBar(tagName?: string): void {
  BxProgressBar.define(tagName);
}
