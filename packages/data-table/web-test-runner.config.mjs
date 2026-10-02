import { esbuildPlugin } from '@web/dev-server-esbuild';
import { playwrightLauncher } from '@web/test-runner-playwright';
import { testRunnerHtml, tokensPlugin } from '../../tools/wtr-tokens.mjs';

// docs/features/_conventions.md §11 calls for real Chromium/Firefox/WebKit coverage. Restrict to
// a subset with `TEST_BROWSERS=chromium,firefox` (comma-separated) for environments where the
// other engines aren't installed/downloadable; CI runs the full set.
const ALL = ['chromium', 'firefox', 'webkit'];
const requested =
  process.env['TEST_BROWSERS']?.split(',').map((s) => s.trim()) ?? ALL;

export default {
  files: 'src/**/*.test.ts',
  nodeResolve: true,
  plugins: [esbuildPlugin({ ts: true, target: 'es2022' }), tokensPlugin],
  testRunnerHtml,
  browsers: requested.map((product) => playwrightLauncher({ product })),
  testFramework: {
    config: {
      timeout: 5000,
    },
  },
};
