import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/number-input';

interface Args {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  required: boolean;
  withoutSteppers: boolean;
  wheel: boolean;
}

const meta = {
  title: 'Core/NumberInput',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-number-input>`: numeric field with steppers, locale-aware parsing and min/max clamping, form-associated via `ElementInternals`. Spec: docs/features/core/number-input.md.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    withoutSteppers: { control: 'boolean' },
    wheel: { control: 'boolean' },
  },
  args: {
    label: 'Quantity',
    value: '1',
    min: 0,
    max: 10,
    step: 1,
    disabled: false,
    required: false,
    withoutSteppers: false,
    wheel: false,
  },
  render: (args) => html`
    <bx-number-input
      label=${args.label}
      value=${args.value}
      min=${args.min}
      max=${args.max}
      step=${args.step}
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?without-steppers=${args.withoutSteppers}
      ?wheel=${args.wheel}
    ></bx-number-input>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Currency: Story = {
  name: 'Currency format',
  render: () => html`
    <bx-number-input
      label="Price"
      value="19.99"
      locale="en-US"
      .format=${{ style: 'currency', currency: 'USD' }}
    ></bx-number-input>
  `,
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithoutSteppers: Story = {
  args: { withoutSteppers: true },
};
