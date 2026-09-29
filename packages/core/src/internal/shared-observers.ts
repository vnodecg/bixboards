/**
 * One `IntersectionObserver` per distinct options set, shared across every component instance
 * that asks for it, per the performance contract (docs/features/_conventions.md §9: "shared
 * observers"). A dedicated observer per element does not scale once a page has hundreds of
 * lazy-loading components.
 */

type IntersectionCallback = (entry: IntersectionObserverEntry) => void;

interface PoolEntry {
  observer: IntersectionObserver;
  callbacks: Map<Element, IntersectionCallback>;
}

const pools = new Map<string, PoolEntry>();

function keyFor(options: IntersectionObserverInit): string {
  return `${String(options.root ?? '')}|${options.rootMargin ?? ''}|${String(options.threshold ?? '')}`;
}

/**
 * Observes `target` on the shared observer matching `options`, invoking `callback` on every
 * intersection change. Returns a function that stops observing `target` on that observer.
 *
 * Returns a no-op unobserve function when `IntersectionObserver` is unavailable (SSR, very old
 * browsers); callers should treat that as "assume visible" and load eagerly.
 */
export function observeIntersection(
  target: Element,
  callback: IntersectionCallback,
  options: IntersectionObserverInit = {},
): () => void {
  if (typeof IntersectionObserver === 'undefined') return () => {};

  const key = keyFor(options);
  let entry = pools.get(key);
  if (!entry) {
    const callbacks = new Map<Element, IntersectionCallback>();
    const observer = new IntersectionObserver((entries) => {
      for (const observerEntry of entries)
        callbacks.get(observerEntry.target)?.(observerEntry);
    }, options);
    entry = { observer, callbacks };
    pools.set(key, entry);
  }

  entry.callbacks.set(target, callback);
  entry.observer.observe(target);

  return () => {
    entry.observer.unobserve(target);
    entry.callbacks.delete(target);
  };
}
