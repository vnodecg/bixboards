// Palette names come from the generated tokens, so adding a seed to the default theme shows up in
// every story without touching them.

import light from '../.storybook/generated/themes/light.json';

const tokens = (light as { tokens: Record<string, string> }).tokens;

export const PALETTES: string[] = [
  ...new Set(
    Object.keys(tokens)
      .map((k) => /^color\.([a-z0-9-]+)\.500$/.exec(k)?.[1])
      .filter((p): p is string => p !== undefined),
  ),
];
