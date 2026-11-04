import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/chip';
import '@bixboards/core/icon';

const meta = {
  title: 'Core/Chip',
  parameters: {
    docs: {
      description: {
        component: '`<bx-chip>`. Spec: docs/features/core/chip.md.',
      },
    },
  },
  render: () => html`<bx-chip>Design</bx-chip>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Interactive: Story = {
  render: () =>
    html`<div style="display:flex;gap:.5rem;flex-wrap:wrap">
      <bx-chip selectable>Selectable</bx-chip
      ><bx-chip selectable selected variant="default">Selected</bx-chip
      ><bx-chip removable>Removable</bx-chip
      ><bx-chip appearance="outlined" clickable>Clickable</bx-chip>
    </div>`,
};
