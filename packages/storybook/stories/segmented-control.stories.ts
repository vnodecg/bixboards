import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/segmented-control';
import '@bixboards/core/segment';

const meta = {
  title: 'Core/Segmented Control',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-segmented-control>`. Spec: docs/features/core/segmented-control.md.',
      },
    },
  },
  render: () =>
    html`<bx-segmented-control label="View" value="week"
      ><bx-segment value="day" label="Day"></bx-segment
      ><bx-segment value="week" label="Week"></bx-segment
      ><bx-segment value="month" label="Month"></bx-segment
    ></bx-segmented-control>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const WithIcons: Story = {
  render: () =>
    html`<bx-segmented-control label="Layout" value="a" size="l"
      ><bx-segment value="a" icon="info" label="Info"></bx-segment
      ><bx-segment value="b" icon="check" label="Done"></bx-segment
      ><bx-segment value="c" label="Off" disabled></bx-segment
    ></bx-segmented-control>`,
};
