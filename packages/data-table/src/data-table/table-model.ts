// Pure data layer of `bx-data-table`: no DOM, no Lit. Everything here operates on index arrays so
// a 1M-row data set is never copied or deep-cloned (docs/features/data-table/data-table.md §7).

export type Key = string | number;
export type SortDirection = 'asc' | 'desc';
export interface SortModel {
  /** Column id. */
  field: string;
  direction: SortDirection;
}

export type FilterOp =
  | 'contains'
  | 'startsWith'
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between';
export interface FilterCondition {
  op: FilterOp;
  value: unknown;
  /** Upper bound for `between`. */
  to?: unknown;
}
/** A string is "contains" (case-insensitive); a function is a free predicate. */
export type FilterValue =
  | string
  | number
  | boolean
  | FilterCondition
  | ((value: unknown, row: unknown) => boolean);
export type FilterModel = Record<string, FilterValue>;

export type Aggregate =
  'sum' | 'avg' | 'min' | 'max' | 'count' | ((values: unknown[]) => unknown);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ColumnDef<T = any> {
  /** Defaults to `field`. */
  id?: string;
  field?: string;
  header?: string;
  /** Initial width in px (default 140). */
  width?: number;
  minWidth?: number;
  /** Share of leftover width, relative to other flex columns. */
  flex?: number;
  pinned?: 'start' | 'end';
  sortable?: boolean;
  filter?: boolean;
  /** Custom cell template or primitive; receives the row. Errors are isolated per cell. */
  render?: (row: T, context: CellContext<T>) => unknown;
  valueGetter?: (row: T) => unknown;
  editor?:
    | 'text'
    | 'number'
    | 'checkbox'
    | 'select'
    | ((context: EditorContext<T>) => unknown);
  /** Options for the `select` editor. */
  editorOptions?: { value: string; label: string }[];
  aggregate?: Aggregate;
  /** Lower numbers stay visible longer when `responsive="priority"` hides columns. */
  priority?: number;
  hidden?: boolean;
  /** Overrides the default comparison. */
  comparator?: (a: unknown, b: unknown) => number;
  align?: 'start' | 'center' | 'end';
}

export interface CellContext<T> {
  value: unknown;
  row: T;
  rowIndex: number;
  column: ColumnDef<T>;
}

export interface EditorContext<T> extends CellContext<T> {
  commit(value: unknown): void;
  cancel(): void;
}

export const columnId = (column: ColumnDef): string =>
  column.id ?? column.field ?? column.header ?? '';

export function valueOf<T>(column: ColumnDef<T>, row: T): unknown {
  if (column.valueGetter) return column.valueGetter(row);
  return column.field === undefined
    ? undefined
    : (row as Record<string, unknown>)?.[column.field];
}

// --- Filtering --------------------------------------------------------------------------------

function matches(filter: FilterValue, value: unknown, row: unknown): boolean {
  if (typeof filter === 'function') return filter(value, row);
  if (typeof filter === 'object' && filter !== null) {
    const v = value as number;
    switch (filter.op) {
      case 'contains':
        return String(value ?? '')
          .toLowerCase()
          .includes(String(filter.value).toLowerCase());
      case 'startsWith':
        return String(value ?? '')
          .toLowerCase()
          .startsWith(String(filter.value).toLowerCase());
      case 'eq':
        return value === filter.value || String(value) === String(filter.value);
      case 'neq':
        return !(
          value === filter.value || String(value) === String(filter.value)
        );
      case 'gt':
        return v > (filter.value as number);
      case 'gte':
        return v >= (filter.value as number);
      case 'lt':
        return v < (filter.value as number);
      case 'lte':
        return v <= (filter.value as number);
      case 'between':
        return v >= (filter.value as number) && v <= (filter.to as number);
    }
  }
  if (typeof filter === 'boolean') return value === filter;
  const needle = String(filter).toLowerCase();
  return (
    needle === '' ||
    String(value ?? '')
      .toLowerCase()
      .includes(needle)
  );
}

/** Row indexes passing every filter, in data order. */
export function filterRows<T>(
  data: readonly T[],
  columns: readonly ColumnDef<T>[],
  filters: FilterModel,
): Uint32Array {
  const active = Object.entries(filters)
    .map(([id, filter]) => ({
      column: columns.find((c) => columnId(c) === id),
      filter,
    }))
    .filter(
      (f): f is { column: ColumnDef<T>; filter: FilterValue } => !!f.column,
    );
  const out = new Uint32Array(data.length);
  let n = 0;
  for (let i = 0; i < data.length; i++) {
    const row = data[i]!;
    let ok = true;
    for (const { column, filter } of active) {
      if (!matches(filter, valueOf(column, row), row)) {
        ok = false;
        break;
      }
    }
    if (ok) out[n++] = i;
  }
  return out.subarray(0, n);
}

