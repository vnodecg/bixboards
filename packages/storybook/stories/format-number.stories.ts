import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/format-number';

interface Args {
  value: number;
  type: 'currency' | 'decimal' | 'percent';
  currency: string;
  noGrouping: boolean;
  maximumFractionDigits?: number;
  lang: string;
}

const meta = {
  title: 'Core/Format Number',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-format-number>`: formats numbers, currency and percent via `Intl.NumberFormat`. Renders straight into light DOM (no shadow root) since it is meant to appear by the thousand in table/list cells. Spec: docs/features/core/format-number.md.',
      },
    },
  },
  argTypes: {
    value: { control: 'number' },
    type: { control: 'radio', options: ['currency', 'decimal', 'percent'] },
    currency: { control: 'text' },
    noGrouping: { control: 'boolean', name: 'no-grouping' },
    maximumFractionDigits: {
      control: 'number',
      name: 'maximum-fraction-digits',
    },
    lang: { control: 'text' },
  },
  args: {
    value: 1234567.891,
    type: 'decimal',
    currency: 'USD',
    noGrouping: false,
    maximumFractionDigits: 2,
    lang: 'en-US',
  },
  render: (args) => html`
    <bx-format-number
      value=${args.value}
      type=${args.type}
      currency=${args.currency}
      ?no-grouping=${args.noGrouping}
      maximum-fraction-digits=${args.maximumFractionDigits ?? ''}
      lang=${args.lang}
    ></bx-format-number>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Types: Story = {
  render: () => html`
    <table style="border-collapse: collapse">
      <tbody>
        <tr>
          <td style="padding: 0.25rem 0.75rem; color: var(--bx-text-secondary)">
            decimal
          </td>
          <td style="padding: 0.25rem 0.75rem">
            <bx-format-number value="1234567.891"></bx-format-number>
          </td>
        </tr>
        <tr>
          <td style="padding: 0.25rem 0.75rem; color: var(--bx-text-secondary)">
            currency (USD)
          </td>
          <td style="padding: 0.25rem 0.75rem">
            <bx-format-number
              value="1234567.891"
              type="currency"
              currency="USD"
            ></bx-format-number>
          </td>
        </tr>
        <tr>
          <td style="padding: 0.25rem 0.75rem; color: var(--bx-text-secondary)">
            percent
          </td>
          <td style="padding: 0.25rem 0.75rem">
            <bx-format-number value="0.4213" type="percent"></bx-format-number>
          </td>
        </tr>
      </tbody>
    </table>
  `,
};

export const TableUsage: Story = {
  name: 'Table cell usage (no shadow root)',
  render: () => html`
    <table
      style="border-collapse: collapse; font-variant-numeric: tabular-nums"
    >
      <tbody>
        ${[42.5, 1875.2, 934210.99].map(
          (value) => html`
            <tr>
              <td style="padding: 0.25rem 0.75rem; text-align: end">
                <bx-format-number
                  value=${value}
                  type="currency"
                  currency="EUR"
                ></bx-format-number>
              </td>
            </tr>
          `,
        )}
      </tbody>
    </table>
  `,
};

export const Locales: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.25rem">
      ${['en-US', 'de-DE', 'ja-JP'].map(
        (lang) => html`
          <div>
            ${lang}:
            <bx-format-number
              value="1234567.891"
              type="currency"
              currency="USD"
              lang=${lang}
            ></bx-format-number>
          </div>
        `,
      )}
    </div>
  `,
};
