import { BxIconButton } from './icon-button.ts';

/**
 * Registers {@link BxIconButton} under `tagName` (default `bx-icon-button`).
 *
 * Use this instead of importing `@bixboards/core/icon-button` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineIconButton(tagName?: string): void {
  BxIconButton.define(tagName);
}
