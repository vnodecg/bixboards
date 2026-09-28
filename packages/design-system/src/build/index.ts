// Build API: JSON sources → CSS custom properties, and DTCG/Figma token files.
// Node-only (reads and writes files). For browser use, import the package root instead.
//
// The design system owns tokens and theming only. Components consume the generated custom
// properties (`--bx-*`) and define their own component-level properties on top.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  foundationCss,
  parseFoundation,
  themeCss,
  type Foundation,
} from './css.ts';
import { toDtcg, toFigma, type FigmaOptions } from './figma.ts';
import {
  contrastReport,
  contrastWarnings,
  loadThemes,
  resolveTheme,
  type ResolvedTheme,
} from './theme.ts';
import { flatten, indent, type Ctx } from './tree.ts';
import { InputError, readJson } from './validate.ts';

export { evalLength } from './figma.ts';
export { InputError } from './validate.ts';
export type { ResolvedTheme, ContrastEntry } from './theme.ts';

export interface BuildOptions {
  /** Directory with `foundation.json` and `themes/`. Defaults to the package's `data/`. */
  dataDir?: string;
  /** Extra theme files. A theme with `"default": true` replaces the built-in default. */
  extraThemes?: readonly string[];
  /** Options for the Figma export. */
  figma?: FigmaOptions;
}

export interface BuildResult {
  /** Relative path → file contents. */
  files: Record<string, string>;
  warnings: string[];
  themes: string[];
  palettes: string[];
}

/** Both `src/build` and `dist/build` sit two levels below the package root. */
export const defaultDataDir = (): string =>
  fileURLToPath(new URL('../../data', import.meta.url));

const jsonFiles = (dir: string): string[] =>
  fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((f) => f.endsWith('.json'))
        .sort()
        .map((f) => path.join(dir, f))
    : [];

export function build(options: BuildOptions = {}): BuildResult {
  const dataDir = options.dataDir ?? defaultDataDir();
  const foundationFile = path.join(dataDir, 'foundation.json');
  const foundation: Foundation = parseFoundation(
    readJson(foundationFile),
    foundationFile,
  );

  const defs = loadThemes(jsonFiles(path.join(dataDir, 'themes')), 'builtin');
  loadThemes(options.extraThemes ?? [], 'extra', defs);
  // A user theme with "default": true replaces the built-in default (white-label builds).
  if (Object.values(defs).some((t) => t.default && t.source === 'extra')) {
    for (const t of Object.values(defs))
      if (t.source !== 'extra') t.default = false;
  }

  const resolveAll = (): Record<string, ResolvedTheme> =>
    Object.fromEntries(
      Object.keys(defs).map((n) => [n, resolveTheme(n, defs)]),
    );
  let themes = resolveAll();
  const defaults = Object.values(themes).filter((t) => t.default);
  if (defaults.length !== 1)
    throw new InputError(
      'themes',
      `exactly one theme must set "default": true (found ${defaults.length}: ${defaults.map((t) => t.name).join(', ') || 'none'})`,
    );
  const defaultTheme = defaults[0] as ResolvedTheme;
  const palettes = Object.keys(defaultTheme.seeds);

  // Palettes exist in every theme: a theme that does not define (or inherit) a palette seed uses the
  // default theme's seed for it.
  let patched = false;
  for (const t of Object.values(themes)) {
    const missing = palettes.filter((p) => !(p in t.seeds));
    if (!missing.length) continue;
    const def = defs[t.name] as (typeof defs)[string];
    def.seeds = {
      ...Object.fromEntries(
        missing.map((p) => [p, defaultTheme.seeds[p] as string]),
      ),
      ...def.seeds,
    };
    patched = true;
  }
  if (patched) themes = resolveAll();
  const resolved = Object.values(themes);
  const defaultAfter = themes[defaultTheme.name] as ResolvedTheme;

  const foundationKeys = Object.keys(flatten(foundation.tree));
  const coarseKeys = Object.keys(flatten(foundation.coarse));
  const baseKeys = Object.keys(defaultAfter.flat);
  const warnings: string[] = [];
  for (const t of resolved) {
    const missing = baseKeys.filter((k) => !(k in t.flat));
    if (missing.length)
      throw new InputError(
        `theme "${t.name}"`,
        `missing tokens defined by the default theme: ${missing.join(', ')}`,
      );
    const unknown = [
      ...Object.keys(flatten(t.foundation)),
      ...Object.keys(flatten(t.foundationCoarse)),
    ].filter((k) => !foundationKeys.includes(k) && !coarseKeys.includes(k));
    if (unknown.length)
      throw new InputError(
        `theme "${t.name}"`,
        `overrides unknown foundation tokens: ${unknown.join(', ')}`,
      );
    warnings.push(...contrastWarnings(t));
  }

  const deprecated = new Map<string, string>(
    Object.entries(foundation.deprecated),
  );
  for (const t of resolved)
    for (const [k, v] of Object.entries(t.deprecated)) deprecated.set(k, v);
  const ctx: Ctx = {
    known: new Set([...foundationKeys, ...coarseKeys, ...baseKeys]),
    deprecated,
    warnings,
  };

  const ordered = [defaultAfter, ...resolved.filter((t) => t !== defaultAfter)];
  const tokensCss = [
    foundationCss(foundation, ctx),
    ...ordered.map((t) => themeCss(t, foundation, ctx)),
  ].join('\n');

  const figma = toFigma(foundation, resolved, options.figma);
  warnings.push(...figma.warnings);
  const json = (v: unknown): string => `${JSON.stringify(v, null, 2)}\n`;

  return {
    files: {
      'tokens.css': `@layer bx.tokens {\n${indent(tokensCss)}}\n`,
      'tokens.dtcg.json': json(toDtcg(foundation, resolved)),
      'tokens.figma.json': json(figma.tokens),
      'contrast.json': json(
        Object.fromEntries(resolved.map((t) => [t.name, contrastReport(t)])),
      ),
      ...Object.fromEntries(
        resolved.map((t) => [
          `themes/${t.name}.json`,
          json({ name: t.name, colorScheme: t.colorScheme, tokens: t.flat }),
        ]),
      ),
    },
    warnings: [...new Set(warnings)],
    themes: resolved.map((t) => t.name),
    palettes,
  };
}

/** Write build output under `outDir`, creating directories as needed. */
export function writeFiles(
  files: Record<string, string>,
  outDir: string,
): void {
  for (const [rel, content] of Object.entries(files)) {
    const file = path.join(outDir, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  }
}
