import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/breadcrumb';

interface Args {
  label: string;
}

const meta = {
  title: 'Core/Breadcrumb',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-breadcrumb>`: navigation trail owning a set of `bx-breadcrumb-item`, with automatic overflow collapse into an inline "…" expander. Spec: docs/features/core/breadcrumb.md.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
  },
  args: {
    label: 'Breadcrumb',
  },
  render: (args) => html`
    <bx-breadcrumb label=${args.label}>
      <bx-breadcrumb-item href="/">Home</bx-breadcrumb-item>
      <bx-breadcrumb-item href="/products">Products</bx-breadcrumb-item>
      <bx-breadcrumb-item>Widget</bx-breadcrumb-item>
    </bx-breadcrumb>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Overflow: Story = {
  name: 'Overflow collapse (narrow container)',
  render: () => html`
    <div style="max-width: 220px">
      <bx-breadcrumb>
        <bx-breadcrumb-item href="/">Home</bx-breadcrumb-item>
        <bx-breadcrumb-item href="/a">Category</bx-breadcrumb-item>
        <bx-breadcrumb-item href="/a/b">Subcategory</bx-breadcrumb-item>
        <bx-breadcrumb-item href="/a/b/c">Product line</bx-breadcrumb-item>
        <bx-breadcrumb-item>Current page</bx-breadcrumb-item>
      </bx-breadcrumb>
    </div>
  `,
};
