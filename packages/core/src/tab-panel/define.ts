import { BxTabPanel } from './tab-panel.ts';

/**
 * Registers {@link BxTabPanel} under `tagName` (default `bx-tab-panel`).
 *
 * Use this instead of importing `@bixant/core/tab-panel` when the app needs a custom tag
 * name/prefix (docs/features/_conventions.md §1).
 */
export function defineTabPanel(tagName?: string): void {
  BxTabPanel.define(tagName);
}
