import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { themeVars, toCssText } from '@bixant/design-system';
import { PALETTES } from './palettes.ts';

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const hex = (v: string, fallback: string): string =>
  HEX.test(v) ? v : fallback;

const RADIUS: Record<string, Record<string, string> | null> = {
  sharp: {
    '--bx-radius-s': '0px',
    '--bx-radius-m': '0px',
    '--bx-radius-l': '0px',
    '--bx-radius-pill': '0px',
  },
  default: null,
  soft: {
    '--bx-radius-s': 'calc(var(--bx-unit) * 0.5)',
    '--bx-radius-m': 'calc(var(--bx-unit) * 0.75)',
    '--bx-radius-l': 'calc(var(--bx-unit) * 1.25)',
  },
  round: {
    '--bx-radius-s': 'calc(var(--bx-unit) * 0.75)',
    '--bx-radius-m': 'calc(var(--bx-unit) * 1.25)',
    '--bx-radius-l': 'calc(var(--bx-unit) * 1.75)',
  },
};
const FONTS: Record<string, string | null> = {
  system: null,
  serif: "Georgia, 'Times New Roman', serif",
  mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
};

interface Args {
  brand: string;
  success: string;
  warning: string;
  danger: string;
  lightest: number;
  darkest: number;
  radius: string;
  font: string;
  scheme: 'light' | 'dark';
}

const meta = {
  title: 'Theming/Playground',
  parameters: {
    docs: {
      description: {
        component:
          'Runtime theming with `@bixant/design-system`: seeds are expanded into palettes and contrast-checked roles in the browser and applied as inline custom properties. Build-time themes are in the toolbar (Acme, Sharp & compact). Set `scheme` to the mode of the toolbar theme so roles are chosen for the right surfaces. Samples are plain elements styled only with tokens.',
      },
    },
  },
  argTypes: {
    brand: { control: 'color' },
    success: { control: 'color' },
    warning: { control: 'color' },
    danger: { control: 'color' },
    lightest: {
      control: { type: 'range', min: 90, max: 99, step: 1 },
      description: 'Lightness of shade 100',
    },
    darkest: {
      control: { type: 'range', min: 6, max: 40, step: 1 },
      description: 'Lightness of shade 900',
    },
    radius: { control: 'inline-radio', options: Object.keys(RADIUS) },
    font: { control: 'inline-radio', options: Object.keys(FONTS) },
    scheme: { control: 'inline-radio', options: ['light', 'dark'] },
  },
  args: {
    brand: '#3366ff',
    success: '#00a86b',
    warning: '#ffaa00',
    danger: '#d91e48',
    lightest: 96,
    darkest: 18,
    radius: 'default',
    font: 'system',
    scheme: 'light',
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

function varsFor(a: Args): Record<string, string> {
  const foundation: Record<string, string> = { ...(RADIUS[a.radius] ?? {}) };
  const font = FONTS[a.font];
  if (font) foundation['--bx-font-family-sans'] = font;
  return themeVars(
    {
      brand: hex(a.brand, '#3366ff'),
      success: hex(a.success, '#00a86b'),
      warning: hex(a.warning, '#ffaa00'),
      danger: hex(a.danger, '#d91e48'),
    },
    {
      scheme: a.scheme,
      curve: { lightest: a.lightest, darkest: a.darkest },
      foundation,
    },
  );
}

/** Palettes the playground lets you change; the rest keep the theme's values. */
const EDITABLE = ['brand', 'success', 'warning', 'danger'];
const shown = PALETTES.filter((p) => EDITABLE.includes(p));

const chip = (style: string, label: string) =>
  html`<span
    style="padding:var(--bx-space-xs) var(--bx-space-m);border-radius:var(--bx-radius-m);font-weight:var(--bx-font-weight-semibold);${style}"
    >${label}</span
  >`;

const sample = (p: string) => html`
  <div class="sb-row" style="align-items:stretch">
    <span class="sb-label">${p}</span>
    ${chip(
      `background:var(--bx-role-${p}-solid);color:var(--bx-role-${p}-on-solid)`,
      'solid',
    )}
    ${chip(
      `background:var(--bx-role-${p}-subtle);color:var(--bx-role-${p}-fg)`,
      'subtle',
    )}
    ${chip(
      `border:2px solid var(--bx-role-${p}-border);color:var(--bx-role-${p}-fg)`,
      'outline',
    )}
    ${chip(`color:var(--bx-role-${p}-fg)`, 'text')}
  </div>
`;

export const Playground: Story = {
  render: (args) => html`
    <div
      style=${styleMap({
        ...varsFor(args),
        fontFamily: 'var(--bx-font-family-sans)',
      })}
    >
      <h3 class="sb-h">Roles in use</h3>
      ${shown.map(sample)}
      <h3 class="sb-h">Palette</h3>
      ${shown.map(
        (v) =>
          html`<div class="sb-row" style="gap:2px">
            ${[100, 200, 300, 400, 500, 600, 700, 800, 900].map(
              (s) =>
                html`<div
                  title="${v}.${s}"
                  style="width:var(--bx-space-xl);height:var(--bx-space-l);background:var(--bx-color-${v}-${s})"
                ></div>`,
            )}
          </div>`,
      )}
      <h3 class="sb-h">Type and shape</h3>
      <p style="max-width:32rem">
        <a href="#" style="color:var(--bx-text-link)">Links</a> use
        <code>text.link</code>; boxes take their corners from
        <code>radius.l</code>, and this paragraph its face from
        <code>font.family.sans</code>.
      </p>
      <div
        style="max-width:24rem;padding:var(--bx-space-m);border:1px solid var(--bx-border-base);border-radius:var(--bx-radius-l);outline:2px solid var(--bx-focus-ring);outline-offset:2px"
      >
        Focus ring, border and radius tokens
      </div>
    </div>
  `,
};

export const GeneratedCss: Story = {
  name: 'Generated CSS',
  parameters: {
    docs: {
      description: {
        story:
          'The exact declarations the playground applies. Use `toCssText(selector, vars)` to emit the same as a stylesheet, for example server-rendered tenant themes.',
      },
    },
  },
  render: (args) =>
    html`<pre
      style="overflow:auto;font-size:var(--bx-font-xs);padding:var(--bx-space-s);background:var(--bx-surface-subtle);border-radius:var(--bx-radius-m)"
    >
${toCssText(':root', varsFor(args))}</pre>`,
};
