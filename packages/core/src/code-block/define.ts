import { BxCodeBlock } from './code-block.ts';

/**
 * Registers {@link BxCodeBlock} under `tagName` (default `bx-code-block`).
 *
 * Use this instead of importing `@bixboards/core/code-block` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineCodeBlock(tagName?: string): void {
  BxCodeBlock.define(tagName);
}
