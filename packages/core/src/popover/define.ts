import { BxPopover } from './popover.ts';

/**
 * Registers {@link BxPopover} under `tagName` (default `bx-popover`).
 *
 * Use this instead of importing `@bixant/core/popover` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function definePopover(tagName?: string): void {
  BxPopover.define(tagName);
}
