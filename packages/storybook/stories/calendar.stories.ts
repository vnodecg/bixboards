import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/calendar';

const meta = {
  title: 'Core/Calendar',
  parameters: {
    docs: {
      description: {
        component: '`<bx-calendar>`. Spec: docs/features/core/calendar.md.',
      },
    },
  },
  render: () =>
    html`<bx-calendar
      month="2024-05"
      value="2024-05-14"
      locale="en-US"
    ></bx-calendar>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Range: Story = {
  render: () =>
    html`<bx-calendar
      mode="range"
      month="2024-05"
      months="2"
      value="2024-05-10/2024-05-16"
      locale="en-US"
      show-week-numbers
    ></bx-calendar>`,
};
