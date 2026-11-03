import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/carousel';

interface Args {
  loop: boolean;
  navigation: boolean;
  pagination: boolean;
  autoplay: boolean;
  slidesPerPage: string;
  orientation: 'horizontal' | 'vertical';
  mouseDragging: boolean;
}

const COLORS = ['#3366ff', '#00a86b', '#b36b00', '#d91e48', '#7a869f'];

const meta = {
  title: 'Core/Carousel',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-carousel>`: scroll-snap carousel with pagination, navigation, autoplay and drag, built from `bx-carousel-item` slides. Spec: docs/features/core/carousel.md.',
      },
    },
  },
  argTypes: {
    loop: { control: 'boolean' },
    navigation: { control: 'boolean' },
    pagination: { control: 'boolean' },
    autoplay: { control: 'boolean' },
    slidesPerPage: { control: 'text', name: 'slides-per-page' },
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    mouseDragging: { control: 'boolean', name: 'mouse-dragging' },
  },
  args: {
    loop: false,
    navigation: true,
    pagination: true,
    autoplay: false,
    slidesPerPage: '1',
    orientation: 'horizontal',
    mouseDragging: true,
  },
  render: (args) => html`
    <bx-carousel
      ?loop=${args.loop}
      ?navigation=${args.navigation}
      ?pagination=${args.pagination}
      ?autoplay=${args.autoplay}
      slides-per-page=${args.slidesPerPage}
      orientation=${args.orientation}
      ?mouse-dragging=${args.mouseDragging}
      aria-label="Colors"
      style="inline-size: 24rem; ${args.orientation === 'vertical' ? 'block-size: 16rem' : ''}"
    >
      ${COLORS.map(
        (color, i) => html`
          <bx-carousel-item
            style="inline-size: 100%; aspect-ratio: 16/9; background: ${color}; display: flex; align-items: center; justify-content: center; color: white; font: 600 1.5rem system-ui; border-radius: var(--bx-radius-m)"
          >
            Slide ${i + 1}
          </bx-carousel-item>
        `,
      )}
    </bx-carousel>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Looping: Story = {
  name: 'Loop + autoplay',
  args: { loop: true, autoplay: true },
};

export const MultiSlide: Story = {
  name: 'Multiple slides per page',
  args: { slidesPerPage: '2' },
  render: (args) => html`
    <bx-carousel
      ?loop=${args.loop}
      ?navigation=${args.navigation}
      ?pagination=${args.pagination}
      ?autoplay=${args.autoplay}
      slides-per-page=${args.slidesPerPage}
      aria-label="Colors"
      style="inline-size: 32rem"
    >
      ${COLORS.map(
        (color, i) => html`
          <bx-carousel-item
            style="inline-size: 100%; aspect-ratio: 4/3; background: ${color}; display: flex; align-items: center; justify-content: center; color: white; font: 600 1.5rem system-ui; border-radius: var(--bx-radius-m)"
          >
            Slide ${i + 1}
          </bx-carousel-item>
        `,
      )}
    </bx-carousel>
  `,
};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
};

export const Photos: Story = {
  parameters: {
    // Loads remote images; not deterministic.
    visual: false,
  },
  name: 'Photo gallery',
  render: (args) => html`
    <bx-carousel
      ?loop=${args.loop}
      navigation
      pagination
      aria-label="Photo gallery"
      style="inline-size: 28rem"
    >
      ${[1, 2, 3].map(
        (i) => html`
          <bx-carousel-item
            style="inline-size: 100%; aspect-ratio: 16/9; border-radius: var(--bx-radius-m); overflow: hidden"
          >
            <img
              src="https://picsum.photos/seed/bixboards-carousel-${i}/800/450"
              alt="Photo ${i}"
              style="inline-size: 100%; block-size: 100%; object-fit: cover"
            />
          </bx-carousel-item>
        `,
      )}
    </bx-carousel>
  `,
};
