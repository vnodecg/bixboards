import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/stat-card';
import '@bixboards/core/sparkline';

const meta = {
  title: 'Core/Stat Card',
  parameters: {
    docs: {
      description: {
        component: '`<bx-stat-card>`. Spec: docs/features/core/stat-card.md.',
      },
    },
  },
  render: () =>
    html`<bx-stat-card
      label="Revenue"
      value="128400"
      delta="12.5"
      .format=${{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
      ><bx-sparkline
        slot="chart"
        label="Trend"
        values="3,5,4,8,6,9,12"
      ></bx-sparkline
      ><span slot="footer">vs last month</span></bx-stat-card
    >`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const LoadingAndInverted: Story = {
  render: () =>
    html`<div
      style="display:grid;grid-template-columns:repeat(2,minmax(0,16rem));gap:1rem"
    >
      <bx-stat-card
        label="Churn"
        value="3.2"
        delta="-0.4"
        trend-is-good="down"
      ></bx-stat-card
      ><bx-stat-card label="Loading" loading></bx-stat-card>
    </div>`,
};
