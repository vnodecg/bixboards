import path from 'node:path';
import { compile } from 'svelte/compiler';
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { playwrightLauncher } from '@web/test-runner-playwright';

const ALL = ['chromium', 'firefox', 'webkit'];
const requested =
  process.env['TEST_BROWSERS']?.split(',').map((s) => s.trim()) ?? ALL;

// Compiles `.svelte` files on the fly. Svelte 5 strips `lang="ts"` itself, so no preprocessing.
const sveltePlugin = {
  name: 'svelte',
  resolveMimeType(context) {
    if (context.path.endsWith('.svelte')) return 'js';
    return undefined;
  },
  transform(context) {
    if (!context.path.endsWith('.svelte')) return undefined;
    const result = compile(context.body, {
      filename: path.basename(context.path),
      generate: 'client',
      dev: true,
    });
    for (const warning of result.warnings)
      console.warn(`[svelte] ${context.path}: ${warning.message}`);
    return { body: result.js.code };
  },
};

export default {
  files: 'tests/**/*.test.ts',
  nodeResolve: { exportConditions: ['browser', 'development', 'default'] },
  plugins: [sveltePlugin, esbuildPlugin({ ts: true, target: 'es2022' })],
  browsers: requested.map((product) => playwrightLauncher({ product })),
  testFramework: { config: { timeout: 5000 } },
};
