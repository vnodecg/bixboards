// Token trees, flattening and reference resolution shared by the build.

export interface Tree {
  [key: string]: string | Tree;
}

export const isRecord = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

/** Deep-merge two token trees; `b` wins. */
export function deepMerge(a: Tree, b: Tree): Tree {
  const out: Tree = { ...a };
  for (const [k, bv] of Object.entries(b)) {
    const av = out[k];
    out[k] =
      typeof av === 'object' && typeof bv === 'object' ? deepMerge(av, bv) : bv;
  }
  return out;
}

/** `{ a: { b: '1' } }` → `{ 'a.b': '1' }`. Keys starting with `$` are metadata and skipped. */
export function flatten(tree: Tree, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(tree)) {
    if (k.startsWith('$')) continue;
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out[path] = v;
    else Object.assign(out, flatten(v, path));
  }
  return out;
}

/** `{ 'a.b': '1' }` → `{ a: { b: '1' } }`. */
export function unflatten(flat: Record<string, string>): Tree {
  const root: Tree = {};
  for (const [path, value] of Object.entries(flat)) {
    const parts = path.split('.');
    let node = root;
    for (const part of parts.slice(0, -1)) {
      const next = node[part];
      if (typeof next === 'object') node = next;
      else node = node[part] = {};
    }
    node[parts[parts.length - 1] as string] = value;
  }
  return root;
}

export const tokenName = (path: string): string =>
  `--bx-${path.replace(/\./g, '-')}`;

/** Shared state while compiling: known token names, deprecations, collected warnings. */
export interface Ctx {
  known: ReadonlySet<string>;
  deprecated: ReadonlyMap<string, string>;
  warnings: string[];
}

const REF = /\{([^}]+)\}/g;

/** Token references (`{a.b}`) contained in a value. */
export function refsIn(value: string): string[] {
  return [...value.matchAll(REF)].map((m) => m[1] as string);
}

/** Replace `{path.to.token}` with `var(--bx-path-to-token)`, validating that the token exists. */
export function toCssValue(value: string, ctx: Ctx, where: string): string {
  return value.replace(REF, (_, ref: string) => {
    if (!ctx.known.has(ref))
      throw new Error(`Unknown token reference {${ref}} in ${where}`);
    const note = ctx.deprecated.get(ref);
    if (note !== undefined) {
      const msg = `Deprecated token {${ref}} used in ${where}: ${note}`;
      if (!ctx.warnings.includes(msg)) ctx.warnings.push(msg);
    }
    return `var(${tokenName(ref)})`;
  });
}

/** Follow `{alias}` chains in a flat token map to a final non-alias value. */
export function resolveAlias(
  flat: Record<string, string>,
  value: string,
  depth = 0,
): string | undefined {
  if (depth > 16) return undefined;
  const m = /^\{([^}]+)\}$/.exec(value.trim());
  if (!m) return value;
  const next = flat[m[1] as string];
  return next === undefined ? undefined : resolveAlias(flat, next, depth + 1);
}

export const indent = (s: string, n = 2): string =>
  s.replace(/^(?=.)/gm, ' '.repeat(n));
