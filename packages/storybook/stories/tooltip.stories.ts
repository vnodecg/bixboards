import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/tooltip';
import '@bixant/core/button';

interface Args {
  placement: 'top' | 'bottom' | 'left' | 'right';
  trigger: 'hover focus' | 'click' | 'manual';
  content: string;
}

const meta = {
  title: 'Core/Tooltip',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-tooltip>`: short hover/focus hint anchored to any element via `for` (an id) or a slotted `anchor`, positioned by an internal `bx-popup`. Spec: docs/features/core/tooltip.md.',
      },
    },
  },
  argTypes: {
    placement: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
    trigger: { control: 'radio', options: ['hover focus', 'click', 'manual'] },
    content: { control: 'text' },
  },
  args: {
    placement: 'top',
    trigger: 'hover focus',
    content: 'This is a tooltip',
  },
  render: (args) => html`
    <bx-button id="story-anchor">Hover or focus me</bx-button>
    <bx-tooltip for="story-anchor" placement=${args.placement} trigger=${args.trigger}
      >${args.content}</bx-tooltip
    >
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const ClickTrigger: Story = {
  args: { trigger: 'click' },
};

export const SlottedAnchor: Story = {
  name: 'Slotted anchor (no for attribute)',
  render: () => html`
    <bx-tooltip placement="right">
      Slotted anchor tooltip
      <bx-button slot="anchor">Anchor is slotted</bx-button>
    </bx-tooltip>
  `,
};

export const DisabledAnchor: Story = {
  name: 'Anchored to a disabled bx-button',
  render: () => html`
    <bx-button id="disabled-anchor" disabled>Disabled</bx-button>
    <bx-tooltip for="disabled-anchor">Still shows on hover (FR-BUTTON-06)</bx-tooltip>
  `,
};
