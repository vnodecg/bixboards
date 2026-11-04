import { loaders } from '../data/loaders.ts';

/**
 * Registers every `bx-*` element used on the page by importing only the modules it needs.
 * The tag → module map is rendered by the layout as JSON, so the browser bundle never has to
 * read the manifests.
 */
const keys: Record<string, string> = JSON.parse(
  document.getElementById('bx-tag-keys')?.textContent ?? '{}',
);

const needed = new Set<string>();
for (const el of document.querySelectorAll('*')) {
  const tag = el.localName;
  if (!tag.startsWith('bx-') || customElements.get(tag)) continue;
  const key = keys[tag];
  if (key) needed.add(key);
}
// Demos that only touch an element imperatively (bx-toast) declare it here.
for (const tag of (document.body.dataset.bxLoad ?? '').split(/\s+/)) {
  const key = keys[tag];
  if (key) needed.add(key);
}

await Promise.all([...needed].map((key) => loaders[key]!()));

/** Runs every demo's script once its elements are defined. */
for (const stage of document.querySelectorAll<HTMLElement>('[data-demo-js]')) {
  const tags = new Set(
    [...stage.querySelectorAll('*')]
      .map((el) => el.localName)
      .filter((t) => t.startsWith('bx-')),
  );
  await Promise.all([...tags].map((t) => customElements.whenDefined(t)));
  try {
    new Function('stage', stage.dataset.demoJs!)(stage);
  } catch (error) {
    console.error('demo script failed', stage.dataset.demoJs, error);
  }
}
