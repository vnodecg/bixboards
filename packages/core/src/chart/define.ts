import { BxChart } from './chart.ts';

/**
 * Registers {@link BxChart} under `tagName` (default `bx-chart`).
 *
 * Use this instead of importing `@bixboards/core/chart` when the app needs a custom tag name or
 * prefix (docs/features/_conventions.md §1).
 */
export function defineChart(tagName?: string): void {
  BxChart.define(tagName);
}
