// Semantic per-palette roles, derived so that they meet WCAG contrast on the theme's surfaces.
//
// Palettes are the same in every theme; what changes between light and dark is *which step* reads
// well on the page. Components therefore never use palette steps directly: they use roles
// (`role.brand.fg`, `role.brand.solid`, …) that each theme resolves to a step by contrast search.
// The search is pure and shared by the build (aliases) and the browser runtime (`var()` references).

import {
  contrast,
  parseColor,
  TRANSPARENT_ALPHAS,
  type Shade,
  type ShadeMap,
} from './color.ts';

/** Role names, in the order they are emitted. */
export const ROLE_NAMES = [
  'solid',
  'solid-hover',
  'solid-active',
  'on-solid',
  'fg',
  'border',
  'subtle',
  'subtle-hover',
  'subtle-active',
  'tint',
] as const;
export type RoleName = (typeof ROLE_NAMES)[number];

export type Scheme = 'light' | 'dark';

export interface RolePlan {
  solid: Shade;
  solidHover: Shade;
  solidActive: Shade;
  /** Text color on solid fills: white or the dark text color. */
  on: 'light' | 'dark';
  fg: Shade;
  border: Shade;
}

export interface RoleInput {
  shades: ShadeMap;
  /** Page/panel colors (hex) that role colors must read on. */
  surfaces: string[];
  scheme: Scheme;
  /** Text color used on light solids, for example `neutral.900`. */
  darkText: string;
}

export const TEXT_MIN = 4.5;
export const UI_MIN = 3;

const clampStep = (n: number): Shade =>
  Math.min(900, Math.max(100, n)) as Shade;

/** Steps to try, nearest to the seed (500) first. */
const SOLID_ORDER: readonly Shade[] = [
  500, 600, 400, 700, 300, 800, 200, 900, 100,
];
const LIGHT_MODE_ORDER: readonly Shade[] = [500, 600, 700, 800, 900];
const DARK_MODE_ORDER: readonly Shade[] = [500, 400, 300, 200, 100];

function planSolid({
  shades,
  darkText,
}: RoleInput): Pick<RolePlan, 'solid' | 'solidHover' | 'solidActive' | 'on'> {
  let best:
    | {
        min: number;
        plan: Pick<RolePlan, 'solid' | 'solidHover' | 'solidActive' | 'on'>;
      }
    | undefined;
  for (const step of SOLID_ORDER) {
    for (const on of ['light', 'dark'] as const) {
      // Hover/active move away from the text color so contrast never drops below the resting state.
      const dir = on === 'light' ? 1 : -1;
      const hover = clampStep(step + dir * 100);
      const active = clampStep(step + dir * 200);
      const text = on === 'light' ? '#ffffff' : darkText;
      const min = Math.min(
        contrast(text, shades[step]),
        contrast(text, shades[hover]),
        contrast(text, shades[active]),
      );
      const plan = { solid: step, solidHover: hover, solidActive: active, on };
      if (min >= TEXT_MIN) return plan;
      if (!best || min > best.min) best = { min, plan };
    }
  }
  return (best as NonNullable<typeof best>).plan;
}

/** Highest tint (alpha) a role's `fg` must stay readable on (`subtle-active`). */
const WORST_TINT_ALPHA = TRANSPARENT_ALPHAS[3];

function planFg({ shades, surfaces, scheme }: RoleInput): Shade {
  const order = scheme === 'light' ? LIGHT_MODE_ORDER : DARK_MODE_ORDER;
  for (const step of order) {
    const color = shades[step];
    const rgb = parseColor(color);
    if (!rgb) continue;
    const ok = surfaces.every((surface) => {
      const tint = { ...rgb, a: WORST_TINT_ALPHA };
      return (
        contrast(color, surface) >= TEXT_MIN &&
        contrast(color, tint, surface) >= TEXT_MIN
      );
    });
    if (ok) return step;
  }
  return order[order.length - 1] as Shade;
}

function planBorder({ shades, surfaces, scheme }: RoleInput): Shade {
  const order = scheme === 'light' ? LIGHT_MODE_ORDER : DARK_MODE_ORDER;
  for (const step of order) {
    if (surfaces.every((surface) => contrast(shades[step], surface) >= UI_MIN))
      return step;
  }
  return order[order.length - 1] as Shade;
}

export function planRoles(input: RoleInput): RolePlan {
  return { ...planSolid(input), fg: planFg(input), border: planBorder(input) };
}

/**
 * Role values for one palette. `ref(path)` renders a reference to a palette token, e.g.
 * `{color.brand.500}` in the build or `var(--bx-color-brand-500)` at runtime.
 */
export function roleValues(
  name: string,
  plan: RolePlan,
  ref: (path: string) => string,
  darkText: string,
): Record<RoleName, string> {
  const c = (step: number): string => ref(`color.${name}.${step}`);
  const t = (step: number): string => ref(`color.${name}.transparent.${step}`);
  return {
    solid: c(plan.solid),
    'solid-hover': c(plan.solidHover),
    'solid-active': c(plan.solidActive),
    'on-solid': plan.on === 'light' ? '#ffffff' : darkText,
    fg: c(plan.fg),
    border: c(plan.border),
    subtle: t(200),
    'subtle-hover': t(300),
    'subtle-active': t(400),
    tint: t(100),
  };
}
