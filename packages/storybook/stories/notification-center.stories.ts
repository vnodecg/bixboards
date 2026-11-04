import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/notification-center';
const now = Date.now();
const items = [
  {
    id: '1',
    title: 'Build finished',
    body: 'main passed',
    time: new Date(now - 60000).toISOString(),
  },
  {
    id: '2',
    title: 'New comment',
    body: 'Sam replied',
    time: new Date(now - 3600000).toISOString(),
    read: true,
  },
  {
    id: '3',
    title: 'Invite',
    time: new Date(now - 86400000 * 2).toISOString(),
  },
];

const meta = {
  title: 'Core/Notification Center',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-notification-center>`. Spec: docs/features/core/notification-center.md.',
      },
    },
  },
  render: () =>
    html`<div style="min-height:24rem;text-align:end">
      <bx-notification-center .items=${items}></bx-notification-center>
    </div>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};
