import { BxQrCode } from './qr-code.ts';

/**
 * Registers {@link BxQrCode} under `tagName` (default `bx-qr-code`).
 *
 * Use this instead of importing `@bixboards/core/qr-code` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineQrCode(tagName?: string): void {
  BxQrCode.define(tagName);
}
