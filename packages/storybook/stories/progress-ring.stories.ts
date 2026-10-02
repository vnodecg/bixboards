import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/progress-ring';

interface Args {
  value: number;
  label: string;
  overlay: string;
}

const meta = {
  title: 'Core/Progress Ring',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-progress-ring>`: a circular progress indicator with a centered label. Spec: docs/features/core/progress-ring.md.',
      },
    },
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    label: { control: 'text' },
    overlay: { control: 'text' },
  },
  args: {
    value: 65,
    label: 'Upload progress',
    overlay: '65%',
  },
  render: (args) => html`
    <bx-progress-ring value=${args.value} label=${args.label}
      >${args.overlay}</bx-progress-ring
    >
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: 1.5rem">
      <bx-progress-ring
        value="30"
        label="30%"
        style="--bx-progress-ring-size: 2.5rem; font-size: 0.6rem"
        >30%</bx-progress-ring
      >
      <bx-progress-ring value="65" label="65%">65%</bx-progress-ring>
      <bx-progress-ring
        value="90"
        label="90%"
        style="--bx-progress-ring-size: 6rem; font-size: 1.5rem"
        >90%</bx-progress-ring
      >
    </div>
  `,
};
