import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/data-table/data-table';
import type { ColumnDef } from '@bixboards/data-table/data-table';

interface Row {
  id: number;
  name: string;
  team: string;
  amount: number;
  status: string;
}

interface Args {
  rows: number;
  density: 'compact' | 'comfortable' | 'spacious';
  selection: 'none' | 'single' | 'multiple';
  editable: boolean;
  responsive: 'scroll' | 'priority' | 'cards';
}

const TEAMS = ['Platform', 'Design', 'Growth', 'Support', 'Finance'];
const STATUS = ['Open', 'Review', 'Done'];

const makeRows = (count: number): Row[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Account ${i + 1}`,
    team: TEAMS[i % TEAMS.length]!,
    amount: ((i * 7919) % 100_000) / 100,
    status: STATUS[i % STATUS.length]!,
  }));

const columns: ColumnDef<Row>[] = [
  { field: 'id', header: 'ID', width: 90, sortable: true, priority: 3 },
  {
    field: 'name',
    header: 'Name',
    flex: 1,
    sortable: true,
    filter: true,
    editor: 'text',
    priority: 1,
  },
  {
    field: 'team',
    header: 'Team',
    width: 140,
    sortable: true,
    editor: 'select',
    editorOptions: TEAMS.map((t) => ({ value: t, label: t })),
    priority: 2,
  },
  {
    field: 'amount',
    header: 'Amount',
    width: 130,
    align: 'end',
    sortable: true,
    editor: 'number',
    aggregate: 'sum',
    render: (row) => `$${row.amount.toFixed(2)}`,
    priority: 2,
  },
  { field: 'status', header: 'Status', width: 120, sortable: true },
];

const meta = {
  title: 'Data/Data table',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '`<bx-data-table>`: virtualized table with native grid semantics (`aria-rowindex` etc. come from data indexes, so rows outside the DOM keep their numbers). Multi-column sort, filtering, grouping with aggregates, row/cell selection with TSV copy, column resize/reorder/pin, inline editing, a server-side block-cached row model, and CSV/xlsx export. Spec: docs/features/data-table/data-table.md.',
      },
    },
  },
  argTypes: {
    rows: { control: { type: 'number', min: 0, step: 10_000 } },
    density: {
      control: 'radio',
      options: ['compact', 'comfortable', 'spacious'],
    },
    selection: { control: 'radio', options: ['none', 'single', 'multiple'] },
    editable: { control: 'boolean' },
    responsive: { control: 'radio', options: ['scroll', 'priority', 'cards'] },
  },
  args: {
    rows: 1_000_000,
    density: 'comfortable',
    selection: 'multiple',
    editable: false,
    responsive: 'priority',
  },
  render: (args) => html`
    <bx-data-table
      aria-label="Accounts"
      style="block-size: 24rem"
      .columns=${columns}
      .data=${makeRows(args.rows)}
      density=${args.density}
      selection=${args.selection}
      ?editable=${args.editable}
      responsive=${args.responsive}
    ></bx-data-table>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const MillionRows: Story = {};

export const Editable: Story = {
  args: { rows: 500, editable: true, selection: 'none' },
};

export const Grouped: Story = {
  render: () => html`
    <bx-data-table
      aria-label="Accounts by team"
      style="block-size: 24rem"
      .columns=${columns}
      .data=${makeRows(5_000)}
      .groupBy=${['team']}
    ></bx-data-table>
  `,
};

export const PinnedColumns: Story = {
  render: () => html`
    <bx-data-table
      aria-label="Pinned columns"
      style="block-size: 20rem; max-inline-size: 28rem"
      .columns=${columns.map((c) => ({
        ...c,
        width: 160,
        flex: undefined,
        pinned: c.field === 'name' ? ('start' as const) : undefined,
      }))}
      .data=${makeRows(1_000)}
      responsive="scroll"
    ></bx-data-table>
  `,
};

export const ServerSide: Story = {
  parameters: {
    // Rows arrive from a fake async server; capture timing is not deterministic.
    visual: false,
  },
  render: () => {
    const dataSource = {
      getRows: async ({
        start,
        end,
        signal,
      }: {
        start: number;
        end: number;
        signal: AbortSignal;
      }) => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        signal.throwIfAborted();
        return { rows: makeRows(end).slice(start), total: 250_000 };
      },
    };
    return html`
      <bx-data-table
        aria-label="Server-side accounts"
        style="block-size: 24rem"
        .columns=${columns}
        .dataSource=${dataSource}
        selection="multiple"
      ></bx-data-table>
    `;
  },
};

export const CardsWhenNarrow: Story = {
  // The width is observed after first paint; wait for the resulting cards-mode re-render.
  play: async ({ canvasElement }) => {
    const table = canvasElement.querySelector(
      'bx-data-table',
    ) as HTMLElement & { updateComplete: Promise<unknown> };
    await table.updateComplete;
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await table.updateComplete;
  },
  render: () => html`
    <bx-data-table
      aria-label="Accounts as cards"
      style="block-size: 24rem; max-inline-size: 22rem"
      .columns=${columns}
      .data=${makeRows(200)}
      responsive="cards"
    ></bx-data-table>
  `,
};

export const Empty: Story = {
  render: () => html`
    <bx-data-table
      aria-label="Empty table"
      style="block-size: 12rem"
      .columns=${columns}
      .data=${[]}
      empty-label="No accounts match"
    ></bx-data-table>
  `,
};
