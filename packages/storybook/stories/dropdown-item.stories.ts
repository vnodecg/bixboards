import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/dropdown-item';

interface Args {
  variant: 'default' | 'error';
  type: 'normal' | 'checkbox';
  checked: boolean;
  disabled: boolean;
  label: string;
}

const meta = {
  title: 'Core/Dropdown Item',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-dropdown-item>`: a single menu entry — plain, checkbox, or submenu parent. Sibling items sharing a parent reserve a shared checkmark gutter the moment any one of them is a checkbox item. Spec: docs/features/core/dropdown-item.md.',
      },
    },
  },
  argTypes: {
    variant: { control: 'radio', options: ['default', 'error'] },
    type: { control: 'radio', options: ['normal', 'checkbox'] },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    variant: 'default',
    type: 'normal',
    checked: false,
    disabled: false,
    label: 'Rename',
  },
  render: (args) => html`
    <div
      role="menu"
      style="inline-size: 14rem; border: 1px solid var(--bx-border-subtle); border-radius: var(--bx-radius-m); overflow: hidden"
    >
      <bx-dropdown-item
        variant=${args.variant}
        type=${args.type}
        ?checked=${args.checked}
        ?disabled=${args.disabled}
        >${args.label}</bx-dropdown-item
      >
    </div>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Menu: Story = {
  name: 'Full menu',
  render: () => html`
    <div
      role="menu"
      style="inline-size: 16rem; border: 1px solid var(--bx-border-subtle); border-radius: var(--bx-radius-m); overflow: hidden"
    >
      <bx-dropdown-item>
        <span slot="icon">✏️</span>Rename
        <span slot="details">⌘R</span>
      </bx-dropdown-item>
      <bx-dropdown-item type="checkbox" checked
        >Show hidden files</bx-dropdown-item
      >
      <bx-dropdown-item type="checkbox">Show in sidebar</bx-dropdown-item>
      <bx-dropdown-item disabled
        >Move to project (unavailable)</bx-dropdown-item
      >
      <bx-dropdown-item variant="error">
        <span slot="icon">🗑️</span>Delete
      </bx-dropdown-item>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          'Because one sibling is a checkbox item, every item in this group reserves the checkmark gutter — labels stay aligned regardless of type.',
      },
    },
  },
};

export const Submenu: Story = {
  name: 'With submenu',
  render: () => html`
    <div
      role="menu"
      style="inline-size: 14rem; border: 1px solid var(--bx-border-subtle); border-radius: var(--bx-radius-m); overflow: hidden"
    >
      <bx-dropdown-item>
        Export
        <div slot="submenu" role="menu" style="display: block">
          <bx-dropdown-item>PNG</bx-dropdown-item>
          <bx-dropdown-item>SVG</bx-dropdown-item>
        </div>
      </bx-dropdown-item>
    </div>
  `,
};
