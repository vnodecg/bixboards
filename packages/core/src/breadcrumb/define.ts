import { BxBreadcrumb } from './breadcrumb.ts';

/**
 * Registers {@link BxBreadcrumb} under `tagName` (default `bx-breadcrumb`).
 *
 * Use this instead of importing `@bixant/core/breadcrumb` when the app needs a custom tag
 * name/prefix (docs/features/_conventions.md §1).
 */
export function defineBreadcrumb(tagName?: string): void {
  BxBreadcrumb.define(tagName);
}
