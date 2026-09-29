import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/card';
import '@bixant/core/badge';

interface Args {
  appearance: 'accent' | 'filled' | 'outlined' | 'filled outlined';
  orientation: 'horizontal' | 'vertical';
  withHeader: boolean;
  withMedia: boolean;
  withFooter: boolean;
}

const meta = {
  title: 'Core/Card',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-card>`: container with optional header, media, body, footer and actions — each region opt-in via its own boolean attribute. Spec: docs/features/core/card.md.',
      },
    },
  },
  argTypes: {
    appearance: {
      control: 'select',
      options: ['accent', 'filled', 'outlined', 'filled outlined'],
    },
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    withHeader: { control: 'boolean', name: 'with-header' },
    withMedia: { control: 'boolean', name: 'with-media' },
    withFooter: { control: 'boolean', name: 'with-footer' },
  },
  args: {
    appearance: 'outlined',
    orientation: 'vertical',
    withHeader: true,
    withMedia: true,
    withFooter: true,
  },
  render: (args) => html`
    <bx-card
      appearance=${args.appearance}
      orientation=${args.orientation}
      ?with-header=${args.withHeader}
      ?with-media=${args.withMedia}
      ?with-footer=${args.withFooter}
      style="max-inline-size: 22rem"
    >
      ${
        args.withMedia
          ? html`<img
              slot="media"
              src="https://picsum.photos/seed/bixant/400/225"
              alt=""
            />`
          : ''
      }
      ${args.withHeader ? html`<span slot="header">Project Nova</span>` : ''}
      <p>
        A short summary of the card's body content, wrapping naturally to
        however many lines it needs.
      </p>
      ${
        args.withFooter
          ? html`<span slot="footer">Updated 2 hours ago</span>`
          : ''
      }
    </bx-card>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Appearances: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; flex-wrap: wrap">
      ${(['accent', 'filled', 'outlined', 'filled outlined'] as const).map(
        (appearance) => html`
          <bx-card
            appearance=${appearance}
            with-header
            style="inline-size: 14rem"
          >
            <span slot="header">${appearance}</span>
            <p>Card body content.</p>
          </bx-card>
        `,
      )}
    </div>
  `,
};

export const HorizontalOrientation: Story = {
  name: 'Horizontal orientation',
  render: () => html`
    <bx-card
      orientation="horizontal"
      with-media
      with-header
      style="max-inline-size: 32rem"
    >
      <img
        slot="media"
        src="https://picsum.photos/seed/bixant-h/400/400"
        alt=""
      />
      <span slot="header">Horizontal card</span>
      <p>
        Media sits beside the body; collapses to stacked under a narrow
        container.
      </p>
    </bx-card>
  `,
};

export const WithActions: Story = {
  name: 'With header and footer actions',
  render: () => html`
    <bx-card with-header with-footer style="max-inline-size: 22rem">
      <span slot="header">Deploy #482</span>
      <bx-badge slot="header-actions" variant="success">Live</bx-badge>
      <p>Deployed to production 12 minutes ago by the release pipeline.</p>
      <span slot="footer">main @ a1b2c3d</span>
    </bx-card>
  `,
};
