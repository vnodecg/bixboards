import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/format-bytes';

interface Args {
  value: number;
  unit: 'byte' | 'bit';
  display: 'long' | 'short' | 'narrow';
  lang: string;
}

const meta = {
  title: 'Core/Format Bytes',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-format-bytes>`: formats a byte/bit count in a locale-aware, human-readable form, picking the largest unit that keeps the magnitude under the base (1024 for bytes, 1000 for bits). Spec: docs/features/core/format-bytes.md.',
      },
    },
  },
  argTypes: {
    value: { control: 'number' },
    unit: { control: 'radio', options: ['byte', 'bit'] },
    display: { control: 'radio', options: ['long', 'short', 'narrow'] },
    lang: { control: 'text' },
  },
  args: { value: 1536000, unit: 'byte', display: 'short', lang: 'en-US' },
  render: (args) => html`
    <bx-format-bytes
      value=${args.value}
      unit=${args.unit}
      display=${args.display}
      lang=${args.lang}
    ></bx-format-bytes>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Scale: Story = {
  name: 'Value scale (B → PB)',
  render: () => html`
    <table style="border-collapse: collapse">
      <tbody>
        ${[512, 15360, 5242880, 3221225472, 1099511627776].map(
          (value) => html`
            <tr>
              <td
                style="padding: 0.25rem 0.75rem; color: var(--bx-text-secondary)"
              >
                ${value.toLocaleString()} bytes
              </td>
              <td style="padding: 0.25rem 0.75rem">
                <bx-format-bytes value=${value}></bx-format-bytes>
              </td>
            </tr>
          `,
        )}
      </tbody>
    </table>
  `,
};

export const DisplayForms: Story = {
  name: 'Display forms',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.25rem">
      ${(['long', 'short', 'narrow'] as const).map(
        (display) => html`
          <div>
            ${display}:
            <bx-format-bytes value="15360" display=${display}></bx-format-bytes>
          </div>
        `,
      )}
    </div>
  `,
};

export const Locales: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.25rem">
      ${['en-US', 'de-DE', 'ja-JP'].map(
        (lang) => html`
          <div>
            ${lang}:
            <bx-format-bytes value="1536000" lang=${lang}></bx-format-bytes>
          </div>
        `,
      )}
    </div>
  `,
};
