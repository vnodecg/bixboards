// CSS generation for foundation tokens and themes.

import type { ResolvedTheme } from './theme.ts';
import {
  flatten,
  indent,
  tokenName,
  toCssValue,
  type Ctx,
  type Tree,
} from './tree.ts';
import {
  InputError,
  expectRecord,
  expectTree,
  parseDeprecated,
} from './validate.ts';

export interface Foundation {
  tree: Tree;
  /** Overrides under `@media (pointer: coarse)`. */
  coarse: Tree;
  deprecated: Record<string, string>;
}

export function parseFoundation(raw: unknown, file: string): Foundation {
  const rec = expectRecord(raw, file);
  const scale = rec['scale'];
  if (scale === undefined) throw new InputError(file, 'missing "scale"');
  return {
    tree: expectTree(rec, file),
    coarse:
      rec['$coarse'] === undefined
        ? {}
        : expectTree(rec['$coarse'], `${file}.$coarse`),
    deprecated: parseDeprecated(rec['$deprecated'], `${file}.$deprecated`),
  };
}

/**
 * Derived tokens hold `var()` references, and custom properties resolve where they are declared.
 * To let `--bx-scale` change on a subtree, derived tokens are declared again on every element that
 * can carry a different scale: `.bx-scale`, `[data-bx-scale]` and any themed element that sets `scale`.
 */
const scaleScope = (prefixes: readonly string[]): string =>
  prefixes
    .flatMap((p) => [p, `${p} .bx-scale`, `${p} [data-bx-scale]`])
    .join(',\n');

const decl =
  (indentBy: string, ctx: Ctx, where: string) =>
  ([k, v]: [string, string]): string =>
    `${indentBy}${tokenName(k)}: ${toCssValue(v, ctx, `${where} ${k}`)};`;

export function foundationCss(f: Foundation, ctx: Ctx): string {
  const { scale, ...rest } = flatten(f.tree);
  const lines = Object.entries(rest).map(decl('  ', ctx, 'foundation'));
  const sels = ':root,\n.bx-scale,\n[data-bx-scale]';
  let css = `:root {\n  --bx-scale: ${scale};\n}\n\n${sels} {\n${lines.join('\n')}\n}\n`;
  const coarse = Object.entries(flatten(f.coarse)).map(
    decl('    ', ctx, 'foundation.$coarse'),
  );
  if (coarse.length)
    css += `\n@media (pointer: coarse) {\n${indent(sels)} {\n${coarse.join('\n')}\n  }\n}\n`;
  return css;
}

/**
 * Tokens for one theme. Foundation overrides are emitted when the theme defines them itself, or
 * when it inherits from a non-default theme (whose scope would not cover this one).
 */
export function themeCss(
  theme: ResolvedTheme,
  foundation: Foundation,
  ctx: Ctx,
): string {
  const parent =
    theme.parents.length === 1 ? (theme.parents[0] as ResolvedTheme) : null;
  const inherit = theme.parents.some((p) => !p.default);
  const has = (t: Tree): boolean => Object.keys(t).length > 0;
  const fnd = has(theme.own.foundation) || inherit ? theme.foundation : {};
  const coarse =
    has(theme.own.foundationCoarse) || inherit ? theme.foundationCoarse : {};

  const { scale, ...fndRest } = flatten(fnd);
  // A themed element that sets `scale` must recompute every token derived from it.
  const derived =
    scale === undefined
      ? fndRest
      : { ...withoutScale(flatten(foundation.tree)), ...fndRest };
  const fndLines = Object.entries(derived).map(
    decl('  ', ctx, `theme ${theme.name} foundation`),
  );
  const coarseLines = Object.entries(flatten(coarse)).map(
    decl('    ', ctx, `theme ${theme.name} foundation.$coarse`),
  );

  const entries = Object.entries(theme.flat).filter(
    ([k, v]) => !parent || parent.flat[k] !== v || v.includes('{'),
  );
  const bodyLines = [
    `  color-scheme: ${theme.colorScheme};`,
    ...entries.map(decl('  ', ctx, `theme ${theme.name}`)),
  ];
  if (scale !== undefined) bodyLines.push(`  --bx-scale: ${scale};`);
  const body = bodyLines.join('\n');

  const render = (prefixes: string[]): string => {
    let css = `${prefixes.join(',\n')} {\n${body}\n}\n`;
    const sels = scaleScope(prefixes);
    if (fndLines.length) css += `\n${sels} {\n${fndLines.join('\n')}\n}\n`;
    if (coarseLines.length)
      css += `\n@media (pointer: coarse) {\n${indent(sels)} {\n${coarseLines.join('\n')}\n  }\n}\n`;
    return css;
  };

  let css = render(
    theme.default
      ? [':root', `[data-theme="${theme.name}"]`]
      : [`[data-theme="${theme.name}"]`],
  );
  if (theme.auto) {
    css += `\n@media (prefers-color-scheme: ${theme.colorScheme}) {\n${indent(render([':root:not([data-theme])']))}}\n`;
  }
  return css;
}

function withoutScale(flat: Record<string, string>): Record<string, string> {
  const { scale: _scale, ...rest } = flat;
  return rest;
}
