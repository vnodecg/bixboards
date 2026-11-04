import { BxSocialButton } from './social-button.ts';

/**
 * Registers {@link BxSocialButton} under `tagName` (default `bx-social-button`).
 *
 * Use this instead of importing `@bixboards/core/social-button` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineSocialButton(tagName?: string): void {
  BxSocialButton.define(tagName);
}
