/**
 * Icon library registry (docs/features/core/icon.md FR-ICON-01/02/03).
 *
 * A library's `resolver` returns either raw SVG markup (used as-is, no network — this is how the
 * bundled `default` library stays offline-safe) or a URL/data URI, which is fetched. Every
 * resolved/fetched result is sanitised (`<script>`/`<foreignObject>` stripped) and cached by
 * `library::family::variant::name` (or `src::<url>` for the `src` property), de-duplicating
 * concurrent requests for the same icon across every `<bx-icon>` instance on the page.
 */

export interface IconLibrary {
  resolver: (
    name: string,
    options: { family?: string; variant?: string },
  ) => string | Promise<string>;
  /** Runs on the parsed `<svg>` before it is cached/rendered, e.g. to force `fill="currentColor"`. */
  mutator?: (svg: SVGElement) => void;
}

const URL_PATTERN = /^(?:https?:|data:|\.?\/)/;

const libraries = new Map<string, IconLibrary>();
const cache = new Map<string, Promise<string>>();

/**
 * Registers (or replaces) an icon library under `name`. Replacing a library invalidates only that
 * library's cached entries; other libraries are unaffected.
 */
export function registerIconLibrary(name: string, library: IconLibrary): void {
  libraries.set(name, library);
  const prefix = `${name}::`;
  for (const key of cache.keys()) if (key.startsWith(prefix)) cache.delete(key);
}

export function getIconLibrary(name: string): IconLibrary | undefined {
  return libraries.get(name);
}

function sanitizeAndSerialize(
  markup: string,
  mutator?: (svg: SVGElement) => void,
): string {
  const doc = new DOMParser().parseFromString(markup, 'image/svg+xml');
  const svg = doc.documentElement;
  if (svg.nodeName.toLowerCase() !== 'svg' || doc.querySelector('parsererror'))
    throw new Error('Invalid icon markup: expected a root <svg> element.');
  for (const node of svg.querySelectorAll('script, foreignObject'))
    node.remove();
  for (const el of [svg, ...svg.querySelectorAll('*')])
    for (const attr of [...el.attributes]) {
      const n = attr.name.toLowerCase();
      if (
        n.startsWith('on') ||
        ((n === 'href' || n === 'xlink:href') &&
          /^\s*javascript:/i.test(attr.value))
      )
        el.removeAttribute(attr.name);
    }
  // Icons with only width/height can't scale to `--bx-icon-size`; derive a viewBox.
  if (!svg.hasAttribute('viewBox')) {
    const w = parseFloat(svg.getAttribute('width') ?? '');
    const h = parseFloat(svg.getAttribute('height') ?? '');
    if (w > 0 && h > 0) svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  }
  mutator?.(svg as unknown as SVGElement);
  return new XMLSerializer().serializeToString(svg);
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to fetch icon "${url}": ${response.status}`);
  return response.text();
}

/** Resolves an icon by `library`/`name`/`family`/`variant`, cached and de-duplicated. */
export function resolveIcon(
  library: string,
  name: string,
  options: { family?: string; variant?: string } = {},
): Promise<string> {
  const cacheKey = `${library}::${options.family ?? ''}::${options.variant ?? ''}::${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const lib = libraries.get(library);
  if (!lib)
    return Promise.reject(
      new Error(`Icon library "${library}" is not registered.`),
    );

  const pending = (async () => {
    const resolved = await lib.resolver(name, options);
    const markup = URL_PATTERN.test(resolved)
      ? await fetchText(resolved)
      : resolved;
    return sanitizeAndSerialize(markup, lib.mutator);
  })();

  cache.set(cacheKey, pending);
  pending.catch(() => cache.delete(cacheKey));
  return pending;
}

/** Resolves an icon fetched directly from a URL (the `src` property), cached and de-duplicated. */
export function resolveIconSrc(src: string): Promise<string> {
  const cacheKey = `src::${src}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const pending = fetchText(src).then((markup) => sanitizeAndSerialize(markup));
  cache.set(cacheKey, pending);
  pending.catch(() => cache.delete(cacheKey));
  return pending;
}
