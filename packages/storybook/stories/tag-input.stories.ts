import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/tag-input';

const meta = {
  title: 'Core/Tag Input',
  parameters: {
    docs: {
      description: {
        component: '`<bx-tag-input>`. Spec: docs/features/core/tag-input.md.',
      },
    },
  },
  render: () =>
    html`<bx-tag-input
      label="Keywords"
      value="web,components"
      style="max-width:24rem"
    ></bx-tag-input>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};
