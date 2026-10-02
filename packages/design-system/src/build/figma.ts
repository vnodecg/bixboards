// Design Tokens Community Group (DTCG) exports.
//
// `tokens.dtcg.json` keeps tokens as authored (aliases and CSS expressions), organised as Tokens Studio
// "sets". `tokens.figma.json` additionally evaluates fluid foundation values to pixels at a reference
// viewport, because Figma variables cannot evaluate `calc(clamp(...))`.

import type { Foundation } from './css.ts';
import type { ResolvedTheme } from './theme.ts';
import { flatten } from './tree.ts';

// ---------------------------------------------------------- expression

interface Val {
  n: number;
  px: boolean;
}

interface EvalOptions {
  viewport: number;
  rem: number;
}

const TOKEN = /\s*(\{[^}]+\}|[a-z]+\(|[)(,+*/-]|\d*\.?\d+[a-z%]*)/y;

function tokenize(src: string): string[] {
  const out: string[] = [];
  TOKEN.lastIndex = 0;
  let pos = 0;
  while (pos < src.length) {
    TOKEN.lastIndex = pos;
    const m = TOKEN.exec(src);
    if (!m) {
      if (src.slice(pos).trim() === '') break;
      throw new SyntaxError(
        `Unexpected character at ${pos} in ${JSON.stringify(src)}`,
      );
    }
    out.push(m[1] as string);
    pos = TOKEN.lastIndex;
  }
  return out;
}

/**
 * Evaluate the CSS length subset used by the foundation (`calc`, `clamp`, `min`, `max`, `+ - * /`,
 * `px`/`rem`/`em`/`vi`/`vw`, and `{token}` references). Returns pixels, or a plain number for unitless values.
 */
export function evalLength(
  expr: string,
  lookup: (ref: string) => string | undefined,
  opts: EvalOptions,
  depth = 0,
): Val {
  if (depth > 32) throw new RangeError('Token reference nesting too deep');
  const toks = tokenize(expr);
  let i = 0;
  const peek = (): string | undefined => toks[i];
  const next = (): string => {
    const t = toks[i++];
    if (t === undefined)
      throw new SyntaxError(`Unexpected end of ${JSON.stringify(expr)}`);
    return t;
  };
  const same = (a: Val, b: Val): void => {
    if (a.px !== b.px)
      throw new TypeError(
        `Cannot mix lengths and numbers in ${JSON.stringify(expr)}`,
      );
  };

  const parseExpr = (): Val => {
    let v = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = next();
      const r = parseTerm();
      same(v, r);
      v = { n: op === '+' ? v.n + r.n : v.n - r.n, px: v.px };
    }
    return v;
  };
  const parseTerm = (): Val => {
    let v = parseFactor();
    while (peek() === '*' || peek() === '/') {
      const op = next();
      const r = parseFactor();
      if (op === '*') {
        if (v.px && r.px)
          throw new TypeError(
            `Cannot multiply two lengths in ${JSON.stringify(expr)}`,
          );
        v = { n: v.n * r.n, px: v.px || r.px };
      } else {
        if (r.px)
          throw new TypeError(
            `Cannot divide by a length in ${JSON.stringify(expr)}`,
          );
        v = { n: v.n / r.n, px: v.px };
      }
    }
    return v;
  };
  const args = (): Val[] => {
    const list = [parseExpr()];
    while (peek() === ',') (next(), list.push(parseExpr()));
    if (next() !== ')')
      throw new SyntaxError(`Expected ")" in ${JSON.stringify(expr)}`);
    return list;
  };
  const parseFactor = (): Val => {
    const t = next();
    if (t === '-') {
      const v = parseFactor();
      return { n: -v.n, px: v.px };
    }
    if (t === '(') return args()[0] as Val;
    if (t.endsWith('(')) {
      const fn = t.slice(0, -1);
      const a = args();
      if (fn === 'calc') return a[0] as Val;
      a.forEach((x) => same(a[0] as Val, x));
      if (fn === 'max')
        return { n: Math.max(...a.map((x) => x.n)), px: (a[0] as Val).px };
      if (fn === 'min')
        return { n: Math.min(...a.map((x) => x.n)), px: (a[0] as Val).px };
      if (fn === 'clamp' && a.length === 3)
        return {
          n: Math.min(
            Math.max((a[1] as Val).n, (a[0] as Val).n),
            (a[2] as Val).n,
          ),
          px: (a[0] as Val).px,
        };
      throw new SyntaxError(
        `Unsupported function ${fn}() in ${JSON.stringify(expr)}`,
      );
    }
    if (t.startsWith('{')) {
      const ref = t.slice(1, -1);
      const raw = lookup(ref);
      if (raw === undefined) throw new ReferenceError(`Unknown token {${ref}}`);
      return evalLength(raw, lookup, opts, depth + 1);
    }
    const m = /^(\d*\.?\d+)([a-z%]*)$/.exec(t);
    if (!m)
      throw new SyntaxError(
        `Unexpected ${JSON.stringify(t)} in ${JSON.stringify(expr)}`,
      );
    const n = Number(m[1]);
    switch (m[2]) {
      case '':
        return { n, px: false };
      case 'px':
        return { n, px: true };
      case 'rem':
      case 'em':
        return { n: n * opts.rem, px: true };
      case 'vi':
      case 'vw':
        return { n: (n * opts.viewport) / 100, px: true };
      default:
        throw new SyntaxError(
          `Unsupported unit "${m[2]}" in ${JSON.stringify(expr)}`,
        );
    }
  };

  const result = parseExpr();
  if (i !== toks.length)
    throw new SyntaxError(
      `Unexpected ${JSON.stringify(toks[i])} in ${JSON.stringify(expr)}`,
    );
  return result;
}

