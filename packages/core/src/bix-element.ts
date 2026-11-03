import { LitElement, css } from 'lit';
import { defineCustomElement } from './internal/register.ts';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Base class for every Bixboards component (docs/features/_conventions.md).
 *
 * This is deliberately small: a shared `box-sizing` reset, one `tagName`/`define()` pattern for
 * registration so per-component boilerplate doesn't drift, and a `prefersReducedMotion` check for
 * components that autoplay. Everything else a component needs (variants, slots, parts, tokens)
 * stays in the component itself — the goal is a thin, ownable base you can subclass or read in
 * full, not a framework.
 */
export abstract class BixElement extends LitElement {
  /** Default custom-element tag name used by `define()`. Every subclass must set this. */
  static tagName = '';

  /**
   * Shared reset for every component's shadow root. Not applied automatically — compose it into
   * a subclass's own `static styles`, e.g. `static override styles = [BixElement.baseStyles, css\`...\`];`.
   */
  static baseStyles = css`
    :host {
      box-sizing: border-box;
    }
    :host *,
    :host *::before,
    :host *::after {
      box-sizing: inherit;
    }
  `;

  /**
   * Registers this class under `tagName` (default: the class's `static tagName`). Idempotent: a
   * second registration under the same name (HMR, a duplicate import) is skipped rather than
   * thrown, and registering under a different name gives the element a second, independent tag.
   *
   * A component's side-effecting entry point (`@bixboards/core/<component>`) calls this with the
   * default name; call it yourself with a custom name/prefix instead of importing that entry
   * point when the app needs one (docs/features/_conventions.md §1).
   */
  static define(tagName: string = this.tagName): void {
    if (!tagName)
      throw new Error(
        `${this.name} has no default tag name; pass one to define().`,
      );
    defineCustomElement(tagName, this as unknown as CustomElementConstructor);
  }

  /**
   * True when the user has requested reduced motion. Components that autoplay (carousel,
   * animated-image, animation) should start paused/still when this is true.
   */
  protected get prefersReducedMotion(): boolean {
    return (
      typeof matchMedia === 'function' &&
      matchMedia(REDUCED_MOTION_QUERY).matches
    );
  }
}
