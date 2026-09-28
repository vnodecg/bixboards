// Theme resolution: extends → merged seeds/tokens → palettes → derived roles → contrast report.

import {
  contrast,
  generateShades,
  parseColor,
  transparentShades,
  isHex,
  SHADES,
  type PaletteCurve,
  type ShadeMap,
} from '../color.ts';
import { ROLE_NAMES, planRoles, roleValues, type Scheme } from '../roles.ts';
import {
  deepMerge,
  flatten,
  isRecord,
  resolveAlias,
  type Tree,
} from './tree.ts';
import {
  InputError,
  parseTheme,
  readJson,
  type ContrastRule,
  type ThemeDef,
} from './validate.ts';

export interface ResolvedTheme {
  name: string;
  colorScheme: Scheme;
  default: boolean;
  auto: boolean;
  source: 'builtin' | 'extra';
  parents: ResolvedTheme[];
  seeds: Record<string, string>;
  palette: PaletteCurve;
  shades: ThemeDef['shades'];
  tokens: Tree;
  /** Foundation overrides including inherited ones. */
  foundation: Tree;
  foundationCoarse: Tree;
  /** Overrides defined by this theme itself (not inherited). */
  own: { foundation: Tree; foundationCoarse: Tree };
  contrast: ContrastRule[];
  deprecated: Record<string, string>;
  /** Every token of the theme: palettes, roles and semantic tokens (values may be `{aliases}`). */
  flat: Record<string, string>;
}

export function loadThemes(
  files: readonly string[],
  source: 'builtin' | 'extra',
  into: Record<string, ThemeDef> = {},
): Record<string, ThemeDef> {
  for (const file of files) {
    const def = parseTheme(readJson(file), file, source);
    if (def.name in into)
      throw new InputError(file, `theme "${def.name}" is already defined`);
    into[def.name] = def;
  }
  return into;
}

function mergeUnknown(a: unknown, b: unknown): unknown {
  if (isRecord(a) && isRecord(b)) {
    const out: Record<string, unknown> = { ...a };
    for (const [k, v] of Object.entries(b))
      out[k] = k in a ? mergeUnknown(a[k], v) : v;
    return out;
  }
  return b;
}

interface Layer {
  colorScheme: Scheme | undefined;
  seeds: Record<string, string>;
  palette: PaletteCurve;
  shades: ThemeDef['shades'];
  tokens: Tree;
  foundation: Tree;
  foundationCoarse: Tree;
  contrast: ContrastRule[];
  deprecated: Record<string, string>;
}

const EMPTY: Layer = {
  colorScheme: undefined,
  seeds: {},
  palette: {},
  shades: {},
  tokens: {},
  foundation: {},
  foundationCoarse: {},
  contrast: [],
  deprecated: {},
};

function applyLayer(base: Layer, l: Layer): Layer {
  return {
    colorScheme: l.colorScheme ?? base.colorScheme,
    seeds: { ...base.seeds, ...l.seeds },
    palette: { ...base.palette, ...l.palette },
    shades: mergeUnknown(base.shades, l.shades) as ThemeDef['shades'],
    tokens: deepMerge(base.tokens, l.tokens),
    foundation: deepMerge(base.foundation, l.foundation),
    foundationCoarse: deepMerge(base.foundationCoarse, l.foundationCoarse),
    contrast: [...base.contrast, ...l.contrast],
    deprecated: { ...base.deprecated, ...l.deprecated },
  };
}

const layerOf = (def: ThemeDef): Layer => ({
  colorScheme: def.colorScheme,
  seeds: def.seeds,
  palette: def.palette,
  shades: def.shades,
  tokens: def.tokens,
  foundation: def.foundation,
  foundationCoarse: def.foundationCoarse,
  contrast: def.contrast,
  deprecated: def.deprecated,
});

const FALLBACK_SURFACE: Record<Scheme, string> = {
  light: '#ffffff',
  dark: '#141a2d',
};
const FALLBACK_DARK_TEXT = '#141a2d';

