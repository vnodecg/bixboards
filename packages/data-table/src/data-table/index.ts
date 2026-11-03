// Side-effect: registers `<bx-data-table>` and `<bx-column>`. Import
// `@bixboards/data-table/data-table/define` instead if a custom tag name/prefix is needed.
import { defineColumn, defineDataTable } from './define.ts';

defineDataTable();
defineColumn();

export {
  BxColumn,
  BxDataTable,
  type ColumnDef,
  type FilterModel,
  type SortModel,
  type TableDataSource,
  type TableState,
} from './data-table.ts';
export { defineColumn, defineDataTable } from './define.ts';
