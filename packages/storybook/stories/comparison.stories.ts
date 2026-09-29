import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/comparison';

interface Args {
  position: number;
}

const meta = {
  title: 'Core/Comparison',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-comparison>`: before/after image comparison with a draggable, keyboard-operable divider (arrow keys move it, Home/End jump to the ends). Spec: docs/features/core/comparison.md.',
      },
    },
  },
  argTypes: {
    position: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
  args: { position: 50 },
  render: (args) => html`
    <bx-comparison position=${args.position} style="max-inline-size: 32rem">
      <img
        slot="before"
        src="https://picsum.photos/seed/bixant-before/640/360?grayscale"
        alt="Before"
      />
      <img
        slot="after"
        src="https://picsum.photos/seed/bixant-before/640/360"
        alt="After"
      />
    </bx-comparison>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const StartAtEdge: Story = {
  name: 'Starting position at 20%',
  args: { position: 20 },
};

export const CustomHandle: Story = {
  name: 'Custom handle glyph',
  render: (args) => html`
    <bx-comparison position=${args.position} style="max-inline-size: 32rem">
      <img
        slot="before"
        src="https://picsum.photos/seed/bixant-h2/640/360?grayscale"
        alt="Before"
      />
      <img
        slot="after"
        src="https://picsum.photos/seed/bixant-h2/640/360"
        alt="After"
      />
      <span slot="handle" style="font-size: 1.25rem">↔</span>
    </bx-comparison>
  `,
};
