import { BxStepper } from './stepper.ts';

/**
 * Registers {@link BxStepper} under `tagName` (default `bx-stepper`).
 *
 * Use this instead of importing `@bixboards/core/stepper` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineStepper(tagName?: string): void {
  BxStepper.define(tagName);
}
