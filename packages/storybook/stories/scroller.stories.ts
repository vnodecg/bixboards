import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/scroller';

interface Args {
  orientation: 'horizontal' | 'vertical';
  withoutScrollbar: boolean;
  withoutShadow: boolean;
}

function tiles(count: number) {
  return Array.from(
    { length: count },
    (_, i) => html`
      <div
        style="flex: none; inline-size: 8rem; block-size: 6rem; display: flex; align-items: center; justify-content: center; border-radius: var(--bx-radius-m); background: var(--bx-surface-subtle); margin-inline-end: 0.5rem"
      >
        Item ${i + 1}
      </div>
    `,
  );
}

const meta = {
  title: 'Core/Scroller',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-scroller>`: scroll region with edge shadows and keyboard access — the scrollable element itself is a native tab stop once content overflows. Spec: docs/features/core/scroller.md.',
      },
    },
  },
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    withoutScrollbar: { control: 'boolean', name: 'without-scrollbar' },
    withoutShadow: { control: 'boolean', name: 'without-shadow' },
  },
  args: {
    orientation: 'horizontal',
    withoutScrollbar: false,
    withoutShadow: false,
  },
  render: (args) => html`
    <bx-scroller
      orientation=${args.orientation}
      ?without-scrollbar=${args.withoutScrollbar}
      ?without-shadow=${args.withoutShadow}
      aria-label="Item list"
      style="max-inline-size: 28rem; max-block-size: 20rem"
    >
      ${tiles(10)}
    </bx-scroller>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => html`
    <bx-scroller
      orientation=${args.orientation}
      aria-label="Item list"
      style="max-inline-size: 12rem; max-block-size: 16rem"
    >
      <div style="display: flex; flex-direction: column; gap: 0.5rem">
        ${Array.from(
          { length: 12 },
          (_, i) => html`
            <div
              style="block-size: 3rem; display: flex; align-items: center; justify-content: center; border-radius: var(--bx-radius-m); background: var(--bx-surface-subtle)"
            >
              Row ${i + 1}
            </div>
          `,
        )}
      </div>
    </bx-scroller>
  `,
};

export const WithoutScrollbar: Story = {
  name: 'Without visible scrollbar',
  args: { withoutScrollbar: true },
};

export const WithoutEdgeShadow: Story = {
  name: 'Without edge shadow',
  args: { withoutShadow: true },
};

export const NotScrollable: Story = {
  name: 'Content fits (no scroll, not a tab stop)',
  render: () => html`
    <bx-scroller aria-label="Item list" style="max-inline-size: 28rem">
      ${tiles(2)}
    </bx-scroller>
  `,
  parameters: {
    docs: {
      description: {
        story:
          'When content does not overflow, the scroller removes itself from the tab order and skips `role="region"` — an unnecessary stop/landmark is worse than none.',
      },
    },
  },
};
