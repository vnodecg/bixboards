import { BxTooltip } from './tooltip.ts';

/**
 * Registers {@link BxTooltip} under `tagName` (default `bx-tooltip`).
 *
 * Use this instead of importing `@bixant/core/tooltip` when the app needs a custom tag
 * name/prefix (docs/features/_conventions.md §1).
 */
export function defineTooltip(tagName?: string): void {
  BxTooltip.define(tagName);
}
