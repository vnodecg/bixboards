import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  framework: '@storybook/web-components-vite',
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.ts'],
  addons: ['@storybook/addon-docs'],
  viteFinal: (viteConfig) => {
    // Use the design-system sources directly so no build step is needed while developing.
    viteConfig.resolve ??= {};
    viteConfig.resolve.alias = {
      ...(viteConfig.resolve.alias as Record<string, string> | undefined),
      '@bixant/design-system': fileURLToPath(
        new URL('../../design-system/src/index.ts', import.meta.url),
      ),
      '@bixant/core/animated-image': fileURLToPath(
        new URL('../../core/src/animated-image/index.ts', import.meta.url),
      ),
      '@bixant/core': fileURLToPath(
        new URL('../../core/src/index.ts', import.meta.url),
      ),
    };
    return viteConfig;
  },
};

export default config;
