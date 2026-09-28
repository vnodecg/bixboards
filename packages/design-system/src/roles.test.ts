import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { contrast, generateShades, hslToRgb, rgbToHex } from './color.ts';
import {
  ROLE_NAMES,
  TEXT_MIN,
  UI_MIN,
  planRoles,
  roleValues,
  type Scheme,
} from './roles.ts';

const SURFACES: Record<Scheme, string[]> = {
  light: ['#ffffff', '#f5f7fb'],
  dark: ['#141a2d', '#232b3d'],
};
const DARK_TEXT = '#141a2d';

/** A spread of seeds across hue and lightness/saturation, plus the awkward extremes. */
const seeds = (): string[] => {
  const out = [
    '#3366ff',
    '#ffaa00',
    '#d91e48',
    '#00a86b',
    '#7a869f',
    '#ffff00',
    '#00ffff',
    '#ffffff',
    '#000000',
    '#808080',
  ];
  for (let h = 0; h < 360; h += 30)
    for (const [s, l] of [
      [80, 40],
      [80, 55],
      [60, 70],
      [90, 30],
    ] as const)
      out.push(rgbToHex(hslToRgb([h, s, l])));
  return out;
};

describe('roles', () => {
  for (const scheme of ['light', 'dark'] as const) {
    it(`meet contrast requirements on ${scheme} surfaces for every seed`, () => {
      const failures: string[] = [];
      for (const seed of seeds()) {
        const shades = generateShades(seed);
        const plan = planRoles({
          shades,
          surfaces: SURFACES[scheme],
          scheme,
          darkText: DARK_TEXT,
        });
        const text = plan.on === 'light' ? '#ffffff' : DARK_TEXT;
        for (const step of [plan.solid, plan.solidHover, plan.solidActive]) {
          const ratio = contrast(text, shades[step]);
          if (ratio < TEXT_MIN)
            failures.push(
              `${seed} ${scheme}: on-solid vs ${step} = ${ratio.toFixed(2)}`,
            );
        }
        for (const surface of SURFACES[scheme]) {
          const fg = contrast(shades[plan.fg], surface);
          if (fg < TEXT_MIN)
            failures.push(
              `${seed} ${scheme}: fg ${plan.fg} on ${surface} = ${fg.toFixed(2)}`,
            );
          const border = contrast(shades[plan.border], surface);
          if (border < UI_MIN)
            failures.push(
              `${seed} ${scheme}: border ${plan.border} on ${surface} = ${border.toFixed(2)}`,
            );
        }
      }
      // Pure white/black/mid-gray seeds can be unsatisfiable at some steps; everything else must pass.
      const unexpected = failures.filter((f) => !/^#(ffffff|000000) /.test(f));
      assert.deepEqual(unexpected, []);
    });
  }

  it('picks dark text on a light solid (warning) and moves hover/active lighter', () => {
    const shades = generateShades('#ffaa00');
    const plan = planRoles({
      shades,
      surfaces: SURFACES.light,
      scheme: 'light',
      darkText: DARK_TEXT,
    });
    assert.equal(plan.on, 'dark');
    assert.ok(
      plan.solidHover <= plan.solid && plan.solidActive <= plan.solidHover,
    );
  });

  it('uses lighter fg steps in dark mode than in light mode', () => {
    const shades = generateShades('#3366ff');
    const light = planRoles({
      shades,
      surfaces: SURFACES.light,
      scheme: 'light',
      darkText: DARK_TEXT,
    });
    const dark = planRoles({
      shades,
      surfaces: SURFACES.dark,
      scheme: 'dark',
      darkText: DARK_TEXT,
    });
    assert.ok(
      dark.fg < light.fg,
      `dark fg ${dark.fg} should be a lighter (lower) step than light fg ${light.fg}`,
    );
  });

  it('renders every role with the provided reference format', () => {
    const shades = generateShades('#3366ff');
    const plan = planRoles({
      shades,
      surfaces: SURFACES.light,
      scheme: 'light',
      darkText: DARK_TEXT,
    });
    const values = roleValues(
      'brand',
      plan,
      (p) => `{${p}}`,
      '{color.neutral.900}',
    );
    assert.deepEqual(Object.keys(values).sort(), [...ROLE_NAMES].sort());
    assert.match(values.solid, /^\{color\.brand\.\d00\}$/);
    assert.equal(values.subtle, '{color.brand.transparent.200}');
    assert.match(values['on-solid'], /^(#ffffff|\{color\.neutral\.900\})$/);
  });
});
