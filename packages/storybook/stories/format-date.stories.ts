import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/format-date';

interface Args {
  date: string;
  weekday: '' | 'long' | 'short' | 'narrow';
  year: '' | 'numeric' | '2-digit';
  month: '' | 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day: '' | 'numeric' | '2-digit';
  lang: string;
}

const meta = {
  title: 'Core/Format Date',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-format-date>`: formats a date via `Intl.DateTimeFormat`. Attributes mirror `Intl.DateTimeFormat` option names 1:1. Omitted `date` formats "now" at each render. Spec: docs/features/core/format-date.md.',
      },
    },
  },
  argTypes: {
    date: { control: 'text' },
    weekday: { control: 'select', options: ['', 'long', 'short', 'narrow'] },
    year: { control: 'select', options: ['', 'numeric', '2-digit'] },
    month: {
      control: 'select',
      options: ['', 'numeric', '2-digit', 'long', 'short', 'narrow'],
    },
    day: { control: 'select', options: ['', 'numeric', '2-digit'] },
    lang: { control: 'text' },
  },
  args: {
    date: '2026-09-29T12:00:00Z',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    lang: 'en-US',
  },
  render: (args) => html`
    <bx-format-date
      date=${args.date}
      weekday=${args.weekday || undefined}
      year=${args.year || undefined}
      month=${args.month || undefined}
      day=${args.day || undefined}
      lang=${args.lang}
      time-zone="UTC"
    ></bx-format-date>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const DateOnly: Story = {
  name: 'Date only',
  render: () => html`
    <bx-format-date
      date="2026-09-29"
      year="numeric"
      month="short"
      day="numeric"
      lang="en-US"
    ></bx-format-date>
  `,
};

export const TimeOnly: Story = {
  name: 'Time only (24h)',
  render: () => html`
    <bx-format-date
      date="2026-09-29T13:05:00Z"
      hour="numeric"
      minute="numeric"
      hour-format="h23"
      time-zone="UTC"
      lang="en-US"
    ></bx-format-date>
  `,
};

export const Locales: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.25rem">
      ${['en-US', 'de-DE', 'ja-JP', 'ar-EG'].map(
        (lang) => html`
          <div>
            ${lang}:
            <bx-format-date
              date="2026-09-29T12:00:00Z"
              year="numeric"
              month="long"
              day="numeric"
              time-zone="UTC"
              lang=${lang}
            ></bx-format-date>
          </div>
        `,
      )}
    </div>
  `,
};

export const InvalidDate: Story = {
  name: 'Invalid date (renders empty)',
  render: () => html`<bx-format-date date="not-a-date"></bx-format-date>`,
};
