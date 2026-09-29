import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/radio-group';

interface Args {
  label: string;
  hint: string;
  orientation: 'horizontal' | 'vertical';
  required: boolean;
  disabled: boolean;
}

const meta = {
  title: 'Core/RadioGroup',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-radio-group>`: owns a set of slotted `bx-radio` members — single value, validation, and label/hint chrome, form-associated via `ElementInternals`. Spec: docs/features/core/radio-group.md.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    hint: { control: 'text' },
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Plan',
    hint: '',
    orientation: 'vertical',
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <bx-radio-group
      name="story-plan"
      label=${args.label}
      hint=${args.hint}
      orientation=${args.orientation}
      ?required=${args.required}
      ?disabled=${args.disabled}
    >
      <bx-radio value="free" checked>Free</bx-radio>
      <bx-radio value="pro">Pro</bx-radio>
      <bx-radio value="enterprise">Enterprise</bx-radio>
    </bx-radio-group>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
};

export const WithHint: Story = {
  args: { hint: 'You can change your plan at any time.' },
};

export const Required: Story = {
  args: { required: true, label: 'Plan (required)' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const ButtonAppearance: Story = {
  name: 'Button appearance members',
  render: () => html`
    <bx-radio-group name="story-size" label="Size">
      <bx-radio appearance="button" value="s">Small</bx-radio>
      <bx-radio appearance="button" value="m" checked>Medium</bx-radio>
      <bx-radio appearance="button" value="l">Large</bx-radio>
    </bx-radio-group>
  `,
};
