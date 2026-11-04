import { BxStep } from './step.ts';

/**
 * Registers {@link BxStep} under `tagName` (default `bx-step`).
 *
 * Use this instead of importing `@bixboards/core/step` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineStep(tagName?: string): void {
  BxStep.define(tagName);
}
