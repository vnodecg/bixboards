import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/breadcrumb-item';

interface Args {
  href: string;
  current: boolean;
  label: string;
}

const meta = {
  title: 'Core/Breadcrumb Item',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-breadcrumb-item>`: one crumb — renders as a link (`href` set), a button (no `href`, not `current`), or plain text with `aria-current="page"` (`current`). Spec: docs/features/core/breadcrumb-item.md.',
      },
    },
  },
  argTypes: {
    href: { control: 'text' },
    current: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    href: '#',
    current: false,
    label: 'Products',
  },
  render: (args) => html`
    <bx-breadcrumb-item href=${args.href} ?current=${args.current}
      >${args.label}</bx-breadcrumb-item
    >
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Trail: Story = {
  name: 'Full trail (link → interactive → current)',
  render: () => html`
    <nav aria-label="Breadcrumb" style="display: flex">
      <bx-breadcrumb-item href="#">Home</bx-breadcrumb-item>
      <bx-breadcrumb-item href="#">Products</bx-breadcrumb-item>
      <bx-breadcrumb-item>Category (SPA route)</bx-breadcrumb-item>
      <bx-breadcrumb-item current>Current item</bx-breadcrumb-item>
    </nav>
  `,
  parameters: {
    docs: {
      description: {
        story:
          'The last item is `:last-child`, so its separator is hidden automatically via CSS — no JS bookkeeping needed.',
      },
    },
  },
};

export const WithIcons: Story = {
  name: 'Start/end icon slots',
  render: () => html`
    <nav aria-label="Breadcrumb" style="display: flex">
      <bx-breadcrumb-item href="#"
        ><span slot="start">🏠</span>Home</bx-breadcrumb-item
      >
      <bx-breadcrumb-item current>Settings</bx-breadcrumb-item>
    </nav>
  `,
};

export const CustomSeparator: Story = {
  name: 'Custom separator',
  render: () => html`
    <nav aria-label="Breadcrumb" style="display: flex">
      <bx-breadcrumb-item href="#"
        >Home<span slot="separator">›</span></bx-breadcrumb-item
      >
      <bx-breadcrumb-item current>Docs</bx-breadcrumb-item>
    </nav>
  `,
};
