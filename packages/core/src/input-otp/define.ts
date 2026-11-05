import { BxInputOtp } from './input-otp.ts';

/**
 * Registers {@link BxInputOtp} under `tagName` (default `bx-input-otp`).
 *
 * Use this instead of importing `@bixboards/core/input-otp` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineInputOtp(tagName?: string): void {
  BxInputOtp.define(tagName);
}
