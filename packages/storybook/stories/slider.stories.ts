import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/slider';

interface Args {
  value: number;
  min: number;
  max: number;
  step: number;
  range: boolean;
  orientation: 'horizontal' | 'vertical';
  withMarkers: boolean;
  withTooltip: boolean;
  disabled: boolean;
  size: 'small' | 'medium' | 'large';
}

const meta = {
  title: 'Core/Slider',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-slider>`: single or range slider, form-associated via `ElementInternals`. Range mode submits as a `${name}-min`/`${name}-max` FormData pair. Spec: docs/features/core/slider.md.',
      },
    },
  },
  argTypes: {
    value: { control: 'number' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    range: { control: 'boolean' },
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    withMarkers: { control: 'boolean', name: 'with-markers' },
    withTooltip: { control: 'boolean', name: 'with-tooltip' },
    disabled: { control: 'boolean' },
    size: { control: 'radio', options: ['small', 'medium', 'large'] },
  },
  args: {
    value: 40,
    min: 0,
    max: 100,
    step: 1,
    range: false,
    orientation: 'horizontal',
    withMarkers: false,
    withTooltip: false,
    disabled: false,
    size: 'medium',
  },
  render: (args) => html`
    <div style="inline-size: 20rem">
      <bx-slider
        name="story-slider"
        value=${args.value}
        min=${args.min}
        max=${args.max}
        step=${args.step}
        ?range=${args.range}
        orientation=${args.orientation}
        ?with-markers=${args.withMarkers}
        ?with-tooltip=${args.withTooltip}
        ?disabled=${args.disabled}
        size=${args.size}
      >
        <span slot="label">Volume</span>
      </bx-slider>
    </div>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const RangeMode: Story = {
  name: 'Range mode',
  args: { range: true },
  render: (args) => html`
    <div style="inline-size: 20rem">
      <bx-slider
        name="story-range"
        min=${args.min}
        max=${args.max}
        step=${args.step}
        range
        min-value="20"
        max-value="70"
        with-tooltip
      >
        <span slot="label">Price range</span>
      </bx-slider>
    </div>
  `,
};

export const WithMarkersAndTooltip: Story = {
  name: 'With markers + tooltip',
  args: { withMarkers: true, withTooltip: true, step: 10 },
};

export const Disabled: Story = {
  args: { disabled: true, value: 60 },
};

export const Vertical: Story = {
  render: (args) => html`
    <div style="block-size: 16rem; display: flex; justify-content: center">
      <bx-slider
        name="story-vertical"
        orientation="vertical"
        value=${args.value}
      ></bx-slider>
    </div>
  `,
};

export const Sizes: Story = {
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 1.5rem; inline-size: 20rem"
    >
      ${(['small', 'medium', 'large'] as const).map(
        (size) =>
          html`<bx-slider
            name="story-size-${size}"
            size=${size}
            value="50"
          ></bx-slider>`,
      )}
    </div>
  `,
};

export const Keyboard: Story = {
  name: 'Keyboard operable',
  render: (args) => html`
    <div style="inline-size: 20rem">
      <bx-slider name="story-kb" value=${args.value} with-tooltip>
        <span slot="label">Arrow/Page/Home/End on the focused thumb</span>
      </bx-slider>
    </div>
  `,
};
