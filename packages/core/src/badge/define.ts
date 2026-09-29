import { BxBadge } from './badge.ts';

/**
 * Registers {@link BxBadge} under `tagName` (default `bx-badge`).
 *
 * Use this instead of importing `@bixant/core/badge` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineBadge(tagName?: string): void {
  BxBadge.define(tagName);
}
