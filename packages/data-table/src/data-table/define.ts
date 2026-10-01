import { BxColumn, BxDataTable } from './data-table.ts';

/**
 * Registers {@link BxDataTable} under `tagName` (default `bx-data-table`). The declarative
 * `<bx-column>` helper is registered separately (see {@link defineColumn}) so a custom table
 * prefix does not silently change which children it reads (it always reads `bx-column`).
 */
export function defineDataTable(tagName?: string): void {
  BxDataTable.define(tagName);
}

/** Registers the data-only `<bx-column>` element used for declarative columns. */
export function defineColumn(tagName?: string): void {
  BxColumn.define(tagName);
}
