import { BxKbd } from './kbd.ts';

/**
 * Registers {@link BxKbd} under `tagName` (default `bx-kbd`).
 *
 * Use this instead of importing `@bixboards/core/kbd` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineKbd(tagName?: string): void {
  BxKbd.define(tagName);
}
