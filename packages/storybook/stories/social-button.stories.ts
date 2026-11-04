import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/social-button';
import { registerSocialProvider } from '@bixboards/core/social-button';
registerSocialProvider('github', { label: 'GitHub' });
registerSocialProvider('acme', { label: 'Acme' });

const meta = {
  title: 'Core/Social Button',
  parameters: {
    docs: {
      description: {
        component:
          'Brand artwork is not bundled: register marks with registerSocialProvider(); unregistered providers get a monogram.',
      },
    },
  },
  render: () => html`<bx-social-button provider="github"></bx-social-button>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Modes: Story = {
  render: () =>
    html`<div
      style="display:flex;flex-direction:column;gap:.5rem;align-items:flex-start"
    >
      ${['continue', 'signin', 'signup', 'share'].map((m) => html`<bx-social-button provider="acme" mode=${m}></bx-social-button>`)}
    </div>`,
};
