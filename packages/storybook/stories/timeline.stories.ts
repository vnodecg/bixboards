import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/timeline';
import '@bixboards/core/timeline-item';

const meta = {
  title: 'Core/Timeline',
  parameters: {
    docs: {
      description: {
        component: '`<bx-timeline>`. Spec: docs/features/core/timeline.md.',
      },
    },
  },
  render: () =>
    html`<bx-timeline
      ><bx-timeline-item
        heading="Order placed"
        time="2024-05-01T10:00:00Z"
        status="default"
        icon="check"
      ></bx-timeline-item
      ><bx-timeline-item
        heading="Shipped"
        time="2024-05-02T09:30:00Z"
        description="Left the warehouse"
      ></bx-timeline-item
      ><bx-timeline-item
        heading="Delivered"
        time="2024-05-04T16:10:00Z"
      ></bx-timeline-item
    ></bx-timeline>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Alternate: Story = {
  render: () =>
    html`<bx-timeline layout="alternate"
      ><bx-timeline-item heading="One" description="First"></bx-timeline-item
      ><bx-timeline-item heading="Two" description="Second"></bx-timeline-item
      ><bx-timeline-item heading="Three" description="Third"></bx-timeline-item
    ></bx-timeline>`,
};
