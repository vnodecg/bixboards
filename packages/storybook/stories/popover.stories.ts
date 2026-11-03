import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/popover';
import '@bixboards/core/button';
import '@bixboards/core/button-group';
import '@bixboards/core/copy-button';
import '@bixboards/core/input';

interface Args {
  label: string;
  placement:
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'right';
  open: boolean;
  distance: number;
  skidding: number;
  withoutArrow: boolean;
}

const meta = {
  title: 'Core/Popover',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '`<bx-popover>`: rich, interactive floating panel anchored to an element and positioned by `bx-popup`. Unlike `bx-tooltip` it can hold buttons and inputs: focus moves in on open, and it closes on Escape or an outside click. Clicking the anchor toggles it. Spec: docs/features/core/popover.md.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
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
    open: { control: 'boolean' },
    distance: { control: 'number' },
    skidding: { control: 'number' },
    withoutArrow: { control: 'boolean', name: 'without-arrow' },
  },
  args: {
    label: 'Dimensions',
    placement: 'bottom',
    open: false,
    distance: 8,
    skidding: 0,
    withoutArrow: false,
  },
  render: (args) => html`
    <div style="padding: 8rem 4rem">
      <bx-popover
        label=${args.label}
        placement=${args.placement}
        ?open=${args.open}
        distance=${args.distance}
        skidding=${args.skidding}
        ?without-arrow=${args.withoutArrow}
      >
        <bx-button
          slot="anchor"
          variant="secondary"
          appearance="outlined"
          with-caret
          >Dimensions</bx-button
        >
        <div style="display: flex; flex-direction: column; gap: 0.75rem">
          <strong>Set the dimensions</strong>
          <span
            style="color: var(--bx-text-secondary); font-size: var(--bx-font-s)"
            >Rich content, not just a hint.</span
          >
          <bx-button-group label="Presets">
            <bx-button size="small" variant="secondary" appearance="outlined"
              >Small</bx-button
            >
            <bx-button size="small" variant="secondary" appearance="outlined"
              >Medium</bx-button
            >
            <bx-button size="small" variant="secondary" appearance="outlined"
              >Large</bx-button
            >
          </bx-button-group>
        </div>
      </bx-popover>
    </div>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const InitiallyOpen: Story = {
  args: { open: true },
};

export const Placements: Story = {
  name: 'Placements',
  parameters: { layout: 'padded' },
  render: () => html`
    <div
      style="display: grid; grid-template-columns: repeat(3, max-content); gap: 3rem 4rem; justify-content: center; padding: 6rem 4rem"
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
          'bottom-end',
        ] as const
      ).map(
        (placement) => html`
          <bx-popover placement=${placement} label=${placement}>
            <bx-button slot="anchor" variant="secondary" appearance="outlined"
              >${placement}</bx-button
            >
            Anchored ${placement}
          </bx-popover>
        `,
      )}
    </div>
  `,
};

export const InteractiveForm: Story = {
  name: 'Interactive content (focus moves in)',
  render: () => html`
    <div style="padding: 8rem 4rem">
      <bx-popover placement="bottom-start" label="Rename file">
        <bx-button slot="anchor">Rename</bx-button>
        <form
          style="display: flex; flex-direction: column; gap: 0.75rem; min-inline-size: 16rem"
          @submit=${(event: Event) => {
            event.preventDefault();
            (
              (event.currentTarget as HTMLElement).closest(
                'bx-popover',
              ) as HTMLElement & {
                hide(): void;
              }
            ).hide();
          }}
        >
          <bx-input label="File name" value="report.pdf"></bx-input>
          <div style="display: flex; justify-content: flex-end; gap: 0.5rem">
            <bx-button
              variant="secondary"
              appearance="plain"
              @click=${(event: Event) =>
                (
                  (event.currentTarget as HTMLElement).closest(
                    'bx-popover',
                  ) as HTMLElement & {
                    hide(): void;
                  }
                ).hide()}
              >Cancel</bx-button
            >
            <bx-button type="submit">Save</bx-button>
          </div>
        </form>
      </bx-popover>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          'Opening moves focus to the first interactive element (the input). **Escape** closes and returns focus to the trigger; **Tab** flows on through the page (it is a non-modal dialog, so there is no focus trap). Clicking anywhere outside dismisses it.',
      },
    },
  },
};

export const ComposedContent: Story = {
  name: 'Composed with copy button and button group',
  render: () => html`
    <div style="padding: 8rem 4rem">
      <bx-popover placement="bottom-start" label="Share this page">
        <bx-button slot="anchor" variant="secondary" appearance="outlined"
          >Share</bx-button
        >
        <div
          style="display: flex; flex-direction: column; gap: 0.75rem; min-inline-size: 18rem"
        >
          <strong>Share this page</strong>
          <div style="display: flex; align-items: center; gap: 0.5rem">
            <code
              id="pop-share-url"
              style="flex: 1; overflow: hidden; text-overflow: ellipsis"
              >https://example.com/p/42</code
            >
            <bx-copy-button
              from="pop-share-url"
              copy-label="Copy link"
            ></bx-copy-button>
          </div>
          <bx-button-group label="Share targets">
            <bx-button size="small" variant="secondary" appearance="outlined"
              >Email</bx-button
            >
            <bx-button size="small" variant="secondary" appearance="outlined"
              >Chat</bx-button
            >
            <bx-button size="small" variant="secondary" appearance="outlined"
              >Embed</bx-button
            >
          </bx-button-group>
        </div>
      </bx-popover>
    </div>
  `,
};

export const ForAttribute: Story = {
  name: 'Anchored by id (for attribute)',
  render: () => html`
    <div style="padding: 8rem 4rem">
      <bx-button
        id="popover-for-anchor"
        variant="secondary"
        appearance="outlined"
        >Anchor by id</bx-button
      >
      <bx-popover
        for="popover-for-anchor"
        label="Anchored by id"
        placement="right"
      >
        Resolved with <code>for</code>, no slot needed.
      </bx-popover>
    </div>
  `,
};

export const Events: Story = {
  name: 'Events (cancelable bx-show / bx-hide)',
  render: () => html`
    <div
      style="padding: 8rem 4rem; display: flex; flex-direction: column; gap: 1rem; align-items: flex-start"
    >
      <bx-popover
        placement="bottom-start"
        label="Event demo"
        @bx-hide=${(event: Event) => {
          const detail = (event as CustomEvent).detail;
          const root = (event.currentTarget as HTMLElement).parentElement!;
          root.querySelector('output')!.textContent =
            `bx-hide, source: ${detail.source}`;
        }}
      >
        <bx-button slot="anchor" variant="secondary" appearance="outlined"
          >Open</bx-button
        >
        Dismiss me by Escape, an outside click, or the anchor.
      </bx-popover>
      <output
        style="font-size: var(--bx-font-s); color: var(--bx-text-secondary)"
        >Waiting for bx-hide…</output
      >
    </div>
  `,
};
