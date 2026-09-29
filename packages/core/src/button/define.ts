import { BxButton } from './button.ts';

/**
 * Registers {@link BxButton} under `tagName` (default `bx-button`).
 *
 * Use this instead of importing `@bixant/core/button` when the app needs a custom tag
 * name/prefix (docs/features/_conventions.md §1).
 */
export function defineButton(tagName?: string): void {
  BxButton.define(tagName);
}
