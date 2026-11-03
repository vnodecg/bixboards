import { BxSkeleton } from './skeleton.ts';

/**
 * Registers {@link BxSkeleton} under `tagName` (default `bx-skeleton`).
 *
 * Use this instead of importing `@bixboards/core/skeleton` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineSkeleton(tagName?: string): void {
  BxSkeleton.define(tagName);
}
