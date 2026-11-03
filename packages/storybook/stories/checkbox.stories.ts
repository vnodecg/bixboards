import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/checkbox';
import '@bixboards/core/button';

interface Args {
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  required: boolean;
  size: 'small' | 'medium' | 'large';
  label: string;
  hint: string;
}

const meta = {
  title: 'Core/Checkbox',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-checkbox>`: binary or indeterminate selection, form-associated via `ElementInternals`. Spec: docs/features/core/checkbox.md.',
      },
    },
  },
  argTypes: {
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    size: { control: 'radio', options: ['small', 'medium', 'large'] },
    label: { control: 'text' },
    hint: { control: 'text' },
  },
  args: {
    checked: false,
    indeterminate: false,
    disabled: false,
    required: false,
    size: 'medium',
    label: 'Email me about product updates',
    hint: '',
  },
  render: (args) => html`
    <bx-checkbox
      ?checked=${args.checked}
      ?indeterminate=${args.indeterminate}
      ?disabled=${args.disabled}
      ?required=${args.required}
      size=${args.size}
      hint=${args.hint}
      >${args.label}</bx-checkbox
    >
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const States: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.75rem">
      <bx-checkbox>Unchecked</bx-checkbox>
      <bx-checkbox checked>Checked</bx-checkbox>
      <bx-checkbox indeterminate>Indeterminate</bx-checkbox>
      <bx-checkbox disabled>Disabled</bx-checkbox>
      <bx-checkbox disabled checked>Disabled + checked</bx-checkbox>
    </div>
  `,
};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.75rem">
      ${(['small', 'medium', 'large'] as const).map(
        (size) =>
          html`<bx-checkbox size=${size} checked>Size: ${size}</bx-checkbox>`,
      )}
    </div>
  `,
};

export const RequiredWithHint: Story = {
  name: 'Required, with hint and form',
  render: () => html`
    <form
      style="display: flex; flex-direction: column; gap: 0.75rem; align-items: flex-start"
      @submit=${(event: Event) => event.preventDefault()}
    >
      <bx-checkbox name="terms" required hint="You must accept to continue">
        I agree to the terms of service
      </bx-checkbox>
      <bx-button type="submit">Submit</bx-button>
    </form>
  `,
  parameters: {
    docs: {
      description: {
        story:
          'Submitting without checking shows the native constraint-validation bubble; `data-user-invalid` styles the hint red after the first interaction.',
      },
    },
  },
};

export const Keyboard: Story = {
  name: 'Keyboard operable',
  render: () => html`<bx-checkbox>Tab to focus, Space to toggle</bx-checkbox>`,
};
