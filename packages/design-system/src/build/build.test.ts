import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { tempData } from '../test-utils.ts';
import { build, InputError } from './index.ts';

const withData = <T>(fn: (d: ReturnType<typeof tempData>) => T): T => {
  const d = tempData();
  try {
    return fn(d);
  } finally {
    d.cleanup();
  }
};

/** CSS text of the first rule whose selector list contains `selector`. */
function rule(css: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp(`(?:^|\\n)\\s*[^{}]*${escaped}[^{}]*\\{([^}]*)\\}`).exec(
    css,
  );
  return m?.[1] ?? '';
}

describe('build (built-in data)', () => {
  const result = build();

  it('is clean: no contrast or deprecation warnings', () => {
    assert.deepEqual(result.warnings, []);
  });

  it('emits exactly the token artifacts and no component styling', () => {
    assert.deepEqual(Object.keys(result.files).sort(), [
      'contrast.json',
      'themes/dark.json',
      'themes/light.json',
      'tokens.css',
      'tokens.dtcg.json',
      'tokens.figma.json',
    ]);
    assert.deepEqual(result.themes.sort(), ['dark', 'light']);
    const css = result.files['tokens.css'] as string;
    assert.doesNotMatch(css, /^\s*bx-[a-z]/m, 'no component selectors');
    assert.doesNotMatch(css, /--bx-(button|input|badge|card)-/);
  });

  it('emits tokens in a single layer, with roles for every palette', () => {
    const css = result.files['tokens.css'] as string;
    assert.match(css, /^@layer bx\.tokens \{/);
    for (const p of result.palettes) {
      for (const role of ['solid', 'on-solid', 'fg', 'border', 'subtle']) {
        assert.match(
          css,
          new RegExp(`--bx-role-${p}-${role}: `),
          `${p} ${role}`,
        );
      }
    }
  });

  it('redeclares derived tokens on scaled regions', () => {
    const css = result.files['tokens.css'] as string;
    assert.match(css, /:root,\n\s*\.bx-scale,\n\s*\[data-bx-scale\] \{/);
    assert.match(css, /--bx-unit: calc\(clamp\(/);
  });

  it('applies dark under data-theme and under prefers-color-scheme when unset', () => {
    const css = result.files['tokens.css'] as string;
    assert.match(css, /\[data-theme="dark"\] \{\n\s*color-scheme: dark;/);
    assert.match(
      css,
      /@media \(prefers-color-scheme: dark\) \{\n\s*:root:not\(\[data-theme\]\) \{/,
    );
  });

  it('defines the same token names in every theme', () => {
    const light = JSON.parse(
      result.files['themes/light.json'] as string,
    ).tokens;
    const dark = JSON.parse(result.files['themes/dark.json'] as string).tokens;
    assert.deepEqual(Object.keys(dark).sort(), Object.keys(light).sort());
  });

  it('reports contrast per theme for every documented pair', () => {
    const report = JSON.parse(
      result.files['contrast.json'] as string,
    ) as Record<
      string,
      { fg: string; bg: string; min: number; ratio: number; pass: boolean }[]
    >;
    assert.deepEqual(Object.keys(report).sort(), ['dark', 'light']);
    for (const entries of Object.values(report)) {
      assert.ok(entries.length > 30);
      assert.ok(entries.every((e) => e.pass && e.ratio >= e.min));
      assert.ok(entries.some((e) => e.fg === 'text.primary'));
      assert.ok(entries.some((e) => e.fg === 'role.brand.on-solid'));
    }
  });

  it('produces DTCG sets and a Figma export with pixel dimensions', () => {
    const dtcg = JSON.parse(result.files['tokens.dtcg.json'] as string);
    assert.deepEqual(dtcg.$metadata.tokenSetOrder, [
      'foundation',
      'light',
      'dark',
    ]);
    assert.equal(dtcg.light.color.brand['500'].$type, 'color');
    assert.equal(dtcg.foundation.space.m.$value, '{unit}');
    assert.equal(
      dtcg.foundation.space.m.$type,
      undefined,
      'expressions must not claim a dimension type',
    );

    const figma = JSON.parse(result.files['tokens.figma.json'] as string);
    assert.equal(figma.foundation.space.m.$value, '16.2px');
    assert.equal(figma.foundation.space.m.$type, 'dimension');
    assert.equal(figma.foundation.radius.pill.$value, '9999px');
  });
});

describe('build (custom data)', () => {
  it('scopes a theme scale to the themed element, not just <html>', () => {
    withData((d) => {
      d.write('themes/compact.json', {
        name: 'compact',
        extends: 'light',
        foundation: { scale: '0.9' },
      });
      const css = build({ dataDir: d.dir }).files['tokens.css'] as string;
      assert.match(rule(css, '[data-theme="compact"]'), /--bx-scale: 0\.9;/);
      const scoped = rule(css, '[data-theme="compact"] .bx-scale');
      assert.match(
        scoped,
        /--bx-unit: /,
        'derived --bx-unit must be redeclared under the theme',
      );
      assert.match(scoped, /--bx-space-m: /);
      assert.doesNotMatch(scoped, /--bx-scale:/);
    });
  });

  it('does not re-declare derived tokens for themes that do not change foundation', () => {
    withData((d) => {
      d.write('themes/plain.json', {
        name: 'plain',
        extends: 'light',
        seeds: { brand: '#0a7d6b' },
      });
      const css = build({ dataDir: d.dir }).files['tokens.css'] as string;
      assert.equal(rule(css, '[data-theme="plain"] .bx-scale'), '');
    });
  });

  it('supports coarse-pointer overrides in themes', () => {
    withData((d) => {
      d.write('themes/touchy.json', {
        name: 'touchy',
        extends: 'light',
        foundation: { $coarse: { target: { min: '3rem' } } },
      });
      const css = build({ dataDir: d.dir }).files['tokens.css'] as string;
      assert.match(
        css,
        /@media \(pointer: coarse\) \{\n\s*\[data-theme="touchy"\]/,
      );
      assert.match(css, /--bx-target-min: 3rem;/);
    });
  });

  it('merges an extends list with later entries winning', () => {
    withData((d) => {
      d.write('themes/a.json', {
        name: 'a',
        extends: 'light',
        seeds: { brand: '#0a7d6b' },
        foundation: { radius: { m: '1px' } },
      });
      d.write('themes/b.json', { name: 'b', extends: ['a', 'dark'] });
      const files = build({ dataDir: d.dir }).files;
      const b = JSON.parse(files['themes/b.json'] as string);
      assert.equal(b.colorScheme, 'dark');
      assert.equal(
        b.tokens['color.brand.500'],
        '#0a7d6b',
        'brand seed inherited from a',
      );
      assert.equal(
        b.tokens['surface.base'],
        '{color.neutral.900}',
        'dark surface wins over light',
      );
      assert.match(
        rule(files['tokens.css'] as string, '[data-theme="b"]'),
        /color-scheme: dark;/,
      );
      assert.match(
        files['tokens.css'] as string,
        /\[data-theme="b"\][^{]*\{[^}]*--bx-radius-m: 1px;/,
        'foundation override from a is emitted for b',
      );
    });
  });

  it('adds a palette everywhere, with roles', () => {
    withData((d) => {
      const light = d.read('themes/light.json') as {
        seeds: Record<string, string>;
      };
      light.seeds['info'] = '#0891b2';
      d.write('themes/light.json', light);
      const r = build({ dataDir: d.dir });
      assert.ok(r.palettes.includes('info'));
      const dark = JSON.parse(r.files['themes/dark.json'] as string).tokens;
      assert.ok('role.info.solid' in dark, 'dark also gets the palette');
      assert.ok('color.info.500' in dark);
    });
  });

  it('lets a user theme replace the default', () => {
    withData((d) => {
      const file = d.write('brand.json', {
        name: 'brand',
        extends: 'light',
        default: true,
        seeds: { brand: '#0a7d6b' },
      });
      const r = build({ dataDir: d.dir, extraThemes: [file] });
      assert.match(
        r.files['tokens.css'] as string,
        /:root,\n\s*\[data-theme="brand"\] \{/,
      );
      assert.doesNotMatch(
        r.files['tokens.css'] as string,
        /:root,\n\s*\[data-theme="light"\] \{/,
      );
    });
  });

  it('warns on contrast failures in theme tokens', () => {
    withData((d) => {
      d.write('themes/bad.json', {
        name: 'bad',
        extends: 'light',
        tokens: { text: { primary: '#eeeeee' } },
      });
      const r = build({ dataDir: d.dir });
      assert.ok(
        r.warnings.some((x) =>
          /\[bad\] text\.primary on surface\.base/.test(x),
        ),
        r.warnings.join('\n'),
      );
      const report = JSON.parse(r.files['contrast.json'] as string).bad as {
        fg: string;
        pass: boolean;
      }[];
      assert.ok(report.some((e) => e.fg === 'text.primary' && !e.pass));
    });
  });

  it('warns when hand-written role overrides break contrast', () => {
    withData((d) => {
      d.write('themes/bad.json', {
        name: 'bad',
        extends: 'light',
        tokens: { role: { brand: { fg: '#ccddff' } } },
      });
      const w = build({ dataDir: d.dir }).warnings;
      assert.ok(
        w.some((x) => /\[bad\] role\.brand\.fg on surface\.base/.test(x)),
        w.join('\n'),
      );
    });
  });

  it('checks a theme’s own contrast rules, including unknown tokens', () => {
    withData((d) => {
      d.write('themes/x.json', {
        name: 'x',
        extends: 'light',
        contrast: [
          { fg: 'text.secondary', bg: 'surface.muted', min: 12 },
          { fg: 'text.nope', bg: 'surface.base' },
        ],
      });
      const w = build({ dataDir: d.dir }).warnings;
      assert.ok(
        w.some((x) =>
          /\[x\] text\.secondary on surface\.muted = .* \(< 12:1\)/.test(x),
        ),
        w.join('\n'),
      );
      assert.ok(
        w.some((x) => /text\.nope on surface\.base: token missing/.test(x)),
      );
    });
  });

  it('reports deprecated tokens still referenced by a theme', () => {
    withData((d) => {
      const f = d.read('foundation.json') as Record<string, unknown>;
      f['$deprecated'] = { 'radius.s': 'use radius.m' };
      d.write('foundation.json', f);
      d.write('themes/x.json', {
        name: 'x',
        extends: 'light',
        foundation: { radius: { l: '{radius.s}' } },
      });
      const w = build({ dataDir: d.dir }).warnings;
      assert.ok(
        w.some((x) =>
          /Deprecated token \{radius\.s\} used in theme x foundation.*use radius\.m/.test(
            x,
          ),
        ),
        w.join('\n'),
      );
    });
  });

  describe('errors', () => {
    const fails = (
      mutate: (d: ReturnType<typeof tempData>) => void,
      pattern: RegExp,
    ): void =>
      withData((d) => {
        mutate(d);
        assert.throws(
          () => build({ dataDir: d.dir }),
          (e: Error) =>
            pattern.test(e.message)
              ? true
              : assert.fail(`message did not match ${pattern}: ${e.message}`),
        );
      });

    it('unknown token reference', () =>
      fails(
        (d) =>
          d.write('themes/x.json', {
            name: 'x',
            extends: 'light',
            foundation: { radius: { m: '{nope.nope}' } },
          }),
        /Unknown token reference \{nope\.nope\} in theme x foundation/,
      ));
    it('invalid JSON names the file', () =>
      fails(
        (d) => d.write('themes/broken.json', '{ "name": '),
        /broken\.json: invalid JSON/,
      ));
    it('invalid seed', () =>
      fails(
        (d) => d.write('themes/x.json', { name: 'x', seeds: { brand: 'foo' } }),
        /x\.json \(x\) seeds\.brand must be a #rgb or #rrggbb hex color/,
      ));
    it('unknown theme property', () =>
      fails(
        (d) => d.write('themes/x.json', { name: 'x', colour: 1 }),
        /unknown property "colour"/,
      ));
    it('component overrides are not part of the design system', () =>
      fails(
        (d) =>
          d.write('themes/x.json', {
            name: 'x',
            extends: 'light',
            components: { button: {} },
          }),
        /unknown property "components"/,
      ));
    it('curve out of range', () =>
      fails(
        (d) =>
          d.write('themes/x.json', {
            name: 'x',
            extends: 'light',
            palette: { lightest: 10 },
          }),
        /palette\.lightest must be between 50 and 100/,
      ));
    it('extends unknown theme', () =>
      fails(
        (d) => d.write('themes/x.json', { name: 'x', extends: 'nope' }),
        /extends unknown theme "nope"/,
      ));
    it('circular extends', () =>
      fails(
        (d) => (
          d.write('themes/x.json', { name: 'x', extends: 'y' }),
          d.write('themes/y.json', { name: 'y', extends: 'x' })
        ),
        /circular extends: x -> y -> x/,
      ));
    it('two defaults', () =>
      fails(
        (d) =>
          d.write('themes/x.json', {
            name: 'x',
            extends: 'light',
            default: true,
          }),
        /exactly one theme must set "default": true \(found 2: /,
      ));
    it('unknown foundation override', () =>
      fails(
        (d) =>
          d.write('themes/x.json', {
            name: 'x',
            extends: 'light',
            foundation: { bogus: '1' },
          }),
        /overrides unknown foundation tokens: bogus/,
      ));
    it('foundation without scale', () =>
      fails(
        (d) => d.write('foundation.json', { space: { m: '1rem' } }),
        /missing "scale"/,
      ));

    it('errors are InputError instances', () => {
      withData((d) => {
        d.write('themes/x.json', '{');
        assert.throws(() => build({ dataDir: d.dir }), InputError);
      });
    });
  });
});
