import { BxDrawer } from './drawer.ts';

/**
 * Registers {@link BxDrawer} under `tagName` (default `bx-drawer`).
 *
 * Use this instead of importing `@bixant/core/drawer` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineDrawer(tagName?: string): void {
  BxDrawer.define(tagName);
}
