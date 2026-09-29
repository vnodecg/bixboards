import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/badge';

interface Args {
  variant: 'neutral' | 'brand' | 'success' | 'warning' | 'danger';
  appearance: 'accent' | 'filled' | 'outlined' | 'filled outlined';
  size: 'small' | 'medium' | 'large';
  pill: boolean;
  content: string;
  attention: 'none' | 'pulse' | 'bounce';
  withRemove: boolean;
  live: boolean;
}

const meta = {
  title: 'Core/Badge',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-badge>`: one component for status, count and label/chip. Removable chips are `<bx-badge with-remove>`. Spec: docs/features/core/badge.md.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['neutral', 'brand', 'success', 'warning', 'danger'],
    },
    appearance: {
      control: 'select',
      options: ['accent', 'filled', 'outlined', 'filled outlined'],
    },
    size: { control: 'radio', options: ['small', 'medium', 'large'] },
    pill: { control: 'boolean' },
    content: { control: 'text' },
    attention: { control: 'radio', options: ['none', 'pulse', 'bounce'] },
    withRemove: { control: 'boolean', name: 'with-remove' },
    live: { control: 'boolean' },
  },
  args: {
    variant: 'neutral',
    appearance: 'filled outlined',
    size: 'medium',
    pill: false,
    content: 'Beta',
    attention: 'none',
    withRemove: false,
    live: false,
  },
  render: (args) => html`
    <bx-badge
      variant=${args.variant}
      appearance=${args.appearance}
      size=${args.size}
      attention=${args.attention}
      ?pill=${args.pill}
      ?with-remove=${args.withRemove}
      ?live=${args.live}
      >${args.content}</bx-badge
    >
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
      ${['neutral', 'brand', 'success', 'warning', 'danger'].map(
        (variant) => html`<bx-badge variant=${variant}>${variant}</bx-badge>`,
      )}
    </div>
  `,
};

export const Appearances: Story = {
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
      ${['accent', 'filled', 'outlined', 'filled outlined'].map(
        (appearance) =>
          html`<bx-badge variant="brand" appearance=${appearance}
            >${appearance}</bx-badge
          >`,
      )}
    </div>
  `,
};

export const CountOverflow: Story = {
  name: 'Count overflow (max)',
  render: () => html`
    <div style="display: flex; gap: 0.5rem; align-items: center">
      <bx-badge variant="danger" pill max="99">42</bx-badge>
      <bx-badge variant="danger" pill max="99">150</bx-badge>
    </div>
  `,
};

export const RemovableChip: Story = {
  name: 'Removable chip',
  args: { withRemove: true, content: 'React' },
  parameters: {
    docs: {
      description: {
        story:
          'Focus the chip and press Backspace/Delete, or click the remove button — both emit a cancelable `bx-remove`.',
      },
    },
  },
};

export const AnchoredCount: Story = {
  name: 'Anchored count',
  render: () => html`
    <div style="position: relative; display: inline-block">
      <span style="font-size: 2rem">🔔</span>
      <bx-badge variant="danger" appearance="accent" pill anchor="top-end"
        >3</bx-badge
      >
    </div>
  `,
};
