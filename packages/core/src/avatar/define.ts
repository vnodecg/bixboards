import { BxAvatarGroup } from './avatar-group.ts';
import { BxAvatar } from './avatar.ts';

/**
 * Registers {@link BxAvatar} under `tagName` (default `bx-avatar`).
 *
 * Use this instead of importing `@bixant/core/avatar` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineAvatar(tagName?: string): void {
  BxAvatar.define(tagName);
}

/**
 * Registers {@link BxAvatarGroup} under `tagName` (default `bx-avatar-group`).
 *
 * Use this instead of importing `@bixant/core/avatar` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineAvatarGroup(tagName?: string): void {
  BxAvatarGroup.define(tagName);
}