// ---------------------------------------------------------------- types

const DIMENSION_GROUPS =
  /^(space|radius|control|target|fluid|unit|font\.(xs|s|m|l|xl|2xl|3xl)|type\.[a-z]+\.[a-z]+\.size)\b/;
const COLOR_GROUPS = /^(color|surface|text|role|border|focus)\b/;
const DIMENSION_LITERAL = /^-?(\d*\.?\d+)(px|rem|em)$/;
const ALIAS = /^\{[^}]+\}$/;

interface Leaf {
  $value: string;
  $type?: string;
}

function typeOf(path: string, value: string): string | undefined {
  if (path.startsWith('type.')) {
    // type.<style>.family | type.<style>.<size>.{size,weight,leading,tracking}
    const prop = path.slice(path.lastIndexOf('.') + 1);
    if (prop === 'family') return 'fontFamily';
    if (prop === 'weight') return 'fontWeight';
    if (prop === 'leading') return 'number';
    return DIMENSION_LITERAL.test(value) ? 'dimension' : undefined;
  }
  if (path.startsWith('font.family')) return 'fontFamily';
  if (path.startsWith('font.weight')) return 'fontWeight';
  if (
    path.startsWith('font.leading') ||
    path === 'scale' ||
    path.startsWith('z.')
  )
    return 'number';
  if (path.startsWith('motion.duration')) return 'duration';
  if (path.startsWith('motion.easing')) return 'cubicBezier';
  if (path.startsWith('shadow')) return 'shadow';
  if (path.startsWith('border.width') || DIMENSION_GROUPS.test(path))
    return DIMENSION_LITERAL.test(value) ? 'dimension' : undefined;
  if (COLOR_GROUPS.test(path))
    return ALIAS.test(value) || /^(#|rgb)/.test(value) ? 'color' : undefined;
  return undefined;
}

function leaves(flat: Record<string, string>): Record<string, unknown> {
  const root: Record<string, unknown> = {};
  for (const [path, value] of Object.entries(flat)) {
    const type = typeOf(path, value);
    const leaf: Leaf = type
      ? { $value: value, $type: type }
      : { $value: value };
    const parts = path.split('.');
    let node = root;
    for (const part of parts.slice(0, -1))
      node = (node[part] ??= {}) as Record<string, unknown>;
    node[parts[parts.length - 1] as string] = leaf;
  }
  return root;
}

// -------------------------------------------------------------- exports

const themeOrder = (themes: ResolvedTheme[]): ResolvedTheme[] =>
  [...themes].sort((a, b) => Number(b.default) - Number(a.default));

const themeSet = (theme: ResolvedTheme): Record<string, unknown> =>
  leaves({ ...theme.flat, ...flatten(theme.foundation) });

/** Tokens as authored, organised as Tokens Studio sets: `foundation`, then one set per theme. */
export function toDtcg(
  foundation: Foundation,
  themes: ResolvedTheme[],
): Record<string, unknown> {
  const ordered = themeOrder(themes);
  const out: Record<string, unknown> = {
    foundation: leaves(flatten(foundation.tree)),
  };
  for (const t of ordered) out[t.name] = themeSet(t);
  out['$metadata'] = {
    tokenSetOrder: ['foundation', ...ordered.map((t) => t.name)],
  };
  return out;
}

export interface FigmaOptions {
  /** Reference viewport width in px used to resolve `vi` units. Default 1280. */
  viewport?: number;
  /** Root font size in px. Default 16. */
  rem?: number;
}

/**
 * Like {@link toDtcg}, but dimension tokens are evaluated to pixels at `viewport` and scale 1 (or the
 * theme's own scale), so Figma variables can consume them. Unevaluable values keep their expression
 * and are reported in `warnings`.
 */
export function toFigma(
  foundation: Foundation,
  themes: ResolvedTheme[],
  options: FigmaOptions = {},
): { tokens: Record<string, unknown>; warnings: string[] } {
  const opts = { viewport: options.viewport ?? 1280, rem: options.rem ?? 16 };
  const warnings: string[] = [];

  const resolveAll = (
    flat: Record<string, string>,
    where: string,
  ): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const [path, value] of Object.entries(flat)) {
      if (!DIMENSION_GROUPS.test(path) && !path.startsWith('border.width')) {
        out[path] = value;
        continue;
      }
      try {
        const v = evalLength(value, (ref) => flat[ref], opts);
        out[path] = v.px
          ? `${Math.round(v.n * 100) / 100}px`
          : String(Math.round(v.n * 100) / 100);
      } catch (e) {
        warnings.push(
          `figma export: ${where} ${path}: ${(e as Error).message}`,
        );
        out[path] = value;
      }
    }
    return out;
  };

  const ordered = themeOrder(themes);
  const out: Record<string, unknown> = {
    foundation: leaves(resolveAll(flatten(foundation.tree), 'foundation')),
  };
  for (const t of ordered) {
    const base = flatten(foundation.tree);
    const merged = { ...base, ...flatten(t.foundation) };
    const resolved = resolveAll(merged, t.name);
    // A theme that changes `scale` changes every derived dimension, not just the keys it overrides.
    const overridden = flatten(t.foundation);
    const keys =
      'scale' in overridden ? Object.keys(resolved) : Object.keys(overridden);
    const own = Object.fromEntries(keys.map((k) => [k, resolved[k] as string]));
    out[t.name] = leaves({ ...t.flat, ...own });
  }
  out['$metadata'] = {
    tokenSetOrder: ['foundation', ...ordered.map((t) => t.name)],
  };
  return { tokens: out, warnings };
}
