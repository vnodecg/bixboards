import { BxDetails } from './details.ts';

/**
 * Registers {@link BxDetails} under `tagName` (default `bx-details`).
 *
 * Use this instead of importing `@bixant/core/details` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineDetails(tagName?: string): void {
  BxDetails.define(tagName);
}
