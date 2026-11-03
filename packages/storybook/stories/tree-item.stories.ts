import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/tree-item';

interface Args {
  expanded: boolean;
  selected: boolean;
  disabled: boolean;
  withCheckbox: boolean;
  label: string;
}

const meta = {
  title: 'Core/Tree Item',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-tree-item>`: a node for the future `bx-tree`, with lazy children. Indentation is computed from actual DOM nesting depth; the expand button and optional checkbox are independently focusable standalone. Spec: docs/features/core/tree-item.md.',
      },
    },
  },
  argTypes: {
    expanded: { control: 'boolean' },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
    withCheckbox: { control: 'boolean', name: 'with-checkbox' },
    label: { control: 'text' },
  },
  args: {
    expanded: false,
    selected: false,
    disabled: false,
    withCheckbox: false,
    label: 'src',
  },
  render: (args) => html`
    <bx-tree-item
      ?expanded=${args.expanded}
      ?selected=${args.selected}
      ?disabled=${args.disabled}
      ?with-checkbox=${args.withCheckbox}
    >
      ${args.label}
      <bx-tree-item slot="children">index.ts</bx-tree-item>
      <bx-tree-item slot="children">bix-element.ts</bx-tree-item>
    </bx-tree-item>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const NestedTree: Story = {
  name: 'Nested tree',
  render: () => html`
    <bx-tree-item expanded>
      packages
      <bx-tree-item slot="children" expanded>
        core
        <bx-tree-item slot="children" selected>bix-element.ts</bx-tree-item>
        <bx-tree-item slot="children">index.ts</bx-tree-item>
      </bx-tree-item>
      <bx-tree-item slot="children">design-system</bx-tree-item>
    </bx-tree-item>
  `,
};

export const WithCheckboxes: Story = {
  name: 'With selection checkboxes',
  args: { withCheckbox: true, expanded: true },
};

export const LazyLoading: Story = {
  name: 'Lazy loading',
  render: () => {
    const handleLazyLoad = (event: Event) => {
      const item = event.target as HTMLElement & { loading: boolean };
      setTimeout(() => {
        const child = document.createElement('bx-tree-item');
        child.slot = 'children';
        child.textContent = 'Loaded child';
        item.appendChild(child);
        item.loading = false;
      }, 800);
    };
    return html`<bx-tree-item lazy @bx-lazy-load=${handleLazyLoad}
      >Fetched on expand</bx-tree-item
    >`;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Expanding fires cancelable `bx-lazy-load`; the consumer populates the `children` slot asynchronously and sets `loading = false`, which triggers the actual expand.',
      },
    },
  },
};

export const Disabled: Story = {
  parameters: {
    // Disabled items are exempt from WCAG contrast requirements (SC 1.4.3); axe does not detect disabled state on the custom element.
    a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } },
  },
  args: { disabled: true },
};
