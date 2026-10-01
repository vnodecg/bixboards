import { BxDataList } from './data-list.ts';

/** Registers {@link BxDataList} under `tagName` (default `bx-data-list`). */
export function defineDataList(tagName?: string): void {
  BxDataList.define(tagName);
}
