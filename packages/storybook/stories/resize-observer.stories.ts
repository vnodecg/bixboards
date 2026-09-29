import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/resize-observer';

interface Args {
  disabled: boolean;
}

const meta = {
  title: 'Core/Resize Observer',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-resize-observer>`: declaratively observes its own box size, firing `bx-resize` on change. Wraps the page-wide shared `ResizeObserver` and coalesces delivery to one `requestAnimationFrame` per instance. Spec: docs/features/core/resize-observer.md.',
      },
    },
  },
  argTypes: {
    disabled: { control: 'boolean' },
  },
  args: { disabled: false },
  render: (args) => {
    const handleResize = (event: Event) => {
      const rect = (event as CustomEvent).detail.entries[0].contentRect;
      const out = document.getElementById('ro-size');
      if (out)
        out.textContent = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
    };
    return html`
      <bx-resize-observer ?disabled=${args.disabled} @bx-resize=${handleResize}>
        <div
          style="resize: both; overflow: auto; inline-size: 12rem; block-size: 8rem; border: 1px dashed var(--bx-border-subtle); border-radius: var(--bx-radius-m); padding: 0.5rem"
        >
          Drag the bottom-right corner to resize.
        </div>
      </bx-resize-observer>
      <div style="margin-block-start: 0.5rem; font-size: var(--bx-font-size-s)">
        Size: <span id="ro-size">—</span>
      </div>
    `;
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};
