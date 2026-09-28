// Runtime validation of JSON inputs. The JSON Schemas in `schema/` serve editors; these checks give
// the build precise, file-aware errors without a schema-validator dependency.

import fs from 'node:fs';
import {
  assertCurve,
  assertHex,
  type PaletteCurve,
  type Shade,
} from '../color.ts';
import { isRecord, type Tree } from './tree.ts';

export class InputError extends Error {
  constructor(where: string, message: string) {
    super(`${where}: ${message}`);
    this.name = 'InputError';
  }
}

export function readJson(file: string): unknown {
  let text: string;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch (e) {
    throw new InputError(file, `cannot read file (${(e as Error).message})`);
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new InputError(file, `invalid JSON (${(e as Error).message})`);
  }
}

const NAME = /^[a-z][a-z0-9-]*$/;

export function expectRecord(
  v: unknown,
  where: string,
): Record<string, unknown> {
  if (!isRecord(v)) throw new InputError(where, 'expected an object');
  return v;
}

export function expectName(v: unknown, where: string): string {
  if (typeof v !== 'string' || !NAME.test(v))
    throw new InputError(
      where,
      `expected a lowercase name matching ${NAME}, got ${JSON.stringify(v)}`,
    );
  return v;
}

function expectString(v: unknown, where: string): string {
  if (typeof v === 'number') return String(v);
  if (typeof v !== 'string')
    throw new InputError(where, `expected a string, got ${JSON.stringify(v)}`);
  return v;
}

/** A nested object whose leaves are strings or numbers. Keys starting with `$` are metadata and ignored. */
export function expectTree(v: unknown, where: string): Tree {
  const rec = expectRecord(v, where);
  const out: Tree = {};
  for (const [k, val] of Object.entries(rec)) {
    if (k.startsWith('$')) continue;
    out[k] = isRecord(val)
      ? expectTree(val, `${where}.${k}`)
      : expectString(val, `${where}.${k}`);
  }
  return out;
}

export interface ContrastRule {
  fg: string;
  bg: string;
  min?: number;
}

export interface ThemeDef {
  name: string;
  extends: string[];
  colorScheme?: 'light' | 'dark';
  default: boolean;
  auto: boolean;
  seeds: Record<string, string>;
  palette: PaletteCurve;
  shades: Record<string, Partial<Record<Shade, string>>>;
  tokens: Tree;
  foundation: Tree;
  /** Overrides applied under `@media (pointer: coarse)`. */
  foundationCoarse: Tree;
  contrast: ContrastRule[];
  deprecated: Record<string, string>;
  source: 'builtin' | 'extra';
}

export function parseContrastRules(v: unknown, where: string): ContrastRule[] {
  if (v === undefined) return [];
  if (!Array.isArray(v)) throw new InputError(where, 'expected an array');
  return v.map((r, i) => {
    const rec = expectRecord(r, `${where}[${i}]`);
    const min = rec['min'];
    if (min !== undefined && typeof min !== 'number')
      throw new InputError(`${where}[${i}]`, '"min" must be a number');
    const rule: ContrastRule = {
      fg: expectString(rec['fg'], `${where}[${i}].fg`),
      bg: expectString(rec['bg'], `${where}[${i}].bg`),
    };
    if (min !== undefined) rule.min = min;
    return rule;
  });
}

export function parseDeprecated(
  v: unknown,
  where: string,
): Record<string, string> {
  if (v === undefined) return {};
  const rec = expectRecord(v, where);
  return Object.fromEntries(
    Object.entries(rec).map(([k, note]) => [
      k,
      expectString(note, `${where}.${k}`),
    ]),
  );
}

const THEME_KEYS = new Set([
  '$schema',
  '$deprecated',
  'name',
  'extends',
  'colorScheme',
  'default',
  'auto',
  'seeds',
  'palette',
  'shades',
  'tokens',
  'foundation',
  'contrast',
]);

