import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/details';

interface Args {
  summary: string;
  open: boolean;
  disabled: boolean;
  appearance: 'filled' | 'outlined' | 'plain';
  iconPlacement: 'start' | 'end';
  lazy: boolean;
}

const meta = {
  title: 'Core/Details',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-details>`: disclosure widget with animated open/close; group several under the same `name` for accordion (mutually-exclusive) behavior. Spec: docs/features/core/details.md.',
      },
    },
  },
  argTypes: {
    summary: { control: 'text' },
    open: { control: 'boolean' },
    disabled: { control: 'boolean' },
    appearance: { control: 'select', options: ['filled', 'outlined', 'plain'] },
    iconPlacement: {
      control: 'radio',
      options: ['start', 'end'],
      name: 'icon-placement',
    },
    lazy: { control: 'boolean' },
  },
  args: {
    summary: 'What is Bixboards?',
    open: false,
    disabled: false,
    appearance: 'outlined',
    iconPlacement: 'end',
    lazy: false,
  },
  render: (args) => html`
    <bx-details
      summary=${args.summary}
      ?open=${args.open}
      ?disabled=${args.disabled}
      appearance=${args.appearance}
      icon-placement=${args.iconPlacement}
      ?lazy=${args.lazy}
      style="max-inline-size: 28rem"
    >
      A fluid-scale, accessible web component library built on Lit and design
      tokens.
    </bx-details>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const OpenByDefault: Story = {
  name: 'Open by default',
  args: { open: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Appearances: Story = {
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 0.5rem; max-inline-size: 28rem"
    >
      ${(['filled', 'outlined', 'plain'] as const).map(
        (appearance) => html`
          <bx-details summary=${appearance} appearance=${appearance}>
            Appearance: ${appearance}.
          </bx-details>
        `,
      )}
    </div>
  `,
};

export const IconStart: Story = {
  name: 'Icon at start',
  args: { iconPlacement: 'start' },
};

export const AccordionGroup: Story = {
  name: 'Accordion group (name)',
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 0.5rem; max-inline-size: 28rem"
    >
      <bx-details name="faq" summary="Is it accessible?" open>
        Yes — every interactive part is keyboard reachable with a visible focus
        ring.
      </bx-details>
      <bx-details name="faq" summary="Does it support dark mode?">
        Yes, via <code>color-scheme</code> and <code>light-dark()</code>.
      </bx-details>
      <bx-details name="faq" summary="Can I theme it?">
        Yes — every visual surface is a CSS custom property with a token
        fallback.
      </bx-details>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          'Items sharing a `name` behave like native `<details name>`: opening one closes the others.',
      },
    },
  },
};

export const Lazy: Story = {
  name: 'Lazy content',
  args: { lazy: true, summary: 'Load on first open' },
  parameters: {
    docs: {
      description: {
        story:
          'With `lazy`, the default slot content is not rendered until the details opens for the first time.',
      },
    },
  },
};
