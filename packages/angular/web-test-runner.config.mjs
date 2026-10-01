import path from 'node:path';
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { playwrightLauncher } from '@web/test-runner-playwright';

const ALL = ['chromium', 'firefox', 'webkit'];
const requested =
  process.env['TEST_BROWSERS']?.split(',').map((s) => s.trim()) ?? ALL;

export default {
  files: 'src/**/*.test.ts',
  nodeResolve: { exportConditions: ['browser', 'development', 'default'] },
  plugins: [
    esbuildPlugin({
      ts: true,
      target: 'es2022',
      // The wrappers use Angular decorators; the tests run them through the JIT compiler.
      tsconfig: path.resolve('tsconfig.spec.json'),
    }),
  ],
  browsers: requested.map((product) => playwrightLauncher({ product })),
  testFramework: { config: { timeout: 5000 } },
};
