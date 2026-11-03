import { BxMutationObserver } from './mutation-observer.ts';

/**
 * Registers {@link BxMutationObserver} under `tagName` (default `bx-mutation-observer`).
 *
 * Use this instead of importing `@bixboards/core/mutation-observer` when the app needs a custom tag
 * name or prefix (docs/features/_conventions.md §1).
 */
export function defineMutationObserver(tagName?: string): void {
  BxMutationObserver.define(tagName);
}
