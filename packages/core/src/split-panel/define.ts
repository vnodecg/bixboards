import { BxSplitPanel } from './split-panel.ts';

/**
 * Registers {@link BxSplitPanel} under `tagName` (default `bx-split-panel`).
 *
 * Use this instead of importing `@bixboards/core/split-panel` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineSplitPanel(tagName?: string): void {
  BxSplitPanel.define(tagName);
}
