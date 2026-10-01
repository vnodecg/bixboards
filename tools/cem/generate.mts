// Generates a Custom Elements Manifest (schema 2.1.0) per package from the component sources.
//
//   node tools/cem/generate.mts            # writes packages/<pkg>/custom-elements.json
//   node tools/cem/generate.mts --check    # fails if a committed manifest is stale
//
// Why a bespoke generator rather than @custom-elements-manifest/analyzer: every component here
// follows one shape (`static tagName`, `static properties = {...}` plus `declare` fields, JSDoc
// `@fires/@slot/@csspart/@cssprop`), so a ~200 line TypeScript-compiler pass covers it exactly,
// stays in lockstep with the TypeScript version the repo builds with, and has no plugin surface to
// drift. The framework wrappers (tools/wrappers) are generated from this manifest only, which is
// what keeps them from drifting from the elements (docs/features/_conventions.md §8).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const packagesDir = path.join(root, 'packages');
const PACKAGES = ['core', 'data-list', 'data-table'];
const LIFECYCLE = new Set([
  'connectedCallback',
  'disconnectedCallback',
  'attributeChangedCallback',
  'adoptedCallback',
  'render',
  'firstUpdated',
  'updated',
  'willUpdate',
  'shouldUpdate',
  'update',
  'performUpdate',
  'createRenderRoot',
  'formResetCallback',
  'formStateRestoreCallback',
  'formDisabledCallback',
  'formAssociatedCallback',
  'requestUpdate',
  'toString',
]);

interface Described {
  name: string;
  description?: string;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (
      entry.name.endsWith('.ts') &&
      !entry.name.endsWith('.test.ts') &&
      !['define.ts', 'index.ts'].includes(entry.name)
    )
      out.push(full);
  }
  return out;
}

function jsDoc(node: ts.Node): {
  text: string;
  tags: { tag: string; text: string }[];
} {
  const docs = ts.getJSDocCommentsAndTags(node).filter(ts.isJSDoc);
  const doc = docs.at(-1);
  if (!doc) return { text: '', tags: [] };
  const text =
    typeof doc.comment === 'string'
      ? doc.comment
      : (doc.comment ?? []).map((c) => c.text).join('');
  const tags = (doc.tags ?? []).map((t) => ({
    tag: t.tagName.text,
    text:
      typeof t.comment === 'string'
        ? t.comment
        : (t.comment ?? []).map((c) => c.text).join(''),
  }));
  return { text: text.trim(), tags };
}

/** "name - description" (or "- description" for an unnamed default). */
function splitNamed(text: string): Described {
  const m = /^(\S+)?\s*(?:-\s*)?([\s\S]*)$/.exec(text.trim())!;
  const raw = m[1] ?? '';
  const name = raw === '-' ? '' : raw;
  const description = (raw === '-' ? `${m[2]}` : m[2])
    .replace(/\s+/g, ' ')
    .trim();
  return { name, description: description || undefined };
}

function stringLiteral(node: ts.Expression | undefined): string | undefined {
  return node &&
    (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
    ? node.text
    : undefined;
}

function hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
  return (
    ts.canHaveModifiers(node) &&
    !!ts.getModifiers(node)?.some((m) => m.kind === kind)
  );
}

