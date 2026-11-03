import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/switch';

interface Args {
  checked: boolean;
  disabled: boolean;
  required: boolean;
  size: 'small' | 'medium' | 'large';
  label: string;
  hint: string;
}

const meta = {
  title: 'Core/Switch',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-switch>`: on/off toggle, form-associated via `ElementInternals`, with drag-to-toggle on touch. Spec: docs/features/core/switch.md.',
      },
    },
  },
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    size: { control: 'radio', options: ['small', 'medium', 'large'] },
    label: { control: 'text' },
    hint: { control: 'text' },
  },
  args: {
    checked: false,
    disabled: false,
    required: false,
    size: 'medium',
    label: 'Enable notifications',
    hint: '',
  },
  render: (args) => html`
    <bx-switch
      ?checked=${args.checked}
      ?disabled=${args.disabled}
      ?required=${args.required}
      size=${args.size}
      hint=${args.hint}
      >${args.label}</bx-switch
    >
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const States: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.75rem">
      <bx-switch>Off</bx-switch>
      <bx-switch checked>On</bx-switch>
      <bx-switch disabled>Disabled</bx-switch>
      <bx-switch disabled checked>Disabled + on</bx-switch>
    </div>
  `,
};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.75rem">
      ${(['small', 'medium', 'large'] as const).map(
        (size) =>
          html`<bx-switch size=${size} checked>Size: ${size}</bx-switch>`,
      )}
    </div>
  `,
};

export const Keyboard: Story = {
  name: 'Keyboard operable',
  render: () =>
    html`<bx-switch>Tab to focus, Space/Enter to toggle</bx-switch>`,
};
