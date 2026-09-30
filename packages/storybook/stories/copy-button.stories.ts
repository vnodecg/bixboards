import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/copy-button';
import '@bixant/core/button';
import '@bixant/core/button-group';
import '@bixant/core/input';

interface Args {
  value: string;
  from: string;
  disabled: boolean;
  variant: 'default' | 'secondary' | 'tertiary' | 'error' | 'warning';
  appearance: 'accent' | 'filled' | 'outlined' | 'plain';
  size: 'small' | 'medium' | 'large';
  copyLabel: string;
  successLabel: string;
  errorLabel: string;
  feedbackDuration: number;
  tooltipPlacement: 'top' | 'bottom' | 'left' | 'right';
}

const meta = {
  title: 'Core/CopyButton',
  parameters: {
    docs: {
      description: {
        component:
          "`<bx-copy-button>`: copies text (or another element's content) to the clipboard. A composite of `bx-button` + `bx-tooltip` + `bx-icon`: the tooltip shows the current label and doubles as success/error feedback, and a hidden live region announces the result. Spec: docs/features/core/copy-button.md.",
      },
    },
  },
  argTypes: {
    value: { control: 'text' },
    from: { control: 'text', description: '`id`, `id[attr]` or `id.prop`' },
    disabled: { control: 'boolean' },
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'tertiary', 'error', 'warning'],
    },
    appearance: {
      control: 'select',
      options: ['accent', 'filled', 'outlined', 'plain'],
    },
    size: { control: 'radio', options: ['small', 'medium', 'large'] },
    copyLabel: { control: 'text', name: 'copy-label' },
    successLabel: { control: 'text', name: 'success-label' },
    errorLabel: { control: 'text', name: 'error-label' },
    feedbackDuration: { control: 'number', name: 'feedback-duration' },
    tooltipPlacement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      name: 'tooltip-placement',
    },
  },
  args: {
    value: 'npm install @bixant/core',
    from: '',
    disabled: false,
    variant: 'secondary',
    appearance: 'plain',
    size: 'medium',
    copyLabel: 'Copy',
    successLabel: 'Copied',
    errorLabel: 'Error',
    feedbackDuration: 1000,
    tooltipPlacement: 'top',
  },
  render: (args) => html`
    <bx-copy-button
      value=${args.value}
      from=${args.from}
      ?disabled=${args.disabled}
      variant=${args.variant}
      appearance=${args.appearance}
      size=${args.size}
      copy-label=${args.copyLabel}
      success-label=${args.successLabel}
      error-label=${args.errorLabel}
      feedback-duration=${args.feedbackDuration}
      tooltip-placement=${args.tooltipPlacement}
    ></bx-copy-button>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const FromElement: Story = {
  name: 'From another element (id, id[attr], id.prop)',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.75rem">
      <div style="display: flex; align-items: center; gap: 0.5rem">
        <code id="cb-src-text">pnpm add @bixant/core</code>
        <bx-copy-button
          from="cb-src-text"
          copy-label="Copy text content"
        ></bx-copy-button>
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem">
        <a id="cb-src-link" href="https://example.com/docs" data-token="tok_123"
          >example.com/docs</a
        >
        <bx-copy-button
          from="cb-src-link[href]"
          copy-label="Copy href attribute"
        ></bx-copy-button>
        <bx-copy-button
          from="cb-src-link[data-token]"
          copy-label="Copy data-token"
        ></bx-copy-button>
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem">
        <bx-input
          id="cb-src-input"
          value="typed value"
          label="Source input"
        ></bx-input>
        <bx-copy-button
          from="cb-src-input.value"
          copy-label="Copy the value property"
        ></bx-copy-button>
      </div>
    </div>
  `,
};

export const CustomLabels: Story = {
  name: 'Custom labels and feedback duration',
  args: {
    copyLabel: 'Copy API key',
    successLabel: 'Key copied!',
    errorLabel: 'Copy failed',
    feedbackDuration: 2500,
    tooltipPlacement: 'right',
  },
};

export const ErrorState: Story = {
  name: 'Error (nothing to copy)',
  args: { value: '', from: 'does-not-exist' },
  parameters: {
    docs: {
      description: {
        story:
          'An unresolvable `from` reference (or a rejected clipboard write) shows the error icon/label and fires `bx-error` with `detail.reason`.',
      },
    },
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const CustomIcons: Story = {
  name: 'Custom icons (copy-icon / success-icon / error-icon slots)',
  render: () => html`
    <bx-copy-button value="hello">
      <span slot="copy-icon">📋</span>
      <span slot="success-icon">✅</span>
      <span slot="error-icon">⚠️</span>
    </bx-copy-button>
  `,
};

export const InsideInput: Story = {
  name: 'Reused inside bx-input (end slot)',
  render: () => html`
    <bx-input
      label="Invite link"
      readonly
      value="https://example.com/invite/abc123"
      style="max-inline-size: 26rem"
    >
      <bx-copy-button
        slot="end"
        value="https://example.com/invite/abc123"
        copy-label="Copy invite link"
      ></bx-copy-button>
    </bx-input>
  `,
};

export const InsideButtonGroup: Story = {
  name: 'Reused inside bx-button-group',
  render: () => html`
    <bx-button-group label="Share">
      <bx-button variant="secondary" appearance="outlined">Share</bx-button>
      <bx-copy-button
        appearance="outlined"
        value="https://example.com/share"
      ></bx-copy-button>
    </bx-button-group>
  `,
};

export const EventsAndKeyboard: Story = {
  name: 'Events and keyboard',
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 0.75rem; align-items: flex-start"
    >
      <bx-copy-button
        value="event demo"
        @bx-copy=${(event: Event) => {
          const out = (
            event.target as HTMLElement
          ).parentElement!.querySelector('output')!;
          out.textContent = `bx-copy → ${(event as CustomEvent).detail.value}`;
        }}
        @bx-error=${(event: Event) => {
          const out = (
            event.target as HTMLElement
          ).parentElement!.querySelector('output')!;
          out.textContent = `bx-error → ${(event as CustomEvent).detail.reason}`;
        }}
      ></bx-copy-button>
      <output
        style="font-size: var(--bx-font-s); color: var(--bx-text-secondary)"
        >Tab to the button and press Enter or Space.</output
      >
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          'It is a real `bx-button`, so Tab focuses it and Enter/Space activate it. The tooltip shows on focus, the accessible name always equals the current label, and each state change is announced through a polite live region.',
      },
    },
  },
};
