import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/relative-time';

interface Args {
  offsetMinutes: number;
  format: 'long' | 'short' | 'narrow';
  numeric: 'always' | 'auto';
  sync: boolean;
  lang: string;
}

function isoOffset(minutes: number): string {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

const meta = {
  title: 'Core/Relative Time',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-relative-time>`: self-updating relative timestamp ("3 minutes ago") via `Intl.RelativeTimeFormat`. Each instance self-schedules at an interval adapted to its displayed unit; `sync` opts into a shared page-wide ticker instead. Spec: docs/features/core/relative-time.md.',
      },
    },
  },
  argTypes: {
    offsetMinutes: {
      control: { type: 'range', min: -1440, max: 1440, step: 1 },
      name: 'offset (minutes)',
    },
    format: { control: 'radio', options: ['long', 'short', 'narrow'] },
    numeric: { control: 'radio', options: ['always', 'auto'] },
    sync: { control: 'boolean' },
    lang: { control: 'text' },
  },
  args: {
    offsetMinutes: -5,
    format: 'long',
    numeric: 'auto',
    sync: false,
    lang: 'en-US',
  },
  render: (args) => html`
    <bx-relative-time
      date=${isoOffset(args.offsetMinutes)}
      format=${args.format}
      numeric=${args.numeric}
      ?sync=${args.sync}
      lang=${args.lang}
    ></bx-relative-time>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const PastAndFuture: Story = {
  name: 'Past and future',
  render: () => html`
    <table style="border-collapse: collapse">
      <tbody>
        ${[-30 * 24 * 60, -60 * 24, -90, -5, 10, 120, 3 * 24 * 60].map(
          (offset) => html`
            <tr>
              <td style="padding: 0.25rem 0.75rem">
                <bx-relative-time
                  date=${isoOffset(offset)}
                  lang="en-US"
                ></bx-relative-time>
              </td>
            </tr>
          `,
        )}
      </tbody>
    </table>
  `,
};

export const NumericAlways: Story = {
  name: 'numeric="always" (no "yesterday"/"tomorrow")',
  args: { offsetMinutes: -24 * 60, numeric: 'always' },
};

export const SyncTicker: Story = {
  name: 'Shared sync ticker (many instances)',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.25rem">
      ${[-1, -5, -30, -120].map(
        (offset) => html`
          <div>
            <bx-relative-time
              sync
              date=${isoOffset(offset)}
              lang="en-US"
            ></bx-relative-time>
          </div>
        `,
      )}
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          'All four instances share one page-wide timer instead of four independent ones — useful for a long list of timestamps.',
      },
    },
  },
};

export const InvalidDate: Story = {
  name: 'Invalid date (renders empty)',
  render: () => html`<bx-relative-time date="not-a-date"></bx-relative-time>`,
};
