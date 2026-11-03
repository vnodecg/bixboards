import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/dropdown';
import '@bixboards/core/button';
import '@bixboards/core/divider';

interface Args {
  placement:
    'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'right-start';
  size: 'small' | 'medium' | 'large';
  distance: number;
  skidding: number;
  focusableDisabled: boolean;
}

const meta = {
  title: 'Core/Dropdown',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '`<bx-dropdown>`: a menu of `bx-dropdown-item`s anchored to a trigger. Arrow keys (with wrap), Home/End and typeahead move real focus between items; Escape returns focus to the trigger; Tab closes. Items can be checkboxes, radio groups or submenu parents (hover uses a safe triangle). Large menus use the `items` data array with `virtual`, which renders only the rows in view. Spec: docs/features/core/dropdown.md.',
      },
    },
  },
  argTypes: {
    placement: {
      control: 'select',
      options: [
        'bottom-start',
        'bottom-end',
        'top-start',
        'top-end',
        'right-start',
      ],
    },
    size: { control: 'radio', options: ['small', 'medium', 'large'] },
    distance: { control: 'number' },
    skidding: { control: 'number' },
    focusableDisabled: { control: 'boolean', name: 'focusable-disabled' },
  },
  args: {
    placement: 'bottom-start',
    size: 'medium',
    distance: 4,
    skidding: 0,
    focusableDisabled: false,
  },
  render: (args) => html`
    <div style="padding: 2rem 4rem 14rem">
      <bx-dropdown
        placement=${args.placement}
        size=${args.size}
        distance=${args.distance}
        skidding=${args.skidding}
        ?focusable-disabled=${args.focusableDisabled}
      >
        <bx-button slot="trigger" with-caret>Actions</bx-button>
        <bx-dropdown-item value="rename">Rename</bx-dropdown-item>
        <bx-dropdown-item value="duplicate">
          Duplicate
          <span slot="details">⌘D</span>
        </bx-dropdown-item>
        <bx-dropdown-item value="move" disabled>Move</bx-dropdown-item>
        <bx-divider></bx-divider>
        <bx-dropdown-item value="delete" variant="error"
          >Delete</bx-dropdown-item
        >
      </bx-dropdown>
    </div>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const CheckboxAndRadio: Story = {
  name: 'Checkbox and radio items',
  render: () => html`
    <div style="padding: 2rem 4rem 14rem">
      <bx-dropdown>
        <bx-button slot="trigger" with-caret>View</bx-button>
        <bx-dropdown-item type="checkbox" value="grid" checked>
          Show grid
        </bx-dropdown-item>
        <bx-dropdown-item type="checkbox" value="rulers"
          >Show rulers</bx-dropdown-item
        >
        <bx-divider></bx-divider>
        <bx-dropdown-item type="radio" name="zoom" value="50"
          >50%</bx-dropdown-item
        >
        <bx-dropdown-item type="radio" name="zoom" value="100" checked>
          100%
        </bx-dropdown-item>
        <bx-dropdown-item type="radio" name="zoom" value="200"
          >200%</bx-dropdown-item
        >
      </bx-dropdown>
    </div>
  `,
};

export const Submenus: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A `submenu` slot turns an item into a submenu parent. It opens on hover (the pointer may cross sibling rows on the way — the safe triangle keeps it open), on ArrowRight/Enter/Space, and closes with ArrowLeft/Escape. Only one submenu per menu is open at a time.',
      },
    },
  },
  render: () => html`
    <div style="padding: 2rem 4rem 14rem">
      <bx-dropdown>
        <bx-button slot="trigger" with-caret>File</bx-button>
        <bx-dropdown-item value="new">New</bx-dropdown-item>
        <bx-dropdown-item>
          Share
          <bx-dropdown-item slot="submenu" value="email"
            >Email</bx-dropdown-item
          >
          <bx-dropdown-item slot="submenu" value="link"
            >Copy link</bx-dropdown-item
          >
          <bx-dropdown-item slot="submenu">
            Social
            <bx-dropdown-item slot="submenu" value="mastodon"
              >Mastodon</bx-dropdown-item
            >
            <bx-dropdown-item slot="submenu" value="bluesky"
              >Bluesky</bx-dropdown-item
            >
          </bx-dropdown-item>
        </bx-dropdown-item>
        <bx-dropdown-item>
          Export
          <bx-dropdown-item slot="submenu" value="pdf">PDF</bx-dropdown-item>
          <bx-dropdown-item slot="submenu" value="png">PNG</bx-dropdown-item>
        </bx-dropdown-item>
        <bx-divider></bx-divider>
        <bx-dropdown-item value="print">Print…</bx-dropdown-item>
      </bx-dropdown>
    </div>
  `,
};

const many = Array.from({ length: 50_000 }, (_, i) => ({
  label: `Command ${i + 1}`,
  value: `cmd-${i}`,
  details: i % 7 === 0 ? `⌘${i % 10}` : undefined,
}));

export const Virtualized: Story = {
  name: '50,000 items (virtualized)',
  parameters: {
    // Virtualized list renders a scroll-position-dependent window; not pixel-stable.
    visual: false,
    docs: {
      description: {
        story:
          'With `virtual` and the `items` array, only the rows in view are in the DOM. The focused row stays pinned while you scroll, typeahead ("Command 4321") and End run over the full array, and `aria-setsize` reports 50000. Checkbox/radio state is held by the dropdown, so it survives rows being recycled.',
      },
    },
  },
  render: () => html`
    <div style="padding: 2rem 4rem 24rem">
      <bx-dropdown virtual .items=${many}>
        <bx-button slot="trigger" with-caret>Commands</bx-button>
      </bx-dropdown>
    </div>
  `,
};

export const SelectEvent: Story = {
  name: 'Reacting to bx-select',
  render: () => html`
    <div
      style="padding: 2rem 4rem 14rem; display: grid; gap: var(--bx-space-m)"
    >
      <bx-dropdown
        @bx-select=${(event: CustomEvent) => {
          const out = document.querySelector('#dropdown-select-out');
          if (out)
            out.textContent = `bx-select → value: ${event.detail.value}, checked: ${event.detail.checked}`;
        }}
      >
        <bx-button slot="trigger" with-caret>Pick</bx-button>
        <bx-dropdown-item value="one">One</bx-dropdown-item>
        <bx-dropdown-item value="two" type="checkbox"
          >Two (checkbox)</bx-dropdown-item
        >
        <bx-dropdown-item value="three">Three</bx-dropdown-item>
      </bx-dropdown>
      <output
        id="dropdown-select-out"
        style="font-family: var(--bx-font-family-mono); font-size: var(--bx-font-s)"
      >
        Choose an item…
      </output>
    </div>
  `,
};
