import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/popup';

interface Args {
  placement:
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'right';
  active: boolean;
  distance: number;
  arrow: boolean;
  flip: boolean;
  shift: boolean;
}

const meta = {
  title: 'Core/Popup',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-popup>`: low-level positioning primitive (anchor, flip, shift, size, arrow) used to build dropdown/select/tooltip/popover. Spec: docs/features/core/popup.md.',
      },
    },
  },
  argTypes: {
    placement: {
      control: 'select',
      options: [
        'top',
        'top-start',
        'top-end',
        'bottom',
        'bottom-start',
        'bottom-end',
        'left',
        'right',
      ],
    },
    active: { control: 'boolean' },
    distance: { control: 'number' },
    arrow: { control: 'boolean' },
    flip: { control: 'boolean' },
    shift: { control: 'boolean' },
  },
  args: {
    placement: 'bottom',
    active: true,
    distance: 8,
    arrow: true,
    flip: true,
    shift: true,
  },
  render: (args) => html`
    <div style="padding: 6rem; display: flex; justify-content: center">
      <bx-popup
        placement=${args.placement}
        ?active=${args.active}
        distance=${args.distance}
        ?arrow=${args.arrow}
        ?flip=${args.flip}
        ?shift=${args.shift}
      >
        <button slot="anchor" type="button">Anchor</button>
        <div
          style="padding: 0.75rem 1rem; border-radius: var(--bx-radius-m); background: var(--bx-surface); border: 1px solid var(--bx-border-subtle); box-shadow: var(--bx-shadow-s)"
        >
          Popup content
        </div>
      </bx-popup>
    </div>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Placements: Story = {
  render: () => html`
    <div
      style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4rem; padding: 5rem 2rem"
    >
      ${(
        [
          'top-start',
          'top',
          'top-end',
          'left',
          'bottom',
          'right',
          'bottom-start',
          'bottom',
          'bottom-end',
        ] as const
      ).map(
        (placement) => html`
          <bx-popup placement=${placement} active arrow>
            <button slot="anchor" type="button">${placement}</button>
            <div
              style="padding: 0.5rem 0.75rem; border-radius: var(--bx-radius-m); background: var(--bx-surface); border: 1px solid var(--bx-border-subtle); box-shadow: var(--bx-shadow-s); font-size: var(--bx-font-size-s)"
            >
              ${placement}
            </div>
          </bx-popup>
        `,
      )}
    </div>
  `,
};

export const FlipAndShift: Story = {
  name: 'Flip + shift near viewport edge',
  render: (args) => html`
    <div
      style="display: flex; justify-content: flex-end; padding-inline-end: 1rem"
    >
      <bx-popup placement="right" active flip shift arrow>
        <button slot="anchor" type="button">Near edge</button>
        <div
          style="padding: 0.75rem 1rem; inline-size: 12rem; border-radius: var(--bx-radius-m); background: var(--bx-surface); border: 1px solid var(--bx-border-subtle); box-shadow: var(--bx-shadow-s)"
        >
          Flips to the left when there's no room on the right.
        </div>
      </bx-popup>
    </div>
  `,
};
