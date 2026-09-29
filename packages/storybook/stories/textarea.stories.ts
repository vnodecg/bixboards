import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/textarea';

interface Args {
  label: string;
  hint: string;
  placeholder: string;
  rows: number;
  resize: 'none' | 'vertical' | 'horizontal' | 'both' | 'auto';
  disabled: boolean;
  required: boolean;
  showCount: boolean;
  maxlength: number;
}

const meta = {
  title: 'Core/Textarea',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-textarea>`: multi-line text field, form-associated via `ElementInternals`, with auto-resize and a character counter. Spec: docs/features/core/textarea.md.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    hint: { control: 'text' },
    placeholder: { control: 'text' },
    rows: { control: 'number' },
    resize: {
      control: 'select',
      options: ['none', 'vertical', 'horizontal', 'both', 'auto'],
    },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    showCount: { control: 'boolean' },
    maxlength: { control: 'number' },
  },
  args: {
    label: 'Bio',
    hint: '',
    placeholder: 'Tell us about yourself…',
    rows: 4,
    resize: 'vertical',
    disabled: false,
    required: false,
    showCount: false,
    maxlength: 0,
  },
  render: (args) => html`
    <bx-textarea
      label=${args.label}
      hint=${args.hint}
      placeholder=${args.placeholder}
      rows=${args.rows}
      resize=${args.resize}
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?show-count=${args.showCount}
      maxlength=${args.maxlength || undefined}
    ></bx-textarea>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const WithCounter: Story = {
  args: { showCount: true, maxlength: 280, label: 'Post' },
};

export const AutoResize: Story = {
  name: 'Auto-resize (resize=auto)',
  args: { resize: 'auto', rows: 2 },
};

export const Disabled: Story = {
  args: { disabled: true },
};
