import { css, html, nothing, type PropertyValues } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';
import { FormAssociatedMixin } from '../internal/form-associated.ts';
import { textStyle, textFamily } from '../internal/text-style.ts';

/**
 * Transparency checkerboard shared by the trigger and the opacity track. Both tones come from
 * tokens, so it themes with the surface; `--bx-color-picker-checker-*` retune it per instance.
 */
const CHECKERBOARD = css`
  --_checker: var(--bx-color-picker-checker-size, calc(var(--bx-unit) * 0.5));
  --_checker-color: var(
    --bx-color-picker-checker-color,
    var(--bx-surface-muted)
  );
  background-image:
    linear-gradient(45deg, var(--_checker-color) 25%, transparent 25%),
    linear-gradient(-45deg, var(--_checker-color) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--_checker-color) 75%),
    linear-gradient(-45deg, transparent 75%, var(--_checker-color) 75%);
  background-size: calc(var(--_checker) * 2) calc(var(--_checker) * 2);
  background-position:
    0 0,
    0 var(--_checker),
    var(--_checker) calc(var(--_checker) * -1),
    calc(var(--_checker) * -1) 0;
`;

type Format = 'hex' | 'rgb' | 'hsl' | 'hsv';
type Size = 'small' | 'medium' | 'large';

interface Hsva {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
  a: number; // 0-1
}

let nextId = 0;

// --- Pure color math (FR-COLOR-PICKER-06: pure, unit-tested, no external color library). ---

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function hsvToRgb(
  h: number,
  s: number,
  v: number,
): { r: number; g: number; b: number } {
  const sNorm = s / 100;
  const vNorm = v / 100;
  const c = vNorm * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vNorm - c;
  let [r, g, b] = [0, 0, 0];
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function rgbToHsv(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; v: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) h = 60 * (((gNorm - bNorm) / delta) % 6);
    else if (max === gNorm) h = 60 * ((bNorm - rNorm) / delta + 2);
    else h = 60 * ((rNorm - gNorm) / delta + 4);
  }
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : (delta / max) * 100;
  const v = max * 100;
  return { h, s, v };
}

function rgbToHsl(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; l: number } {
  const { h, s: hsvS, v } = rgbToHsv(r, g, b);
  const l = (v / 100) * (1 - hsvS / 100 / 2);
  const s = l === 0 || l === 1 ? 0 : ((v / 100 - l) / Math.min(l, 1 - l)) * 100;
  return { h, s, l: l * 100 };
}

function hslToRgb(
  h: number,
  s: number,
  l: number,
): { r: number; g: number; b: number } {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;
  let [r, g, b] = [0, 0, 0];
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function toHex2(n: number): string {
  return clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
}

/** Parses hex (#rgb/#rgba/#rrggbb/#rrggbbaa), rgb()/rgba() and hsl()/hsla() strings. Returns
 *  `null` for anything unparseable, rather than throwing — callers decide what "invalid" means. */
function parseColor(input: string): Hsva | null {
  const raw = input.trim();

  const hexMatch = /^#([0-9a-f]{3,8})$/i.exec(raw);
  if (hexMatch) {
    let hex = hexMatch[1]!;
    if (hex.length === 3 || hex.length === 4)
      hex = [...hex].map((c) => c + c).join('');
    if (hex.length !== 6 && hex.length !== 8) return null;
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    const a = hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return { ...rgbToHsv(r, g, b), a };
  }

  const rgbMatch =
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(
      raw,
    );
  if (rgbMatch) {
    const [, r, g, b, a] = rgbMatch;
    return {
      ...rgbToHsv(Number(r), Number(g), Number(b)),
      a: a === undefined ? 1 : clamp(Number(a), 0, 1),
    };
  }

  const hslMatch =
    /^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(
      raw,
    );
  if (hslMatch) {
    const [, h, s, l, a] = hslMatch;
    const { r, g, b } = hslToRgb(Number(h), Number(s), Number(l));
    return {
      ...rgbToHsv(r, g, b),
      a: a === undefined ? 1 : clamp(Number(a), 0, 1),
    };
  }

  return null;
}

function formatColor(
  color: Hsva,
  format: Format,
  opacity: boolean,
  uppercase: boolean,
): string {
  const { r, g, b } = hsvToRgb(color.h, color.s, color.v);
  const a = Math.round(color.a * 100) / 100;
  // Alpha is only written when opacity is enabled AND the color isn't fully opaque, so an
  // untouched color stays a clean `#rrggbb` / `rgb(...)`.
  const withAlpha = opacity && a < 1;
  let out: string;

  switch (format) {
    case 'rgb':
      out = withAlpha
        ? `rgba(${r}, ${g}, ${b}, ${a})`
        : `rgb(${r}, ${g}, ${b})`;
      break;
    case 'hsl': {
      const { h, s, l } = rgbToHsl(r, g, b);
      const [hr, sr, lr] = [Math.round(h), Math.round(s), Math.round(l)];
      out = withAlpha
        ? `hsla(${hr}, ${sr}%, ${lr}%, ${a})`
        : `hsl(${hr}, ${sr}%, ${lr}%)`;
      break;
    }
    case 'hsv': {
      const [hr, sr, vr] = [
        Math.round(color.h),
        Math.round(color.s),
        Math.round(color.v),
      ];
      out = withAlpha
        ? `hsva(${hr}, ${sr}%, ${vr}%, ${a})`
        : `hsv(${hr}, ${sr}%, ${vr}%)`;
      break;
    }
    default:
      out = `#${toHex2(r)}${toHex2(g)}${toHex2(b)}${withAlpha ? toHex2(a * 255) : ''}`;
  }
  return uppercase ? out.toUpperCase() : out;
}

/** Default preset palette, used when no `presets` array is passed. */
export const DEFAULT_COLOR_PRESETS: readonly string[] = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#d946ef',
  '#ec4899',
  '#64748b',
  '#000000',
  '#ffffff',
];

const FORMATS: readonly Format[] = ['hex', 'rgb', 'hsl', 'hsv'];

