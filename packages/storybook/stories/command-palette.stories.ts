import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/command-palette';
import '@bixboards/core/button';
import type { BxCommandPalette } from '@bixboards/core/command-palette';
const commands = [
  {
    id: 'new',
    label: 'New document',
    group: 'File',
    shortcut: 'mod+n',
    handler: () => undefined,
  },
  {
    id: 'open',
    label: 'Open settings',
    group: 'Navigation',
    shortcut: 'mod+,',
    handler: () => undefined,
  },
  {
    id: 'theme',
    label: 'Toggle theme',
    group: 'Navigation',
    keywords: ['dark', 'light'],
    handler: () => undefined,
  },
];

const meta = {
  title: 'Core/Command Palette',
  parameters: {
    docs: { description: { component: 'Opens with mod+k by default.' } },
  },
  render: () =>
    html`<bx-button
        @click=${(e: Event) => {
          const p = (e.target as HTMLElement)
            .nextElementSibling as BxCommandPalette;
          p.commands = commands;
          p.show();
        }}
        >Open palette (⌘K)</bx-button
      ><bx-command-palette></bx-command-palette>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};
