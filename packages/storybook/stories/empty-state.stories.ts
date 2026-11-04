import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/empty-state';
import '@bixboards/core/button';

const meta = {
  title: 'Core/Empty State',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-empty-state>`. Spec: docs/features/core/empty-state.md.',
      },
    },
  },
  render: () =>
    html`<bx-empty-state variant="no-results"
      ><bx-button slot="actions" size="small"
        >Clear filters</bx-button
      ></bx-empty-state
    >`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Variants: Story = {
  render: () =>
    html`<div style="display:grid;gap:1rem">
      ${['empty', 'no-results', 'error', 'offline', 'forbidden'].map((v) => html`<bx-empty-state variant=${v} size="s"></bx-empty-state>`)}
    </div>`,
};
