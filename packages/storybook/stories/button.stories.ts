import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/button';

interface Args {
  variant: 'default' | 'secondary' | 'tertiary' | 'error' | 'warning';
  appearance: 'accent' | 'filled' | 'outlined' | 'plain' | 'filled outlined';
  size: 'small' | 'medium' | 'large';
  pill: boolean;
  loading: boolean;
  disabled: boolean;
  withCaret: boolean;
  label: string;
}

const meta = {
  title: 'Core/Button',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-button>`: triggers an action, navigates (link mode via `href`), or submits/resets a form. Spec: docs/features/core/button.md.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'tertiary', 'error', 'warning'],
    },
    appearance: {
      control: 'select',
      options: ['accent', 'filled', 'outlined', 'plain', 'filled outlined'],
    },
    size: { control: 'radio', options: ['small', 'medium', 'large'] },
    pill: { control: 'boolean' },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    withCaret: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    variant: 'default',
    appearance: 'accent',
    size: 'medium',
    pill: false,
    loading: false,
    disabled: false,
    withCaret: false,
    label: 'Save changes',
  },
  render: (args) => html`
    <bx-button
      variant=${args.variant}
      appearance=${args.appearance}
      size=${args.size}
      ?pill=${args.pill}
      ?loading=${args.loading}
      ?disabled=${args.disabled}
      ?with-caret=${args.withCaret}
      >${args.label}</bx-button
    >
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
      ${(['default', 'secondary', 'tertiary', 'error', 'warning'] as const).map(
        (variant) => html`<bx-button variant=${variant}>${variant}</bx-button>`,
      )}
    </div>
  `,
};

export const Appearances: Story = {
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
      ${(['accent', 'filled', 'outlined', 'plain'] as const).map(
        (appearance) =>
          html`<bx-button appearance=${appearance}>${appearance}</bx-button>`,
      )}
    </div>
  `,
};

export const Loading: Story = {
  args: { loading: true },
};

export const Disabled: Story = {
  name: 'Disabled (stays focusable/hoverable)',
  args: { disabled: true },
};

export const LinkMode: Story = {
  name: 'Link mode',
  render: () =>
    html`<bx-button href="https://example.com" target="_blank"
      >Open docs</bx-button
    >`,
};

export const IconOnly: Story = {
  name: 'Icon-only (needs aria-label)',
  render: () =>
    html`<bx-button aria-label="Close" appearance="plain">✕</bx-button>`,
};
