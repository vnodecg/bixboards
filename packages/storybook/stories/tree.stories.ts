import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/tree';

interface Args {
  selection: 'single' | 'multiple' | 'leaf';
}

const meta = {
  title: 'Core/Tree',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-tree>`: hierarchical tree owning a nested set of `bx-tree-item`, with single/multiple/leaf selection and full keyboard navigation. Spec: docs/features/core/tree.md.',
      },
    },
  },
  argTypes: {
    selection: { control: 'radio', options: ['single', 'multiple', 'leaf'] },
  },
  args: {
    selection: 'single',
  },
  render: (args) => html`
    <bx-tree selection=${args.selection} style="max-inline-size: 320px">
      <bx-tree-item expanded with-checkbox=${args.selection === 'multiple'}>
        Documents
        <bx-tree-item slot="children" with-checkbox=${args.selection === 'multiple'}
          >Resume.pdf</bx-tree-item
        >
        <bx-tree-item slot="children" with-checkbox=${args.selection === 'multiple'} expanded>
          Projects
          <bx-tree-item slot="children" with-checkbox=${args.selection === 'multiple'}
            >bixant</bx-tree-item
          >
        </bx-tree-item>
      </bx-tree-item>
      <bx-tree-item with-checkbox=${args.selection === 'multiple'}>Downloads</bx-tree-item>
    </bx-tree>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Single: Story = {};

export const Multiple: Story = {
  args: { selection: 'multiple' },
};

export const LeafOnly: Story = {
  name: 'Leaf-only selection',
  args: { selection: 'leaf' },
};

export const Lazy: Story = {
  name: 'Lazy-loaded node',
  render: () => html`
    <bx-tree style="max-inline-size: 320px">
      <bx-tree-item
        lazy
        @bx-lazy-load=${(event: CustomEvent) => {
          const item = event.target as HTMLElement;
          setTimeout(() => {
            item.innerHTML +=
              '<bx-tree-item slot="children">Fetched child</bx-tree-item>';
            (item as unknown as { loading: boolean }).loading = false;
          }, 600);
        }}
        >Lazy folder</bx-tree-item
      >
    </bx-tree>
  `,
};
