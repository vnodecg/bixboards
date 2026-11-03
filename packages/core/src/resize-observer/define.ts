import { BxResizeObserver } from './resize-observer.ts';

/**
 * Registers {@link BxResizeObserver} under `tagName` (default `bx-resize-observer`).
 *
 * Use this instead of importing `@bixboards/core/resize-observer` when the app needs a custom tag
 * name or prefix (docs/features/_conventions.md §1).
 */
export function defineResizeObserver(tagName?: string): void {
  BxResizeObserver.define(tagName);
}
