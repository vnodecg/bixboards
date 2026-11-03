import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/tab';
import '@bixboards/core/tab-panel';

interface Args {
  active: boolean;
}

const meta = {
  title: 'Core/Tab Panel',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-tab-panel>`: content for a tab. Inactive panels use the `hidden` attribute, fully removing them from the accessibility tree and tab order rather than only hiding them visually. Spec: docs/features/core/tab-panel.md.',
      },
    },
  },
  argTypes: {
    active: { control: 'boolean' },
  },
  args: { active: true },
  render: (args) => html`
    <bx-tab-panel ?active=${args.active}
      >Panel content, visible while active.</bx-tab-panel
    >
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const WithTabs: Story = {
  name: 'Paired with tabs (click to switch)',
  render: () => {
    const select = (name: string) => (event: Event) => {
      const root = (event.currentTarget as HTMLElement).parentElement!;
      for (const tab of root.querySelectorAll('bx-tab'))
        tab.toggleAttribute('active', tab.getAttribute('panel') === name);
      const panels = root.nextElementSibling!;
      for (const panel of panels.querySelectorAll('bx-tab-panel'))
        (panel as HTMLElement & { active: boolean }).active =
          panel.getAttribute('name') === name;
    };
    return html`
      <div
        role="tablist"
        style="display: flex; border-bottom: 1px solid var(--bx-border-subtle)"
      >
        <bx-tab active panel="overview" @click=${select('overview')}
          >Overview</bx-tab
        >
        <bx-tab panel="activity" @click=${select('activity')}>Activity</bx-tab>
      </div>
      <div>
        <bx-tab-panel name="overview" active>Overview content.</bx-tab-panel>
        <bx-tab-panel name="activity"
          >Activity content (hidden until selected).</bx-tab-panel
        >
      </div>
    `;
  },
};
