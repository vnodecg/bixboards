import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { run, type Io } from './cli.ts';
import { tempData, tempDir } from './test-utils.ts';

function capture(): { io: Io; out: string[]; err: string[] } {
  const out: string[] = [];
  const err: string[] = [];
  return {
    io: { log: (m) => out.push(m), error: (m) => err.push(m) },
    out,
    err,
  };
}

describe('cli', () => {
  it('prints usage and exits 0 for --help, 1 for no command', () => {
    const a = capture();
    assert.equal(run(['--help'], a.io), 0);
    assert.match(a.out.join('\n'), /bixant-ds <command>/);
    const b = capture();
    assert.equal(run([], b.io), 1);
  });

  it('rejects unknown flags and commands (no silent typos)', () => {
    const a = capture();
    assert.equal(run(['validate', '--stric'], a.io), 2);
    assert.match(a.err.join('\n'), /Unknown option '--stric'/);
    const b = capture();
    assert.equal(run(['build', '--out'], b.io), 2, 'flag missing its value');
    const c = capture();
    assert.equal(run(['frobnicate'], c.io), 2);
    assert.match(c.err.join('\n'), /unknown command "frobnicate"/);
  });

  it('validates the built-in data, strictly', () => {
    const a = capture();
    assert.equal(run(['validate', '--strict'], a.io), 0);
    assert.match(a.out.join('\n'), /^OK: 2 themes, 5 palettes/);
  });

  it('builds into --out', () => {
    const t = tempDir();
    try {
      const a = capture();
      assert.equal(
        run(['build', '--strict', '--out', path.join(t.dir, 'out')], a.io),
        0,
        a.err.join('\n'),
      );
      for (const f of [
        'tokens.css',
        'contrast.json',
        'tokens.dtcg.json',
        'tokens.figma.json',
        'themes/light.json',
      ]) {
        assert.ok(fs.existsSync(path.join(t.dir, 'out', f)), f);
      }
    } finally {
      t.cleanup();
    }
  });

  it('fails with exit 1 and a readable message on invalid input', () => {
    const d = tempData();
    try {
      const file = d.write('bad.json', {
        name: 'bad',
        seeds: { brand: 'nope' },
      });
      const a = capture();
      assert.equal(run(['validate', '--theme', file], a.io), 1);
      assert.match(
        a.err.join('\n'),
        /seeds\.brand must be a #rgb or #rrggbb hex color/,
      );
    } finally {
      d.cleanup();
    }
  });

  it('turns warnings into failures with --strict only', () => {
    const d = tempData();
    try {
      const file = d.write('low.json', {
        name: 'low',
        extends: 'light',
        tokens: { text: { primary: '#eeeeee' } },
      });
      const lenient = capture();
      assert.equal(run(['validate', '--theme', file], lenient.io), 0);
      assert.match(
        lenient.err.join('\n'),
        /warning: \[low\] text\.primary on surface\.base/,
      );
      const strict = capture();
      assert.equal(
        run(['validate', '--strict', '--theme', file], strict.io),
        1,
      );
      assert.match(strict.err.join('\n'), /warning\(s\) with --strict/);
    } finally {
      d.cleanup();
    }
  });

  it('scaffolds a theme that builds cleanly with --strict', () => {
    const t = tempDir();
    try {
      const a = capture();
      assert.equal(
        run(['init-theme', 'acme', '--brand', '#0a7d6b'], a.io, t.dir),
        0,
        a.err.join('\n'),
      );
      const file = path.join(t.dir, 'acme.json');
      assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')).seeds, {
        brand: '#0a7d6b',
      });
      const b = capture();
      assert.equal(
        run(['validate', '--strict', '--theme', file], b.io),
        0,
        b.err.join('\n'),
      );
      const again = capture();
      assert.equal(
        run(['init-theme', 'acme'], again.io, t.dir),
        1,
        'refuses to overwrite',
      );
      const bad = capture();
      assert.equal(run(['init-theme', 'Not Valid'], bad.io, t.dir), 2);
    } finally {
      t.cleanup();
    }
  });

  it('validates --viewport', () => {
    const a = capture();
    assert.equal(run(['validate', '--viewport', 'abc'], a.io), 1);
    assert.match(a.err.join('\n'), /--viewport: expected a positive number/);
  });

  it('honours --viewport in the Figma export', () => {
    const t = tempDir();
    try {
      const a = capture();
      assert.equal(
        run(['build', '--viewport', '2000', '--out', t.dir], a.io),
        0,
        a.err.join('\n'),
      );
      const figma = JSON.parse(
        fs.readFileSync(path.join(t.dir, 'tokens.figma.json'), 'utf8'),
      );
      assert.equal(
        figma.foundation.unit.$value,
        '18px',
        'clamped to the max at a wide viewport',
      );
    } finally {
      t.cleanup();
    }
  });
});
