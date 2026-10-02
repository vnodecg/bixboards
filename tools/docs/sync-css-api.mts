// Keeps the "CSS parts" and "CSS custom properties" sections of every feature doc
// (docs/features/**/<name>.md) identical to the component's JSDoc, via the generated Custom
// Elements Manifest — so the styling API documented for humans cannot drift from the code.
//
// Usage: node tools/docs/sync-css-api.mts [--check]
//   (run `node tools/cem/generate.mts` first; `pnpm generate` does both in order)
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { format, resolveConfig } from 'prettier';

const root = join(import.meta.dirname, '..', '..');
const check = process.argv.includes('--check');

interface Entry {
  name: string;
  description?: string;
}
interface Declaration {
  tagName?: string;
  cssParts?: Entry[];
  cssProperties?: Entry[];
}

const docs = new Map<string, string>(); // tag -> doc path
(function walk(dir: string) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (e.endsWith('.md') && !e.startsWith('_') && e !== 'README.md')
      docs.set(`bx-${e.slice(0, -3)}`, p);
  }
})(join(root, 'docs', 'features'));

const cell = (text: string | undefined) =>
  (text ?? '').replace(/\s+/g, ' ').replace(/\|/g, '\\|').trim();

function table(head: string, entries: Entry[], none: string): string {
  if (!entries.length) return none;
  const rows = entries.map(
    (e) => `| \`${e.name}\` | ${cell(e.description) || '-'} |`,
  );
  return [`| ${head} | Description |`, '| --- | --- |', ...rows].join('\n');
}

function replaceSection(
  doc: string,
  heading: string,
  body: string,
): string | null {
  const start = doc.indexOf(`### ${heading}\n`);
  if (start < 0) return null;
  const bodyStart = start + `### ${heading}\n`.length;
  const next = doc.slice(bodyStart).search(/\n#{2,3} /);
  const end = next < 0 ? doc.length : bodyStart + next + 1;
  return `${doc.slice(0, bodyStart)}\n${body}\n\n${doc.slice(end)}`.replace(
    /\n{3,}(?=#{2,3} )/g,
    '\n\n',
  );
}

// Emit exactly what `prettier --write` would, so `format:check` and `--check` agree.
const pretty = async (path: string, text: string) =>
  format(text, { ...(await resolveConfig(path)), filepath: path });

let drift = 0;
for (const pkg of ['core', 'data-table', 'data-list']) {
  const manifest = JSON.parse(
    readFileSync(join(root, 'packages', pkg, 'custom-elements.json'), 'utf8'),
  ) as { modules: { declarations?: Declaration[] }[] };
  for (const decl of manifest.modules.flatMap((m) => m.declarations ?? [])) {
    if (!decl.tagName) continue;
    const path = docs.get(decl.tagName);
    if (!path) continue;
    const before = readFileSync(path, 'utf8');
    let after = before;
    const parts = replaceSection(
      after,
      'CSS parts',
      table('Part', decl.cssParts ?? [], '_None._'),
    );
    if (parts) after = parts;
    const props = replaceSection(
      after,
      'CSS custom properties',
      table(
        'Property',
        decl.cssProperties ?? [],
        '_Only global tokens (see conventions)._',
      ),
    );
    if (props) after = props;
    after = await pretty(path, after);
    if (after !== before) {
      drift++;
      if (check) console.error(`out of date: ${path}`);
      else writeFileSync(path, after);
    }
  }
}

if (check && drift) {
  console.error(
    `${drift} feature doc(s) out of date; run \`pnpm generate\` to refresh.`,
  );
  process.exit(1);
}
console.log(
  check ? 'feature docs are up to date' : `feature docs: ${drift} updated`,
);
