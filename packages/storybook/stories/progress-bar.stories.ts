import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/progress-bar';

interface Args {
  value: number;
  indeterminate: boolean;
  label: string;
  overlay: string;
}

const meta = {
  title: 'Core/Progress Bar',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-progress-bar>`: a linear progress indicator, determinate or indeterminate. Spec: docs/features/core/progress-bar.md.',
      },
    },
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    indeterminate: { control: 'boolean' },
    label: { control: 'text' },
    overlay: { control: 'text' },
  },
  args: {
    value: 42,
    indeterminate: false,
    label: 'Upload progress',
    overlay: '',
  },
  render: (args) => html`
    <div style="max-width: 20rem">
      <bx-progress-bar
        value=${args.value}
        label=${args.label}
        ?indeterminate=${args.indeterminate}
        >${args.overlay}</bx-progress-bar
      >
    </div>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const WithOverlayLabel: Story = {
  name: 'With overlay label',
  args: { overlay: '42%' },
};

export const Indeterminate: Story = {
  args: { indeterminate: true, label: 'Loading' },
};
