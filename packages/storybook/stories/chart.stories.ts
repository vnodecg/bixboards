import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/chart';
const rows = [
  { month: 'Jan', sales: 10, cost: 4 },
  { month: 'Feb', sales: 25, cost: 9 },
  { month: 'Mar', sales: 18, cost: 12 },
  { month: 'Apr', sales: 32, cost: 10 },
];

const meta = {
  title: 'Core/Chart',
  parameters: {
    visual: false,
    docs: {
      description: {
        component: '`<bx-chart>`. Spec: docs/features/core/chart.md.',
      },
    },
  },
  render: () =>
    html`<bx-chart
      style="max-width:36rem"
      label="Sales"
      x="month"
      .series=${['sales', 'cost']}
      .data=${rows}
      ><span slot="title">Sales vs cost</span></bx-chart
    >`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Bars: Story = {
  render: () =>
    html`<bx-chart
      style="max-width:36rem"
      label="Sales"
      type="bar"
      x="month"
      .series=${['sales', 'cost']}
      .data=${rows}
    ></bx-chart>`,
};

export const Donut: Story = {
  render: () =>
    html`<bx-chart
      style="max-width:20rem"
      label="Share"
      type="radial"
      x="month"
      height="14rem"
      .series=${['sales']}
      .data=${rows}
    ></bx-chart>`,
};