/** Resolve a token to a hex color, following aliases; undefined if it is not a hex color. */
function hexOf(flat: Record<string, string>, key: string): string | undefined {
  const raw = flat[key];
  if (raw === undefined) return undefined;
  const v = resolveAlias(flat, raw);
  return v !== undefined && isHex(v) ? v : undefined;
}

/** Ancestors of `def` (excluding itself), oldest first, without duplicates. */
function linearize(
  def: ThemeDef,
  defs: Record<string, ThemeDef>,
  stack: readonly string[],
): ThemeDef[] {
  const out: ThemeDef[] = [];
  for (const parentName of def.extends) {
    const parent = defs[parentName];
    if (!parent)
      throw new InputError(
        `theme "${def.name}"`,
        `extends unknown theme "${parentName}"`,
      );
    if (stack.includes(parentName))
      throw new InputError(
        `theme "${def.name}"`,
        `circular extends: ${[...stack, parentName].join(' -> ')}`,
      );
    for (const d of [
      ...linearize(parent, defs, [...stack, parentName]),
      parent,
    ])
      if (!out.includes(d)) out.push(d);
  }
  return out;
}

export function resolveTheme(
  name: string,
  defs: Record<string, ThemeDef>,
  stack: readonly string[] = [],
): ResolvedTheme {
  const def = defs[name];
  if (!def)
    throw new InputError(
      `theme "${stack[stack.length - 1] ?? name}"`,
      `extends unknown theme "${name}"`,
    );
  if (stack.includes(name))
    throw new InputError(
      `theme "${name}"`,
      `circular extends: ${[...stack, name].join(' -> ')}`,
    );

  const parents = def.extends.map((p) =>
    resolveTheme(p, defs, [...stack, name]),
  );
  // Apply ancestors in linear order (each ancestor once, earlier `extends` entries first), so an
  // entry later in the list overrides earlier ones without re-applying what they inherited.
  const inherited = linearize(def, defs, [name]).reduce<Layer>(
    (acc, d) => applyLayer(acc, layerOf(d)),
    EMPTY,
  );
  const merged = applyLayer(inherited, layerOf(def));
  const colorScheme: Scheme = merged.colorScheme ?? 'light';

  // Palettes
  const flat: Record<string, string> = {};
  const steps: Record<string, ShadeMap> = {};
  for (const [n, seed] of Object.entries(merged.seeds)) {
    const s = {
      ...generateShades(seed, merged.palette),
      ...(merged.shades[n] ?? {}),
    } as ShadeMap;
    steps[n] = s;
    for (const shade of SHADES) flat[`color.${n}.${shade}`] = s[shade];
    for (const [k, v] of Object.entries(transparentShades(s[500])))
      flat[`color.${n}.transparent.${k}`] = v;
  }
  const withTokens = { ...flat, ...flatten(merged.tokens) };

  // Roles: derived from palettes and this theme's surfaces; explicit tokens win.
  const surfaces = ['surface.base', 'surface.subtle'].map(
    (k) => hexOf(withTokens, k) ?? FALLBACK_SURFACE[colorScheme],
  );
  const neutral = steps['neutral'];
  const darkText = neutral?.[900] ?? FALLBACK_DARK_TEXT;
  const darkRef = neutral ? '{color.neutral.900}' : FALLBACK_DARK_TEXT;
  const roles: Record<string, string> = {};
  for (const [n, shades] of Object.entries(steps)) {
    const plan = planRoles({ shades, surfaces, scheme: colorScheme, darkText });
    const values = roleValues(n, plan, (p) => `{${p}}`, darkRef);
    for (const role of ROLE_NAMES) roles[`role.${n}.${role}`] = values[role];
  }
  const all: Record<string, string> = {
    ...flat,
    ...roles,
    ...flatten(merged.tokens),
  };

  return {
    name,
    colorScheme,
    default: def.default,
    auto: def.auto,
    source: def.source,
    parents,
    seeds: merged.seeds,
    palette: merged.palette,
    shades: merged.shades,
    tokens: merged.tokens,
    foundation: merged.foundation,
    foundationCoarse: merged.foundationCoarse,
    own: { foundation: def.foundation, foundationCoarse: def.foundationCoarse },
    contrast: merged.contrast,
    deprecated: merged.deprecated,
    flat: all,
  };
}