// --- Sorting ----------------------------------------------------------------------------------

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

export function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1; // empties last, regardless of direction below
  if (b === null || b === undefined) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a < b ? -1 : 1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'boolean' && typeof b === 'boolean')
    return Number(a) - Number(b);
  return collator.compare(String(a), String(b));
}

/**
 * Stable sort of `order` (row indexes) by the model. Sort keys are extracted once per column into
 * a typed array (numbers) or array (everything else) so the comparator never calls a getter, and
 * the sort itself works on indexes — rows are never moved or cloned.
 */
export function sortRows<T>(
  order: Uint32Array,
  data: readonly T[],
  columns: readonly ColumnDef<T>[],
  sort: readonly SortModel[],
): Uint32Array {
  const keys = sort
    .map((s) => ({
      column: columns.find((c) => columnId(c) === s.field),
      dir: s.direction === 'desc' ? -1 : 1,
    }))
    .filter((k): k is { column: ColumnDef<T>; dir: 1 | -1 } => !!k.column);
  if (keys.length === 0) return order;

  const extracted = keys.map(({ column }) => {
    const values = new Array<unknown>(data.length);
    let numeric = true;
    for (let i = 0; i < order.length; i++) {
      const row = order[i]!;
      const v = valueOf(column, data[row]!);
      values[row] = v;
      if (typeof v !== 'number') numeric = false;
    }
    if (numeric && !column.comparator) {
      const typed = new Float64Array(data.length);
      for (let i = 0; i < order.length; i++)
        typed[order[i]!] = values[order[i]!] as number;
      return typed;
    }
    return values;
  });

  const sorted = Uint32Array.from(order);
  sorted.sort((a, b) => {
    for (let k = 0; k < keys.length; k++) {
      const { column, dir } = keys[k]!;
      const values = extracted[k]!;
      const va = values[a];
      const vb = values[b];
      let c: number;
      if (column.comparator) c = column.comparator(va, vb);
      else if (
        va === null ||
        va === undefined ||
        vb === null ||
        vb === undefined
      ) {
        // Empties sort last in both directions.
        const ea = va === null || va === undefined;
        const eb = vb === null || vb === undefined;
        if (ea && eb) continue;
        return ea ? 1 : -1;
      } else c = compareValues(va, vb);
      if (c !== 0) return c * dir;
    }
    return a - b; // stable
  });
  return sorted;
}

// --- Grouping ---------------------------------------------------------------------------------

export interface GroupInfo {
  /** Unique path key, e.g. `region:EU/city:Paris`. */
  key: string;
  level: number;
  field: string;
  value: unknown;
  count: number;
  /** Aggregates by column id. */
  aggregates: Record<string, unknown>;
}

export function aggregate(kind: Aggregate, values: unknown[]): unknown {
  if (typeof kind === 'function') return kind(values);
  if (kind === 'count') return values.length;
  const nums = values.filter((v): v is number => typeof v === 'number');
  if (nums.length === 0) return undefined;
  switch (kind) {
    case 'sum':
      return nums.reduce((a, b) => a + b, 0);
    case 'avg':
      return nums.reduce((a, b) => a + b, 0) / nums.length;
    case 'min':
      return nums.reduce((a, b) => (b < a ? b : a));
    case 'max':
      return nums.reduce((a, b) => (b > a ? b : a));
  }
}

export interface GroupedView {
  /** `>= 0`: a data row index. `< 0`: group row `-(n + 1)` indexing `groups`. */
  refs: Int32Array;
  groups: GroupInfo[];
}

/**
 * Builds the flat, expansion-aware row list for grouped data. `order` must already be sorted with
 * the group columns first, so equal values are adjacent and each level is one linear partition.
 */
