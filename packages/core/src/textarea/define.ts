import { BxTextarea } from './textarea.ts';

/**
 * Registers {@link BxTextarea} under `tagName` (default `bx-textarea`).
 *
 * Use this instead of importing `@bixboards/core/textarea` when the app needs a custom tag
 * name/prefix (docs/features/_conventions.md §1).
 */
export function defineTextarea(tagName?: string): void {
  BxTextarea.define(tagName);
}
