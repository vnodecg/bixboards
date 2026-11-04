import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/sidebar';
import '@bixboards/core/sidebar-group';
import '@bixboards/core/sidebar-item';

const meta = {
  title: 'Core/Sidebar',
  parameters: {
    docs: {
      description: {
        component: '`<bx-sidebar>`. Spec: docs/features/core/sidebar.md.',
      },
    },
  },
  render: () =>
    html`<div style="height:24rem">
      <bx-sidebar mode="inline"
        ><strong slot="header">Acme</strong
        ><bx-sidebar-group label="Main"
          ><bx-sidebar-item href="#home" icon="info" active
            >Home</bx-sidebar-item
          ><bx-sidebar-item icon="check" badge="3">Inbox</bx-sidebar-item
          ><bx-sidebar-item icon="copy"
            >Reports<bx-sidebar-item slot="children" href="#weekly"
              >Weekly</bx-sidebar-item
            ></bx-sidebar-item
          ></bx-sidebar-group
        ><span slot="footer">Signed in</span></bx-sidebar
      >
    </div>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Collapsed: Story = {
  render: () =>
    html`<div style="height:20rem">
      <bx-sidebar mode="inline" collapsed
        ><bx-sidebar-item href="#home" icon="info" active>Home</bx-sidebar-item
        ><bx-sidebar-item icon="check">Inbox</bx-sidebar-item></bx-sidebar
      >
    </div>`,
};
