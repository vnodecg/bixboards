import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/split-panel';

const meta = {
  title: 'Core/Split Panel',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-split-panel>`. Spec: docs/features/core/split-panel.md.',
      },
    },
  },
  render: () =>
    html`<bx-split-panel
      style="height:12rem;border:1px solid var(--bx-border-subtle)"
      ><div slot="start" style="padding:1rem">Start</div>
      <div slot="end" style="padding:1rem">End</div></bx-split-panel
    >`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const VerticalWithSnap: Story = {
  render: () =>
    html`<bx-split-panel
      orientation="vertical"
      snap="25% 50% 75%"
      style="height:16rem;border:1px solid var(--bx-border-subtle)"
      ><div slot="start" style="padding:1rem">Top</div>
      <div slot="end" style="padding:1rem">Bottom</div></bx-split-panel
    >`,
};
