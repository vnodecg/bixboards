import type { Preview } from '@storybook/web-components-vite';
import { html } from 'lit';
// Built by `pnpm run tokens`: the design system plus the example themes in packages/design-system/examples.
import './generated/tokens.css';
import './story.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        dynamicTitle: true,
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
          { value: 'acme', title: 'Acme (custom brand, serif, rounder)' },
          { value: 'acme-dark', title: 'Acme dark (extends acme + dark)' },
          {
            value: 'sharp-compact',
            title: 'Sharp & compact (square, scale 0.9)',
          },
        ],
      },
    },
    scale: {
      description: '--bx-scale',
      toolbar: {
        title: 'Scale',
        icon: 'zoom',
        dynamicTitle: true,
        items: [
          { value: '0.85', title: 'Scale 0.85' },
          { value: '1', title: 'Scale 1' },
          { value: '1.25', title: 'Scale 1.25' },
          { value: '1.5', title: 'Scale 1.5' },
        ],
      },
    },
  },
  initialGlobals: { theme: 'light', scale: '1' },
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
    backgrounds: { disabled: true },
    // axe-core runs on every story; violations fail `pnpm test:stories`. Override per story with
    // `parameters.a11y.config.rules` (documented reason required) or `a11y.test = 'todo'`.
    a11y: { test: 'error' },
  },
  decorators: [
    (story, { globals }) => {
      document.documentElement.dataset['theme'] = String(globals['theme']);
      document.body.style.background = 'var(--bx-surface-base)';
      return html`<div
        class="bx-scale"
        style="--bx-scale: ${
          globals['scale']
        }; box-sizing: border-box; padding: var(--bx-space-l); color: var(--bx-text-primary); font-family: var(--bx-font-family-sans); font-size: var(--bx-font-m);"
      >
        ${story()}
      </div>`;
    },
  ],
};

export default preview;
