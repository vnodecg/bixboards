import { unsafeCSS, type CSSResult } from 'lit';

/**
 * Typography contract (docs/design-system/foundations.md → Typography): every piece of text in a
 * component takes its look from a design-system text style, never from loose font tokens or literal
 * sizes. A style is `<group>-<size>` (`heading-s`, `label-m`, `body-m`, `caption-s`, `code-s`, …)
 * and resolves to the `--bx-type-<group>-<size>-{size,weight,leading,tracking}` and
 * `--bx-type-<group>-family` tokens, so a theme can retune a whole text type (say, a serif for every
 * heading) in one place.
 */
export type TextStyle =
  | 'display-l'
  | 'display-m'
  | 'heading-xl'
  | 'heading-l'
  | 'heading-m'
  | 'heading-s'
  | 'heading-xs'
  | 'body-l'
  | 'body-m'
  | 'body-s'
  | 'label-l'
  | 'label-m'
  | 'label-s'
  | 'label-xs'
  | 'caption-m'
  | 'caption-s'
  | 'field-l'
  | 'field-m'
  | 'field-s'
  | 'code-m'
  | 'code-s';

export type TextGroup =
  'display' | 'heading' | 'body' | 'label' | 'caption' | 'field' | 'code';

/** Per-property default overrides for text whose geometry is not a plain type step. */
export interface TextStyleOverrides {
  /** e.g. `40cqi` for an avatar's initials, which scale with their container. */
  size?: string;
  weight?: string;
  leading?: string;
  tracking?: string;
}

const cache = new Map<string, CSSResult>();

/**
 * The five font declarations of a text surface, each a public hook
 * (`<hook>-font-family|-font-size|-font-weight|-line-height|-letter-spacing`) defaulting to the
 * style's token. `hook` is the surface's hook prefix, for example `--bx-dialog-title`.
 */
export function textStyle(
  hook: string,
  style: TextStyle,
  overrides: TextStyleOverrides = {},
): CSSResult {
  const key = `${hook}|${style}|${JSON.stringify(overrides)}`;
  let css = cache.get(key);
  if (!css) {
    const group = style.slice(0, style.lastIndexOf('-'));
    const t = (prop: string) => `var(--bx-type-${style}-${prop})`;
    css = unsafeCSS(
      `font-family: var(${hook}-font-family, var(--bx-type-${group}-family));` +
        `font-size: var(${hook}-font-size, ${overrides.size ?? t('size')});` +
        `font-weight: var(${hook}-font-weight, ${overrides.weight ?? t('weight')});` +
        `line-height: var(${hook}-line-height, ${overrides.leading ?? t('leading')});` +
        `letter-spacing: var(${hook}-letter-spacing, ${overrides.tracking ?? t('tracking')});`,
    );
    cache.set(key, css);
  }
  return css;
}

/** Only the family of a text group, for hosts that leave size and weight to their context. */
export function textFamily(hook: string, group: TextGroup): CSSResult {
  const key = `${hook}|family|${group}`;
  let css = cache.get(key);
  if (!css) {
    css = unsafeCSS(
      `font-family: var(${hook}-font-family, var(--bx-type-${group}-family));`,
    );
    cache.set(key, css);
  }
  return css;
}
