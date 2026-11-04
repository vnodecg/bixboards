import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/pagination';

const meta = {
  title: 'Core/Pagination',
  parameters: {
    docs: {
      description: {
        component: '`<bx-pagination>`. Spec: docs/features/core/pagination.md.',
      },
    },
  },
  render: () => html`<bx-pagination page="5" page-count="20"></bx-pagination>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Compact: Story = {
  render: () =>
    html`<bx-pagination compact page="3" page-count="20"></bx-pagination>`,
};

export const PageSizes: Story = {
  render: () =>
    html`<bx-pagination total="240" page-size="10" .pageSizes=${[10, 25, 50]}
      ><span slot="summary">Showing 1–10 of 240</span></bx-pagination
    >`,
};
