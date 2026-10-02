// Web Test Runner helper: load the generated design-system tokens into every test page, so
// components render exactly as they do for consumers (token values, light/dark, coarse pointer)
// instead of silently depending on raw fallbacks. Requires `design-system:tokens` to have run.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const tokensPath = fileURLToPath(
  new URL(
    '../packages/design-system/dist/generated/tokens.css',
    import.meta.url,
  ),
);

export const tokensPlugin = {
  name: 'bx-tokens',
  serve(context) {
    if (context.path === '/__bx-tokens.css')
      return { body: readFileSync(tokensPath, 'utf8'), type: 'css' };
  },
};

export const testRunnerHtml = (testFramework) => `<!doctype html>
<html>
  <head><link rel="stylesheet" href="/__bx-tokens.css" /></head>
  <body><script type="module" src="${testFramework}"></script></body>
</html>`;
