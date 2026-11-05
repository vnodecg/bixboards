import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/search-field';

const meta = {
  title: 'Core/Search Field',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-search-field>`. Spec: docs/features/core/search-field.md.',
      },
    },
  },
  render: () =>
    html`<bx-search-field
      label="Search"
      shortcut="mod+k"
      style="max-width:24rem"
    ></bx-search-field>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};