declare global {
  interface Window {
    EyeDropper?: new () => { open(): Promise<{ sRGBHex: string }> };
  }
}

/**
 * `<bx-color-picker>` — color selection with a saturation/value grid, hue/alpha sliders,
 * swatches, eyedropper and format switching, form-associated via `ElementInternals`
 * (docs/features/core/color-picker.md).
 *
 * The canonical internal state is HSV + alpha (`Hsva`), not the `format`-displayed string: the
 * saturation/value grid maps directly to `s`/`v`, and every other representation (hex/rgb/hsl) is
 * a pure, lossless-enough derivation from it (FR-COLOR-PICKER-06) computed on demand, not stored.
 * `value` (the form value and `getFormattedValue()`'s default) is that derivation in the current
 * `format`.
 *
 * FR-COLOR-PICKER-05's rAF-coalescing applies to the grid and slider `pointermove` handlers
 * specifically (dragging can fire many events per frame); clicks, keyboard steps and the text
 * input commit immediately, since there's nothing to coalesce there.
 *
 * Non-`inline` mode reuses `bx-popup` for the trigger→panel relationship, with click-outside and
 * Escape dismissal — the same pattern `bx-tooltip` wires up for its own `bx-popup`, plus the
 * outside-click handling a hover-driven tooltip never needed. `open` isn't in the spec's own
 * properties table but is required for this non-`inline` mode to have any state to toggle at all;
 * added the same way other components fill an analogous gap in their own specs.
 *
 * @fires input - Value changed by user (bubbles, composed).
 * @fires change - Committed change (bubbles, composed).
 * @fires bx-invalid - Constraint validation failed.
 * @fires bx-show - The panel opened (non-`inline` mode only).
 * @fires bx-hide - The panel closed (non-`inline` mode only).
 *
 * @slot label - Label content.
 *
 * @csspart base - The outer wrapper.
 * @csspart trigger - The swatch button that opens the panel (non-`inline` mode).
 * @csspart presets - The wrapper around preset swatches.
 * @csspart swatch - A single preset swatch button.
 * @csspart custom-toggle - The tile that shows/hides the custom picker (grid + hue slider).
 * @csspart custom - The custom picker section.
 * @csspart grid - The saturation/value `role="application"` area.
 * @csspart grid-handle - The grid's drag handle.
 * @csspart slider - Either hue/opacity slider track.
 * @csspart hue-slider - The hue slider track.
 * @csspart opacity-slider - The opacity slider track, present when `opacity` is set.
 * @csspart input - The text field showing/accepting the formatted value.
 * @csspart opacity-input - The numeric opacity (%) field, present unless `no-opacity` is set.
 * @csspart eyedropper-button - The eyedropper button, present when `window.EyeDropper` exists.
 * @csspart format-select - The format `<select>`, present unless `no-format-toggle` is set.
 *
 * @cssprop --bx-color-picker-grid-width - Saturation/value grid width. Default `calc(var(--bx-unit) * 16)`.
 * @cssprop --bx-color-picker-grid-height - Saturation/value grid height. Default `calc(var(--bx-unit) * 10)`.
 * @cssprop --bx-color-picker-swatch-radius - Corner radius of preset boxes, grid and trigger. Default `--bx-radius-m`.
 * @cssprop --bx-color-picker-swatch-size - Minimum preset box size. Default `calc(var(--bx-unit) * 1.75)`.
 * @cssprop --bx-color-picker-gap - Gap of the root surface. Default `var(--bx-space-s)`.
 * @cssprop --bx-color-picker-trigger-size - Size (width and height) of the `trigger` part. Default `var(--bx-target-min)`.
 * @cssprop --bx-color-picker-trigger-border-width - Border width of the `trigger` part. Default `var(--bx-border-width)`.
 * @cssprop --bx-color-picker-trigger-border-color - Border color of the `trigger` part. Default `var(--bx-border-subtle)`.
 * @cssprop --bx-color-picker-trigger-focus-ring-width - Focus ring width of the `trigger` part (focus state). Default `var(--bx-border-width-strong)`.
 * @cssprop --bx-color-picker-trigger-focus-ring-color - Focus ring color of the `trigger` part (focus state). Default `var(--bx-focus-ring)`.
 * @cssprop --bx-color-picker-trigger-focus-ring-offset - Focus ring offset of the `trigger` part (focus state). Default `var(--bx-focus-ring-offset)`.
 * @cssprop --bx-color-picker-panel-gap - Gap of the `panel` element. Default `var(--bx-space-s)`.
 * @cssprop --bx-color-picker-panel-padding - Padding of the `panel` element. Default `var(--bx-space-s)`.
 * @cssprop --bx-color-picker-grid-handle-size - Size (width and height) of the `grid-handle` part. Default `var(--bx-space-m)`.
 * @cssprop --bx-color-picker-grid-handle-border-width - Border width of the `grid-handle` part. Default `var(--bx-border-width-strong)`.
 * @cssprop --bx-color-picker-slider-height - Height of the `slider` part. Default `var(--bx-space-m)`.
 * @cssprop --bx-color-picker-slider-radius - Corner radius of the `slider` part. Default `var(--bx-radius-pill)`.
 * @cssprop --bx-color-picker-slider-handle-size - Size (width and height) of the `slider-handle` element. Default `var(--bx-space-m)`.
 * @cssprop --bx-color-picker-slider-handle-border-width - Border width of the `slider-handle` element. Default `var(--bx-border-width-strong)`.
 * @cssprop --bx-color-picker-row-gap - Gap of the `row` element. Default `var(--bx-space-xs)`.
 * @cssprop --bx-color-picker-opacity-input-padding - Padding of the `opacity-input` part. Default `var(--bx-space-2xs) var(--bx-space-xs)`.
 * @cssprop --bx-color-picker-opacity-input-border-width - Border width of the `opacity-input` part. Default `var(--bx-border-width)`.
 * @cssprop --bx-color-picker-opacity-input-border-color - Border color of the `opacity-input` part. Default `var(--bx-border-subtle)`.
 * @cssprop --bx-color-picker-opacity-input-radius - Corner radius of the `opacity-input` part. Default `var(--bx-radius-s)`.
 * @cssprop --bx-color-picker-eyedropper-button-size - Size (width and height) of the `eyedropper-button` part. Default `var(--bx-target-min)`.
 * @cssprop --bx-color-picker-eyedropper-button-radius - Corner radius of the `eyedropper-button` part. Default `var(--bx-radius-s)`.
 * @cssprop --bx-color-picker-eyedropper-button-fg - Text/icon color of the `eyedropper-button` part. Default `var(--bx-text-secondary)`.
 * @cssprop --bx-color-picker-eyedropper-button-hover-bg - Background of the `eyedropper-button` part (hover state). Default `var(--bx-surface-subtle)`.
 * @cssprop --bx-color-picker-eyedropper-button-focus-ring-width - Focus ring width of the `eyedropper-button` part (focus state). Default `var(--bx-border-width-strong)`.
 * @cssprop --bx-color-picker-eyedropper-button-focus-ring-color - Focus ring color of the `eyedropper-button` part (focus state). Default `var(--bx-focus-ring)`.
 * @cssprop --bx-color-picker-eyedropper-button-focus-ring-offset - Focus ring offset of the `eyedropper-button` part (focus state). Default `calc(var(--bx-focus-ring-offset) * -1)`.
 * @cssprop --bx-color-picker-presets-gap - Gap of the `presets` part. Default `var(--bx-space-xs)`.
 * @cssprop --bx-color-picker-custom-gap - Gap of the `custom` part. Default `var(--bx-space-s)`.
 * @cssprop --bx-color-picker-format-select-padding - Padding of the `format-select` part. Default `var(--bx-space-2xs) var(--bx-space-xs)`.
 * @cssprop --bx-color-picker-format-select-border-width - Border width of the `format-select` part. Default `var(--bx-border-width)`.
 * @cssprop --bx-color-picker-format-select-border-color - Border color of the `format-select` part. Default `var(--bx-border-subtle)`.
 * @cssprop --bx-color-picker-format-select-radius - Corner radius of the `format-select` part. Default `var(--bx-radius-s)`.
 * @cssprop --bx-color-picker-format-select-focus-ring-width - Focus ring width of the `format-select` part (focus state). Default `var(--bx-border-width-strong)`.
 * @cssprop --bx-color-picker-format-select-focus-ring-color - Focus ring color of the `format-select` part (focus state). Default `var(--bx-focus-ring)`.
 * @cssprop --bx-color-picker-format-select-focus-ring-offset - Focus ring offset of the `format-select` part (focus state). Default `var(--bx-focus-ring-offset)`.
 * @cssprop --bx-color-picker-opacity-input-width - Width of the `opacity-input` part. Default `calc(var(--bx-unit) * 4.5)`.
 * @cssprop --bx-color-picker-swatch-bg - Background of the `swatch` part. Default `conic-gradient(red, #ff0, #0f0, #0ff, #00f, #f0f, red)`.
 * @cssprop --bx-color-picker-custom-toggle-expanded-ring-width - Focus ring width of the `custom-toggle` element (expanded state). Default `var(--bx-border-width-strong)`.
 * @cssprop --bx-color-picker-custom-toggle-expanded-ring-color - Focus ring color of the `custom-toggle` element (expanded state). Default `var(--bx-focus-ring)`.
 * @cssprop --bx-color-picker-custom-toggle-expanded-outline-offset - Outline offset of the `custom-toggle` element (expanded state). Default `var(--bx-focus-ring-offset)`.
 * @cssprop --bx-color-picker-swatch-border-width - Border width of the `swatch` part. Default `var(--bx-border-width)`.
 * @cssprop --bx-color-picker-swatch-border-color - Border color of the `swatch` part. Default `var(--bx-border-subtle)`.
 * @cssprop --bx-color-picker-swatch-pressed-shadow - Box shadow of the `swatch` part (pressed state). Default `0 0 0 var(--bx-border-width-strong) var(--bx-surface-base), 0 0 0 calc(var(--bx-border-width-strong) * 2) var(--bx-focus-ring)`.
 * @cssprop --bx-color-picker-swatch-focus-ring-width - Focus ring width of the `swatch` part (focus state). Default `var(--bx-border-width-strong)`.
 * @cssprop --bx-color-picker-swatch-focus-ring-color - Focus ring color of the `swatch` part (focus state). Default `var(--bx-focus-ring)`.
 * @cssprop --bx-color-picker-swatch-focus-ring-offset - Focus ring offset of the `swatch` part (focus state). Default `var(--bx-focus-ring-offset)`.
 * @cssprop --bx-color-picker-grid-disabled-opacity - Opacity of the `grid` part (disabled state). Default `0.5`.
 * @cssprop --bx-color-picker-checker-size - Edge length of one transparency-checkerboard square. Default `calc(var(--bx-unit) * 0.5)`.
 * @cssprop --bx-color-picker-checker-color - Color of the darker checkerboard squares. Default `--bx-surface-muted`.
 * @cssprop --bx-color-picker-handle-border - Ring color of the grid and slider handles; stays light by default so the handle reads on any picked color. Default `white`.
 * @cssprop --bx-color-picker-handle-shadow - Outer outline color of the grid and slider handles. Default `rgb(0 0 0 / 30%)`.
 * @cssprop --bx-color-picker-font-family - Font family of the root surface. Default `var(--bx-type-body-family)`.
 * @cssprop --bx-color-picker-opacity-input-font-family - Font family of the `opacity-input` part (text style `body-s`). Default `var(--bx-type-body-family)`.
 * @cssprop --bx-color-picker-opacity-input-font-size - Font size of the `opacity-input` part (text style `body-s`). Default `var(--bx-type-body-s-size)`.
 * @cssprop --bx-color-picker-opacity-input-font-weight - Font weight of the `opacity-input` part (text style `body-s`). Default `var(--bx-type-body-s-weight)`.
 * @cssprop --bx-color-picker-opacity-input-line-height - Line height of the `opacity-input` part (text style `body-s`). Default `var(--bx-type-body-s-leading)`.
 * @cssprop --bx-color-picker-opacity-input-letter-spacing - Letter spacing of the `opacity-input` part (text style `body-s`). Default `var(--bx-type-body-s-tracking)`.
 * @cssprop --bx-color-picker-format-select-font-family - Font family of the `format-select` part (text style `body-s`). Default `var(--bx-type-body-family)`.
 * @cssprop --bx-color-picker-format-select-font-size - Font size of the `format-select` part (text style `body-s`). Default `var(--bx-type-body-s-size)`.
 * @cssprop --bx-color-picker-format-select-font-weight - Font weight of the `format-select` part (text style `body-s`). Default `var(--bx-type-body-s-weight)`.
 * @cssprop --bx-color-picker-format-select-line-height - Line height of the `format-select` part (text style `body-s`). Default `var(--bx-type-body-s-leading)`.
 * @cssprop --bx-color-picker-format-select-letter-spacing - Letter spacing of the `format-select` part (text style `body-s`). Default `var(--bx-type-body-s-tracking)`.
 */
