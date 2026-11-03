import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/animation';
import '@bixboards/core/animation/presets/bounce';
import '@bixboards/core/animation/presets/fade-in';
import '@bixboards/core/animation/presets/pulse';
import '@bixboards/core/animation/presets/shake';
import '@bixboards/core/animation/presets/spin';
import '@bixboards/core/animation/presets/zoom-in';

interface Args {
  name: string;
  play: boolean;
  duration: number;
  iterations: number;
  force: boolean;
}

const BOX = html`<div
  style="inline-size: 4rem; block-size: 4rem; border-radius: var(--bx-radius-m); background: var(--bx-role-brand-solid);"
></div>`;

const meta = {
  title: 'Core/Animation',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-animation>`: declarative Web Animations API wrapper with named presets. Animates its first slotted element. Auto-disabled under `prefers-reduced-motion` unless `force`. Spec: docs/features/core/animation.md.',
      },
    },
  },
  argTypes: {
    name: {
      control: 'select',
      options: ['none', 'bounce', 'fadeIn', 'pulse', 'shake', 'spin', 'zoomIn'],
    },
    play: { control: 'boolean' },
    duration: { control: 'number' },
    iterations: { control: 'number' },
    force: { control: 'boolean' },
  },
  args: {
    name: 'bounce',
    play: true,
    duration: 1000,
    iterations: Infinity,
    force: false,
  },
  render: (args) => html`
    <bx-animation
      name=${args.name}
      ?play=${args.play}
      duration=${args.duration}
      iterations=${args.iterations}
      ?force=${args.force}
      >${BOX}</bx-animation
    >
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Presets: Story = {
  render: () => html`
    <div style="display: flex; gap: 2rem; flex-wrap: wrap; align-items: center">
      ${(['bounce', 'fadeIn', 'pulse', 'shake', 'spin', 'zoomIn'] as const).map(
        (name) => html`
          <div style="text-align: center">
            <bx-animation
              name=${name}
              play
              iterations="Infinity"
              duration="1200"
              >${BOX}</bx-animation
            >
            <div
              style="font-size: var(--bx-font-s); margin-top: var(--bx-space-xs)"
            >
              ${name}
            </div>
          </div>
        `,
      )}
    </div>
  `,
};

export const PlayToggle: Story = {
  name: 'Play toggle',
  args: { name: 'shake', iterations: 1 },
  parameters: {
    docs: {
      description: {
        story:
          'Toggle the `play` control to start/stop; `bx-start`/`bx-finish`/`bx-cancel` fire around the lifecycle.',
      },
    },
  },
};

export const ReducedMotion: Story = {
  name: 'Respects prefers-reduced-motion',
  args: { name: 'bounce', iterations: 1, force: false },
  parameters: {
    docs: {
      description: {
        story:
          'With the OS/browser reduced-motion setting on, the animation still runs but with zero duration and one iteration, unless `force` is set.',
      },
    },
  },
};