export function groupRows<T>(
  order: Uint32Array,
  data: readonly T[],
  columns: readonly ColumnDef<T>[],
  groupBy: readonly string[],
  expanded: ReadonlySet<string>,
): GroupedView {
  const groupColumns = groupBy
    .map((id) => columns.find((c) => columnId(c) === id))
    .filter((c): c is ColumnDef<T> => !!c);
  const aggColumns = columns.filter((c) => c.aggregate);
  const refs: number[] = [];
  const groups: GroupInfo[] = [];

  const walk = (
    lo: number,
    hi: number,
    level: number,
    prefix: string,
  ): void => {
    if (level >= groupColumns.length) {
      for (let i = lo; i < hi; i++) refs.push(order[i]!);
      return;
    }
    const column = groupColumns[level]!;
    let i = lo;
    while (i < hi) {
      const value = valueOf(column, data[order[i]!]!);
      let j = i + 1;
      while (
        j < hi &&
        compareValues(valueOf(column, data[order[j]!]!), value) === 0
      )
        j++;
      const key = `${prefix}${columnId(column)}:${String(value)}`;
      const aggregates: Record<string, unknown> = {};
      for (const c of aggColumns) {
        const values: unknown[] = [];
        for (let k = i; k < j; k++) values.push(valueOf(c, data[order[k]!]!));
        aggregates[columnId(c)] = aggregate(c.aggregate!, values);
      }
      groups.push({
        key,
        level,
        field: columnId(column),
        value,
        count: j - i,
        aggregates,
      });
      refs.push(-groups.length);
      if (expanded.has(key)) walk(i, j, level + 1, `${key}/`);
      i = j;
    }
  };
  walk(0, order.length, 0, '');
  return { refs: Int32Array.from(refs), groups };
}

// --- Export -----------------------------------------------------------------------------------

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const text = value instanceof Date ? value.toISOString() : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Streams CSV in chunks (so the whole string never exists at once) as an array of strings ready
 * for `new Blob(chunks)`. Honors the current sort/filter because it iterates `order`.
 */
export function toCsvChunks<T>(
  order: ArrayLike<number>,
  data: readonly T[],
  columns: readonly ColumnDef<T>[],
  chunkRows = 5000,
): string[] {
  const chunks: string[] = [
    columns.map((c) => csvCell(c.header ?? columnId(c))).join(',') + '\r\n',
  ];
  for (let start = 0; start < order.length; start += chunkRows) {
    let text = '';
    const end = Math.min(order.length, start + chunkRows);
    for (let i = start; i < end; i++) {
      const row = data[order[i]!]!;
      text += columns.map((c) => csvCell(valueOf(c, row))).join(',') + '\r\n';
    }
    chunks.push(text);
  }
  return chunks;
}

/** Tab-separated text for the clipboard. */
export function toTsv(rows: unknown[][]): string {
  return rows
    .map((r) =>
      r.map((v) => String(v ?? '').replace(/[\t\r\n]+/g, ' ')).join('\t'),
    )
    .join('\n');
}

