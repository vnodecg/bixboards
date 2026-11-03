import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/tab-group';

interface Args {
  placement: 'top' | 'bottom' | 'start' | 'end';
  activation: 'auto' | 'manual';
  withoutScrollControls: boolean;
}

const meta = {
  title: 'Core/TabGroup',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-tab-group>`: tabbed interface owning a `nav`-slotted set of `bx-tab` and a default-slotted set of `bx-tab-panel`. Spec: docs/features/core/tab-group.md.',
      },
    },
  },
  argTypes: {
    placement: { control: 'radio', options: ['top', 'bottom', 'start', 'end'] },
    activation: { control: 'radio', options: ['auto', 'manual'] },
    withoutScrollControls: { control: 'boolean' },
  },
  args: {
    placement: 'top',
    activation: 'auto',
    withoutScrollControls: false,
  },
  render: (args) => html`
    <bx-tab-group
      placement=${args.placement}
      activation=${args.activation}
      ?without-scroll-controls=${args.withoutScrollControls}
    >
      <bx-tab slot="nav" panel="overview">Overview</bx-tab>
      <bx-tab slot="nav" panel="activity">Activity</bx-tab>
      <bx-tab slot="nav" panel="settings">Settings</bx-tab>
      <bx-tab slot="nav" panel="disabled" disabled>Disabled</bx-tab>
      <bx-tab-panel name="overview">Overview content.</bx-tab-panel>
      <bx-tab-panel name="activity">Activity content.</bx-tab-panel>
      <bx-tab-panel name="settings">Settings content.</bx-tab-panel>
      <bx-tab-panel name="disabled">Disabled content.</bx-tab-panel>
    </bx-tab-group>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const ManualActivation: Story = {
  args: { activation: 'manual' },
};

export const PlacementStart: Story = {
  name: 'Placement: start (vertical)',
  args: { placement: 'start' },
};

export const ScrollingOverflow: Story = {
  name: 'Overflow with scroll controls',
  render: () => html`
    <div style="max-width: 320px">
      <bx-tab-group>
        ${Array.from(
          { length: 10 },
          (_, index) =>
            html`<bx-tab slot="nav" panel="tab-${index}"
              >Tab ${index + 1}</bx-tab
            >`,
        )}
        ${Array.from(
          { length: 10 },
          (_, index) =>
            html`<bx-tab-panel name="tab-${index}"
              >Panel ${index + 1} content.</bx-tab-panel
            >`,
        )}
      </bx-tab-group>
    </div>
  `,
};

export const Closable: Story = {
  name: 'Closable tabs',
  render: () => html`
    <bx-tab-group>
      <bx-tab slot="nav" panel="one" closable>One</bx-tab>
      <bx-tab slot="nav" panel="two" closable>Two</bx-tab>
      <bx-tab-panel name="one">Panel one.</bx-tab-panel>
      <bx-tab-panel name="two">Panel two.</bx-tab-panel>
    </bx-tab-group>
  `,
};
