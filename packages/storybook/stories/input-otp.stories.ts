import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/input-otp';

const meta = {
  title: 'Core/Input OTP',
  parameters: {
    docs: {
      description: {
        component: '`<bx-input-otp>`. Spec: docs/features/core/input-otp.md.',
      },
    },
  },
  render: () =>
    html`<bx-input-otp
      label="Verification code"
      length="6"
      group-size="3"
    ></bx-input-otp>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Masked: Story = {
  render: () => html`<bx-input-otp label="PIN" length="4" mask></bx-input-otp>`,
};
