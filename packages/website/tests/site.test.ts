import { test } from 'node:test';
import assert from 'node:assert/strict';
import { components, templates, features } from '../src/data/site.ts';

test('component tags are unique and prefixed', () => {
  const tags = components.map((c) => c.tag);
  assert.equal(new Set(tags).size, tags.length);
  for (const t of tags) assert.match(t, /^bx-[a-z0-9-]+$/);
});

test('every component has a known status and category', () => {
  for (const c of components) {
    assert.ok(['available', 'planned'].includes(c.status));
    assert.ok(c.category.length > 0);
  }
});

test('templates have unique slugs', () => {
  const slugs = templates.map((t) => t.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test('features are non-empty', () => {
  assert.ok(features.length >= 4);
});
