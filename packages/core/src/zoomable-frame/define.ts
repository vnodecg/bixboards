import { BxZoomableFrame } from './zoomable-frame.ts';

/**
 * Registers {@link BxZoomableFrame} under `tagName` (default `bx-zoomable-frame`).
 *
 * Use this instead of importing `@bixboards/core/zoomable-frame` when the app needs a custom tag
 * name/prefix (docs/features/_conventions.md §1).
 */
export function defineZoomableFrame(tagName?: string): void {
  BxZoomableFrame.define(tagName);
}
