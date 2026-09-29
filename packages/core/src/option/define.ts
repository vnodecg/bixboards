import { BxOption } from './option.ts';

/**
 * Registers {@link BxOption} under `tagName` (default `bx-option`).
 *
 * Use this instead of importing `@bixant/core/option` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineOption(tagName?: string): void {
  BxOption.define(tagName);
}
