import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/time-field';

const meta = {
  title: 'Core/Time Field',
  parameters: {
    docs: {
      description: {
        component: '`<bx-time-field>`. Spec: docs/features/core/time-field.md.',
      },
    },
  },
  render: () =>
    html`<bx-time-field
      label="Start"
      value="09:30"
      hour-cycle="h12"
    ></bx-time-field>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const TwentyFourHourWithSeconds: Story = {
  render: () =>
    html`<bx-time-field
      label="Precise"
      value="14:05:30"
      hour-cycle="h23"
      granularity="second"
    ></bx-time-field>`,
};
