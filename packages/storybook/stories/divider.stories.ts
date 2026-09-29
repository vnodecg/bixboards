import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/divider';

interface Args {
  orientation: 'horizontal' | 'vertical';
}

const meta = {
  title: 'Core/Divider',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-divider>`: a horizontal or vertical hairline separator with `role="separator"`. Spec: docs/features/core/divider.md.',
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
    },
  },
  args: {
    orientation: 'horizontal',
  },
  render: (args) => html`
    <div style="max-width: 20rem">
      <p>Above the divider.</p>
      <bx-divider orientation=${args.orientation}></bx-divider>
      <p>Below the divider.</p>
    </div>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Horizontal: Story = {};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => html`
    <div style="display: flex; align-items: center; height: 4rem; gap: 0">
      <span>Left</span>
      <bx-divider orientation=${args.orientation}></bx-divider>
      <span>Right</span>
    </div>
  `,
};
