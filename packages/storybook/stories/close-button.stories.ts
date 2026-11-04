import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/close-button';

const meta = {
  title: 'Core/Close Button',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-close-button>`. Spec: docs/features/core/close-button.md.',
      },
    },
  },
  render: () => html`<bx-close-button></bx-close-button>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Sizes: Story = {
  render: () =>
    html`<div style="display:flex;gap:.5rem">
      <bx-close-button size="s"></bx-close-button
      ><bx-close-button></bx-close-button
      ><bx-close-button size="l" appearance="filled"></bx-close-button>
    </div>`,
};
