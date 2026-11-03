import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/option';

interface Args {
  value: string;
  label: string;
  selected: boolean;
  disabled: boolean;
}

const meta = {
  title: 'Core/Option',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-option>`: a single item inside the future `bx-select`. Deliberately inert — no selection logic or listeners of its own; a parent list reads/writes `selected`/`disabled` directly. Spec: docs/features/core/option.md.',
      },
    },
  },
  argTypes: {
    value: { control: 'text' },
    label: { control: 'text' },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    value: 'us',
    label: 'United States',
    selected: false,
    disabled: false,
  },
  render: (args) => html`
    <div
      style="inline-size: 14rem; border: 1px solid var(--bx-border-subtle); border-radius: var(--bx-radius-m)"
    >
      <bx-option
        value=${args.value}
        label=${args.label}
        ?selected=${args.selected}
        ?disabled=${args.disabled}
        >${args.label}</bx-option
      >
    </div>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  parameters: {
    // bx-option is rendered standalone here; its listbox parent is provided by bx-select/bx-dropdown.
    a11y: {
      config: { rules: [{ id: 'aria-required-parent', enabled: false }] },
    },
  },
};

export const ListBox: Story = {
  parameters: {
    // bx-option is rendered standalone here; its listbox parent is provided by bx-select/bx-dropdown.
    a11y: {
      config: { rules: [{ id: 'aria-required-parent', enabled: false }] },
    },
  },
  name: 'List of options',
  render: () => html`
    <div
      style="inline-size: 14rem; border: 1px solid var(--bx-border-subtle); border-radius: var(--bx-radius-m); overflow: hidden"
    >
      <bx-option value="us" selected>United States</bx-option>
      <bx-option value="ca">Canada</bx-option>
      <bx-option value="mx">Mexico</bx-option>
      <bx-option value="br" disabled>Brazil (unavailable)</bx-option>
    </div>
  `,
};

export const WithIcons: Story = {
  parameters: {
    // bx-option is rendered standalone here; its listbox parent is provided by bx-select/bx-dropdown.
    a11y: {
      config: { rules: [{ id: 'aria-required-parent', enabled: false }] },
    },
  },
  name: 'Start/end icon slots',
  render: () => html`
    <div
      style="inline-size: 14rem; border: 1px solid var(--bx-border-subtle); border-radius: var(--bx-radius-m)"
    >
      <bx-option value="draft" selected>
        <span slot="start">📝</span>Draft
        <span slot="end">3</span>
      </bx-option>
    </div>
  `,
};
