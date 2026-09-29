import { BxFormatBytes } from './format-bytes.ts';

/**
 * Registers {@link BxFormatBytes} under `tagName` (default `bx-format-bytes`).
 *
 * Use this instead of importing `@bixant/core/format-bytes` when the app needs a custom tag name
 * or prefix (docs/features/_conventions.md §1).
 */
export function defineFormatBytes(tagName?: string): void {
  BxFormatBytes.define(tagName);
}
