import { categories, registry, type Category, type Demo } from './registry.ts';
import { manifest, type ElementApi, type PackageName } from './manifest.ts';

export { categories };
export type { Category };

export interface ComponentEntry {
  /** Display name, e.g. "Button Group". */
  name: string;
  tag: string;
  /** URL segment under /components/. */
  slug: string;
  category: Category;
  pkg: PackageName;
  summary: string;
  demo: Demo;
  api: ElementApi;
  /** Sub-elements documented on the same page (e.g. `bx-tab` under `bx-tab-group`). */
  parts: ElementApi[];
}

const title = (tag: string) =>
  tag
    .replace(/^bx-/, '')
    .split('-')
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join(' ');

function build(): ComponentEntry[] {
  const api = manifest();
  const get = (tag: string): ElementApi => {
    const found = api.get(tag);
    if (!found)
      throw new Error(`registry lists ${tag}, which no manifest declares`);
    return found;
  };
  return registry.map((e) => {
    const main = get(e.tag);
    return {
      name: title(e.tag),
      tag: e.tag,
      slug: e.tag.replace(/^bx-/, ''),
      category: e.category,
      pkg: main.pkg,
      summary: main.summary,
      demo: e.demo,
      api: main,
      parts: e.parts.map(get),
    };
  });
}

/** Every documented component, in registry (category) order. */
export const components: ComponentEntry[] = build();

export const componentsByCategory = categories
  .map((category) => ({
    category,
    items: components.filter((c) => c.category === category),
  }))
  .filter((g) => g.items.length > 0);

/** Elements including sub-parts: what "coverage" counts. */
export const elementCount = components.reduce(
  (n, c) => n + 1 + c.parts.length,
  0,
);

export const templates = [
  {
    slug: 'dashboard',
    name: 'Dashboard',
    blurb: 'KPI tiles, activity feed and a data table.',
  },
  {
    slug: 'auth',
    name: 'Auth & settings',
    blurb: 'Sign in, sign up and account settings.',
  },
  {
    slug: 'landing',
    name: 'Landing page',
    blurb: 'Hero, features, pricing and call to action.',
  },
  {
    slug: 'board',
    name: 'Project board',
    blurb: 'Kanban columns with task cards.',
  },
] as const;

export const features = [
  {
    title: 'Framework agnostic',
    body: 'Standards-based custom elements built on Lit, with generated wrappers for React, Angular and Svelte.',
  },
  {
    title: 'Token driven theming',
    body: 'Semantic tokens compiled from JSON. Switch light, dark or your own brand with one attribute.',
  },
  {
    title: 'Fluid by default',
    body: 'One --bx-scale token drives spacing, type and radii. Components reflow with container queries, not breakpoints.',
  },
  {
    title: 'Accessible by default',
    body: 'Every component is tested with axe and keyboard navigation in a real browser.',
  },
  {
    title: 'Tree-shakeable',
    body: 'Import only the components you use, and register them under any tag prefix.',
  },
  {
    title: 'Built for big data',
    body: 'Virtualized data table, data list and tree stay fast with hundreds of thousands of rows.',
  },
  {
    title: 'Forms that behave',
    body: 'Form-associated elements with native constraint validation, reset and restore.',
  },
  {
    title: 'Fully specified',
    body: 'Each component has a written feature spec, a Storybook story and a browser test suite.',
  },
] as const;
