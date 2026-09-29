import { BxSwitch } from './switch.ts';

/**
 * Registers {@link BxSwitch} under `tagName` (default `bx-switch`).
 *
 * Use this instead of importing `@bixant/core/switch` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineSwitch(tagName?: string): void {
  BxSwitch.define(tagName);
}
