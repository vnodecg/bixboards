// Small runtime shared by the generated Svelte components (docs/features/_conventions.md §8).
// Svelte 5 already assigns properties to custom elements, but doing it explicitly here keeps the
// behavior identical for every property type (objects, arrays, false/0) and lets the generated
// components stay declarative.

type Props = Record<string, unknown>;

/** Assigns every defined prop to the element, skipping ones that already match. */
export function sync(element: HTMLElement, props: Props): void {
  const target = element as unknown as Props;
  for (const [name, value] of Object.entries(props)) {
    if (value !== undefined && target[name] !== value) target[name] = value;
  }
}

/** Attaches `bx-*` event handlers; returns the cleanup. Handlers may be undefined. */
export function on(
  element: HTMLElement,
  handlers: Record<string, ((event: CustomEvent) => void) | undefined>,
): () => void {
  const disposers = Object.entries(handlers)
    .filter(([, handler]) => typeof handler === 'function')
    .map(([name, handler]) => {
      const listener = (event: Event): void => handler!(event as CustomEvent);
      element.addEventListener(name, listener);
      return () => element.removeEventListener(name, listener);
    });
  return () => disposers.forEach((dispose) => dispose());
}

/**
 * Two-way bindings: when any of `events` fires, read the element's `property` and hand it to
 * `set` (which assigns the component's `$bindable` prop). Returns the cleanup.
 */
export function bind(
  element: HTMLElement,
  bindings: [
    property: string,
    events: string[],
    set: (value: unknown) => void,
  ][],
): () => void {
  const disposers = bindings.flatMap(([property, events, set]) =>
    events.map((name) => {
      const listener = (): void => set((element as unknown as Props)[property]);
      element.addEventListener(name, listener);
      return () => element.removeEventListener(name, listener);
    }),
  );
  return () => disposers.forEach((dispose) => dispose());
}
