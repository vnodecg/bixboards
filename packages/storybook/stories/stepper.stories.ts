import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/stepper';
import '@bixboards/core/step';

const meta = {
  title: 'Core/Stepper',
  parameters: {
    docs: {
      description: {
        component: '`<bx-stepper>`. Spec: docs/features/core/stepper.md.',
      },
    },
  },
  render: () =>
    html`<bx-stepper current="1"
      ><bx-step label="Account" description="Create login"></bx-step
      ><bx-step label="Profile" description="Tell us more"></bx-step
      ><bx-step label="Billing"></bx-step><bx-step label="Done"></bx-step
    ></bx-stepper>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Vertical: Story = {
  render: () =>
    html`<bx-stepper current="1" orientation="vertical"
      ><bx-step label="Account"></bx-step><bx-step label="Profile"></bx-step
      ><bx-step label="Billing" status="error"></bx-step
    ></bx-stepper>`,
};
