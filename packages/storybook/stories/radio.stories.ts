import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/radio';

interface Args {
  checked: boolean;
  disabled: boolean;
  appearance: 'default' | 'button';
  size: 'small' | 'medium' | 'large';
  label: string;
}

const meta = {
  title: 'Core/Radio',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-radio>`: single option within a name-keyed radio group, form-associated via `ElementInternals`. Grouped instances get mutual exclusion and roving tabindex/arrow-key navigation standalone (no `bx-radio-group` required yet). Spec: docs/features/core/radio.md.',
      },
    },
  },
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    appearance: { control: 'radio', options: ['default', 'button'] },
    size: { control: 'radio', options: ['small', 'medium', 'large'] },
    label: { control: 'text' },
  },
  args: {
    checked: false,
    disabled: false,
    appearance: 'default',
    size: 'medium',
    label: 'Option',
  },
  render: (args) => html`
    <bx-radio
      name="story-single"
      ?checked=${args.checked}
      ?disabled=${args.disabled}
      appearance=${args.appearance}
      size=${args.size}
      >${args.label}</bx-radio
    >
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Group: Story = {
  name: 'Grouped by name (arrow keys navigate)',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.5rem">
      <bx-radio name="story-plan" value="free" checked>Free</bx-radio>
      <bx-radio name="story-plan" value="pro">Pro</bx-radio>
      <bx-radio name="story-plan" value="enterprise">Enterprise</bx-radio>
    </div>
  `,
};

export const ButtonAppearance: Story = {
  name: 'Button appearance group',
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
      <bx-radio name="story-size" appearance="button" value="s">Small</bx-radio>
      <bx-radio name="story-size" appearance="button" value="m" checked
        >Medium</bx-radio
      >
      <bx-radio name="story-size" appearance="button" value="l">Large</bx-radio>
    </div>
  `,
};

export const DisabledMember: Story = {
  name: 'Disabled group member',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.5rem">
      <bx-radio name="story-disabled" value="a" checked>Available</bx-radio>
      <bx-radio name="story-disabled" value="b" disabled>Out of stock</bx-radio>
      <bx-radio name="story-disabled" value="c">Available</bx-radio>
    </div>
  `,
};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.5rem">
      ${(['small', 'medium', 'large'] as const).map(
        (size) =>
          html`<bx-radio name="story-sizes-${size}" size=${size} checked
            >Size: ${size}</bx-radio
          >`,
      )}
    </div>
  `,
};
