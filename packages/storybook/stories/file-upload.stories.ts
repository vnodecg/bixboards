import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/file-upload';

const meta = {
  title: 'Core/File Upload',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-file-upload>`. Spec: docs/features/core/file-upload.md.',
      },
    },
  },
  render: () =>
    html`<bx-file-upload
      label="Attachments"
      multiple
      max-size="2000000"
      accept="image/*,.pdf"
      style="max-width:28rem"
      ><span slot="hint">Images or PDF up to 2 MB</span></bx-file-upload
    >`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};
