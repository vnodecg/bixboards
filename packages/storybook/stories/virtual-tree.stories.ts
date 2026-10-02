import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/data-list/virtual-tree';

interface Args {
  selection: 'none' | 'single' | 'multiple' | 'leaf';
  filter: string;
  showGuides: boolean;
}

interface Node {
  id: string;
  label: string;
  children?: Node[];
}

/** `branches` folders of `leaves` files under one root: 200 × 1000 is 200k leaves. */
const makeTree = (branches: number, leaves: number): Node[] => [
  {
    id: 'root',
    label: 'Everything',
    children: Array.from({ length: branches }, (_, b) => ({
      id: `b${b}`,
      label: `Folder ${b + 1}`,
      children: Array.from({ length: leaves }, (_, l) => ({
        id: `b${b}-l${l}`,
        label: `File ${b + 1}.${l + 1}`,
      })),
    })),
  },
];

const frame = 'border: 1px solid var(--bx-border-subtle)';

const meta = {
  title: 'Data/Virtual tree',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '`<bx-virtual-tree>`: data-driven tree that virtualizes 100k+ nodes. Collapsed subtrees are skipped rather than walked, branch tri-state is computed from aggregate counts, filtering keeps ancestors visible, and children can load lazily with per-node error/retry. Keyboard follows the APG tree pattern. Spec: docs/features/data-list/virtual-tree.md.',
      },
    },
  },
  argTypes: {
    selection: {
      control: 'radio',
      options: ['none', 'single', 'multiple', 'leaf'],
    },
    filter: { control: 'text' },
    showGuides: { control: 'boolean', name: 'show-guides' },
  },
  args: { selection: 'multiple', filter: '', showGuides: true },
  render: (args) => html`
    <bx-virtual-tree
      aria-label="Files"
      style="block-size: 22rem; ${frame}"
      .nodes=${makeTree(200, 1000)}
      .expandedKeys=${['root']}
      .filter=${args.filter || undefined}
      selection=${args.selection}
      ?show-guides=${args.showGuides}
    ></bx-virtual-tree>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const TwoHundredThousandNodes: Story = {};

export const Filtered: Story = {
  args: { filter: 'File 7.', selection: 'none' },
};

export const LazyLoading: Story = {
  render: () => {
    let attempts = 0;
    const dataSource = {
      getChildren: async (key: string | number, signal: AbortSignal) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        signal.throwIfAborted();
        // The first load of "flaky" fails, to show the per-node error + retry (Enter / click).
        if (key === 'flaky' && attempts++ === 0) {
          throw new Error('Network error');
        }
        return Array.from({ length: 5 }, (_, i) => ({
          id: `${key}-${i}`,
          label: `${key} child ${i + 1}`,
          hasChildren: i === 0,
        }));
      },
    };
    return html`
      <bx-virtual-tree
        aria-label="Lazy tree"
        style="block-size: 18rem; ${frame}"
        .nodes=${[
          { id: 'docs', label: 'Documents', hasChildren: true },
          { id: 'flaky', label: 'Flaky folder', hasChildren: true },
        ]}
        .dataSource=${dataSource}
      ></bx-virtual-tree>
    `;
  },
};

export const FlatWithParentId: Story = {
  render: () => html`
    <bx-virtual-tree
      aria-label="Org chart"
      style="block-size: 14rem; ${frame}"
      .nodes=${[
        { id: 1, label: 'CEO' },
        { id: 2, label: 'Engineering', parentId: 1 },
        { id: 3, label: 'Platform', parentId: 2 },
        { id: 4, label: 'Design', parentId: 1 },
      ]}
      .expandedKeys=${[1, 2]}
      selection="single"
    ></bx-virtual-tree>
  `,
};

export const Empty: Story = {
  render: () => html`
    <bx-virtual-tree aria-label="Empty tree" style="block-size: 8rem; ${frame}">
      <span slot="empty">No nodes</span>
    </bx-virtual-tree>
  `,
};
