import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath } from 'node:url';

const dirname = fileURLToPath(new URL('.', import.meta.url));

// Every story is a test: it renders, runs its `play` function, is checked by axe (a11y addon) and
// compared against a committed screenshot (see .storybook/vitest.setup.ts). The '@bixboards/*'
// aliases come from .storybook/main.ts via the storybookTest plugin.
// Run `pnpm test:stories`; refresh screenshot baselines with `pnpm test:stories -u`.
export default defineConfig({
  plugins: [
    storybookTest({
      configDir: `${dirname}.storybook`,
    }),
  ],
  test: {
    name: 'stories',
    setupFiles: ['./.storybook/vitest.setup.ts'],
    testTimeout: 15000,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      // Fixed viewport so screenshots are comparable across machines.
      viewport: { width: 1024, height: 768 },
      expect: {
        toMatchScreenshot: {
          resolveScreenshotPath: ({ arg, browserName, ext, root, platform }) =>
            `${root}/tests/screenshots/${platform}/${browserName}/${arg}${ext}`,
          comparatorName: 'pixelmatch',
          comparatorOptions: {
            threshold: 0.2,
            allowedMismatchedPixelRatio: 0.01,
          },
        },
      },
    },
  },
});
