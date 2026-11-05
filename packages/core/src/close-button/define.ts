import { BxCloseButton } from './close-button.ts';

/**
 * Registers {@link BxCloseButton} under `tagName` (default `bx-close-button`).
 *
 * Use this instead of importing `@bixboards/core/close-button` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineCloseButton(tagName?: string): void {
  BxCloseButton.define(tagName);
}
