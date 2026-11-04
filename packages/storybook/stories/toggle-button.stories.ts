import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/toggle-button';
import '@bixboards/core/icon';

const meta = {
  title: 'Core/Toggle Button',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-toggle-button>`. Spec: docs/features/core/toggle-button.md.',
      },
    },
  },
  render: () => html`<bx-toggle-button>Bold</bx-toggle-button>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Pressed: Story = {
  render: () =>
    html`<div style="display:flex;gap:.5rem">
      <bx-toggle-button pressed variant="default">Pressed</bx-toggle-button
      ><bx-toggle-button appearance="filled">Filled</bx-toggle-button
      ><bx-toggle-button disabled>Disabled</bx-toggle-button>
    </div>`,
};
