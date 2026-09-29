import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/animated-image';

const DEMO_SRC = new URL('./assets/pulse-demo.gif', import.meta.url).href;
const BROKEN_SRC = new URL('./assets/does-not-exist.gif', import.meta.url).href;

interface Args {
  src: string;
  alt: string;
  play: boolean;
}

const meta = {
  title: 'Core/Animated Image',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-animated-image>`: a play/pause control for GIF and animated WebP. Paused, it shows the decoded first frame on a `<canvas>` (browsers cannot pause a running GIF in place); playing, it swaps in a live `<img>`, restarted from frame one every time. Lazy-loads on a shared `IntersectionObserver` and starts paused under `prefers-reduced-motion`. Spec: docs/features/core/animated-image.md.',
      },
    },
  },
  argTypes: {
    src: { control: 'text', description: 'Image URL (GIF or animated WebP).' },
    alt: {
      control: 'text',
      description: 'Accessible description, used in the toggle button label.',
    },
    play: {
      control: 'boolean',
      description: 'Play/pause state (reflected as an attribute).',
    },
  },
  args: {
    src: DEMO_SRC,
    alt: 'A circle cycling through brand, success, warning and danger colors',
    play: false,
  },
  render: (args) => html`
    <div style="width: 12rem; height: 12rem">
      <bx-animated-image
        src=${args.src}
        alt=${args.alt}
        ?play=${args.play}
      ></bx-animated-image>
    </div>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Playing: Story = {
  args: { play: true },
};

export const CustomIcons: Story = {
  name: 'Custom icons (slots)',
  parameters: {
    docs: {
      description: {
        story:
          'The `play-icon`/`pause-icon` slots override the default toggle glyph. Anything slotted is sized to `1em` by the component; give the toggle a larger `font-size` via `--bx-control-box-size` if you want bigger custom icons.',
      },
    },
  },
  render: (args) => html`
    <div style="width: 12rem; height: 12rem">
      <bx-animated-image src=${args.src} alt=${args.alt}>
        <span slot="play-icon">▶</span>
        <span slot="pause-icon">⏸</span>
      </bx-animated-image>
    </div>
  `,
};

export const ErrorState: Story = {
  name: 'Error state',
  args: { src: BROKEN_SRC, alt: 'A link that 404s' },
  parameters: {
    docs: {
      description: {
        story:
          'A broken `src` dispatches `bx-error`, disables the toggle and falls back to a labelled text placeholder so the `alt` description still reaches assistive tech.',
      },
    },
  },
};

export const KeyboardAndScreenReader: Story = {
  name: 'Keyboard & screen reader walkthrough',
  parameters: {
    docs: {
      description: {
        story:
          'Tab to the toggle, then press **Enter** or **Space** to play/pause — it is a native `<button>`, so no extra key handling was written. `aria-pressed` tracks play state and the accessible name switches between "Play: …" and "Pause: …". The toggle stays `disabled` (and out of the tab order) until the image has decoded, so it can never be actuated into a state with nothing to show.',
      },
    },
  },
};

export const ManyInstances: Story = {
  name: 'Many instances (36)',
  parameters: {
    docs: {
      description: {
        story:
          'Every instance lazy-loads independently through one shared `IntersectionObserver` (docs/features/_conventions.md §9: "shared observers") rather than one observer per element — this is the non-data-component analogue of the scaling tests data components run against large row/item counts.',
      },
    },
  },
  render: (args) => html`
    <div
      style="display:grid;grid-template-columns:repeat(6, 1fr);gap:var(--bx-space-s);max-width:48rem"
    >
      ${Array.from(
        { length: 36 },
        (_, i) => html`
          <div style="width: 100%; aspect-ratio: 1">
            <bx-animated-image
              src=${args.src}
              alt="${args.alt} (${i + 1})"
            ></bx-animated-image>
          </div>
        `,
      )}
    </div>
  `,
};
