import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/date-picker';

const meta = {
  title: 'Core/Date Picker',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-date-picker>`. Spec: docs/features/core/date-picker.md.',
      },
    },
  },
  render: () =>
    html`<bx-date-picker
      label="Due date"
      locale="en-US"
      style="max-width:18rem"
    ></bx-date-picker>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Range: Story = {
  render: () =>
    html`<bx-date-picker
      label="Stay"
      range
      locale="en-US"
      style="max-width:24rem"
    ></bx-date-picker>`,
};
