import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import report from '../.storybook/generated/contrast.json';

interface Entry {
  fg: string;
  bg: string;
  min: number;
  ratio?: number;
  pass: boolean;
}

const reports = report as Record<string, Entry[]>;

const meta = {
  title: 'Foundation/Contrast',
  parameters: {
    docs: {
      description: {
        component:
          'WCAG contrast of every documented token pair for the theme selected in the toolbar. The build fails (`--strict`) if any row fails, so components that use these tokens inherit the guarantee: text 4.5:1, borders and focus 3:1.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

/** `fg.token` → the CSS variable that holds it. */
const cssVar = (token: string): string =>
  `var(--bx-${token.replace(/\./g, '-')})`;

export const Pairs: Story = {
  name: 'Token pairs',
  render: (_args, { globals }) => {
    const theme = String(globals['theme']);
    const entries = reports[theme] ?? [];
    return html`
      <p class="sb-label" style="width:auto">
        Theme <strong>${theme}</strong>: ${entries.filter((e) => e.pass).length}
        of ${entries.length} pairs pass.
      </p>
      <table class="sb-table">
        <thead>
          <tr>
            <th>Sample</th>
            <th>Foreground</th>
            <th>Background</th>
            <th>Ratio</th>
            <th>Min</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${entries.map(
            (e) =>
              html`<tr>
                <td>
                  <span
                    style="display:inline-block;padding:2px var(--bx-space-s);border-radius:var(--bx-radius-s);border:1px solid var(--bx-border-subtle);color:${cssVar(
                      e.fg,
                    )};background:${cssVar(e.bg)}"
                    >Aa</span
                  >
                </td>
                <td><code>${e.fg}</code></td>
                <td><code>${e.bg}</code></td>
                <td>${e.ratio === undefined ? '–' : e.ratio.toFixed(2)}</td>
                <td>${e.min}</td>
                <td>
                  <span class=${e.pass ? 'sb-pass' : 'sb-fail'}
                    >${e.pass ? 'pass' : 'fail'}</span
                  >
                </td>
              </tr>`,
          )}
        </tbody>
      </table>
    `;
  },
};
