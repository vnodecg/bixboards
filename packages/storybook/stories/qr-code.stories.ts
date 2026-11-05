import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/qr-code';

const meta = {
  title: 'Core/QR Code',
  parameters: {
    docs: {
      description: {
        component: '`<bx-qr-code>`. Spec: docs/features/core/qr-code.md.',
      },
    },
  },
  render: () =>
    html`<bx-qr-code
      value="https://bixboards.dev"
      label="Open Bixboards"
      background="#fff"
      fill="#000"
    ></bx-qr-code>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};
