import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/color-picker';

interface Args {
  value: string;
  format: 'hex' | 'rgb' | 'hsl' | 'hsv';
  opacity: boolean;
  uppercase: boolean;
  inline: boolean;
  disabled: boolean;
  noFormatToggle: boolean;
}

const meta = {
  title: 'Core/ColorPicker',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-color-picker>`: color selection with a saturation/value grid, hue/alpha sliders, swatches, eyedropper and format switching, form-associated via `ElementInternals`. Spec: docs/features/core/color-picker.md.',
      },
    },
  },
  argTypes: {
    value: { control: 'text' },
    format: { control: 'select', options: ['hex', 'rgb', 'hsl', 'hsv'] },
    opacity: { control: 'boolean' },
    uppercase: { control: 'boolean' },
    inline: { control: 'boolean' },
    disabled: { control: 'boolean' },
    noFormatToggle: { control: 'boolean' },
  },
  args: {
    value: '#3b82f6',
    format: 'hex',
    opacity: false,
    uppercase: false,
    inline: false,
    disabled: false,
    noFormatToggle: false,
  },
  render: (args) => html`
    <bx-color-picker
      value=${args.value}
      format=${args.format}
      ?opacity=${args.opacity}
      ?uppercase=${args.uppercase}
      ?inline=${args.inline}
      ?disabled=${args.disabled}
      ?no-format-toggle=${args.noFormatToggle}
      .swatches=${['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']}
    ></bx-color-picker>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Inline: Story = {
  args: { inline: true },
};

export const WithOpacity: Story = {
  args: { opacity: true, inline: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};
