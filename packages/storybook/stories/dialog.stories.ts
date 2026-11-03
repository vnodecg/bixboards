import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/dialog';
import '@bixboards/core/button';

interface Args {
  label: string;
  withoutHeader: boolean;
  lightDismiss: boolean;
}

function openDialog(id: string) {
  return (event: Event) => {
    const root = (event.target as HTMLElement).getRootNode() as
      ShadowRoot | Document;
    root.querySelector<HTMLElement & { show(): void }>(`#${id}`)?.show();
  };
}

const meta = {
  title: 'Core/Dialog',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-dialog>`: modal dialog built on native `<dialog>` — inert background, focus trap and top-layer stacking come from the platform. Spec: docs/features/core/dialog.md.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    withoutHeader: { control: 'boolean', name: 'without-header' },
    lightDismiss: { control: 'boolean', name: 'light-dismiss' },
  },
  args: {
    label: 'Delete project?',
    withoutHeader: false,
    lightDismiss: true,
  },
  render: (args) => html`
    <bx-button @click=${openDialog('story-dialog')}>Open dialog</bx-button>
    <bx-dialog
      id="story-dialog"
      label=${args.label}
      ?without-header=${args.withoutHeader}
      ?light-dismiss=${args.lightDismiss}
    >
      This action cannot be undone. All project data will be permanently
      removed.
      <bx-button
        slot="footer"
        variant="secondary"
        appearance="outlined"
        data-dialog="close"
        >Cancel</bx-button
      >
      <bx-button slot="footer" variant="error" data-dialog="close"
        >Delete</bx-button
      >
    </bx-dialog>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const WithoutHeader: Story = {
  name: 'Without header',
  args: { withoutHeader: true },
};

export const NoLightDismiss: Story = {
  name: 'No light dismiss (backdrop click ignored)',
  args: { lightDismiss: false },
};

export const KeyboardAndFocus: Story = {
  name: 'Keyboard & focus return',
  render: (args) => html`
    <bx-button @click=${openDialog('kb-dialog')}>Open dialog</bx-button>
    <bx-dialog id="kb-dialog" label=${args.label}>
      Press <kbd>Escape</kbd> to close, or Tab through the footer buttons —
      focus is trapped inside while open and returns to the opener on close.
      <bx-button slot="footer" data-dialog="close">Close</bx-button>
    </bx-dialog>
  `,
  parameters: {
    docs: {
      description: {
        story:
          'Escape and the close button both route through the cancelable `bx-hide` event with `detail.source` set to `"keyboard"`/`"close-button"`.',
      },
    },
  },
};
