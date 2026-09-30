import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/intersection-observer';

interface Args {
  threshold: string;
  once: boolean;
  disabled: boolean;
  intersectClass: string;
}

const meta = {
  title: 'Core/Intersection Observer',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-intersection-observer>`: declaratively observes its own intersection with a root (default the viewport), toggling `intersect-class` on the host and firing `bx-intersect`. Wraps a shared, options-keyed `IntersectionObserver` pool. Spec: docs/features/core/intersection-observer.md.',
      },
    },
  },
  argTypes: {
    threshold: { control: 'text' },
    once: { control: 'boolean' },
    disabled: { control: 'boolean' },
    intersectClass: { control: 'text', name: 'intersect-class' },
  },
  args: {
    threshold: '0',
    once: false,
    disabled: false,
    intersectClass: 'intersect',
  },
  render: (args) => html`
    <style>
      .lazy-box {
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: 12rem;
        block-size: 8rem;
        border-radius: var(--bx-radius-m);
        background: var(--bx-surface-subtle);
        opacity: 0.3;
        transition: opacity 0.3s ease;
      }
      bx-intersection-observer.intersect .lazy-box {
        opacity: 1;
        background: var(--bx-role-brand-subtle);
      }
    </style>
    <div
      style="block-size: 30rem; overflow-y: auto; border: 1px dashed var(--bx-border-subtle)"
    >
      <div
        style="block-size: 20rem; display: flex; align-items: center; justify-content: center; color: var(--bx-text-secondary)"
      >
        Scroll down ↓
      </div>
      <bx-intersection-observer
        threshold=${args.threshold}
        ?once=${args.once}
        ?disabled=${args.disabled}
        intersect-class=${args.intersectClass}
        @bx-intersect=${(e: CustomEvent) => console.log('bx-intersect', e.detail)}
      >
        <div class="lazy-box">Watched content</div>
      </bx-intersection-observer>
      <div style="block-size: 20rem"></div>
    </div>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Once: Story = {
  name: 'Observe once (stop after first intersect)',
  args: { once: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};
