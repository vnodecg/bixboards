import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/icon';

const DEFAULT_LIBRARY_ICONS = [
  'check',
  'close',
  'chevron-down',
  'chevron-up',
  'chevron-left',
  'chevron-right',
  'info',
  'warning',
];

interface Args {
  name: string;
  label: string;
}

const meta = {
  title: 'Core/Icon',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-icon>`: an icon from a registered library (the bundled `default` library needs no network) or a `src` URL, inlined as sanitised SVG. Register more libraries with `registerIconLibrary()`. Spec: docs/features/core/icon.md.',
      },
    },
  },
  argTypes: {
    name: { control: 'select', options: DEFAULT_LIBRARY_ICONS },
    label: { control: 'text' },
  },
  args: {
    name: 'check',
    label: '',
  },
  render: (args) => html`
    <bx-icon
      style="font-size: 2rem"
      name=${args.name}
      label=${args.label}
    ></bx-icon>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const DefaultLibrary: Story = {
  name: 'Default library (bundled)',
  render: () => html`
    <div style="display: flex; gap: 1rem; font-size: 1.5rem">
      ${DEFAULT_LIBRARY_ICONS.map(
        (name) => html`<bx-icon name=${name} label=${name}></bx-icon>`,
      )}
    </div>
  `,
};

export const Sizing: Story = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: 1rem">
      <bx-icon name="check" style="font-size: 1rem"></bx-icon>
      <bx-icon name="check" style="font-size: 2rem"></bx-icon>
      <bx-icon name="check" style="font-size: 3rem"></bx-icon>
    </div>
  `,
};

export const UnknownIcon: Story = {
  name: 'Unknown icon (bx-error)',
  args: { name: 'does-not-exist' },
  parameters: {
    docs: {
      description: {
        story:
          'An unregistered icon name dispatches `bx-error` and renders a dashed "?" placeholder rather than nothing or a broken image.',
      },
    },
  },
};
