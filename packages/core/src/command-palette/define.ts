import { BxCommandPalette } from './command-palette.ts';

/**
 * Registers {@link BxCommandPalette} under `tagName` (default `bx-command-palette`).
 *
 * Use this instead of importing `@bixboards/core/command-palette` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineCommandPalette(tagName?: string): void {
  BxCommandPalette.define(tagName);
}
