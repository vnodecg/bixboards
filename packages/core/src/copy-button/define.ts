import { BxCopyButton } from './copy-button.ts';

/**
 * Registers {@link BxCopyButton} under `tagName` (default `bx-copy-button`).
 *
 * Use this instead of importing `@bixboards/core/copy-button` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineCopyButton(tagName?: string): void {
  BxCopyButton.define(tagName);
}
