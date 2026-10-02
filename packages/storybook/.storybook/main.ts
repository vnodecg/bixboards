import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  framework: '@storybook/web-components-vite',
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.ts'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  viteFinal: (viteConfig) => {
    // Use the design-system and core sources directly so no build step is needed while
    // developing. A plain string alias for '@bixant/core' would also prefix-match every subpath
    // import (rollup-plugin-alias's matching rule), rewriting e.g. '@bixant/core/avatar' to
    // '<core/src/index.ts>/avatar' — an invalid path. The regexes below rewrite each subpath to
    // its own source entry instead, and only fall back to the bare '@bixant/core' alias for the
    // package root import.
    const packagesDir = fileURLToPath(new URL('../../', import.meta.url));
    const coreSrc = fileURLToPath(new URL('../../core/src/', import.meta.url));
    viteConfig.resolve ??= {};
    viteConfig.resolve.alias = [
      ...(Array.isArray(viteConfig.resolve.alias)
        ? viteConfig.resolve.alias
        : Object.entries(viteConfig.resolve.alias ?? {}).map(
            ([find, replacement]) => ({ find, replacement }),
          )),
      {
        find: '@bixant/design-system',
        replacement: fileURLToPath(
          new URL('../../design-system/src/index.ts', import.meta.url),
        ),
      },
      // The data packages are consumed from source too, so stories never test a stale `dist`.
      {
        find: /^@bixant\/(data-list|data-table)\/([^/]+)\/define$/,
        replacement: `${packagesDir}$1/src/$2/define.ts`,
      },
      {
        find: /^@bixant\/(data-list|data-table)\/([^/]+)$/,
        replacement: `${packagesDir}$1/src/$2/index.ts`,
      },
      {
        find: /^@bixant\/(data-list|data-table)$/,
        replacement: `${packagesDir}$1/src/index.ts`,
      },
      {
        // Multi-segment leaves that are plain files, not `<name>/index.ts` directories, e.g.
        // '@bixant/core/animation/presets/spin' -> 'animation/presets/spin.ts'.
        find: /^@bixant\/core\/(animation\/presets\/[^/]+)$/,
        replacement: `${coreSrc}$1.ts`,
      },
      {
        find: /^@bixant\/core\/([^/]+)\/define$/,
        replacement: `${coreSrc}$1/define.ts`,
      },
      {
        find: /^@bixant\/core\/([^/]+)$/,
        replacement: `${coreSrc}$1/index.ts`,
      },
      {
        find: '@bixant/core',
        replacement: `${coreSrc}index.ts`,
      },
    ];
    return viteConfig;
  },
};

export default config;
