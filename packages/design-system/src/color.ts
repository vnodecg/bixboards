// Small, dependency-free color helpers. Pure and browser-safe (no Node APIs).

export type Rgb = readonly [number, number, number];

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface PaletteCurve {
  /** Lightness (percent) of shade 100. Default 96. */
  lightest?: number;
  /** Lightness (percent) of shade 900. Default 18. */
  darkest?: number;
}

export const SHADES = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
export type Shade = (typeof SHADES)[number];
export type ShadeMap = Record<Shade, string>;

/** Alpha steps for `transparent.100…600`, derived from shade 500. */
export const TRANSPARENT_ALPHAS = [0.08, 0.16, 0.24, 0.32, 0.4, 0.48] as const;

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export const isHex = (value: unknown): value is string =>
  typeof value === 'string' && HEX.test(value);

/** Throws a descriptive error unless `value` is `#rgb` or `#rrggbb`; returns it lower-cased. */
export function assertHex(value: unknown, what: string): string {
  if (!isHex(value))
    throw new TypeError(
      `${what} must be a #rgb or #rrggbb hex color, got ${JSON.stringify(value)}`,
    );
  return value.toLowerCase();
}

export function hexToRgb(hex: string): Rgb {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(rgb: Rgb): string {
  return (
    '#' +
    rgb
      .map((v) =>
        Math.round(Math.min(255, Math.max(0, v)))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

export function rgbToHsl([r0, g0, b0]: Rgb): [number, number, number] {
  const r = r0 / 255;
  const g = g0 / 255;
  const b = b0 / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s * 100, l * 100];
}

export function hslToRgb([h, s0, l0]: readonly [number, number, number]): Rgb {
  const s = s0 / 100;
  const l = l0 / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rgb: [number, number, number];
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return [(rgb[0] + m) * 255, (rgb[1] + m) * 255, (rgb[2] + m) * 255];
}

/**
 * Parse `#rgb`, `#rrggbb`, `rgb()/rgba()` (comma syntax) or `transparent`.
 * Returns null for anything else (named colors, `var()`, `color-mix()`, …).
 */
export function parseColor(value: string): Rgba | null {
  const v = value.trim();
  if (v === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  if (isHex(v)) {
    const [r, g, b] = hexToRgb(v);
    return { r, g, b, a: 1 };
  }
  const m =
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(
      v,
    );
  if (!m) return null;
  return {
    r: Number(m[1]),
    g: Number(m[2]),
    b: Number(m[3]),
    a: m[4] === undefined ? 1 : Number(m[4]),
  };
}

/** Composite `top` over an opaque `bottom`. */
export function blend(top: Rgba, bottom: Rgba): Rgba {
  const a = top.a;
  return {
    r: top.r * a + bottom.r * (1 - a),
    g: top.g * a + bottom.g * (1 - a),
    b: top.b * a + bottom.b * (1 - a),
    a: 1,
  };
}

function channel(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Relative luminance per WCAG 2.x. */
export function luminance(c: Rgba | string): number {
  const { r, g, b } = typeof c === 'string' ? mustParse(c) : c;
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function mustParse(value: string): Rgba {
  const c = parseColor(value);
  if (!c) throw new TypeError(`Cannot parse color ${JSON.stringify(value)}`);
  return c;
}

/**
 * WCAG contrast ratio of `fg` on `bg`. Semi-transparent colors are composited: `bg` over `under`
 * (default white), then `fg` over the result.
 */
export function contrast(
  fg: Rgba | string,
  bg: Rgba | string,
  under: Rgba | string = '#ffffff',
): number {
  const under1 = typeof under === 'string' ? mustParse(under) : under;
  const bg0 = typeof bg === 'string' ? mustParse(bg) : bg;
  const fg0 = typeof fg === 'string' ? mustParse(fg) : fg;
  const bg1 = bg0.a < 1 ? blend(bg0, under1) : bg0;
  const fg1 = fg0.a < 1 ? blend(fg0, bg1) : fg0;
  const [hi, lo] = [luminance(fg1), luminance(bg1)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (hi + 0.05) / (lo + 0.05);
}

const clamp = (v: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, v));

/** Validate a curve; throws on out-of-range values. */
export function assertCurve(curve: PaletteCurve, what = 'palette'): void {
  const { lightest, darkest } = curve;
  if (lightest !== undefined && !(lightest >= 50 && lightest <= 100))
    throw new RangeError(
      `${what}.lightest must be between 50 and 100, got ${lightest}`,
    );
  if (darkest !== undefined && !(darkest >= 0 && darkest <= 50))
    throw new RangeError(
      `${what}.darkest must be between 0 and 50, got ${darkest}`,
    );
}

/**
 * Derive a 9-step palette (100 lightest … 900 darkest) from a seed color. The seed is shade 500.
 * Lightness is strictly decreasing for any seed: the curve ends are pushed away from the seed when
 * the seed is lighter/darker than the requested `lightest`/`darkest`.
 */
export function generateShades(
  seedHex: string,
  curve: PaletteCurve = {},
): ShadeMap {
  const seed = assertHex(seedHex, 'seed');
  assertCurve(curve);
  const [h, s, l] = rgbToHsl(hexToRgb(seed));
  const hi = clamp(Math.max(curve.lightest ?? 96, l + 4), 0, 99);
  const lo = clamp(Math.min(curve.darkest ?? 18, l - 4), 1, 100);
  const shades = {} as ShadeMap;
  SHADES.forEach((shade, i) => {
    if (shade === 500) {
      shades[500] = seed;
      return;
    }
    let light: number;
    let sat = s;
    if (shade < 500) {
      const t = i / 4;
      light = hi + (l - hi) * t;
      sat = s * (0.85 + 0.15 * t);
    } else {
      light = l + (lo - l) * ((i - 4) / 4);
    }
    shades[shade] = rgbToHex(hslToRgb([h, sat, light]));
  });
  return shades;
}

/** `rgba()` steps `100…600` of `colorHex` at {@link TRANSPARENT_ALPHAS}. */
export function transparentShades(colorHex: string): Record<number, string> {
  const [r, g, b] = hexToRgb(assertHex(colorHex, 'color'));
  const out: Record<number, string> = {};
  TRANSPARENT_ALPHAS.forEach(
    (a, i) => (out[(i + 1) * 100] = `rgba(${r}, ${g}, ${b}, ${a})`),
  );
  return out;
}
