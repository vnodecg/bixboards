import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/carousel-item';

interface Args {
  label: string;
}

const meta = {
  title: 'Core/Carousel Item',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-carousel-item>`: a single, deliberately stateless slide — the parent carousel drives scroll-snap alignment via `--bx-carousel-item-snap-align`. Spec: docs/features/core/carousel-item.md.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
  },
  args: { label: '1 of 3' },
  render: (args) => html`
    <bx-carousel-item
      .label=${args.label}
      style="inline-size: 16rem; aspect-ratio: 16/9; background: var(--bx-role-brand-subtle); display: flex; align-items: center; justify-content: center; border-radius: var(--bx-radius-m)"
    >
      Slide content
    </bx-carousel-item>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const RowOfSlides: Story = {
  name: 'Row of slides (as used inside a carousel)',
  render: () => html`
    <div style="display: flex; gap: 0.5rem; overflow-x: auto">
      ${[1, 2, 3].map(
        (i) => html`
          <bx-carousel-item
            .label=${`${i} of 3`}
            style="inline-size: 12rem; flex-shrink: 0; aspect-ratio: 16/9; background: var(--bx-surface-subtle); display: flex; align-items: center; justify-content: center; border-radius: var(--bx-radius-m)"
          >
            Slide ${i}
          </bx-carousel-item>
        `,
      )}
    </div>
  `,
};