function parseFoundationOverrides(
  v: unknown,
  where: string,
): { tree: Tree; coarse: Tree } {
  if (v === undefined) return { tree: {}, coarse: {} };
  const rec = expectRecord(v, where);
  return {
    tree: expectTree(rec, where),
    coarse:
      rec['$coarse'] === undefined
        ? {}
        : expectTree(rec['$coarse'], `${where}.$coarse`),
  };
}

export function parseTheme(
  raw: unknown,
  file: string,
  source: 'builtin' | 'extra',
): ThemeDef {
  const rec = expectRecord(raw, file);
  for (const k of Object.keys(rec))
    if (!THEME_KEYS.has(k))
      throw new InputError(file, `unknown property "${k}"`);
  const name = expectName(rec['name'], `${file} name`);
  const where = `${file} (${name})`;

  const ext = rec['extends'];
  const extendsList =
    ext === undefined
      ? []
      : Array.isArray(ext)
        ? ext.map((e, i) => expectName(e, `${where} extends[${i}]`))
        : [expectName(ext, `${where} extends`)];

  const scheme = rec['colorScheme'];
  if (scheme !== undefined && scheme !== 'light' && scheme !== 'dark')
    throw new InputError(
      where,
      `colorScheme must be "light" or "dark", got ${JSON.stringify(scheme)}`,
    );

  for (const flag of ['default', 'auto'] as const) {
    if (rec[flag] !== undefined && typeof rec[flag] !== 'boolean')
      throw new InputError(where, `"${flag}" must be a boolean`);
  }

  const seeds: Record<string, string> = {};
  for (const [n, v] of Object.entries(
    rec['seeds'] === undefined
      ? {}
      : expectRecord(rec['seeds'], `${where} seeds`),
  )) {
    expectName(n, `${where} seeds key`);
    seeds[n] = assertHex(v, `${where} seeds.${n}`);
  }

  const paletteRaw =
    rec['palette'] === undefined
      ? {}
      : expectRecord(rec['palette'], `${where} palette`);
  const palette: PaletteCurve = {};
  for (const [k, v] of Object.entries(paletteRaw)) {
    if (k !== 'lightest' && k !== 'darkest')
      throw new InputError(`${where} palette`, `unknown property "${k}"`);
    if (typeof v !== 'number')
      throw new InputError(`${where} palette.${k}`, 'expected a number');
    palette[k] = v;
  }
  assertCurve(palette, `${where} palette`);

  const shades: ThemeDef['shades'] = {};
  for (const [n, steps] of Object.entries(
    rec['shades'] === undefined
      ? {}
      : expectRecord(rec['shades'], `${where} shades`),
  )) {
    const out: Partial<Record<Shade, string>> = {};
    for (const [step, v] of Object.entries(
      expectRecord(steps, `${where} shades.${n}`),
    )) {
      if (!/^[1-9]00$/.test(step))
        throw new InputError(
          `${where} shades.${n}`,
          `step must be 100…900, got "${step}"`,
        );
      out[Number(step) as Shade] = assertHex(v, `${where} shades.${n}.${step}`);
    }
    shades[n] = out;
  }

  const foundation = parseFoundationOverrides(
    rec['foundation'],
    `${where} foundation`,
  );

  return {
    name,
    extends: extendsList,
    ...(scheme ? { colorScheme: scheme } : {}),
    default: rec['default'] === true,
    auto: rec['auto'] === true,
    seeds,
    palette,
    shades,
    tokens:
      rec['tokens'] === undefined
        ? {}
        : expectTree(rec['tokens'], `${where} tokens`),
    foundation: foundation.tree,
    foundationCoarse: foundation.coarse,
    contrast: parseContrastRules(rec['contrast'], `${where} contrast`),
    deprecated: parseDeprecated(rec['$deprecated'], `${where} $deprecated`),
    source,
  };
}
