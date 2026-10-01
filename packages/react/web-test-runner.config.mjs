import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { playwrightLauncher } from '@web/test-runner-playwright';

const ALL = ['chromium', 'firefox', 'webkit'];
const requested =
  process.env['TEST_BROWSERS']?.split(',').map((s) => s.trim()) ?? ALL;

// React ships CommonJS, which the dev server cannot serve as ES modules. Bundle it once into a
// few shared ESM chunks (one React instance for every entry) and serve them under /__vendor__/.
const specifiers = {
  react: 'react.js',
  'react-dom': 'react-dom.js',
  'react-dom/client': 'react-dom-client.js',
  'react/jsx-runtime': 'jsx-runtime.js',
  'react/jsx-dev-runtime': 'jsx-dev-runtime.js',
};

// esbuild cannot know a CommonJS module's export names, so each facade lists them explicitly
// (read from the real module) and re-exports them as ES named exports.
const require = createRequire(import.meta.url);
const facadeDir = path.join(process.cwd(), 'node_modules', '.cache', 'bixant-vendor');
fs.mkdirSync(facadeDir, { recursive: true });
const entryPoints = {};
for (const [source, file] of Object.entries(specifiers)) {
  const names = Object.keys(require(source)).filter(
    (n) => n !== 'default' && /^[A-Za-z_$][\w$]*$/.test(n),
  );
  const facade = path.join(facadeDir, file.replace('.js', '.mjs'));
  fs.writeFileSync(
    facade,
    `import m from '${source}';
export default m;
export const { ${names.join(', ')} } = m;
`,
  );
  entryPoints[file.replace('.js', '')] = facade;
}
const bundle = await build({
  entryPoints,
  absWorkingDir: process.cwd(),
  bundle: true,
  format: 'esm',
  splitting: true,
  outdir: 'vendor',
  write: false,
  platform: 'browser',
  define: { 'process.env.NODE_ENV': '"development"' },
});
const files = new Map(bundle.outputFiles.map((f) => [path.basename(f.path), f.text]));

const reactVendor = {
  name: 'react-vendor',
  resolveImport({ source }) {
    const file = specifiers[source];
    return file ? `/__vendor__/${file}` : undefined;
  },
  serve(context) {
    if (!context.path.startsWith('/__vendor__/')) return undefined;
    const body = files.get(path.basename(context.path));
    return body === undefined ? undefined : { body, type: 'js' };
  },
};

export default {
  files: 'src/**/*.test.{ts,tsx}',
  nodeResolve: true,
  plugins: [
    reactVendor,
    esbuildPlugin({ ts: true, tsx: true, target: 'es2022', tsconfig: path.resolve('tsconfig.spec.json') }),
  ],
  browsers: requested.map((product) => playwrightLauncher({ product })),
  testFramework: { config: { timeout: 5000 } },
};
