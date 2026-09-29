import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/include';

interface Args {
  src: string;
  allowScripts: boolean;
}

const meta = {
  title: 'Core/Include',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-include>`: fetches remote HTML and inlines it into a shadow-DOM container. `<script>` tags and script-executing attributes are stripped by default; `allow-scripts` opts back in and re-creates them so they actually execute. Changing `src` aborts any in-flight fetch. Spec: docs/features/core/include.md.',
      },
    },
  },
  argTypes: {
    src: { control: 'text' },
    allowScripts: { control: 'boolean', name: 'allow-scripts' },
  },
  args: { src: '', allowScripts: false },
  render: (args) => html`
    <bx-include
      src=${args.src}
      ?allow-scripts=${args.allowScripts}
    ></bx-include>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const SanitizedFetch: Story = {
  name: 'Fetches and sanitizes',
  render: () => {
    const src = URL.createObjectURL(
      new Blob(
        [
          '<p>Fetched fragment.</p><script>window.__bxIncludeDemo = true;</script>',
        ],
        { type: 'text/html' },
      ),
    );
    return html`<bx-include src=${src}></bx-include>`;
  },
  parameters: {
    docs: {
      description: {
        story:
          'The `<script>` tag in the fetched HTML is stripped before insertion; open devtools to confirm `window.__bxIncludeDemo` stays undefined.',
      },
    },
  },
};

export const ErrorState: Story = {
  name: 'Fetch error (bx-error)',
  render: () => html`
    <bx-include
      src="https://does-not-exist.invalid/fragment.html"
      @bx-error=${(e: CustomEvent) => console.log('bx-error', e.detail)}
    ></bx-include>
  `,
};
