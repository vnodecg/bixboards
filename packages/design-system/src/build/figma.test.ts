import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { evalLength } from './figma.ts';

const opts = { viewport: 1280, rem: 16 };
const ev = (expr: string, tokens: Record<string, string> = {}) =>
  evalLength(expr, (r) => tokens[r], opts);

describe('evalLength', () => {
  it('evaluates units', () => {
    assert.deepEqual(ev('16px'), { n: 16, px: true });
    assert.deepEqual(ev('1.5rem'), { n: 24, px: true });
    assert.deepEqual(ev('10vi'), { n: 128, px: true });
    assert.deepEqual(ev('2'), { n: 2, px: false });
  });

  it('evaluates calc, clamp, min, max and precedence', () => {
    assert.equal(ev('calc(1rem * 2 + 4px)').n, 36);
    assert.equal(ev('calc(10px + 2px * 3)').n, 16);
    assert.equal(ev('clamp(10px, 5px, 20px)').n, 10);
    assert.equal(ev('clamp(10px, 50px, 20px)').n, 20);
    assert.equal(ev('clamp(10px, 15px, 20px)').n, 15);
    assert.equal(ev('max(10px, 4px + 8px)').n, 12);
    assert.equal(ev('min(10px, 4px + 8px)').n, 10);
    assert.equal(ev('calc(100px / 4)').n, 25);
    assert.equal(ev('calc(-1 * 4px)').n, -4);
  });

  it('resolves token references, including the fluid unit', () => {
    const tokens = {
      scale: '1',
      'fluid.min': '0.875rem',
      'fluid.max': '1.125rem',
      'fluid.preferred': '0.8125rem + 0.25vi',
      unit: 'calc(clamp({fluid.min}, {fluid.preferred}, {fluid.max}) * {scale})',
      'space.m': '{unit}',
      'space.xs': 'calc({unit} * 0.5)',
    };
    // 13px + 0.25 * 12.8px = 16.2px, inside [14px, 18px].
    assert.ok(Math.abs(ev('{space.m}', tokens).n - 16.2) < 1e-9);
    assert.ok(Math.abs(ev('{space.xs}', tokens).n - 8.1) < 1e-9);
    assert.ok(
      Math.abs(
        evalLength('{unit}', (r) => ({ ...tokens, scale: '0.5' })[r], opts).n -
          8.1,
      ) < 1e-9,
    );
  });

  it('rejects unsupported or ill-typed input', () => {
    assert.throws(() => ev('10px * 10px'), /multiply two lengths/);
    assert.throws(() => ev('10px + 2'), /mix lengths and numbers/);
    assert.throws(() => ev('4px / 2px'), /divide by a length/);
    assert.throws(() => ev('50%'), /Unsupported unit/);
    assert.throws(() => ev('foo(1px)'), /Unsupported function/);
    assert.throws(() => ev('{missing}'), /Unknown token/);
    assert.throws(() => ev('calc(1px'), /Expected|Unexpected/);
    assert.throws(() => ev('1px $'), /Unexpected/);
  });

  it('guards against reference cycles', () => {
    assert.throws(() => ev('{a}', { a: '{b}', b: '{a}' }), /nesting too deep/);
  });
});
