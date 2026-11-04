import { BxNotificationCenter } from './notification-center.ts';

/**
 * Registers {@link BxNotificationCenter} under `tagName` (default `bx-notification-center`).
 *
 * Use this instead of importing `@bixboards/core/notification-center` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineNotificationCenter(tagName?: string): void {
  BxNotificationCenter.define(tagName);
}
