import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/toast';
import '@bixboards/core/toast-region';
import '@bixboards/core/button';
import { BxToast } from '@bixboards/core/toast';

const meta = {
  title: 'Core/Toast',
  parameters: {
    docs: {
      description: {
        component:
          'Imperative: BxToast.toast({ message }). Declarative: <bx-toast open>.',
      },
    },
  },
  render: () =>
    html`<bx-button
      @click=${() => void BxToast.toast({ message: 'Saved', variant: 'success' })}
      >Show toast</bx-button
    >`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Declarative: Story = {
  render: () =>
    html`<bx-toast open duration="0" variant="warning"
      >Storage almost full</bx-toast
    >`,
};
