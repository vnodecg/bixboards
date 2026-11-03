// Side-effect: registers `<bx-avatar>` and `<bx-avatar-group>` under their default tag names.
// Import `@bixboards/core/avatar/define` instead if a custom tag name/prefix is needed.
import { defineAvatar, defineAvatarGroup } from './define.ts';

defineAvatar();
defineAvatarGroup();

export { BxAvatarGroup } from './avatar-group.ts';
export { BxAvatar } from './avatar.ts';
export { defineAvatar, defineAvatarGroup } from './define.ts';
