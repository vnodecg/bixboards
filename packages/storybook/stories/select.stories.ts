import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/select';
import '@bixant/core/button';
import '@bixant/core/divider';

interface Args {
  label: string;
  hint: string;
  placeholder: string;
  size: 'small' | 'medium' | 'large';
  appearance: 'outlined' | 'filled' | 'filled outlined';
  multiple: boolean;
  searchable: boolean;
  clearable: boolean;
  pill: boolean;
  disabled: boolean;
  required: boolean;
  loading: boolean;
}

const countries = [
  { value: 'us', label: 'United States', group: 'Americas' },
  { value: 'ca', label: 'Canada', group: 'Americas' },
  { value: 'br', label: 'Brazil', group: 'Americas', disabled: true },
  { value: 'fr', label: 'France', group: 'Europe' },
  { value: 'de', label: 'Germany', group: 'Europe' },
  { value: 'jp', label: 'Japan', group: 'Asia' },
];

const meta = {
  title: 'Core/Select',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '`<bx-select>`: single or multiple choice with a searchable, virtualized listbox. Options are slotted `bx-option`s or a data array (`options`), which is what scales to 100k+ items — only the rows in view are rendered. Form-associated; focus stays on the combobox input while the highlighted option is announced through `aria-activedescendant`. Spec: docs/features/core/select.md.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    hint: { control: 'text' },
    placeholder: { control: 'text' },
    size: { control: 'radio', options: ['small', 'medium', 'large'] },
    appearance: {
      control: 'radio',
      options: ['outlined', 'filled', 'filled outlined'],
    },
    multiple: { control: 'boolean' },
    searchable: { control: 'boolean' },
    clearable: { control: 'boolean' },
    pill: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  args: {
    label: 'Country',
    hint: '',
    placeholder: 'Select a country',
    size: 'medium',
    appearance: 'outlined',
    multiple: false,
    searchable: false,
    clearable: false,
    pill: false,
    disabled: false,
    required: false,
    loading: false,
  },
  render: (args) => html`
    <div style="inline-size: min(22rem, 90vw); min-block-size: 22rem">
      <bx-select
        label=${args.label}
        hint=${args.hint}
        placeholder=${args.placeholder}
        size=${args.size}
        appearance=${args.appearance}
        ?multiple=${args.multiple}
        ?searchable=${args.searchable}
        ?clearable=${args.clearable}
        ?pill=${args.pill}
        ?disabled=${args.disabled}
        ?required=${args.required}
        ?loading=${args.loading}
      >
        <bx-option value="us">United States</bx-option>
        <bx-option value="ca">Canada</bx-option>
        <bx-option value="br" disabled>Brazil (unavailable)</bx-option>
        <bx-divider></bx-divider>
        <bx-option value="fr">France</bx-option>
        <bx-option value="de">Germany</bx-option>
        <bx-option value="jp">Japan</bx-option>
      </bx-select>
    </div>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Multiple: Story = {
  name: 'Multiple with removable tags',
  args: { multiple: true, clearable: true, placeholder: 'Select countries' },
};

export const Searchable: Story = {
  args: { searchable: true, clearable: true },
};

export const Grouped: Story = {
  name: 'Data-driven with groups',
  render: () => html`
    <div style="inline-size: min(22rem, 90vw); min-block-size: 22rem">
      <bx-select
        label="Country"
        placeholder="Select a country"
        searchable
        .options=${countries}
      ></bx-select>
    </div>
  `,
};

export const Form: Story = {
  name: 'In a form (submit, reset, validation)',
  render: () => html`
    <form
      style="display: grid; gap: var(--bx-space-m); inline-size: min(22rem, 90vw); min-block-size: 22rem"
      @submit=${(event: SubmitEvent) => {
        event.preventDefault();
        const data = new FormData(event.target as HTMLFormElement);
        const out = (event.target as HTMLElement).querySelector('output')!;
        out.textContent = JSON.stringify({
          country: data.get('country'),
          topics: data.getAll('topics'),
        });
      }}
    >
      <bx-select
        name="country"
        label="Country (required)"
        placeholder="Select a country"
        required
        .options=${countries}
      ></bx-select>
      <bx-select
        name="topics"
        label="Topics"
        multiple
        clearable
        placeholder="Pick any"
        .options=${[
          { value: 'ui', label: 'UI' },
          { value: 'perf', label: 'Performance' },
          { value: 'a11y', label: 'Accessibility' },
          { value: 'i18n', label: 'Internationalization' },
        ]}
      ></bx-select>
      <div style="display: flex; gap: var(--bx-space-s)">
        <bx-button type="submit">Submit</bx-button>
        <bx-button type="reset" appearance="outlined">Reset</bx-button>
      </div>
      <output
        style="font-family: var(--bx-font-family-mono); font-size: var(--bx-font-s)"
      ></output>
    </form>
  `,
};

const huge = Array.from({ length: 100_000 }, (_, i) => ({
  value: `item-${i}`,
  label: `Item ${i + 1}`,
}));

export const OneHundredThousand: Story = {
  name: '100,000 options (virtualized)',
  parameters: {
    docs: {
      description: {
        story:
          'Only the rows in view are in the DOM (inspect the listbox). Typeahead, search and the selected-label lookup all run over the full array, and `aria-setsize` reports 100000. Try typing "Item 99999" with the list open, or pressing End.',
      },
    },
  },
  render: () => html`
    <div style="inline-size: min(22rem, 90vw); min-block-size: 22rem">
      <bx-select
        label="Item"
        placeholder="Search 100,000 items"
        searchable
        clearable
        .options=${huge}
      ></bx-select>
    </div>
  `,
};

export const Remote: Story = {
  name: 'Remote search with paging',
  parameters: {
    docs: {
      description: {
        story:
          'With `remote`, typing emits a debounced `bx-search` (with an `AbortSignal` that fires when a newer query supersedes it) instead of filtering locally, and scrolling near the end emits `bx-load-more`. This story fakes a slow server.',
      },
    },
  },
  render: () => {
    const all = Array.from({ length: 500 }, (_, i) => ({
      value: `user-${i}`,
      label: `User ${i + 1}`,
    }));
    let query = '';
    let limit = 20;
    const select = document.createElement('bx-select') as HTMLElement & {
      options: unknown[];
      loading: boolean;
    };
    const load = (signal?: AbortSignal) => {
      select.loading = true;
      const timer = setTimeout(() => {
        const matches = all.filter((o) =>
          o.label.toLowerCase().includes(query.toLowerCase()),
        );
        select.options = matches.slice(0, limit);
        select.loading = false;
      }, 400);
      signal?.addEventListener('abort', () => clearTimeout(timer));
    };
    select.setAttribute('label', 'User');
    select.setAttribute('placeholder', 'Search users');
    select.setAttribute('searchable', '');
    select.setAttribute('remote', '');
    select.setAttribute('virtual', '');
    select.addEventListener('bx-search', (event) => {
      const detail = (event as CustomEvent).detail as {
        query: string;
        signal: AbortSignal;
      };
      query = detail.query;
      limit = 20;
      load(detail.signal);
    });
    select.addEventListener('bx-load-more', () => {
      limit += 20;
      load();
    });
    select.options = all.slice(0, limit);
    return html`<div
      style="inline-size: min(22rem, 90vw); min-block-size: 22rem"
    >
      ${select}
    </div>`;
  },
};
