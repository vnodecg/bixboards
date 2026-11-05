import { BxToggleButton } from './toggle-button.ts';

/**
 * Registers {@link BxToggleButton} under `tagName` (default `bx-toggle-button`).
 *
 * Use this instead of importing `@bixboards/core/toggle-button` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineToggleButton(tagName?: string): void {
  BxToggleButton.define(tagName);
}
