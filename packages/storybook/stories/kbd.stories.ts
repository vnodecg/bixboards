import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/kbd';

const meta = {
  title: 'Core/Kbd',
  parameters: {
    docs: {
      description: {
        component: '`<bx-kbd>`. Spec: docs/features/core/kbd.md.',
      },
    },
  },
  render: () => html`<bx-kbd keys="mod+shift+k"></bx-kbd>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Platforms: Story = {
  render: () =>
    html`<div style="display:flex;gap:1rem">
      <bx-kbd keys="mod+k" platform="mac"></bx-kbd
      ><bx-kbd keys="mod+k" platform="windows"></bx-kbd
      ><bx-kbd keys="alt+enter"></bx-kbd><bx-kbd>Fn</bx-kbd>
    </div>`,
};
