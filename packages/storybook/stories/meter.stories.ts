import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/meter';

const meta = {
  title: 'Core/Meter',
  parameters: {
    docs: {
      description: {
        component: '`<bx-meter>`. Spec: docs/features/core/meter.md.',
      },
    },
  },
  render: () =>
    html`<bx-meter label="Disk usage" value="65" show-value></bx-meter>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Bands: Story = {
  render: () =>
    html`<div
      style="display:flex;flex-direction:column;gap:.75rem;max-width:24rem"
    >
      ${[15, 55, 92].map((v) => html`<bx-meter label=${'Usage ' + v} value=${v} low="40" high="80" optimum="10" show-value></bx-meter>`)}
    </div>`,
};