// A stored (uncompressed) ZIP is enough for a valid .xlsx and needs no compression library.
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++)
    c = CRC_TABLE[(c ^ bytes[i]!) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function zipStore(files: { name: string; data: Uint8Array }[]): Uint8Array {
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  const enc = new TextEncoder();
  for (const file of files) {
    const name = enc.encode(file.name);
    const crc = crc32(file.data);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, file.data.length, true);
    local.setUint32(22, file.data.length, true);
    local.setUint16(26, name.length, true);
    parts.push(new Uint8Array(local.buffer), name, file.data);
    const dir = new DataView(new ArrayBuffer(46));
    dir.setUint32(0, 0x02014b50, true);
    dir.setUint16(4, 20, true);
    dir.setUint16(6, 20, true);
    dir.setUint32(16, crc, true);
    dir.setUint32(20, file.data.length, true);
    dir.setUint32(24, file.data.length, true);
    dir.setUint16(28, name.length, true);
    dir.setUint32(42, offset, true);
    central.push(new Uint8Array(dir.buffer), name);
    offset += 30 + name.length + file.data.length;
  }
  const centralSize = central.reduce((n, p) => n + p.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);
  const all = [...parts, ...central, new Uint8Array(end.buffer)];
  const out = new Uint8Array(all.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of all) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

const xml = (s: string): string =>
  s.replace(
    /[<>&"]/g,
    (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]!,
  );

function columnLetter(index: number): string {
  let s = '';
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26))
    s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

/** A single-sheet `.xlsx` workbook of the rows in `order`, honoring sort/filter. */
export function toXlsx<T>(
  order: ArrayLike<number>,
  data: readonly T[],
  columns: readonly ColumnDef<T>[],
): Uint8Array {
  const cell = (value: unknown, ref: string): string => {
    if (value === null || value === undefined || value === '') return '';
    if (typeof value === 'number' && Number.isFinite(value))
      return `<c r="${ref}"><v>${value}</v></c>`;
    if (typeof value === 'boolean')
      return `<c r="${ref}" t="b"><v>${value ? 1 : 0}</v></c>`;
    const text = value instanceof Date ? value.toISOString() : String(value);
    return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xml(text)}</t></is></c>`;
  };
  let sheet =
    '<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>';
  sheet +=
    '<row r="1">' +
    columns
      .map((c, i) => cell(c.header ?? columnId(c), `${columnLetter(i)}1`))
      .join('') +
    '</row>';
  for (let r = 0; r < order.length; r++) {
    const row = data[order[r]!]!;
    sheet +=
      `<row r="${r + 2}">` +
      columns
        .map((c, i) => cell(valueOf(c, row), `${columnLetter(i)}${r + 2}`))
        .join('') +
      '</row>';
  }
  sheet += '</sheetData></worksheet>';
  const enc = new TextEncoder();
  return zipStore([
    {
      name: '[Content_Types].xml',
      data: enc.encode(
        '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
      ),
    },
    {
      name: '_rels/.rels',
      data: enc.encode(
        '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
      ),
    },
    {
      name: 'xl/workbook.xml',
      data: enc.encode(
        '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>',
      ),
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      data: enc.encode(
        '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
      ),
    },
    { name: 'xl/worksheets/sheet1.xml', data: enc.encode(sheet) },
  ]);
}

// --- Server-side row model ---------------------------------------------------------------------

export interface RowRequest {
  start: number;
  end: number;
  sort: SortModel[];
  filter: FilterModel;
  group: string[];
  signal: AbortSignal;
}
export interface RowResponse<T> {
  rows: T[];
  /** Total number of rows matching the filter. */
  total: number;
}
export interface TableDataSource<T> {
  getRows(request: RowRequest): Promise<RowResponse<T>>;
}

/**
 * Block cache for the server-side row model (FR-DATA-TABLE-05): rows are fetched in fixed-size
 * blocks, concurrent requests for the same block are de-duplicated, a block that scrolled away
 * before it arrived can be dropped, and a failed block is retryable.
 */
export class BlockCache<T> {
  readonly blockSize: number;
  total = -1;
  #blocks = new Map<number, T[]>();
  #pending = new Map<number, AbortController>();
  #failed = new Set<number>();
  #fetch: (
    start: number,
    end: number,
    signal: AbortSignal,
  ) => Promise<RowResponse<T>>;
  #onChange: () => void;
  #onError: (error: unknown, block: number) => void;
  #onRequest: (start: number, end: number) => void;

  constructor(
    blockSize: number,
    fetch: (
      start: number,
      end: number,
      signal: AbortSignal,
    ) => Promise<RowResponse<T>>,
    onChange: () => void,
    onError: (error: unknown, block: number) => void,
    onRequest: (start: number, end: number) => void,
  ) {
    this.blockSize = blockSize;
    this.#fetch = fetch;
    this.#onChange = onChange;
    this.#onError = onError;
    this.#onRequest = onRequest;
  }

  get(index: number): T | undefined {
    return this.#blocks.get(Math.floor(index / this.blockSize))?.[
      index % this.blockSize
    ];
  }

  isLoading(index: number): boolean {
    return this.#pending.has(Math.floor(index / this.blockSize));
  }

  hasError(index: number): boolean {
    return this.#failed.has(Math.floor(index / this.blockSize));
  }

  /** Ensures the blocks covering `[start, end]` are loading or loaded. */
  ensure(start: number, end: number): void {
    const first = Math.floor(Math.max(0, start) / this.blockSize);
    const last = Math.floor(Math.max(0, end) / this.blockSize);
    for (let block = first; block <= last; block++) {
      if (
        this.#blocks.has(block) ||
        this.#pending.has(block) ||
        this.#failed.has(block)
      )
        continue;
      void this.#load(block);
    }
    // Blocks far from the viewport that are still in flight are no longer interesting.
    for (const [block, controller] of this.#pending)
      if (block < first - 2 || block > last + 2) {
        controller.abort();
        this.#pending.delete(block);
      }
  }

  retry(): void {
    this.#failed.clear();
  }

  async #load(block: number): Promise<void> {
    const controller = new AbortController();
    this.#pending.set(block, controller);
    const start = block * this.blockSize;
    const end = start + this.blockSize;
    this.#onRequest(start, end);
    try {
      const response = await this.#fetch(start, end, controller.signal);
      if (controller.signal.aborted) return;
      this.total = response.total;
      this.#blocks.set(block, response.rows);
    } catch (error) {
      if (controller.signal.aborted) return;
      this.#failed.add(block);
      this.#onError(error, block);
    } finally {
      if (this.#pending.get(block) === controller) this.#pending.delete(block);
      this.#onChange();
    }
  }

  clear(): void {
    for (const controller of this.#pending.values()) controller.abort();
    this.#pending.clear();
    this.#blocks.clear();
    this.#failed.clear();
    this.total = -1;
  }
}
