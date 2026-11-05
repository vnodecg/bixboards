import { BxSegmentedControl } from './segmented-control.ts';

/**
 * Registers {@link BxSegmentedControl} under `tagName` (default `bx-segmented-control`).
 *
 * Use this instead of importing `@bixboards/core/segmented-control` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineSegmentedControl(tagName?: string): void {
  BxSegmentedControl.define(tagName);
}
