import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Reads the Custom Elements Manifests that `pnpm generate` produces for each package. The site's
 * API tables come straight from them, so the docs cannot drift from the JSDoc.
 */

export type PackageName = 'core' | 'data-table' | 'data-list';
export const packages: PackageName[] = ['core', 'data-table', 'data-list'];

export interface Named {
  name: string;
  description?: string;
}
export interface Prop extends Named {
  attribute?: string;
  type?: string;
  default?: string;
}
export interface ElementApi {
  tag: string;
  pkg: PackageName;
  /** Directory under `src/` that the element's module lives in: its package subpath. */
  dir: string;
  summary: string;
  props: Prop[];
  methods: Named[];
  events: Named[];
  slots: Named[];
  cssParts: Named[];
  cssProps: Named[];
}

interface RawDecl {
  tagName?: string;
  description?: string;
  members?: Array<{
    kind: string;
    name: string;
    description?: string;
    attribute?: string;
    privacy?: string;
    static?: boolean;
    readonly?: boolean;
    type?: { text: string };
    default?: string;
  }>;
  events?: Named[];
  slots?: Named[];
  cssParts?: Named[];
  cssProperties?: Named[];
}

/**
 * First paragraph of the JSDoc (`<bx-x>` — summary), cleaned for display. The remaining
 * paragraphs are implementation notes, which stay in the spec rather than on the page.
 */
function summarize(raw = ''): string {
  const [first = ''] = raw.trim().split(/\n\s*\n/);
  return first
    .replace(/^`<[^>]+>`\s*[—-]\s*/, '')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\s*\((?:see )?docs\/[^)]*\)/g, '')
    .replace(/`/g, '')
    .replace(/\s+\./g, '.')
    .trim();
}

function load(): Map<string, ElementApi> {
  const out = new Map<string, ElementApi>();
  for (const pkg of packages) {
    const file = resolve(process.cwd(), '..', pkg, 'custom-elements.json');
    const manifest = JSON.parse(readFileSync(file, 'utf8')) as {
      modules: Array<{ path: string; declarations?: RawDecl[] }>;
    };
    for (const mod of manifest.modules) {
      for (const d of mod.declarations ?? []) {
        if (!d.tagName) continue;
        const members = d.members ?? [];
        out.set(d.tagName, {
          tag: d.tagName,
          pkg,
          dir: mod.path.split('/')[1]!,
          summary: summarize(d.description),
          props: members
            .filter(
              (m) =>
                m.kind === 'field' &&
                !m.static &&
                !m.privacy &&
                !m.name.startsWith('_'),
            )
            .map((m) => ({
              name: m.name,
              ...(m.attribute ? { attribute: m.attribute } : {}),
              ...(m.type ? { type: m.type.text } : {}),
              ...(m.default ? { default: m.default } : {}),
              ...(m.description ? { description: m.description } : {}),
            })),
          methods: members
            .filter(
              (m) =>
                m.kind === 'method' &&
                !m.static &&
                !m.privacy &&
                !m.name.startsWith('_'),
            )
            .map((m) => ({
              name: m.name,
              ...(m.description ? { description: m.description } : {}),
            })),
          events: d.events ?? [],
          slots: d.slots ?? [],
          cssParts: d.cssParts ?? [],
          cssProps: d.cssProperties ?? [],
        });
      }
    }
  }
  return out;
}

let cache: Map<string, ElementApi> | undefined;
/** Every custom element declared by the three packages, keyed by tag name. */
export function manifest(): Map<string, ElementApi> {
  return (cache ??= load());
}
