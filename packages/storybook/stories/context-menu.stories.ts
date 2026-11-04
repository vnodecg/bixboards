import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/context-menu';
import '@bixboards/core/dropdown-item';

const meta = {
  title: 'Core/Context Menu',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-context-menu>`. Spec: docs/features/core/context-menu.md.',
      },
    },
  },
  render: () =>
    html`<div
      style="padding:2rem;border:1px dashed var(--bx-border-strong);border-radius:.5rem"
    >
      Right-click anywhere in this box<bx-context-menu
        ><bx-dropdown-item value="cut">Cut</bx-dropdown-item
        ><bx-dropdown-item value="copy">Copy</bx-dropdown-item
        ><bx-dropdown-item value="paste"
          >Paste</bx-dropdown-item
        ></bx-context-menu
      >
    </div>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};
