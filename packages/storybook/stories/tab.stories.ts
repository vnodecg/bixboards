import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/tab';

interface Args {
  active: boolean;
  disabled: boolean;
  closable: boolean;
  label: string;
}

const meta = {
  title: 'Core/Tab',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-tab>`: a tab button. Standalone (no `bx-tab-group` yet) it is a tab stop whenever `active` or not part of any group; a group would add roving tabindex across the set. Spec: docs/features/core/tab.md.',
      },
    },
  },
  argTypes: {
    active: { control: 'boolean' },
    disabled: { control: 'boolean' },
    closable: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: { active: false, disabled: false, closable: false, label: 'Overview' },
  render: (args) => html`
    <bx-tab
      ?active=${args.active}
      ?disabled=${args.disabled}
      ?closable=${args.closable}
      >${args.label}</bx-tab
    >
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  parameters: {
    // bx-tab is rendered standalone here; its tablist parent is provided by bx-tab-group.
    a11y: {
      config: { rules: [{ id: 'aria-required-parent', enabled: false }] },
    },
  },
};

export const Row: Story = {
  name: 'Row of tabs',
  render: () => html`
    <div
      role="tablist"
      style="display: flex; border-bottom: 1px solid var(--bx-border-subtle)"
    >
      <bx-tab active panel="overview-panel">Overview</bx-tab>
      <bx-tab panel="activity-panel">Activity</bx-tab>
      <bx-tab panel="settings-panel" disabled>Settings</bx-tab>
    </div>
  `,
};

export const Closable: Story = {
  name: 'Closable tabs',
  render: () => html`
    <div
      role="tablist"
      style="display: flex; border-bottom: 1px solid var(--bx-border-subtle)"
    >
      <bx-tab active closable>index.ts</bx-tab>
      <bx-tab closable>bix-element.ts</bx-tab>
      <bx-tab closable>README.md</bx-tab>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          'Click the close glyph, or focus a tab and press Backspace/Delete — the close control is not itself focusable (a focusable descendant of `role="tab"` is an ARIA violation).',
      },
    },
  },
};
