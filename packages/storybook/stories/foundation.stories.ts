import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, type TemplateResult } from 'lit';
import { ROLE_NAMES } from '@bixant/design-system';
import { PALETTES } from './palettes.ts';

const meta = {
  title: 'Foundation/Tokens',
  parameters: {
    docs: {
      description: {
        component:
          'Generated from `@bixant/design-system`. Use the toolbar to switch theme and `--bx-scale`.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const SHADES = [100, 200, 300, 400, 500, 600, 700, 800, 900];

const swatch = (name: string, label: string = name): TemplateResult => html`
  <div
    style="display:flex;flex-direction:column;gap:4px;align-items:flex-start"
  >
    <div
      style="width:var(--bx-space-2xl);height:var(--bx-space-xl);border-radius:var(--bx-radius-s);border:1px solid var(--bx-border-subtle);background:var(--bx-${name})"
    ></div>
    <code style="font-size:var(--bx-font-xs)">${label}</code>
  </div>
`;

export const Colors: Story = {
  render: () => html`
    ${PALETTES.map(
      (p) => html`
        <h3 class="sb-h">${p}</h3>
        <div class="sb-row" style="align-items:flex-start">
          ${SHADES.map((s) => swatch(`color-${p}-${s}`, String(s)))}
        </div>
        <div class="sb-row" style="align-items:flex-start">
          ${[1, 2, 3, 4, 5, 6].map((s) => swatch(`color-${p}-transparent-${s * 100}`, `t${s * 100}`))}
        </div>
      `,
    )}
  `,
};

export const Roles: Story = {
  name: 'Roles (per theme)',
  parameters: {
    docs: {
      description: {
        story:
          'Components use roles, not palette steps. Each theme resolves a role to the step that meets contrast on its surfaces, so the same component reads correctly in light and dark. Switch the theme in the toolbar.',
      },
    },
  },
  render: () => html`
    ${PALETTES.map(
      (p) => html`
        <h3 class="sb-h">${p}</h3>
        <div class="sb-row" style="align-items:flex-start">
          ${ROLE_NAMES.filter((r) => r !== 'on-solid').map((r) => swatch(`role-${p}-${r}`, r))}
          <div
            style="display:flex;flex-direction:column;gap:4px;align-items:flex-start"
          >
            <div
              style="width:var(--bx-space-2xl);height:var(--bx-space-xl);border-radius:var(--bx-radius-s);display:grid;place-items:center;background:var(--bx-role-${p}-solid);color:var(--bx-role-${p}-on-solid);font-weight:700"
            >
              Aa
            </div>
            <code style="font-size:var(--bx-font-xs)">on-solid</code>
          </div>
        </div>
      `,
    )}
  `,
};

export const SemanticColors: Story = {
  name: 'Semantic colors',
  render: () => {
    const groups: Record<string, string[]> = {
      surface: ['base', 'subtle', 'muted', 'inverse'],
      text: ['primary', 'secondary', 'hint', 'disabled', 'inverse', 'link'],
      border: ['subtle', 'base', 'strong', 'disabled'],
      focus: ['ring'],
    };
    return html`${Object.entries(groups).map(
      ([g, names]) =>
        html`<h3 class="sb-h">${g}</h3>
          <div class="sb-row" style="align-items:flex-start">
            ${names.map((n) => swatch(`${g}-${n}`, `${g}.${n}`))}
          </div>`,
    )}`;
  },
};

export const SpacingAndRadius: Story = {
  name: 'Spacing, radius, control height',
  render: () => html`
    <h3 class="sb-h">Space</h3>
    ${['2xs', 'xs', 's', 'm', 'l', 'xl', '2xl'].map(
      (s) =>
        html`<div class="sb-row">
          <span class="sb-label">space.${s}</span>
          <div
            style="height:var(--bx-space-xs);width:var(--bx-space-${s});background:var(--bx-role-brand-solid);border-radius:2px"
          ></div>
        </div>`,
    )}
    <h3 class="sb-h">Radius</h3>
    <div class="sb-row">
      ${['s', 'm', 'l', 'pill'].map(
        (r) =>
          html`<div
            style="width:var(--bx-space-2xl);height:var(--bx-space-xl);border:2px solid var(--bx-role-brand-border);border-radius:var(--bx-radius-${r});display:grid;place-items:center;font-size:var(--bx-font-xs)"
          >
            ${r}
          </div>`,
      )}
    </div>
    <h3 class="sb-h">Control height</h3>
    ${['s', 'm', 'l'].map(
      (s) =>
        html`<div class="sb-row">
          <span class="sb-label">height.${s}</span>
          <div
            style="height:var(--bx-control-height-${s});width:8rem;background:var(--bx-surface-muted);border-radius:var(--bx-radius-m)"
          ></div>
        </div>`,
    )}
    <h3 class="sb-h">Shadow</h3>
    <div class="sb-row" style="gap:var(--bx-space-l)">
      ${['s', 'm', 'l'].map((s) => html`<div style="width:var(--bx-space-2xl);height:var(--bx-space-xl);background:var(--bx-surface-base);border-radius:var(--bx-radius-m);box-shadow:var(--bx-shadow-${s})"></div>`)}
    </div>
  `,
};

export const Typography: Story = {
  render: () => html`
    ${['xs', 's', 'm', 'l', 'xl', '2xl', '3xl'].map(
      (s) =>
        html`<div class="sb-row">
          <span class="sb-label">font.${s}</span
          ><span style="font-size:var(--bx-font-${s})"
            >The quick brown fox jumps over the lazy dog</span
          >
        </div>`,
    )}
    <h3 class="sb-h">Weights</h3>
    ${['regular', 'medium', 'semibold', 'bold'].map((w) => html`<div class="sb-row"><span class="sb-label">${w}</span><span style="font-weight:var(--bx-font-weight-${w})">Enterprise-ready components</span></div>`)}
  `,
};