function kebab(name: string): string {
  return name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

function propertyOptions(init: ts.Expression): {
  type?: string;
  attribute?: string | false;
  reflect: boolean;
  state: boolean;
} {
  const out: {
    type?: string;
    attribute?: string | false;
    reflect: boolean;
    state: boolean;
  } = {
    reflect: false,
    state: false,
  };
  if (!ts.isObjectLiteralExpression(init)) return out;
  for (const p of init.properties) {
    if (!ts.isPropertyAssignment(p)) continue;
    const key = p.name.getText();
    if (key === 'type') out.type = p.initializer.getText();
    else if (key === 'attribute')
      out.attribute =
        p.initializer.kind === ts.SyntaxKind.FalseKeyword
          ? false
          : stringLiteral(p.initializer);
    else if (key === 'reflect')
      out.reflect = p.initializer.kind === ts.SyntaxKind.TrueKeyword;
    else if (key === 'state')
      out.state = p.initializer.kind === ts.SyntaxKind.TrueKeyword;
  }
  return out;
}

function analyze(file: string): unknown[] {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.ES2022,
    true,
  );
  const declarations: unknown[] = [];

  for (const stmt of source.statements) {
    if (!ts.isClassDeclaration(stmt) || !stmt.name) continue;
    const tagMember = stmt.members.find(
      (m): m is ts.PropertyDeclaration =>
        ts.isPropertyDeclaration(m) &&
        hasModifier(m, ts.SyntaxKind.StaticKeyword) &&
        m.name.getText() === 'tagName',
    );
    const tagName = stringLiteral(tagMember?.initializer);
    if (!tagName) continue;

    const heritage =
      stmt.heritageClauses?.[0]?.types[0]?.expression.getText() ?? '';
    const formAssociated = heritage.includes('FormAssociatedMixin');
    const doc = jsDoc(stmt);

    // Declared types and docs, defaults from constructor assignments.
    const declared = new Map<
      string,
      { type: string; description: string; optional: boolean }
    >();
    const defaults = new Map<string, string>();
    for (const m of stmt.members) {
      if (
        ts.isPropertyDeclaration(m) &&
        !hasModifier(m, ts.SyntaxKind.StaticKeyword) &&
        ts.isIdentifier(m.name)
      ) {
        declared.set(m.name.text, {
          type: m.type?.getText() ?? 'unknown',
          description: jsDoc(m).text,
          optional: !!m.questionToken,
        });
      } else if (
        ts.isGetAccessorDeclaration(m) &&
        ts.isIdentifier(m.name) &&
        !declared.has(m.name.text)
      ) {
        declared.set(m.name.text, {
          type: m.type?.getText() ?? 'unknown',
          description: jsDoc(m).text,
          optional: false,
        });
      } else if (ts.isConstructorDeclaration(m) && m.body) {
        for (const s of m.body.statements) {
          if (
            ts.isExpressionStatement(s) &&
            ts.isBinaryExpression(s.expression) &&
            s.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
            ts.isPropertyAccessExpression(s.expression.left) &&
            s.expression.left.expression.kind === ts.SyntaxKind.ThisKeyword
          )
            defaults.set(
              s.expression.left.name.text,
              s.expression.right.getText(),
            );
        }
      }
    }

    const members: unknown[] = [];
    const attributes: unknown[] = [];
    const propsMember = stmt.members.find(
      (m): m is ts.PropertyDeclaration =>
        ts.isPropertyDeclaration(m) &&
        hasModifier(m, ts.SyntaxKind.StaticKeyword) &&
        m.name.getText() === 'properties',
    );
    if (
      propsMember?.initializer &&
      ts.isObjectLiteralExpression(propsMember.initializer)
    ) {
      for (const p of propsMember.initializer.properties) {
        if (!ts.isPropertyAssignment(p) && !ts.isShorthandPropertyAssignment(p))
          continue;
        const name = p.name.getText().replace(/^['"]|['"]$/g, '');
        const options = ts.isPropertyAssignment(p)
          ? propertyOptions(p.initializer)
          : { reflect: false, state: false };
        if (options.state || name.startsWith('_')) continue;
        const d = declared.get(name);
        const attribute =
          options.attribute === false
            ? undefined
            : (options.attribute ?? kebab(name)).toString();
        members.push({
          kind: 'field',
          name,
          type: { text: d?.type ?? 'unknown' },
          default: defaults.get(name),
          description: d?.description || undefined,
          attribute,
          reflects: options.reflect || undefined,
        });
        if (attribute)
          attributes.push({
            name: attribute,
            fieldName: name,
            type: { text: d?.type ?? 'unknown' },
            default: defaults.get(name),
            description: d?.description || undefined,
          });
      }
    }

    for (const m of stmt.members) {
      if (
        !ts.isMethodDeclaration(m) ||
        !ts.isIdentifier(m.name) ||
        hasModifier(m, ts.SyntaxKind.StaticKeyword) ||
        hasModifier(m, ts.SyntaxKind.ProtectedKeyword) ||
        hasModifier(m, ts.SyntaxKind.PrivateKeyword) ||
        LIFECYCLE.has(m.name.text)
      )
        continue;
      const d = jsDoc(m);
      members.push({
        kind: 'method',
        name: m.name.text,
        description: d.text || undefined,
        parameters: m.parameters.map((p) => ({
          name: p.name.getText(),
          type: { text: p.type?.getText() ?? 'unknown' },
          optional: !!p.questionToken || !!p.initializer || undefined,
        })),
        return: { type: { text: m.type?.getText() ?? 'void' } },
      });
    }

    const named = (tag: string) =>
      doc.tags.filter((t) => t.tag === tag).map((t) => splitNamed(t.text));

    declarations.push({
      kind: 'class',
      name: stmt.name.text,
      tagName,
      customElement: true,
      formAssociated: formAssociated || undefined,
      description: doc.text.replace(/\n{2,}/g, '\n\n'),
      superclass: { name: heritage.replace(/\(.*$/, '') || 'HTMLElement' },
      attributes,
      members,
      events: named('fires').map((e) => ({
        name: e.name,
        description: e.description,
      })),
      slots: named('slot').map((s) => ({
        // `@slot (default) - ...` and `@slot - ...` both mean the unnamed slot (manifest: "").
        name: s.name === '(default)' ? '' : s.name,
        description: s.description,
      })),
      cssParts: named('csspart').map((p) => ({
        name: p.name,
        description: p.description,
      })),
      cssProperties: named('cssprop').map((p) => ({
        name: p.name,
        description: p.description,
      })),
    });
  }
  return declarations;
}

function generate(pkg: string): { path: string; content: string } {
  const srcDir = path.join(packagesDir, pkg, 'src');
  const modules = walk(srcDir)
    .sort()
    .map((file) => ({
      kind: 'javascript-module',
      path: path
        .relative(path.join(packagesDir, pkg), file)
        .split(path.sep)
        .join('/'),
      declarations: analyze(file),
    }))
    .filter((m) => m.declarations.length > 0);
  const manifest = { schemaVersion: '2.1.0', readme: '', modules };
  return {
    path: path.join(packagesDir, pkg, 'custom-elements.json'),
    content: JSON.stringify(manifest, null, 2) + '\n',
  };
}

const check = process.argv.includes('--check');
let stale = false;
for (const pkg of PACKAGES) {
  const { path: out, content } = generate(pkg);
  if (check) {
    const current = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
    if (current !== content) {
      console.error(`stale: ${path.relative(root, out)}`);
      stale = true;
    }
  } else {
    fs.writeFileSync(out, content);
    const count = (
      JSON.parse(content) as { modules: { declarations: unknown[] }[] }
    ).modules.reduce((n, m) => n + m.declarations.length, 0);
    console.log(`${path.relative(root, out)}: ${count} elements`);
  }
}
if (stale) process.exit(1);
