import { BxInclude } from './include.ts';

/**
 * Registers {@link BxInclude} under `tagName` (default `bx-include`).
 *
 * Use this instead of importing `@bixant/core/include` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineInclude(tagName?: string): void {
  BxInclude.define(tagName);
}
