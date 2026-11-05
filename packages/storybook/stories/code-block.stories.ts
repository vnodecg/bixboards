import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/code-block';

const meta = {
  title: 'Core/Code Block',
  parameters: {
    docs: {
      description: {
        component: '`<bx-code-block>`. Spec: docs/features/core/code-block.md.',
      },
    },
  },
  render: () =>
    html`<bx-code-block
      filename="hello.ts"
      line-numbers
      highlight-lines="2"
      .code=${"const greeting = 'hi';\nconsole.log(greeting);\n"}
    ></bx-code-block>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Wrapped: Story = {
  render: () =>
    html`<div style="max-width:20rem">
      <bx-code-block
        wrap
        .code=${'A very long line that wraps instead of scrolling horizontally when wrap is set on the block'}
      ></bx-code-block>
    </div>`,
};
