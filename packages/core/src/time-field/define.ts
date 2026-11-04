import { BxTimeField } from './time-field.ts';

/**
 * Registers {@link BxTimeField} under `tagName` (default `bx-time-field`).
 *
 * Use this instead of importing `@bixboards/core/time-field` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineTimeField(tagName?: string): void {
  BxTimeField.define(tagName);
}
