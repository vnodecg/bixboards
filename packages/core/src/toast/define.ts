import { BxToast } from './toast.ts';

/**
 * Registers {@link BxToast} under `tagName` (default `bx-toast`).
 *
 * Use this instead of importing `@bixboards/core/toast` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineToast(tagName?: string): void {
  BxToast.define(tagName);
}
