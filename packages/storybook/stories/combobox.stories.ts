import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/combobox';
import '@bixboards/core/option';

const meta = {
  title: 'Core/Combobox',
  parameters: {
    docs: {
      description: {
        component: '`<bx-combobox>`. Spec: docs/features/core/combobox.md.',
      },
    },
  },
  render: () =>
    html`<bx-combobox
      label="Fruit"
      placeholder="Search…"
      style="max-width:20rem"
      ><bx-option value="apple">Apple</bx-option
      ><bx-option value="apricot">Apricot</bx-option
      ><bx-option value="banana">Banana</bx-option
      ><bx-option value="cherry">Cherry</bx-option></bx-combobox
    >`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const MultipleAndCustom: Story = {
  render: () =>
    html`<bx-combobox label="Tags" multiple allow-custom style="max-width:24rem"
      ><bx-option value="a">Alpha</bx-option
      ><bx-option value="b">Beta</bx-option></bx-combobox
    >`,
};
