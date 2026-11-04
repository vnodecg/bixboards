import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/sparkline';

const meta = {
  title: 'Core/Sparkline',
  parameters: {
    docs: {
      description: {
        component: '`<bx-sparkline>`. Spec: docs/features/core/sparkline.md.',
      },
    },
  },
  render: () =>
    html`<div style="width:12rem">
      <bx-sparkline label="Visits" values="3,5,4,8,6,9,12"></bx-sparkline>
    </div>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Types: Story = {
  render: () =>
    html`<div style="width:12rem;display:grid;gap:1rem">
      ${['line', 'area', 'bar'].map((t) => html`<bx-sparkline label=${t} type=${t} values="3,5,4,8,6,9,12" trend-is-good="up"></bx-sparkline>`)}
    </div>`,
};
