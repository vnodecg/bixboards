import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  SHADES,
  assertHex,
  blend,
  contrast,
  generateShades,
  hexToRgb,
  isHex,
  luminance,
  parseColor,
  rgbToHsl,
  transparentShades,
} from './color.ts';

describe('color', () => {
  it('validates hex colors', () => {
    assert.equal(isHex('#fff'), true);
    assert.equal(isHex('#3366FF'), true);
    for (const bad of ['fff', '#ffff', '#gggggg', 'red', '', 12, null])
      assert.equal(isHex(bad), false, String(bad));
    assert.equal(assertHex('#ABCDEF', 'x'), '#abcdef');
    assert.throws(
      () => assertHex('foo', 'seed'),
      /seed must be a #rgb or #rrggbb hex color/,
    );
  });

  it('parses hex, rgb(a) and transparent', () => {
    assert.deepEqual(parseColor('#fff'), { r: 255, g: 255, b: 255, a: 1 });
    assert.deepEqual(parseColor('rgba(0, 128, 255, 0.5)'), {
      r: 0,
      g: 128,
      b: 255,
      a: 0.5,
    });
    assert.deepEqual(parseColor('rgb(1,2,3)'), { r: 1, g: 2, b: 3, a: 1 });
    assert.equal(parseColor('transparent')?.a, 0);
    assert.equal(parseColor('var(--x)'), null);
    assert.equal(parseColor('red'), null);
  });

  it('computes WCAG contrast', () => {
    assert.ok(Math.abs(contrast('#000000', '#ffffff') - 21) < 1e-9);
    assert.equal(contrast('#777777', '#777777'), 1);
    // Known reference value: #767676 on white is the AA boundary (4.54:1).
    assert.ok(Math.abs(contrast('#767676', '#ffffff') - 4.54) < 0.01);
    assert.ok(luminance('#ffffff') > luminance('#000000'));
  });

  it('composites translucent colors before comparing', () => {
    const half = { r: 0, g: 0, b: 0, a: 0.5 };
    assert.deepEqual(blend(half, { r: 255, g: 255, b: 255, a: 1 }), {
      r: 127.5,
      g: 127.5,
      b: 127.5,
      a: 1,
    });
    // Black text on a 50% black tint over white behaves like text on the composited mid-gray.
    const gray = { r: 127.5, g: 127.5, b: 127.5, a: 1 };
    assert.ok(
      Math.abs(
        contrast('#000000', half, '#ffffff') - contrast('#000000', gray),
      ) < 1e-9,
    );
  });

  it('generates 9 strictly darkening shades for any seed, with the seed at 500', () => {
    const seeds = [
      '#3366ff',
      '#ffaa00',
      '#d91e48',
      '#7a869f',
      '#fafafa',
      '#050505',
      '#808080',
      '#ff0000',
      '#00ff00',
      '#0000ff',
      '#ffffff',
      '#000000',
    ];
    for (const seed of seeds) {
      const shades = generateShades(seed);
      assert.equal(shades[500], seed);
      const lightness = SHADES.map((s) => rgbToHsl(hexToRgb(shades[s]))[2]);
      for (let i = 1; i < lightness.length; i++) {
        assert.ok(
          (lightness[i] as number) < (lightness[i - 1] as number) + 0.5,
          `${seed}: step ${SHADES[i]} (${lightness[i]}) not darker than ${SHADES[i - 1]} (${lightness[i - 1]})`,
        );
      }
    }
  });

  it('honours the palette curve and rejects out-of-range values', () => {
    const soft = generateShades('#3366ff', { lightest: 99, darkest: 5 });
    const hard = generateShades('#3366ff', { lightest: 90, darkest: 30 });
    assert.ok(luminance(soft[100]) > luminance(hard[100]));
    assert.ok(luminance(soft[900]) < luminance(hard[900]));
    assert.throws(
      () => generateShades('#3366ff', { lightest: 10 }),
      /lightest/,
    );
    assert.throws(() => generateShades('#3366ff', { darkest: 80 }), /darkest/);
    assert.throws(() => generateShades('nope'), /hex color/);
  });

  it('derives transparent steps from the given color', () => {
    const t = transparentShades('#3366ff');
    assert.equal(t[100], 'rgba(51, 102, 255, 0.08)');
    assert.equal(t[600], 'rgba(51, 102, 255, 0.48)');
    assert.equal(Object.keys(t).length, 6);
  });
});
