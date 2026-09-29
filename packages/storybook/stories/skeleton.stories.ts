import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/skeleton';

interface Args {
  effect: 'none' | 'pulse' | 'sheen';
}

const meta = {
  title: 'Core/Skeleton',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-skeleton>`: a placeholder shimmer while content loads. Shape is composed with plain CSS (width/height/border-radius) on the host — there is no `shape` property. Spec: docs/features/core/skeleton.md.',
      },
    },
  },
  argTypes: {
    effect: { control: 'radio', options: ['none', 'pulse', 'sheen'] },
  },
  args: {
    effect: 'sheen',
  },
  render: (args) => html`
    <div style="max-width: 16rem" aria-busy="true">
      <bx-skeleton effect=${args.effect}></bx-skeleton>
    </div>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Shapes: Story = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: 1rem" aria-busy="true">
      <bx-skeleton
        effect="sheen"
        style="inline-size: 2.5rem; block-size: 2.5rem; border-radius: 50%"
      ></bx-skeleton>
      <div style="display: flex; flex-direction: column; gap: 0.5rem; flex: 1">
        <bx-skeleton effect="sheen"></bx-skeleton>
        <bx-skeleton effect="sheen" style="inline-size: 60%"></bx-skeleton>
      </div>
    </div>
  `,
};

export const CardBlock: Story = {
  name: 'Card block',
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 16rem"
      aria-busy="true"
    >
      <bx-skeleton
        effect="sheen"
        style="block-size: 8rem; border-radius: var(--bx-radius-m)"
      ></bx-skeleton>
      <bx-skeleton effect="sheen"></bx-skeleton>
      <bx-skeleton effect="sheen" style="inline-size: 75%"></bx-skeleton>
    </div>
  `,
};
