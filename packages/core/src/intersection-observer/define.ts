import { BxIntersectionObserver } from './intersection-observer.ts';

/**
 * Registers {@link BxIntersectionObserver} under `tagName` (default `bx-intersection-observer`).
 *
 * Use this instead of importing `@bixant/core/intersection-observer` when the app needs a custom
 * tag name or prefix (docs/features/_conventions.md §1).
 */
export function defineIntersectionObserver(tagName?: string): void {
  BxIntersectionObserver.define(tagName);
}
