import { BxCallout } from './callout.ts';

/**
 * Registers {@link BxCallout} under `tagName` (default `bx-callout`).
 *
 * Use this instead of importing `@bixant/core/callout` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineCallout(tagName?: string): void {
  BxCallout.define(tagName);
}
