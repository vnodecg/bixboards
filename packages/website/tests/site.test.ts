import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  components,
  componentsByCategory,
  templates,
  features,
  elementCount,
} from '../src/data/site.ts';
import { manifest } from '../src/data/manifest.ts';
import { loaders } from '../src/data/loaders.ts';
import { iconNames, categoryIcons } from '../src/data/icons.ts';
import { categories } from '../src/data/registry.ts';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

test('component tags are unique and prefixed', () => {
  const tags = components.map((c) => c.tag);
  assert.equal(new Set(tags).size, tags.length);
  for (const t of tags) assert.match(t, /^bx-[a-z0-9-]+$/);
});

test('slugs are unique', () => {
  const slugs = components.map((c) => c.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test('every element in every package manifest has a docs page', () => {
  const documented = new Set(
    components.flatMap((c) => [c.tag, ...c.parts.map((p) => p.tag)]),
  );
  const missing = [...manifest().keys()].filter((t) => !documented.has(t));
  assert.deepEqual(missing, [], `elements without a docs page: ${missing}`);
  assert.equal(documented.size, manifest().size);
  assert.equal(elementCount, manifest().size);
});

test('a part is documented on exactly one page', () => {
  const seen = new Map<string, string>();
  for (const c of components)
    for (const p of c.parts) {
      assert.ok(
        !seen.has(p.tag),
        `${p.tag} listed under ${seen.get(p.tag)} and ${c.tag}`,
      );
      assert.ok(
        !components.some((o) => o.tag === p.tag),
        `${p.tag} is both a page and a part`,
      );
      seen.set(p.tag, c.tag);
    }
});

test('every element module has a loader', () => {
  const missing = [...manifest().values()]
    .map((e) => `${e.pkg}/${e.dir}`)
    .filter((k) => !(k in loaders));
  assert.deepEqual(missing, []);
  const known = new Set(
    [...manifest().values()].map((e) => `${e.pkg}/${e.dir}`),
  );
  assert.deepEqual(
    Object.keys(loaders).filter((k) => !known.has(k)),
    [],
    'stale loaders',
  );
});

test('every component has a summary and a demo that exercises it', () => {
  for (const c of components) {
    assert.ok(c.summary.length > 0, `${c.tag} has no summary in its JSDoc`);
    // Imperative-only components (bx-toast) are exercised from the demo script instead.
    const uses =
      c.demo.html.includes(`<${c.tag}`) || (c.demo.js ?? '').includes(c.slug);
    assert.ok(uses, `${c.tag} demo does not use it`);
  }
});

// Attributes any element accepts, plus ones the demos set on native elements via the same regex.
const GLOBAL_ATTRS = new Set([
  'id',
  'class',
  'style',
  'slot',
  'lang',
  'hidden',
  'title',
]);
test('demos only use attributes the element declares', () => {
  const problems: string[] = [];
  for (const c of components) {
    for (const m of c.demo.html.matchAll(
      /<(bx-[a-z-]+)((?:\s+[^<>]*?)?)\/?>/g,
    )) {
      const api = manifest().get(m[1]!);
      assert.ok(api, `${c.tag} demo uses unknown element ${m[1]}`);
      const known = new Set(
        api.props.flatMap((p) => (p.attribute ? [p.attribute] : [])),
      );
      const attrs = m[2]!.replace(/"[^"]*"|'[^']*'/g, '""');
      for (const a of attrs.matchAll(/\s([a-z][a-z0-9-]*)(?==|\s|$)/g)) {
        const name = a[1]!;
        if (
          GLOBAL_ATTRS.has(name) ||
          name.startsWith('aria-') ||
          name.startsWith('data-')
        )
          continue;
        if (!known.has(name)) problems.push(`${c.tag}: <${m[1]} ${name}>`);
      }
    }
  }
  assert.deepEqual(problems, []);
});

test('demo elements are all registered by the page (own tag, parts or siblings)', () => {
  const tags = new Set(manifest().keys());
  for (const c of components)
    for (const m of c.demo.html.matchAll(/<(bx-[a-z-]+)/g))
      assert.ok(
        tags.has(m[1]!),
        `${c.tag} demo uses ${m[1]}, which does not exist`,
      );
});

test('categories are non-empty and cover every component', () => {
  assert.equal(
    componentsByCategory.reduce((n, g) => n + g.items.length, 0),
    components.length,
  );
});

test('templates have unique slugs', () => {
  const slugs = templates.map((t) => t.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test('features are non-empty', () => {
  assert.ok(features.length >= 4);
});

function sources(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) sources(p, out);
    else if (/\.(astro|ts)$/.test(p)) out.push(p);
  }
  return out;
}

test('every Lucide icon the site uses is listed and bundled', () => {
  const listed = new Set<string>(iconNames);
  const bundle = readFileSync('src/scripts/icons.ts', 'utf8');
  for (const n of listed)
    assert.ok(
      bundle.includes(`lucide-static/icons/${n}.svg?raw`),
      `${n} is listed in data/icons.ts but not bundled in scripts/icons.ts`,
    );
  const used = new Set<string>();
  for (const f of sources('src'))
    for (const m of readFileSync(f, 'utf8').matchAll(
      /library="lucide"\s+name="([a-z0-9-]+)"/g,
    ))
      used.add(m[1]!);
  for (const n of used)
    assert.ok(listed.has(n), `page uses unlisted Lucide icon "${n}"`);
  for (const c of categories)
    assert.ok(listed.has(categoryIcons[c]!), `no icon for ${c}`);
  for (const x of [...features, ...templates])
    assert.ok(
      listed.has(x.icon),
      `${'title' in x ? x.title : x.name}: unlisted icon ${x.icon}`,
    );
});
