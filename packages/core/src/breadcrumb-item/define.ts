import { BxBreadcrumbItem } from './breadcrumb-item.ts';

/**
 * Registers {@link BxBreadcrumbItem} under `tagName` (default `bx-breadcrumb-item`).
 *
 * Use this instead of importing `@bixant/core/breadcrumb-item` when the app needs a custom tag
 * name/prefix (docs/features/_conventions.md §1).
 */
export function defineBreadcrumbItem(tagName?: string): void {
  BxBreadcrumbItem.define(tagName);
}
