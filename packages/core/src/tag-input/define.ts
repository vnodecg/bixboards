import { BxTagInput } from './tag-input.ts';

/**
 * Registers {@link BxTagInput} under `tagName` (default `bx-tag-input`).
 *
 * Use this instead of importing `@bixboards/core/tag-input` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineTagInput(tagName?: string): void {
  BxTagInput.define(tagName);
}
