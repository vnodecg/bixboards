import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/rating';

interface Args {
  value: number;
  max: number;
  precision: number;
  readonly: boolean;
  disabled: boolean;
  size: 'small' | 'medium' | 'large';
  label: string;
}

const meta = {
  title: 'Core/Rating',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-rating>`: star-style rating input/display with fractional precision, form-associated via `ElementInternals`. Spec: docs/features/core/rating.md.',
      },
    },
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 5, step: 0.5 } },
    max: { control: 'number' },
    precision: { control: { type: 'select' }, options: [0.5, 1] },
    readonly: { control: 'boolean' },
    disabled: { control: 'boolean' },
    size: { control: 'radio', options: ['small', 'medium', 'large'] },
    label: { control: 'text' },
  },
  args: {
    value: 3,
    max: 5,
    precision: 1,
    readonly: false,
    disabled: false,
    size: 'medium',
    label: 'Rate this product',
  },
  render: (args) => html`
    <bx-rating
      value=${args.value}
      max=${args.max}
      precision=${args.precision}
      ?readonly=${args.readonly}
      ?disabled=${args.disabled}
      size=${args.size}
      label=${args.label}
    ></bx-rating>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const HalfStarPrecision: Story = {
  name: 'Half-star precision',
  args: { value: 3.5, precision: 0.5 },
};

export const ReadOnlyDisplay: Story = {
  name: 'Read-only display',
  args: { value: 4, readonly: true },
};

export const Disabled: Story = {
  args: { value: 2, disabled: true },
};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.75rem">
      ${(['small', 'medium', 'large'] as const).map(
        (size) =>
          html`<bx-rating
            size=${size}
            value="3"
            label="Size: ${size}"
          ></bx-rating>`,
      )}
    </div>
  `,
};

export const CustomSymbol: Story = {
  name: 'Custom symbol (getSymbol)',
  render: (args) => {
    const el = document.createElement('bx-rating') as HTMLElement & {
      getSymbol: (value: number) => string;
      value: number;
      label: string;
    };
    el.value = args.value;
    el.label = 'Rate with hearts';
    el.getSymbol = () => '♥';
    return el;
  },
};

export const Keyboard: Story = {
  name: 'Keyboard operable',
  render: () => html`
    <bx-rating
      value="2"
      label="Arrow keys adjust, Home/End jump to ends"
    ></bx-rating>
  `,
};
