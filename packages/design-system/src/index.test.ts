import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { applyTheme, paletteVars, themeVars, toCssText } from './index.ts';

describe('runtime', () => {
  it('emits palette steps, transparent steps and roles', () => {
    const vars = paletteVars('brand', '#3366ff');
    assert.equal(vars['--bx-color-brand-500'], '#3366ff');
    assert.ok(vars['--bx-color-brand-transparent-200']?.startsWith('rgba('));
    for (const role of [
      'solid',
      'solid-hover',
      'solid-active',
      'on-solid',
      'fg',
      'border',
      'subtle',
      'subtle-hover',
      'subtle-active',
      'tint',
    ]) {
      assert.ok(`--bx-role-brand-${role}` in vars, role);
    }
    assert.match(
      vars['--bx-role-brand-fg'] as string,
      /^var\(--bx-color-brand-\d00\)$/,
    );
  });

  it('chooses different steps for dark schemes', () => {
    const light = paletteVars('brand', '#3366ff', { scheme: 'light' });
    const dark = paletteVars('brand', '#3366ff', { scheme: 'dark' });
    assert.notEqual(light['--bx-role-brand-fg'], dark['--bx-role-brand-fg']);
  });

  it('points focus and link tokens at brand roles', () => {
    const vars = themeVars({ brand: '#3366ff', danger: '#d91e48' });
    assert.equal(vars['--bx-focus-ring'], 'var(--bx-role-brand-border)');
    assert.equal(vars['--bx-text-link'], 'var(--bx-role-brand-fg)');
    assert.equal(
      themeVars({ danger: '#d91e48' })['--bx-focus-ring'],
      undefined,
    );
  });

  it('applies hand-tuned shades', () => {
    const vars = paletteVars('brand', '#3366ff', {
      shades: { brand: { 600: '#123456' } },
    });
    assert.equal(vars['--bx-color-brand-600'], '#123456');
  });

  it('rejects invalid seeds, names and curves', () => {
    assert.throws(() => paletteVars('brand', 'foo'), /hex color/);
    assert.throws(() => paletteVars('Brand', '#3366ff'), /Palette name/);
    assert.throws(() => paletteVars('brand;}', '#3366ff'), /Palette name/);
    assert.throws(
      () => themeVars({ brand: '#3366ff' }, { curve: { lightest: 5 } }),
      /lightest/,
    );
    assert.throws(
      () =>
        paletteVars('brand', '#3366ff', { shades: { brand: { 600: 'red' } } }),
      /hex color/,
    );
  });

  describe('CSS injection', () => {
    const evil = [
      'red;} body{display:none',
      'a}b',
      'url(https://evil.example/x)',
      '/* c */',
      '@import "x"',
      'x\\ny',
      '<style>',
    ];

    for (const value of evil) {
      it(`rejects unsafe value ${JSON.stringify(value)}`, () => {
        assert.throws(
          () => toCssText(':root', { '--x': value }),
          /Unsafe value/,
        );
        assert.throws(
          () => themeVars({}, { tokens: { '--x': value } }),
          /Unsafe value/,
        );
        assert.throws(
          () => themeVars({}, { foundation: { '--x': value } }),
          /Unsafe value/,
        );
      });
    }

    it('rejects unsafe property names and selectors', () => {
      assert.throws(
        () => toCssText(':root', { 'color: red; --x': '1' }),
        /Custom property name/,
      );
      assert.throws(
        () => toCssText(':root', { '--X': '1' }),
        /Custom property name/,
      );
      assert.throws(
        () => toCssText(':root} body{', { '--x': '1' }),
        /Unsafe selector/,
      );
      assert.throws(() => toCssText('', { '--x': '1' }), /Unsafe selector/);
    });

    it('serializes safe values', () => {
      const css = toCssText('[data-tenant="acme"]', {
        '--bx-radius-m': 'calc(var(--bx-unit) * 0.5)',
        '--bx-font-family-sans': "Georgia, 'Times New Roman', serif",
      });
      assert.equal(
        css,
        `[data-tenant="acme"] {\n  --bx-radius-m: calc(var(--bx-unit) * 0.5);\n  --bx-font-family-sans: Georgia, 'Times New Roman', serif;\n}\n`,
      );
    });
  });

  it('applies and removes inline properties', () => {
    const props = new Map<string, string>();
    const element = {
      style: {
        setProperty: (k: string, v: string) => void props.set(k, v),
        removeProperty: (k: string) => void props.delete(k),
      },
    } as unknown as HTMLElement;
    const remove = applyTheme(element, { brand: '#3366ff' });
    assert.equal(props.get('--bx-color-brand-500'), '#3366ff');
    remove();
    assert.equal(props.size, 0);
  });
});
