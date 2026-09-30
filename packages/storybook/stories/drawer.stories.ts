import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import '@bixant/core/drawer';
import '@bixant/core/button';
import '@bixant/core/button-group';
import '@bixant/core/copy-button';
import '@bixant/core/input';

type Placement = 'top' | 'end' | 'bottom' | 'start';

interface Args {
  label: string;
  placement: Placement;
  withoutHeader: boolean;
  lightDismiss: boolean;
}

type DrawerEl = HTMLElement & { show(): void; hide(): void };

const footerButtons = (drawer: { value?: DrawerEl }) => html`
  <bx-button
    slot="footer"
    variant="secondary"
    appearance="outlined"
    @click=${() => drawer.value?.hide()}
    >Cancel</bx-button
  >
  <bx-button slot="footer" @click=${() => drawer.value?.hide()}>Save</bx-button>
`;

const meta = {
  title: 'Core/Drawer',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-drawer>`: edge-anchored panel (top/end/bottom/start), modal by default or `contained` to a positioned parent. Built on native `<dialog>` like `bx-dialog`: the modal mode gets the inert background, focus trap and top-layer stacking from the platform. The default close control is a `bx-button`. Spec: docs/features/core/drawer.md.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    placement: {
      control: 'radio',
      options: ['end', 'start', 'top', 'bottom'],
    },
    withoutHeader: { control: 'boolean', name: 'without-header' },
    lightDismiss: { control: 'boolean', name: 'light-dismiss' },
  },
  args: {
    label: 'Project settings',
    placement: 'end',
    withoutHeader: false,
    lightDismiss: true,
  },
  render: (args) => {
    const drawer = createRef<DrawerEl>();
    return html`
      <bx-button @click=${() => drawer.value?.show()}>Open drawer</bx-button>
      <bx-drawer
        ${ref(drawer)}
        label=${args.label}
        placement=${args.placement}
        ?without-header=${args.withoutHeader}
        ?light-dismiss=${args.lightDismiss}
      >
        <div style="display: flex; flex-direction: column; gap: 1rem">
          <bx-input label="Project name" value="Bixant"></bx-input>
          <bx-input label="Slug" value="bixant"></bx-input>
        </div>
        ${footerButtons(drawer)}
      </bx-drawer>
    `;
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Placements: Story = {
  name: 'All placements',
  render: () => {
    const refs = {
      end: createRef<DrawerEl>(),
      start: createRef<DrawerEl>(),
      top: createRef<DrawerEl>(),
      bottom: createRef<DrawerEl>(),
    };
    return html`
      <bx-button-group label="Open a drawer">
        ${(['start', 'end', 'top', 'bottom'] as const).map(
          (placement) => html`
            <bx-button
              variant="secondary"
              appearance="outlined"
              @click=${() => refs[placement].value?.show()}
              >${placement}</bx-button
            >
          `,
        )}
      </bx-button-group>
      ${(['start', 'end', 'top', 'bottom'] as const).map(
        (placement) => html`
          <bx-drawer
            ${ref(refs[placement])}
            placement=${placement}
            label=${`Placement: ${placement}`}
          >
            Anchored to the <strong>${placement}</strong> edge.
            ${footerButtons(refs[placement])}
          </bx-drawer>
        `,
      )}
    `;
  },
  parameters: {
    docs: {
      description: {
        story:
          '`start`/`end` are logical (they swap in RTL); `top`/`bottom` span the inline size and take their height from `--bx-drawer-size`.',
      },
    },
  },
};

export const Contained: Story = {
  name: 'Contained to a parent (no viewport takeover)',
  render: (args) => {
    const drawer = createRef<DrawerEl>();
    return html`
      <div
        style="position: relative; block-size: 22rem; border: 1px solid var(--bx-border-subtle); border-radius: var(--bx-radius-m); padding: 1rem; background: var(--bx-surface-subtle)"
      >
        <bx-button @click=${() => drawer.value?.show()}
          >Open inside this panel</bx-button
        >
        <p style="color: var(--bx-text-secondary)">
          The parent needs <code>position: relative</code>. The drawer and its
          scrim fill only this box, and focus is not trapped.
        </p>
        <bx-drawer
          ${ref(drawer)}
          contained
          label=${args.label}
          placement=${args.placement}
        >
          Contained content. ${footerButtons(drawer)}
        </bx-drawer>
      </div>
    `;
  },
};

export const WithoutHeader: Story = {
  name: 'Without header',
  args: { withoutHeader: true },
};

export const NoLightDismiss: Story = {
  name: 'No light dismiss (backdrop click ignored)',
  args: { lightDismiss: false },
};

export const HeaderActionsAndScrolling: Story = {
  name: 'Header actions slot and long, scrolling content',
  render: () => {
    const drawer = createRef<DrawerEl>();
    return html`
      <bx-button @click=${() => drawer.value?.show()}
        >Open long drawer</bx-button
      >
      <bx-drawer ${ref(drawer)} label="Release notes">
        <bx-copy-button
          slot="header-actions"
          value="Release notes v1.0"
          copy-label="Copy title"
        ></bx-copy-button>
        ${Array.from(
          { length: 40 },
          (_, i) =>
            html`<p>
              Line ${i + 1}: the body scrolls while the header and footer stay
              put.
            </p>`,
        )}
        ${footerButtons(drawer)}
      </bx-drawer>
    `;
  },
};

export const KeyboardAndFocus: Story = {
  name: 'Keyboard & focus return',
  render: (args) => {
    const drawer = createRef<DrawerEl>();
    return html`
      <bx-button @click=${() => drawer.value?.show()}>Open drawer</bx-button>
      <bx-drawer ${ref(drawer)} label=${args.label}>
        Press <kbd>Escape</kbd> to close, or Tab around: focus is trapped inside
        while open and returns to the button that opened it on close.
        ${footerButtons(drawer)}
      </bx-drawer>
    `;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Escape, the close button and a backdrop click all route through the cancelable `bx-hide` event with `detail.source` set to `"keyboard"`, `"close-button"` or `"light-dismiss"`.',
      },
    },
  },
};
