import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/spinner';

interface Args {
  label: string;
}

const meta = {
  title: 'Core/Spinner',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-spinner>`: an indeterminate loading spinner, sized in `1em` so it follows surrounding text. Requires an `aria-label`. Spec: docs/features/core/spinner.md.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
  },
  args: {
    label: 'Loading',
  },
  render: (args) => html`<bx-spinner aria-label=${args.label}></bx-spinner>`,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: 1rem">
      <bx-spinner style="font-size: 1rem" aria-label="Loading"></bx-spinner>
      <bx-spinner style="font-size: 2rem" aria-label="Loading"></bx-spinner>
      <bx-spinner style="font-size: 3rem" aria-label="Loading"></bx-spinner>
    </div>
  `,
};

export const InlineWithText: Story = {
  name: 'Inline with text',
  render: () => html`
    <p>
      <bx-spinner aria-label="Loading"></bx-spinner>
      Saving changes…
    </p>
  `,
};
