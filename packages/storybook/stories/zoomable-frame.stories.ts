import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/zoomable-frame';

interface Args {
  label: string;
  zoom: number;
  zoomLevels: string;
  sandbox: string;
}

const SRCDOC = `<!doctype html><html><body style="font-family: sans-serif; padding: 2rem;">
  <h1>Embedded content</h1>
  <p>This document is rendered by a sandboxed &lt;iframe&gt;.</p>
</body></html>`;

const meta = {
  title: 'Core/Zoomable Frame',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-zoomable-frame>`: an iframe with zoom controls that collapse into a menu button under narrow containers. `sandbox` defaults to the empty string (most restrictive). Spec: docs/features/core/zoomable-frame.md.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    zoom: { control: { type: 'range', min: 0.25, max: 2, step: 0.25 } },
    zoomLevels: { control: 'text', name: 'zoom-levels' },
    sandbox: { control: 'text' },
  },
  args: {
    label: 'Embedded content',
    zoom: 1,
    zoomLevels: '0.25 0.5 1 1.5 2',
    sandbox: '',
  },
  render: (args) => html`
    <bx-zoomable-frame
      label=${args.label}
      zoom=${args.zoom}
      zoom-levels=${args.zoomLevels}
      sandbox=${args.sandbox}
      srcdoc=${SRCDOC}
      style="inline-size: 100%; block-size: 20rem"
    ></bx-zoomable-frame>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const NarrowContainer: Story = {
  name: 'Narrow container (controls collapse to menu)',
  render: (args) => html`
    <bx-zoomable-frame
      label=${args.label}
      srcdoc=${SRCDOC}
      style="inline-size: 12rem; block-size: 16rem"
    ></bx-zoomable-frame>
  `,
};

export const RemoteSrc: Story = {
  name: 'Remote src',
  args: { sandbox: 'allow-scripts allow-same-origin' },
  render: (args) => html`
    <bx-zoomable-frame
      label="Example.com"
      src="https://example.com"
      sandbox=${args.sandbox}
      style="inline-size: 100%; block-size: 20rem"
    ></bx-zoomable-frame>
  `,
};