export class BxColorPicker extends FormAssociatedMixin(BixElement) {
  static override tagName = 'bx-color-picker';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-block;
        ${textFamily('--bx-color-picker', 'body')}
      }

      .base {
        display: flex;
        flex-direction: column;
        gap: var(--bx-color-picker-gap, var(--bx-space-s));
      }

      .trigger {
        all: unset;
        box-sizing: border-box;
        display: inline-flex;
        inline-size: var(--bx-color-picker-trigger-size, var(--bx-target-min));
        block-size: var(--bx-color-picker-trigger-size, var(--bx-target-min));
        border-radius: var(--bx-color-picker-swatch-radius, var(--bx-radius-m));
        border: var(
            --bx-color-picker-trigger-border-width,
            var(--bx-border-width)
          )
          solid
          var(--bx-color-picker-trigger-border-color, var(--bx-border-subtle));
        ${CHECKERBOARD}
        cursor: pointer;
      }

      .trigger:focus-visible {
        outline: var(
            --bx-color-picker-trigger-focus-ring-width,
            var(--bx-border-width-strong)
          )
          solid
          var(--bx-color-picker-trigger-focus-ring-color, var(--bx-focus-ring));
        outline-offset: var(
          --bx-color-picker-trigger-focus-ring-offset,
          var(--bx-focus-ring-offset)
        );
      }

      .trigger-fill,
      .swatch-fill {
        inline-size: 100%;
        block-size: 100%;
        border-radius: inherit;
      }

      .panel {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: var(--bx-color-picker-panel-gap, var(--bx-space-s));
        padding: var(--bx-color-picker-panel-padding, var(--bx-space-s));
        inline-size: calc(
          var(--bx-color-picker-grid-width, calc(var(--bx-unit) * 16)) +
            var(--bx-space-s) * 2
        );
        max-inline-size: 100%;
      }

      .grid {
        position: relative;
        inline-size: 100%;
        block-size: var(
          --bx-color-picker-grid-height,
          calc(var(--bx-unit) * 10)
        );
        border-radius: var(--bx-color-picker-swatch-radius, var(--bx-radius-m));
        background-image:
          linear-gradient(to top, #000, transparent),
          /* ds-exempt: saturation/value plane is color-space data */
          linear-gradient(to right, #fff, transparent); /* ds-exempt: saturation/value plane is color-space data */
        cursor: crosshair;
        touch-action: none;
      }

      .grid-handle {
        position: absolute;
        inline-size: var(--bx-color-picker-grid-handle-size, var(--bx-space-m));
        block-size: var(--bx-color-picker-grid-handle-size, var(--bx-space-m));
        border: var(
            --bx-color-picker-grid-handle-border-width,
            var(--bx-border-width-strong)
          )
          solid var(--bx-color-picker-handle-border, white); /* ds-exempt: handle ring must stay legible on any picked color */
        border-radius: 50%;
        box-shadow: 0 0 0 var(--bx-border-width)
          var(--bx-color-picker-handle-shadow, rgb(0 0 0 / 30%)); /* ds-exempt: handle outline must stay legible on any picked color */
        transform: translate(-50%, -50%);
        pointer-events: none;
      }

      .slider {
        position: relative;
        inline-size: 100%;
        block-size: var(--bx-color-picker-slider-height, var(--bx-space-m));
        border-radius: var(
          --bx-color-picker-slider-radius,
          var(--bx-radius-pill)
        );
        touch-action: none;
      }

      .hue-slider {
        background: linear-gradient(
          to right,
          /* ds-exempt: hue track is color-space data, not theme */ red 0%,
          #ff0 17%,
          #0f0 33%,
          #0ff 50%,
          #00f 67%,
          #f0f 83%,
          red 100%
        );
      }

      .opacity-slider {
        ${CHECKERBOARD}
      }

      .opacity-slider-fill {
        position: absolute;
        inset: 0;
        border-radius: inherit;
      }

      .slider-handle {
        position: absolute;
        inset-block-start: 50%;
        inline-size: var(
          --bx-color-picker-slider-handle-size,
          var(--bx-space-m)
        );
        block-size: var(
          --bx-color-picker-slider-handle-size,
          var(--bx-space-m)
        );
        border: var(
            --bx-color-picker-slider-handle-border-width,
            var(--bx-border-width-strong)
          )
          solid var(--bx-color-picker-handle-border, white); /* ds-exempt: handle ring must stay legible on any picked color */
        border-radius: 50%;
        box-shadow: 0 0 0 var(--bx-border-width)
          var(--bx-color-picker-handle-shadow, rgb(0 0 0 / 30%)); /* ds-exempt: handle outline must stay legible on any picked color */
        transform: translate(-50%, -50%);
        pointer-events: none;
      }

      .row {
        display: flex;
        align-items: center;
        gap: var(--bx-color-picker-row-gap, var(--bx-space-xs));
      }

      .input {
        all: unset;
        box-sizing: border-box;
        flex: 1;
        min-inline-size: 0;
        padding: var(
          --bx-color-picker-opacity-input-padding,
          var(--bx-space-2xs) var(--bx-space-xs)
        );
        border: var(
            --bx-color-picker-opacity-input-border-width,
            var(--bx-border-width)
          )
          solid
          var(
            --bx-color-picker-opacity-input-border-color,
            var(--bx-border-subtle)
          );
        border-radius: var(
          --bx-color-picker-opacity-input-radius,
          var(--bx-radius-s)
        );
        font: inherit;

        ${textStyle('--bx-color-picker-opacity-input', 'body-s')}
      }

      .icon-button {
        all: unset;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: var(
          --bx-color-picker-eyedropper-button-size,
          var(--bx-target-min)
        );
        block-size: var(
          --bx-color-picker-eyedropper-button-size,
          var(--bx-target-min)
        );
        border-radius: var(
          --bx-color-picker-eyedropper-button-radius,
          var(--bx-radius-s)
        );
        color: var(
          --bx-color-picker-eyedropper-button-fg,
          var(--bx-text-secondary)
        );
        cursor: pointer;
      }

      .icon-button:hover {
        background: var(
          --bx-color-picker-eyedropper-button-hover-bg,
          var(--bx-surface-subtle)
        );
      }

      .icon-button:focus-visible {
        outline: var(
            --bx-color-picker-eyedropper-button-focus-ring-width,
            var(--bx-border-width-strong)
          )
          solid
          var(
            --bx-color-picker-eyedropper-button-focus-ring-color,
            var(--bx-focus-ring)
          );
        outline-offset: var(
          --bx-color-picker-eyedropper-button-focus-ring-offset,
          calc(var(--bx-focus-ring-offset) * -1)
        );
      }

      .presets {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: var(--bx-color-picker-presets-gap, var(--bx-space-xs));
      }

      .custom {
        display: flex;
        flex-direction: column;
        gap: var(--bx-color-picker-custom-gap, var(--bx-space-s));
      }

      .select {
        box-sizing: border-box;
        min-block-size: 0;
        padding: var(
          --bx-color-picker-format-select-padding,
          var(--bx-space-2xs) var(--bx-space-xs)
        );
        border: var(
            --bx-color-picker-format-select-border-width,
            var(--bx-border-width)
          )
          solid
          var(
            --bx-color-picker-format-select-border-color,
            var(--bx-border-subtle)
          );
        border-radius: var(
          --bx-color-picker-format-select-radius,
          var(--bx-radius-s)
        );
        background: transparent;
        color: inherit;
        font: inherit;

        ${textStyle('--bx-color-picker-format-select', 'body-s')}

        cursor: pointer;
      }

      .select:focus-visible,
      .input:focus-visible {
        outline: var(
            --bx-color-picker-format-select-focus-ring-width,
            var(--bx-border-width-strong)
          )
          solid
          var(
            --bx-color-picker-format-select-focus-ring-color,
            var(--bx-focus-ring)
          );
        outline-offset: var(
          --bx-color-picker-format-select-focus-ring-offset,
          var(--bx-focus-ring-offset)
        );
      }

      .opacity-input {
        inline-size: var(
          --bx-color-picker-opacity-input-width,
          calc(var(--bx-unit) * 4.5)
        );
        flex: none;
      }

      .swatch.custom-toggle {
        background: var(
          --bx-color-picker-swatch-bg,
          conic-gradient(red, #ff0, #0f0, #0ff, #00f, #f0f, red)
        ); /* ds-exempt: hue wheel is color-space data, not theme */
      }

      .custom-toggle[aria-expanded='true'] {
        outline: var(
            --bx-color-picker-custom-toggle-expanded-ring-width,
            var(--bx-border-width-strong)
          )
          solid
          var(
            --bx-color-picker-custom-toggle-expanded-ring-color,
            var(--bx-focus-ring)
          );
        outline-offset: var(
          --bx-color-picker-custom-toggle-expanded-outline-offset,
          var(--bx-focus-ring-offset)
        );
      }

      .swatch {
        all: unset;
        box-sizing: border-box;
        inline-size: 100%;
        aspect-ratio: 1;
        min-block-size: var(
          --bx-color-picker-swatch-size,
          calc(var(--bx-unit) * 1.75)
        );
        border-radius: var(--bx-color-picker-swatch-radius, var(--bx-radius-m));
        border: var(
            --bx-color-picker-swatch-border-width,
            var(--bx-border-width)
          )
          solid
          var(--bx-color-picker-swatch-border-color, var(--bx-border-subtle));
        background-clip: padding-box;
        cursor: pointer;
      }

      .swatch[aria-pressed='true'] {
        box-shadow: var(
          --bx-color-picker-swatch-pressed-shadow,
          0 0 0 var(--bx-border-width-strong) var(--bx-surface-base),
          0 0 0 calc(var(--bx-border-width-strong) * 2) var(--bx-focus-ring)
        );
      }

      .swatch:focus-visible {
        outline: var(
            --bx-color-picker-swatch-focus-ring-width,
            var(--bx-border-width-strong)
          )
          solid
          var(--bx-color-picker-swatch-focus-ring-color, var(--bx-focus-ring));
        outline-offset: var(
          --bx-color-picker-swatch-focus-ring-offset,
          var(--bx-focus-ring-offset)
        );
      }

      :host([disabled]) .grid,
      :host([disabled]) .slider,
      :host([disabled]) .trigger,
      :host([disabled]) .swatch {
        pointer-events: none;
        opacity: var(--bx-color-picker-grid-disabled-opacity, 0.5);
      }
    `,
  ];

  static override properties = {
    value: { type: String },
    format: { type: String },
    noOpacity: { type: Boolean, reflect: true, attribute: 'no-opacity' },
    uppercase: { type: Boolean, reflect: true },
    presets: { attribute: false },
    _customOpen: { state: true },
    inline: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
    noFormatToggle: { type: Boolean, attribute: 'no-format-toggle' },
    name: { type: String },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    open: { type: Boolean, reflect: true },
    label: { type: String },
  };

  declare value: string;
  declare format: Format;
  /** Hides the opacity slider/field and never writes alpha into `value`. */
  declare noOpacity: boolean;
  declare uppercase: boolean;
  /** Preset colors shown as swatches. Any parseable color string. `[]` hides the row. */
  declare presets: readonly string[];
  /** @internal */
  declare _customOpen: boolean;
  declare inline: boolean;
  declare size: Size;
  declare noFormatToggle: boolean;
  declare name: string;
  declare disabled: boolean;
  declare required: boolean;
  declare open: boolean;
  declare label: string;

  #color: Hsva = { h: 0, s: 0, v: 100, a: 1 };
  #hasInteracted = false;
  #defaultValue = '';
  #gridRafId = 0;
  #hueRafId = 0;
  #opacityRafId = 0;
  #gridId = `bx-color-picker-grid-${nextId++}`;
  #triggerRef = createRef<HTMLButtonElement>();
  #gridRef = createRef<HTMLDivElement>();
  #hueRef = createRef<HTMLDivElement>();
  #opacityRef = createRef<HTMLDivElement>();

  constructor() {
    super();
    this.value = '';
    this.format = 'hex';
    this.noOpacity = false;
    this.uppercase = false;
    this.presets = DEFAULT_COLOR_PRESETS;
    this._customOpen = false;
    this.inline = false;
    this.size = 'medium';
    this.noFormatToggle = false;
    this.name = '';
    this.disabled = false;
    this.required = false;
    this.open = false;
    this.label = '';

    this.addEventListener('keydown', this.#handleHostKeydown);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener(
      'pointerdown',
      this.#handleOutsidePointerDown,
      true,
    );
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener(
      'pointerdown',
      this.#handleOutsidePointerDown,
      true,
    );
    if (this.#gridRafId) cancelAnimationFrame(this.#gridRafId);
    if (this.#hueRafId) cancelAnimationFrame(this.#hueRafId);
    if (this.#opacityRafId) cancelAnimationFrame(this.#opacityRafId);
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    // Keep the canonical HSVA in sync when `value` is set from outside (attribute, property, form
    // restore). Runs before render, so the first paint already reflects the initial value.
    if (changed.has('value') && this.value) {
      const parsed = parseColor(this.value);
      const current = formatColor(
        this.#color,
        this.format,
        !this.noOpacity,
        this.uppercase,
      );
      if (parsed && this.value !== current) {
        this.#color = parsed;
        // Canonicalize into the current `format`.
        this.value = formatColor(
          parsed,
          this.format,
          !this.noOpacity,
          this.uppercase,
        );
      }
    }
  }

  protected override firstUpdated(): void {
    this.#defaultValue = this.value;
    this.#syncValidity();
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('value')) this.internals.setFormValue(this.value || null);
    if (changed.has('required')) this.#syncValidity();
  }

  #syncValidity(): void {
    const missing = this.required && !this.value;
    this.internals.setValidity(
      missing ? { valueMissing: true } : {},
      missing ? 'Please choose a color.' : undefined,
    );
    if (this.#hasInteracted) {
      this.toggleAttribute('data-user-valid', !missing);
      this.toggleAttribute('data-user-invalid', missing);
    }
  }

  formResetCallback(): void {
    this.value = this.#defaultValue;
    const parsed = parseColor(this.value);
    if (parsed) this.#color = parsed;
    this.#hasInteracted = false;
    this.removeAttribute('data-user-valid');
    this.removeAttribute('data-user-invalid');
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    if (typeof state !== 'string') return;
    this.value = state;
    const parsed = parseColor(state);
    if (parsed) this.#color = parsed;
  }

  #commit(next: Hsva, dispatchChange: boolean): void {
    this.#color = next;
    const formatted = formatColor(
      next,
      this.format,
      !this.noOpacity,
      this.uppercase,
    );
    const changed = formatted !== this.value;
    this.value = formatted;
    this.#hasInteracted = true;
    if (changed)
      this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    if (dispatchChange) {
      this.dispatchEvent(
        new Event('change', { bubbles: true, composed: true }),
      );
      if (!this.internals.checkValidity())
        this.dispatchEvent(
          new CustomEvent('bx-invalid', { bubbles: true, composed: true }),
        );
    }
    this.requestUpdate();
  }

  /** Returns `value` reformatted in `format` without changing the picker's own `format`/`value`. */
  getFormattedValue(format: Format): string {
    return formatColor(this.#color, format, !this.noOpacity, this.uppercase);
  }

  override reportValidity(): boolean {
    return this.internals.reportValidity();
  }

  // --- Saturation/value grid. ---

  #setFromGridPoint(clientX: number, clientY: number): void {
    const grid = this.#gridRef.value;
    if (!grid) return;
    const rect = grid.getBoundingClientRect();
    const s = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
    const v = clamp(100 - ((clientY - rect.top) / rect.height) * 100, 0, 100);
    this.#commit({ ...this.#color, s, v }, false);
  }

  #handleGridPointerDown = (event: PointerEvent): void => {
    if (this.disabled) return;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.#setFromGridPoint(event.clientX, event.clientY);
  };

  #handleGridPointerMove = (event: PointerEvent): void => {
    if (event.buttons === 0 || this.disabled) return;
    if (this.#gridRafId) return;
    this.#gridRafId = requestAnimationFrame(() => {
      this.#gridRafId = 0;
      this.#setFromGridPoint(event.clientX, event.clientY);
    });
  };

  #handleGridPointerUp = (): void => this.#commit(this.#color, true);

  #handleGridKeydown = (event: KeyboardEvent): void => {
    if (this.disabled) return;
    let ds = 0;
    let dv = 0;
    switch (event.key) {
      case 'ArrowLeft':
        ds = -1;
        break;
      case 'ArrowRight':
        ds = 1;
        break;
      case 'ArrowUp':
        dv = 1;
        break;
      case 'ArrowDown':
        dv = -1;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.#commit(
      {
        ...this.#color,
        s: clamp(this.#color.s + ds, 0, 100),
        v: clamp(this.#color.v + dv, 0, 100),
      },
      true,
    );
  };

  // --- Hue slider. ---

  #setHueFromPoint(clientX: number): void {
    const track = this.#hueRef.value;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const h = clamp(((clientX - rect.left) / rect.width) * 360, 0, 360);
    this.#commit({ ...this.#color, h }, false);
  }

  #handleHuePointerDown = (event: PointerEvent): void => {
    if (this.disabled) return;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.#setHueFromPoint(event.clientX);
  };

  #handleHuePointerMove = (event: PointerEvent): void => {
    if (event.buttons === 0 || this.disabled) return;
    if (this.#hueRafId) return;
    this.#hueRafId = requestAnimationFrame(() => {
      this.#hueRafId = 0;
      this.#setHueFromPoint(event.clientX);
    });
  };

  #handleHuePointerUp = (): void => this.#commit(this.#color, true);

  #handleHueKeydown = (event: KeyboardEvent): void => {
    if (this.disabled) return;
    let dh = 0;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') dh = -1;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') dh = 1;
    else return;
    event.preventDefault();
    this.#commit(
      { ...this.#color, h: clamp(this.#color.h + dh, 0, 360) },
      true,
    );
  };

  // --- Opacity slider. ---

  #setOpacityFromPoint(clientX: number): void {
    const track = this.#opacityRef.value;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const a = clamp((clientX - rect.left) / rect.width, 0, 1);
    this.#commit({ ...this.#color, a }, false);
  }

  #handleOpacityPointerDown = (event: PointerEvent): void => {
    if (this.disabled) return;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.#setOpacityFromPoint(event.clientX);
  };

  #handleOpacityPointerMove = (event: PointerEvent): void => {
    if (event.buttons === 0 || this.disabled) return;
    if (this.#opacityRafId) return;
    this.#opacityRafId = requestAnimationFrame(() => {
      this.#opacityRafId = 0;
      this.#setOpacityFromPoint(event.clientX);
    });
  };

  #handleOpacityPointerUp = (): void => this.#commit(this.#color, true);

  #handleOpacityKeydown = (event: KeyboardEvent): void => {
    if (this.disabled) return;
    let da = 0;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') da = -0.01;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') da = 0.01;
    else return;
    event.preventDefault();
    this.#commit({ ...this.#color, a: clamp(this.#color.a + da, 0, 1) }, true);
  };

  // --- Swatches, text input, eyedropper, format toggle. ---

  #handleSwatchClick(swatch: string): void {
    if (this.disabled) return;
    const parsed = parseColor(swatch);
    if (parsed) this.#commit(parsed, true);
  }

  #handleInputChange = (event: Event): void => {
    const raw = (event.target as HTMLInputElement).value;
    const parsed = parseColor(raw);
    if (parsed) this.#commit(parsed, true);
    else (event.target as HTMLInputElement).value = this.value;
  };

  #handleEyedropperClick = async (): Promise<void> => {
    if (!window.EyeDropper) return;
    try {
      const result = await new window.EyeDropper().open();
      const parsed = parseColor(result.sRGBHex);
      if (parsed) this.#commit(parsed, true);
    } catch {
      // User cancelled (Escape/click-away) — nothing to do.
    }
  };

  #handleFormatChange = (event: Event): void => {
    const next = (event.target as HTMLSelectElement).value as Format;
    if (!FORMATS.includes(next)) return;
    this.format = next;
    this.value = formatColor(
      this.#color,
      this.format,
      !this.noOpacity,
      this.uppercase,
    );
  };

  #handleOpacityInputChange = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    const percent = Number.parseFloat(input.value);
    if (Number.isNaN(percent)) {
      input.value = String(Math.round(this.#color.a * 100));
      return;
    }
    this.#commit({ ...this.#color, a: clamp(percent, 0, 100) / 100 }, true);
  };

  #handleCustomToggle = (): void => {
    this._customOpen = !this._customOpen;
  };

  // --- Trigger/panel (non-inline mode). ---

  #handleTriggerClick = (): void => {
    if (this.disabled) return;
    this.open ? this.hide() : this.show();
  };

  #handleOutsidePointerDown = (event: PointerEvent): void => {
    if (!this.open || this.inline) return;
    if (event.composedPath().includes(this)) return;
    this.hide();
  };

  #handleHostKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.open && !this.inline) {
      this.hide();
      this.#triggerRef.value?.focus();
    }
  };

  /** Opens the panel (non-`inline` mode only; a no-op when `inline`). */
  show(): void {
    if (this.open || this.inline || this.disabled) return;
    this.open = true;
    this.dispatchEvent(new Event('bx-show', { bubbles: true, composed: true }));
  }

  /** Closes the panel (non-`inline` mode only; a no-op when `inline`). */
  hide(): void {
    if (!this.open || this.inline) return;
    this.open = false;
    this.dispatchEvent(new Event('bx-hide', { bubbles: true, composed: true }));
  }

  /** Focuses the trigger (non-`inline`) or the grid (`inline`). */
  override focus(options?: FocusOptions): void {
    (this.inline ? this.#gridRef.value : this.#triggerRef.value)?.focus(
      options,
    );
  }

  override blur(): void {
    (this.inline ? this.#gridRef.value : this.#triggerRef.value)?.blur();
  }

  #renderPanel() {
    const { r, g, b } = hsvToRgb(this.#color.h, this.#color.s, this.#color.v);
    const rgbOpaque = `rgb(${r}, ${g}, ${b})`;
    const huePercent = (this.#color.h / 360) * 100;
    const hasPresets = this.presets.length > 0;
    const showCustom = this._customOpen || !hasPresets;
    const currentHex = formatColor(this.#color, 'hex', false, false);

    return html`
      <div class="panel">
        ${
          hasPresets
            ? html`<div class="presets" part="presets">
                ${this.presets.map((preset) => {
                  const parsed = parseColor(preset);
                  const pressed =
                    parsed !== null &&
                    formatColor(parsed, 'hex', false, false) === currentHex;
                  return html`<button
                    type="button"
                    class="swatch"
                    part="swatch"
                    style="background: ${preset}"
                    aria-label=${preset}
                    aria-pressed=${pressed}
                    ?disabled=${this.disabled}
                    @click=${() => this.#handleSwatchClick(preset)}
                  ></button>`;
                })}
                <button
                  type="button"
                  class="swatch custom-toggle"
                  part="swatch custom-toggle"
                  aria-label="Custom color"
                  aria-expanded=${showCustom}
                  ?disabled=${this.disabled}
                  @click=${this.#handleCustomToggle}
                ></button>
              </div>`
            : nothing
        }
        ${
          showCustom
            ? html`<div class="custom" part="custom">
                <div
                  ${ref(this.#gridRef)}
                  class="grid"
                  part="grid"
                  role="application"
                  aria-label="Saturation and brightness"
                  aria-describedby=${this.#gridId}
                  tabindex=${this.disabled ? -1 : 0}
                  style="background-color: ${`hsl(${this.#color.h}, 100%, 50%)`}"
                  @pointerdown=${this.#handleGridPointerDown}
                  @pointermove=${this.#handleGridPointerMove}
                  @pointerup=${this.#handleGridPointerUp}
                  @keydown=${this.#handleGridKeydown}
                >
                  <span id=${this.#gridId} hidden>${this.value}</span>
                  <div
                    class="grid-handle"
                    part="grid-handle"
                    style="left: ${this.#color.s}%; top: ${100 - this.#color.v}%; background: ${rgbOpaque}"
                  ></div>
                </div>

                <div
                  ${ref(this.#hueRef)}
                  class="slider hue-slider"
                  part="slider hue-slider"
                  role="slider"
                  aria-label="Hue"
                  aria-valuemin="0"
                  aria-valuemax="360"
                  aria-valuenow=${Math.round(this.#color.h)}
                  tabindex=${this.disabled ? -1 : 0}
                  @pointerdown=${this.#handleHuePointerDown}
                  @pointermove=${this.#handleHuePointerMove}
                  @pointerup=${this.#handleHuePointerUp}
                  @keydown=${this.#handleHueKeydown}
                >
                  <div class="slider-handle" style="left: ${huePercent}%"></div>
                </div>
              </div>`
            : nothing
        }
        ${
          this.noOpacity
            ? nothing
            : html`<div
                ${ref(this.#opacityRef)}
                class="slider opacity-slider"
                part="slider opacity-slider"
                role="slider"
                aria-label="Opacity"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow=${Math.round(this.#color.a * 100)}
                tabindex=${this.disabled ? -1 : 0}
                @pointerdown=${this.#handleOpacityPointerDown}
                @pointermove=${this.#handleOpacityPointerMove}
                @pointerup=${this.#handleOpacityPointerUp}
                @keydown=${this.#handleOpacityKeydown}
              >
                <div
                  class="opacity-slider-fill"
                  style="background: linear-gradient(to right, transparent, ${rgbOpaque})"
                ></div>
                <div
                  class="slider-handle"
                  style="left: ${this.#color.a * 100}%"
                ></div>
              </div>`
        }

        <div class="row">
          ${
            this.noFormatToggle
              ? nothing
              : html`<select
                  class="select"
                  part="format-select"
                  aria-label="Color format"
                  ?disabled=${this.disabled}
                  @change=${this.#handleFormatChange}
                >
                  ${FORMATS.map(
                    (format) =>
                      html`<option
                        value=${format}
                        ?selected=${format === this.format}
                      >
                        ${format.toUpperCase()}
                      </option>`,
                  )}
                </select>`
          }
          <input
            class="input"
            part="input"
            type="text"
            .value=${this.value}
            ?disabled=${this.disabled}
            aria-label="Color value"
            @change=${this.#handleInputChange}
          />
          ${
            this.noOpacity
              ? nothing
              : html`<input
                  class="input opacity-input"
                  part="opacity-input"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  .value=${String(Math.round(this.#color.a * 100))}
                  ?disabled=${this.disabled}
                  aria-label="Opacity percent"
                  @change=${this.#handleOpacityInputChange}
                />`
          }
          ${
            window.EyeDropper
              ? html`<button
                  type="button"
                  class="icon-button"
                  part="eyedropper-button"
                  aria-label="Pick a color from the screen"
                  ?disabled=${this.disabled}
                  @click=${this.#handleEyedropperClick}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m2 22 1-1h3l9-9M3 21v-3l9-9" />
                    <path
                      d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"
                    />
                  </svg>
                </button>`
              : nothing
          }
        </div>
      </div>
    `;
  }

  protected override render() {
    const showLabel = this.label.length > 0;
    const { r, g, b } = hsvToRgb(this.#color.h, this.#color.s, this.#color.v);

    return html`
      <div class="base" part="base">
        ${showLabel ? html`<span><slot name="label">${this.label}</slot></span>` : nothing}
        ${
          this.inline
            ? this.#renderPanel()
            : html`
                <button
                  ${ref(this.#triggerRef)}
                  type="button"
                  class="trigger"
                  part="trigger"
                  aria-haspopup="true"
                  aria-expanded=${this.open}
                  aria-label="Choose a color, current value ${this.value || 'none'}"
                  ?disabled=${this.disabled}
                  @click=${this.#handleTriggerClick}
                >
                  <span
                    class="trigger-fill"
                    style="background: rgba(${r}, ${g}, ${b}, ${this.#color.a})"
                  ></span>
                </button>
                <bx-popup
                  .anchor=${this.#triggerRef.value}
                  ?active=${this.open}
                  placement="bottom-start"
                  distance="4"
                  flip
                  shift
                >
                  ${this.open ? this.#renderPanel() : nothing}
                </bx-popup>
              `
        }
      </div>
    `;
  }
}
