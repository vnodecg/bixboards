import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/icon-button';

const meta = {
  title: 'Core/Icon Button',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-icon-button>`. Spec: docs/features/core/icon-button.md.',
      },
    },
  },
  render: () =>
    html`<bx-icon-button name="copy" label="Copy"></bx-icon-button>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Variants: Story = {
  render: () =>
    html`<div style="display:flex;gap:.5rem;align-items:center">
      ${['primary', 'secondary', 'tertiary', 'warning', 'error'].map((v) => html`<bx-icon-button name="info" label=${v} variant=${v} appearance="filled"></bx-icon-button>`)}
    </div>`,
};

export const Shapes: Story = {
  render: () =>
    html`<div style="display:flex;gap:.5rem">
      <bx-icon-button
        name="check"
        label="Square"
        appearance="outlined"
      ></bx-icon-button
      ><bx-icon-button
        name="check"
        label="Circle"
        appearance="filled"
        shape="circle"
      ></bx-icon-button
      ><bx-icon-button name="check" label="Loading" loading></bx-icon-button>
    </div>`,
};
