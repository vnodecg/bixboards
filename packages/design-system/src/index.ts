// Browser-safe runtime theming. No Node APIs; safe to import from application code.
//
// Use when brand colors are only known at runtime (multi-tenant apps, user-chosen accents).
// The build-time pipeline (`@bixant/design-system/build`) stays the source of truth for everything else.

import {
  SHADES,
  assertCurve,
  assertHex,
  generateShades,
  transparentShades,
  type PaletteCurve,
  type Shade,
} from './color.ts';
import { ROLE_NAMES, planRoles, roleValues, type Scheme } from './roles.ts';

export {
  SHADES,
  contrast,
  generateShades,
  luminance,
  transparentShades,
  type PaletteCurve,
  type Shade,
  type ShadeMap,
} from './color.ts';
export {
  ROLE_NAMES,
  planRoles,
  type RoleName,
  type RolePlan,
  type Scheme,
} from './roles.ts';

export interface ThemeVarOptions {
  /** Which mode the palette must read well in. Default `light`. */
  scheme?: Scheme;
  /** Page/panel colors (hex) that text roles are checked against. Defaults to a white/off-white (light) or near-black (dark) pair. */
  surfaces?: string[];
  /** Dark text color used on light solids. Default `#141a2d`. */
  darkText?: string;
  /** Lightness curve of generated palettes. */
  curve?: PaletteCurve;
  /** Hand-tuned palette steps, for example `{ brand: { 600: '#0b5f52' } }`. */
  shades?: Record<string, Partial<Record<Shade, string>>>;
  /** Extra custom properties (full names, e.g. `--bx-radius-m`). */
  foundation?: Record<string, string>;
  /** Extra custom properties (full names, e.g. `--bx-surface-base`). */
  tokens?: Record<string, string>;
}

const PALETTE_NAME = /^[a-z][a-z0-9-]*$/;
const PROPERTY_NAME = /^--[a-z0-9][a-z0-9-]*$/;
// Anything that could end a declaration/rule, start a comment, or load a resource.
const UNSAFE_VALUE = /[;{}<>\\]|\/\*|\*\/|@import|url\s*\(/i;
const UNSAFE_SELECTOR = /[;{}<>\\]|\/\*|\*\/|@/;

const DEFAULT_SURFACES: Record<Scheme, string[]> = {
  light: ['#ffffff', '#f5f7fb'],
  dark: ['#141a2d', '#232b3d'],
};
const DEFAULT_DARK_TEXT = '#141a2d';

function assertName(value: string, what: string): void {
  if (!PALETTE_NAME.test(value))
    throw new TypeError(
      `${what} must match ${PALETTE_NAME}, got ${JSON.stringify(value)}`,
    );
}

function assertProperty(name: string): void {
  if (!PROPERTY_NAME.test(name))
    throw new TypeError(
      `Custom property name must match ${PROPERTY_NAME}, got ${JSON.stringify(name)}`,
    );
}

function assertValue(value: string, name: string): void {
  if (typeof value !== 'string' || UNSAFE_VALUE.test(value))
    throw new TypeError(`Unsafe value for ${name}: ${JSON.stringify(value)}`);
}

const cssVar = (path: string): string =>
  `var(--bx-${path.replace(/\./g, '-')})`;

/**
 * CSS custom properties for one palette: steps `100…900`, `transparent.100…600` and the
 * semantic roles (`--bx-role-<name>-solid`, `-fg`, …) chosen for `options.scheme`.
 */
export function paletteVars(
  name: string,
  seed: string,
  options: ThemeVarOptions = {},
): Record<string, string> {
  assertName(name, 'Palette name');
  const scheme = options.scheme ?? 'light';
  const darkText = assertHex(options.darkText ?? DEFAULT_DARK_TEXT, 'darkText');
  const surfaces = (options.surfaces ?? DEFAULT_SURFACES[scheme]).map((s) =>
    assertHex(s, 'surface'),
  );
  const overrides = options.shades?.[name] ?? {};
  const shades = { ...generateShades(seed, options.curve), ...overrides };
  for (const [step, value] of Object.entries(overrides))
    assertHex(value, `shades.${name}.${step}`);

  const vars: Record<string, string> = {};
  for (const s of SHADES) vars[`--bx-color-${name}-${s}`] = shades[s];
  for (const [step, value] of Object.entries(transparentShades(shades[500])))
    vars[`--bx-color-${name}-transparent-${step}`] = value;

  const plan = planRoles({ shades, surfaces, scheme, darkText });
  const roles = roleValues(name, plan, cssVar, 'var(--bx-color-neutral-900)');
  for (const role of ROLE_NAMES)
    vars[`--bx-role-${name}-${role}`] = roles[role];
  return vars;
}

/**
 * Custom properties for a set of seeds, plus the semantic tokens that point at the `brand` roles
 * (so they resolve correctly when applied below the theme root).
 */
export function themeVars(
  seeds: Record<string, string>,
  options: ThemeVarOptions = {},
): Record<string, string> {
  if (options.curve) assertCurve(options.curve, 'curve');
  const vars: Record<string, string> = {};
  for (const [name, seed] of Object.entries(seeds))
    Object.assign(vars, paletteVars(name, seed, options));
  if (seeds['brand']) {
    vars['--bx-focus-ring'] = 'var(--bx-role-brand-border)';
    vars['--bx-text-link'] = 'var(--bx-role-brand-fg)';
    vars['--bx-role-accent'] = 'var(--bx-role-brand-solid)';
    vars['--bx-role-accent-fg'] = 'var(--bx-role-brand-fg)';
    vars['--bx-role-accent-subtle'] = 'var(--bx-role-brand-subtle)';
    vars['--bx-role-accent-border'] = 'var(--bx-role-brand-border)';
    vars['--bx-on-accent'] = 'var(--bx-role-brand-on-solid)';
  }
  for (const extra of [options.foundation, options.tokens]) {
    for (const [k, v] of Object.entries(extra ?? {})) {
      assertProperty(k);
      assertValue(v, k);
      vars[k] = v;
    }
  }
  return vars;
}

/**
 * Serialize custom properties to a CSS rule, for example for server-rendered tenant themes.
 * Selector, names and values are validated; anything that could break out of the declaration throws.
 */
export function toCssText(
  selector: string,
  vars: Record<string, string>,
): string {
  if (!selector.trim() || UNSAFE_SELECTOR.test(selector))
    throw new TypeError(`Unsafe selector: ${JSON.stringify(selector)}`);
  const body = Object.entries(vars)
    .map(([k, v]) => {
      assertProperty(k);
      assertValue(v, k);
      return `  ${k}: ${v};`;
    })
    .join('\n');
  return `${selector} {\n${body}\n}\n`;
}

/**
 * Apply seeds (and optional overrides) inline on an element. Returns a function that removes them.
 * Apply on the element that carries `data-theme` (or `<html>`); descendants inherit the values.
 */
export function applyTheme(
  element: HTMLElement,
  seeds: Record<string, string>,
  options?: ThemeVarOptions,
): () => void {
  const vars = themeVars(seeds, options);
  for (const [k, v] of Object.entries(vars)) element.style.setProperty(k, v);
  return () => {
    for (const k of Object.keys(vars)) element.style.removeProperty(k);
  };
}
