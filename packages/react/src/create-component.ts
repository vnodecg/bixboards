'use client';
import * as React from 'react';

export interface PropDef {
  /** The element's JavaScript property. */
  name: string;
  /** The matching attribute, if any (used for server rendering). */
  attribute?: string;
}

export interface ComponentDef {
  tagName: string;
  displayName: string;
  properties: PropDef[];
  /** React prop name -> DOM event name, e.g. `onBxShow` -> `bx-show`. */
  events: Record<string, string>;
}

/**
 * Props a generated wrapper accepts: the element's own properties, its `on*` event props, and
 * ordinary DOM attributes (`className`, `style`, `id`, `slot`, `aria-*`, `data-*`, ...).
 */
export type WrapperProps<Properties, Events> = Properties &
  Events &
  Omit<React.HTMLAttributes<HTMLElement>, keyof Properties | keyof Events> & {
    children?: React.ReactNode;
    /** Assign the element to one of its parent's named slots. */
    slot?: string;
  };

const isServer = typeof document === 'undefined';

/**
 * Wraps a custom element as a React component (docs/features/_conventions.md §8).
 *
 * - **Properties, not attributes.** Declared element properties are assigned to the element in a
 *   layout effect (only when they changed), so objects/arrays (`options`, `columns`, `data`)
 *   arrive by reference and `false`/`0` are not lost to attribute coercion. This is why it works
 *   the same on React 18 (which only writes attributes on custom elements) and 19.
 * - **Events.** `onBxSelect` listens for `bx-select`; native `input`/`change` are bound the same
 *   way (`onInput`/`onChange`) and are consumed here so React does not bind them a second time.
 * - **Refs** forward to the element, so methods (`ref.current.show()`) work.
 * - **SSR.** On the server, primitive properties are also written as attributes so the
 *   declarative output is meaningful before the client takes over.
 *
 * It is a client component (`'use client'`) because of the effects; wrappers for purely static
 * elements can still be rendered from a server component as children of one.
 */
export function createComponent<E extends HTMLElement, P>(
  def: ComponentDef,
): React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<E>
> {
  const propNames = new Set(def.properties.map((p) => p.name));
  const eventProps = new Set(Object.keys(def.events));
  const attributeOf = new Map(def.properties.map((p) => [p.name, p.attribute]));

  const Component = React.forwardRef<E, P>(
    function BixboardsElement(props, forwardedRef) {
      const element = React.useRef<E | null>(null);
      const properties: Record<string, unknown> = {};
      const handlers: Record<string, ((event: Event) => void) | undefined> = {};
      const domProps: Record<string, unknown> = {};
      const attributes: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(
        props as Record<string, unknown>,
      )) {
        if (propNames.has(key)) {
          properties[key] = value;
          const attribute = attributeOf.get(key);
          if (isServer && attribute && value !== undefined && value !== null) {
            if (typeof value === 'boolean') {
              if (value) attributes[attribute] = '';
            } else if (typeof value === 'string' || typeof value === 'number') {
              attributes[attribute] = value;
            }
          }
        } else if (eventProps.has(key)) {
          handlers[key] = value as (event: Event) => void;
        } else if (key === 'className') {
          // React 18 renders `className` on a custom element as a literal "classname" attribute.
          domProps['class'] = value;
        } else {
          domProps[key] = value;
        }
      }

      React.useLayoutEffect(() => {
        const el = element.current as unknown as Record<string, unknown> | null;
        if (!el) return;
        for (const [name, value] of Object.entries(properties)) {
          if (value !== undefined && el[name] !== value) el[name] = value;
        }
      });

      // Keep one stable listener per event that always calls the latest handler.
      const latest = React.useRef(handlers);
      latest.current = handlers;
      React.useLayoutEffect(() => {
        const el = element.current;
        if (!el) return;
        const disposers = Object.entries(def.events).map(
          ([prop, eventName]) => {
            const listener = (event: Event): void =>
              latest.current[prop]?.(event);
            el.addEventListener(eventName, listener);
            return () => el.removeEventListener(eventName, listener);
          },
        );
        return () => disposers.forEach((dispose) => dispose());
      }, []);

      const setRef = React.useCallback(
        (node: E | null) => {
          element.current = node;
          if (typeof forwardedRef === 'function') forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        },
        [forwardedRef],
      );

      return React.createElement(def.tagName, {
        ...attributes,
        ...domProps,
        ref: setRef,
      });
    },
  );
  Component.displayName = def.displayName;
  return Component as unknown as React.ForwardRefExoticComponent<
    React.PropsWithoutRef<P> & React.RefAttributes<E>
  >;
}
