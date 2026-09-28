// Stories and story CSS may only reference tokens the design system actually generates, so a
// renamed or removed token fails here instead of silently rendering nothing.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { describe, it } from 'node:test';

const root = new URL('../', import.meta.url);
const tokens = fs.readFileSync(
  new URL('.storybook/generated/tokens.css', root),
  'utf8',
);
const declared = new Set(
  [...tokens.matchAll(/(--bx-[a-z0-9-]+)\s*:/g)].map((m) => m[1] as string),
);

const sources = [
  ...fs
    .readdirSync(new URL('stories/', root))
    .filter((f) => f.endsWith('.ts'))
    .map((f) => `stories/${f}`),
  '.storybook/story.css',
  '.storybook/preview.ts',
];

describe('story token references', () => {
  it('finds the generated tokens', () => {
    assert.ok(declared.size > 100);
  });

  for (const file of sources) {
    it(`${file} only uses generated tokens`, () => {
      const text = fs.readFileSync(new URL(file, root), 'utf8');
      // Static references only: names followed directly by `)` (dynamic ones contain `${…}`).
      const used = [...text.matchAll(/var\((--bx-[a-z0-9-]+)[,)]/g)].map(
        (m) => m[1] as string,
      );
      const missing = [...new Set(used)].filter((t) => !declared.has(t));
      assert.deepEqual(missing, [], `undefined tokens: ${missing.join(', ')}`);
    });
  }
});
