import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/input';

interface Args {
  type: string;
  label: string;
  hint: string;
  placeholder: string;
  value: string;
  disabled: boolean;
  readonly: boolean;
  required: boolean;
  clearable: boolean;
  size: 'small' | 'medium' | 'large';
  appearance: 'outlined' | 'filled' | 'filled outlined';
  pill: boolean;
}

const meta = {
  title: 'Core/Input',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-input>`: single-line text field, form-associated via `ElementInternals`, wrapping a real native `<input>` so constraint validation (`required`/`pattern`/`min`/`max`/etc.) comes from the platform. Spec: docs/features/core/input.md.',
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: [
        'text',
        'email',
        'number',
        'password',
        'search',
        'tel',
        'url',
        'date',
      ],
    },
    label: { control: 'text' },
    hint: { control: 'text' },
    placeholder: { control: 'text' },
    value: { control: 'text' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    required: { control: 'boolean' },
    clearable: { control: 'boolean' },
    size: { control: 'radio', options: ['small', 'medium', 'large'] },
    appearance: {
      control: 'select',
      options: ['outlined', 'filled', 'filled outlined'],
    },
    pill: { control: 'boolean' },
  },
  args: {
    type: 'text',
    label: 'Email address',
    hint: '',
    placeholder: 'you@example.com',
    value: '',
    disabled: false,
    readonly: false,
    required: false,
    clearable: false,
    size: 'medium',
    appearance: 'outlined',
    pill: false,
  },
  render: (args) => html`
    <div style="inline-size: 20rem">
      <bx-input
        label=${args.label}
        hint=${args.hint}
        type=${args.type}
        placeholder=${args.placeholder}
        .value=${args.value}
        ?disabled=${args.disabled}
        ?readonly=${args.readonly}
        ?required=${args.required}
        ?clearable=${args.clearable}
        size=${args.size}
        appearance=${args.appearance}
        ?pill=${args.pill}
        with-label
      ></bx-input>
    </div>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const States: Story = {
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 1rem; inline-size: 20rem"
    >
      <bx-input with-label label="Default" placeholder="Placeholder"></bx-input>
      <bx-input
        with-label
        label="Disabled"
        disabled
        value="Can't edit"
      ></bx-input>
      <bx-input
        with-label
        label="Readonly"
        readonly
        value="Read only"
      ></bx-input>
      <bx-input
        with-label
        label="Invalid"
        required
        value=""
        hint="This field is required"
      ></bx-input>
    </div>
  `,
};

export const Appearances: Story = {
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 1rem; inline-size: 20rem"
    >
      ${(['outlined', 'filled', 'filled outlined'] as const).map(
        (appearance) =>
          html`<bx-input
            appearance=${appearance}
            placeholder=${appearance}
          ></bx-input>`,
      )}
    </div>
  `,
};

export const Sizes: Story = {
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 1rem; inline-size: 20rem"
    >
      ${(['small', 'medium', 'large'] as const).map(
        (size) =>
          html`<bx-input size=${size} placeholder="Size: ${size}"></bx-input>`,
      )}
    </div>
  `,
};

export const Clearable: Story = {
  args: { clearable: true, value: 'Clear me' },
};

export const PasswordToggle: Story = {
  name: 'Password with reveal toggle',
  render: () => html`
    <div style="inline-size: 20rem">
      <bx-input
        with-label
        label="Password"
        type="password"
        password-toggle
        value="hunter2"
      ></bx-input>
    </div>
  `,
};

export const WithIcons: Story = {
  name: 'Start/end icon slots',
  render: () => html`
    <div style="inline-size: 20rem">
      <bx-input placeholder="Search…" type="search">
        <span slot="start">🔍</span>
      </bx-input>
    </div>
  `,
};

export const InlineLabel: Story = {
  name: 'Inline label position',
  render: () => html`
    <div style="inline-size: 24rem">
      <bx-input
        with-label
        label="Name"
        label-position="inline"
        placeholder="Ada Lovelace"
      ></bx-input>
    </div>
  `,
};
