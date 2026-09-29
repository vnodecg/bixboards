import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/avatar';

interface Args {
  image: string;
  initials: string;
  label: string;
  shape: 'circle' | 'square' | 'rounded';
}

const BROKEN_SRC = 'https://does-not-exist.invalid/avatar.png';

const meta = {
  title: 'Core/Avatar',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-avatar>`: user image, initials or icon, falling back image → initials → icon on error. `<bx-avatar-group>` stacks avatars with overlap and a "+N" overflow. Spec: docs/features/core/avatar.md.',
      },
    },
  },
  argTypes: {
    image: { control: 'text' },
    initials: { control: 'text' },
    label: { control: 'text' },
    shape: { control: 'radio', options: ['circle', 'square', 'rounded'] },
  },
  args: {
    image: 'https://i.pravatar.cc/128?img=12',
    initials: 'VC',
    label: 'Vinod C G',
    shape: 'circle',
  },
  render: (args) => html`
    <bx-avatar
      style="font-size: 3rem"
      image=${args.image}
      initials=${args.initials}
      label=${args.label}
      shape=${args.shape}
    ></bx-avatar>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Shapes: Story = {
  render: (args) => html`
    <div style="display: flex; gap: 1rem; font-size: 3rem">
      ${(['circle', 'square', 'rounded'] as const).map(
        (shape) =>
          html`<bx-avatar
            image=${args.image}
            label=${args.label}
            shape=${shape}
          ></bx-avatar>`,
      )}
    </div>
  `,
};

export const InitialsFallback: Story = {
  name: 'Initials (no image)',
  args: { image: '' },
};

export const ErrorFallback: Story = {
  name: 'Image error → initials',
  args: { image: BROKEN_SRC },
  parameters: {
    docs: {
      description: {
        story:
          'A broken `image` dispatches `bx-error` and falls back to `initials` (or the `icon` slot when there are none).',
      },
    },
  },
};

export const Group: Story = {
  name: 'Avatar group (+N overflow)',
  render: () => html`
    <bx-avatar-group max="4" style="font-size: 2rem">
      ${[1, 2, 3, 4, 5, 6].map(
        (i) =>
          html`<bx-avatar
            image="https://i.pravatar.cc/128?img=${i}"
            label="User ${i}"
          ></bx-avatar>`,
      )}
    </bx-avatar-group>
  `,
};
