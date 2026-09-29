import { BxRadio } from './radio.ts';

/**
 * Registers {@link BxRadio} under `tagName` (default `bx-radio`).
 *
 * Use this instead of importing `@bixant/core/radio` when the app needs a custom tag name/prefix
 * (docs/features/_conventions.md §1).
 */
export function defineRadio(tagName?: string): void {
  BxRadio.define(tagName);
}
