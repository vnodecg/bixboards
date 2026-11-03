import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/button-group';
import '@bixboards/core/button';
import '@bixboards/core/copy-button';
import '@bixboards/core/icon';
import '@bixboards/core/tooltip';

interface Args {
  label: string;
  orientation: 'horizontal' | 'vertical';
  variant: '' | 'default' | 'secondary' | 'tertiary' | 'error' | 'warning';
  size: '' | 'small' | 'medium' | 'large';
}

const meta = {
  title: 'Core/ButtonGroup',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-button-group>`: segments related `bx-button`s (and `bx-copy-button`, `bx-tooltip`-wrapped items) into one control with shared borders and rounded outer corners only. Each child keeps its own behavior, events and tab stop. Spec: docs/features/core/button-group.md.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    variant: {
      control: 'select',
      options: ['', 'default', 'secondary', 'tertiary', 'error', 'warning'],
      description:
        'Forces a variant on every child bx-button ("" = leave each alone).',
    },
    size: {
      control: 'radio',
      options: ['', 'small', 'medium', 'large'],
      description:
        'Forces a size on every child bx-button ("" = leave each alone).',
    },
  },
  args: {
    label: 'Text alignment',
    orientation: 'horizontal',
    variant: '',
    size: '',
  },
  render: (args) => html`
    <bx-button-group
      label=${args.label}
      orientation=${args.orientation}
      variant=${args.variant}
      size=${args.size}
    >
      <bx-button variant="secondary" appearance="outlined">Left</bx-button>
      <bx-button variant="secondary" appearance="outlined">Center</bx-button>
      <bx-button variant="secondary" appearance="outlined">Right</bx-button>
    </bx-button-group>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
};

export const Appearances: Story = {
  name: 'Appearances and variants',
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-start"
    >
      ${(['accent', 'filled', 'outlined', 'plain'] as const).map(
        (appearance) => html`
          <bx-button-group label=${appearance}>
            <bx-button appearance=${appearance}>${appearance}</bx-button>
            <bx-button appearance=${appearance}>Two</bx-button>
            <bx-button appearance=${appearance}>Three</bx-button>
          </bx-button-group>
        `,
      )}
      <bx-button-group label="Forced variant" variant="error" size="small">
        <bx-button appearance="outlined">variant=error</bx-button>
        <bx-button appearance="outlined">size=small</bx-button>
        <bx-button appearance="outlined">forced by group</bx-button>
      </bx-button-group>
    </div>
  `,
};

export const Sizes: Story = {
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-start"
    >
      ${(['small', 'medium', 'large'] as const).map(
        (size) => html`
          <bx-button-group label=${size} size=${size}>
            <bx-button variant="secondary" appearance="outlined"
              >${size}</bx-button
            >
            <bx-button variant="secondary" appearance="outlined">Two</bx-button>
            <bx-button variant="secondary" appearance="outlined"
              >Three</bx-button
            >
          </bx-button-group>
        `,
      )}
    </div>
  `,
};

export const WithIcons: Story = {
  name: 'With icons (bx-icon in the start/default slots)',
  render: () => html`
    <bx-button-group label="View mode">
      <bx-button variant="secondary" appearance="outlined">
        <bx-icon slot="start" name="chevron-left"></bx-icon>Previous
      </bx-button>
      <bx-button variant="secondary" appearance="outlined">
        Next<bx-icon slot="end" name="chevron-right"></bx-icon>
      </bx-button>
    </bx-button-group>
  `,
};

export const ComposedItems: Story = {
  name: 'Composed: bx-button + bx-tooltip + bx-copy-button',
  render: () => html`
    <bx-button-group label="Share actions">
      <bx-button variant="secondary" appearance="outlined"
        >Share link</bx-button
      >
      <bx-tooltip placement="bottom">
        Open in a new tab
        <bx-button
          slot="anchor"
          variant="secondary"
          appearance="outlined"
          aria-label="Open in a new tab"
          ><bx-icon name="chevron-right"></bx-icon
        ></bx-button>
      </bx-tooltip>
      <bx-copy-button
        appearance="outlined"
        value="https://example.com/share/abc123"
      ></bx-copy-button>
    </bx-button-group>
  `,
  parameters: {
    docs: {
      description: {
        story:
          'The group only styles what it can reach through public hooks: `--bx-button-radius` is inherited into wrappers, so a tooltip-wrapped button and a `bx-copy-button` (itself a `bx-button` + `bx-tooltip`) join the seam like any other item.',
      },
    },
  },
};

export const States: Story = {
  name: 'States (disabled, loading, hover/focus raise)',
  render: () => html`
    <bx-button-group label="States">
      <bx-button variant="secondary" appearance="outlined">Enabled</bx-button>
      <bx-button variant="secondary" appearance="outlined" disabled
        >Disabled</bx-button
      >
      <bx-button variant="secondary" appearance="outlined" loading
        >Loading</bx-button
      >
      <bx-button variant="secondary" appearance="outlined"
        >Focus me (Tab)</bx-button
      >
    </bx-button-group>
  `,
  parameters: {
    docs: {
      description: {
        story:
          'Every button stays in the tab order (no roving tabindex is imposed). The focused or hovered item is raised above its neighbors so its border and focus ring are never clipped by the shared seam.',
      },
    },
  },
};

export const Rtl: Story = {
  name: 'RTL (outer rounding flips)',
  render: () => html`
    <div dir="rtl">
      <bx-button-group label="RTL">
        <bx-button variant="secondary" appearance="outlined">First</bx-button>
        <bx-button variant="secondary" appearance="outlined">Second</bx-button>
        <bx-button variant="secondary" appearance="outlined">Third</bx-button>
      </bx-button-group>
    </div>
  `,
};

export const Spaced: Story = {
  name: 'Custom gap and radius (CSS custom properties)',
  render: () => html`
    <bx-button-group
      label="Custom"
      style="--bx-button-group-gap: 0.5rem; --bx-button-group-radius: 1.5rem"
    >
      <bx-button variant="secondary" appearance="outlined">One</bx-button>
      <bx-button variant="secondary" appearance="outlined">Two</bx-button>
      <bx-button variant="secondary" appearance="outlined">Three</bx-button>
    </bx-button-group>
  `,
};