/** Rules every theme must satisfy; skipped for tokens a theme does not define. */
const BASE_RULES: ContrastRule[] = [
  { fg: 'text.primary', bg: 'surface.base' },
  { fg: 'text.primary', bg: 'surface.subtle' },
  { fg: 'text.secondary', bg: 'surface.base' },
  { fg: 'text.secondary', bg: 'surface.subtle' },
  { fg: 'text.hint', bg: 'surface.base' },
  { fg: 'text.link', bg: 'surface.base' },
  { fg: 'text.inverse', bg: 'surface.inverse' },
  { fg: 'border.base', bg: 'surface.base', min: 3 },
  { fg: 'border.strong', bg: 'surface.base', min: 3 },
  { fg: 'focus.ring', bg: 'surface.base', min: 3 },
];

/** Rules for every palette's roles (also catches hand-written role overrides). */
function roleRules(theme: ResolvedTheme): ContrastRule[] {
  return Object.keys(theme.seeds).flatMap((n): ContrastRule[] => [
    { fg: `role.${n}.on-solid`, bg: `role.${n}.solid` },
    { fg: `role.${n}.on-solid`, bg: `role.${n}.solid-hover` },
    { fg: `role.${n}.on-solid`, bg: `role.${n}.solid-active` },
    { fg: `role.${n}.fg`, bg: 'surface.base' },
    { fg: `role.${n}.fg`, bg: 'surface.subtle' },
    { fg: `role.${n}.border`, bg: 'surface.base', min: 3 },
  ]);
}

export interface ContrastEntry {
  fg: string;
  bg: string;
  min: number;
  /** Undefined when a token could not be resolved to a color. */
  ratio: number | undefined;
  pass: boolean;
}

/**
 * Contrast of every documented token pair (built-in rules, every palette's roles, and the theme's
 * own `contrast` rules), with the pass/fail against each rule's minimum.
 */
export function contrastReport(theme: ResolvedTheme): ContrastEntry[] {
  const out: ContrastEntry[] = [];
  const rules = [...BASE_RULES, ...roleRules(theme), ...theme.contrast];
  const surface =
    hexOf(theme.flat, 'surface.base') ?? FALLBACK_SURFACE[theme.colorScheme];
  const seen = new Set<string>();
  for (const { fg, bg, min = 4.5 } of rules) {
    const key = `${fg}|${bg}|${min}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const rawFg = theme.flat[fg];
    const rawBg = theme.flat[bg];
    if (rawFg === undefined || rawBg === undefined) {
      // Built-in rules are best-effort; a user-declared rule on a missing token is reported.
      if (theme.contrast.some((r) => r.fg === fg && r.bg === bg))
        out.push({ fg, bg, min, ratio: undefined, pass: false });
      continue;
    }
    const f = parseColor(resolveAlias(theme.flat, rawFg) ?? '');
    const b = parseColor(resolveAlias(theme.flat, rawBg) ?? '');
    if (!f || !b) {
      out.push({ fg, bg, min, ratio: undefined, pass: false });
      continue;
    }
    const ratio = contrast(f, b, surface);
    out.push({ fg, bg, min, ratio, pass: ratio >= min });
  }
  return out;
}

export function contrastWarnings(theme: ResolvedTheme): string[] {
  return contrastReport(theme)
    .filter((e) => !e.pass)
    .map((e) =>
      e.ratio === undefined
        ? `[${theme.name}] contrast ${e.fg} on ${e.bg}: token missing or not a resolvable color`
        : `[${theme.name}] ${e.fg} on ${e.bg} = ${e.ratio.toFixed(2)}:1 (< ${e.min}:1)`,
    );
}
