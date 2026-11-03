import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/callout';

interface Args {
  variant: 'default' | 'secondary' | 'tertiary' | 'error' | 'warning';
  appearance: 'accent' | 'filled' | 'outlined' | 'plain' | 'filled outlined';
  size: 'small' | 'medium' | 'large';
  dismissible: boolean;
  open: boolean;
  message: string;
}

const meta = {
  title: 'Core/Callout',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-callout>`: inline message block for info, warning and error, with an animated open/close and optional dismiss button. Spec: docs/features/core/callout.md.',
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
    dismissible: { control: 'boolean' },
    open: { control: 'boolean' },
    message: { control: 'text' },
  },
  args: {
    variant: 'default',
    appearance: 'outlined',
    size: 'medium',
    dismissible: false,
    open: true,
    message: 'A new version is available. Refresh to update.',
  },
  render: (args) => html`
    <bx-callout
      variant=${args.variant}
      appearance=${args.appearance}
      size=${args.size}
      ?dismissible=${args.dismissible}
      ?open=${args.open}
      >${args.message}</bx-callout
    >
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 0.75rem; max-inline-size: 32rem"
    >
      ${(['default', 'secondary', 'tertiary', 'error', 'warning'] as const).map(
        (variant) =>
          html`<bx-callout variant=${variant}
            >This is a ${variant} callout.</bx-callout
          >`,
      )}
    </div>
  `,
};

export const Appearances: Story = {
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 0.75rem; max-inline-size: 32rem"
    >
      ${(
        ['accent', 'filled', 'outlined', 'filled outlined', 'plain'] as const
      ).map(
        (appearance) =>
          html`<bx-callout variant="default" appearance=${appearance}
            >Appearance: ${appearance}</bx-callout
          >`,
      )}
    </div>
  `,
};

export const Sizes: Story = {
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 0.75rem; max-inline-size: 32rem"
    >
      ${(['small', 'medium', 'large'] as const).map(
        (size) => html`<bx-callout size=${size}>Size: ${size}</bx-callout>`,
      )}
    </div>
  `,
};

export const Dismissible: Story = {
  args: { dismissible: true, variant: 'warning' },
  parameters: {
    docs: {
      description: {
        story:
          'The close button calls `hide()`, which fires cancelable `bx-hide` before animating closed and firing `bx-after-hide`.',
      },
    },
  },
};

export const WithIconSlot: Story = {
  name: 'Custom icon slot',
  render: () => html`
    <bx-callout variant="secondary" style="max-inline-size: 32rem">
      <span slot="icon">🎉</span>
      Your changes were published successfully.
    </bx-callout>
  `,
};
