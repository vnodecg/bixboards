import { BxFileUpload } from './file-upload.ts';

/**
 * Registers {@link BxFileUpload} under `tagName` (default `bx-file-upload`).
 *
 * Use this instead of importing `@bixboards/core/file-upload` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineFileUpload(tagName?: string): void {
  BxFileUpload.define(tagName);
}
