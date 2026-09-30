import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/color-picker';

interface Args {
  value: string;
  format: 'hex' | 'rgb' | 'hsl' | 'hsv';
  noOpacity: boolean;
  presets: string[];
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
          '`<bx-color-picker>`: color selection with a saturation/value grid, preset swatches (`presets`), a custom picker, hue/opacity sliders, format selector, form-associated via `ElementInternals`. Spec: docs/features/core/color-picker.md.',
      },
    },
  },
  argTypes: {
    value: { control: 'text' },
    format: { control: 'select', options: ['hex', 'rgb', 'hsl', 'hsv'] },
    noOpacity: { control: 'boolean' },
    presets: { control: 'object' },
    uppercase: { control: 'boolean' },
    inline: { control: 'boolean' },
    disabled: { control: 'boolean' },
    noFormatToggle: { control: 'boolean' },
  },
  args: {
    value: '#3b82f6',
    format: 'hex',
    noOpacity: false,
    presets: [
      '#ef4444',
      '#f97316',
      '#eab308',
      '#22c55e',
      '#3b82f6',
      '#8b5cf6',
      '#000000',
      '#ffffff',
    ],
    uppercase: false,
    inline: false,
    disabled: false,
    noFormatToggle: false,
  },
  render: (args) => html`
    <bx-color-picker
      value=${args.value}
      format=${args.format}
      ?no-opacity=${args.noOpacity}
      ?uppercase=${args.uppercase}
      ?inline=${args.inline}
      ?disabled=${args.disabled}
      ?no-format-toggle=${args.noFormatToggle}
      .presets=${args.presets}
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
  args: { value: 'rgba(59, 130, 246, 0.5)', format: 'rgb', inline: true },
};

export const NoOpacity: Story = {
  args: { noOpacity: true, inline: true },
};

export const CustomPresets: Story = {
  args: { inline: true, presets: ['#0f172a', '#334155', '#94a3b8', '#e2e8f0'] },
};

export const NoPresets: Story = {
  args: { inline: true, presets: [] },
};

export const Disabled: Story = {
  args: { disabled: true },
};
