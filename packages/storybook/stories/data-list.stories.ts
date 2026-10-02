import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/data-list/data-list';

interface Message {
  id: number;
  title: string;
  body: string;
  group: string;
}

interface Args {
  layout: 'list' | 'grid';
  selection: 'none' | 'single' | 'multiple';
  reorderable: boolean;
  count: number;
}

const WORDS =
  'virtualized list item feed inbox gallery message reply thread'.split(' ');

const makeItems = (count: number): Message[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    title: `Item ${i + 1}`,
    // Deterministic, variable-length bodies so heights differ without randomness.
    body: Array.from(
      { length: 4 + ((i * 7) % 24) },
      (_, w) => WORDS[(i + w) % WORDS.length],
    ).join(' '),
    group: `Group ${String.fromCharCode(65 + (Math.floor(i / 50) % 26))}`,
  }));

const renderMessage = (m: Message) => html`
  <div style="padding: var(--bx-space-s) var(--bx-space-m)">
    <strong>${m.title}</strong>
    <div style="color: var(--bx-text-secondary)">${m.body}</div>
  </div>
`;

const frame = 'border: 1px solid var(--bx-border-subtle)';

const meta = {
  title: 'Data/Data list',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '`<bx-data-list>`: virtualized list/grid for feeds, inboxes and galleries. Only the items near the viewport are in the DOM, with measured variable heights, scroll anchoring, sticky group headers, selection, drag/keyboard reorder, reverse (chat) mode and paged `data-source` loading. Grid columns come from the container width, not breakpoints. Spec: docs/features/data-list/data-list.md.',
      },
    },
  },
  argTypes: {
    layout: { control: 'radio', options: ['list', 'grid'] },
    selection: { control: 'radio', options: ['none', 'single', 'multiple'] },
    reorderable: { control: 'boolean' },
    count: { control: { type: 'number', min: 0, step: 1000 } },
  },
  args: {
    layout: 'list',
    selection: 'none',
    reorderable: false,
    count: 100_000,
  },
  render: (args) => html`
    <bx-data-list
      aria-label="Messages"
      style="block-size: 24rem; ${frame}"
      .items=${makeItems(args.count)}
      .renderItem=${renderMessage}
      .itemLabel=${'title'}
      layout=${args.layout}
      selection=${args.selection}
      ?reorderable=${args.reorderable}
    ></bx-data-list>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Playground: Story = {};

export const Grid: Story = {
  args: { layout: 'grid', selection: 'multiple' },
};

export const Grouped: Story = {
  render: () => html`
    <bx-data-list
      aria-label="Grouped messages"
      style="block-size: 24rem; ${frame}"
      .items=${makeItems(2_000)}
      .renderItem=${renderMessage}
      .groupBy=${'group'}
      .itemLabel=${'title'}
      selection="single"
    ></bx-data-list>
  `,
};

export const Reorderable: Story = {
  render: () => html`
    <p>
      Drag an item, or focus the list, press Space to pick one up, move it with
      the arrow keys and press Space to drop (Escape cancels).
    </p>
    <bx-data-list
      aria-label="Reorderable tasks"
      style="block-size: 20rem; ${frame}"
      .items=${makeItems(40)}
      .renderItem=${renderMessage}
      .itemLabel=${'title'}
      reorderable
    ></bx-data-list>
  `,
};

export const ReverseChat: Story = {
  render: () => html`
    <bx-data-list
      aria-label="Chat"
      style="block-size: 20rem; ${frame}"
      .items=${makeItems(500)}
      .renderItem=${renderMessage}
      direction="reverse"
    ></bx-data-list>
  `,
};

export const InfiniteLoading: Story = {
  render: () => {
    const source = {
      getItems: async ({
        start,
        count,
        signal,
      }: {
        start: number;
        count: number;
        signal: AbortSignal;
      }) => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        signal.throwIfAborted();
        return {
          items: makeItems(start + count).slice(start),
          hasMore: start + count < 1_000,
        };
      },
    };
    return html`
      <bx-data-list
        aria-label="Paged messages"
        style="block-size: 20rem; ${frame}"
        .dataSource=${source}
        .renderItem=${renderMessage}
      ></bx-data-list>
    `;
  },
};

export const Empty: Story = {
  render: () => html`
    <bx-data-list
      aria-label="Empty list"
      style="block-size: 10rem; ${frame}"
      empty-label="Nothing here yet"
    ></bx-data-list>
  `,
};
