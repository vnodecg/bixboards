import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import {
  InputError,
  build,
  defaultDataDir,
  writeFiles,
} from './build/index.ts';

const USAGE = `bixant-ds <command> [options]

Commands
  build              Compile themes to CSS custom properties and token files
  validate           Same checks as build, without writing files
  init-theme <name>  Scaffold <name>.json

Options
  --out <dir>        Output directory (build; default: dist/generated next to the package)
  --theme <file>     Extra theme JSON (repeatable). May "extends" a built-in theme.
  --data <dir>       Data directory (default: the built-in data)
  --strict           Treat contrast and deprecation warnings as errors
  --viewport <px>    Reference viewport for the Figma export (default: 1280)
  --extends <theme>  init-theme: theme to extend (default: light)
  --brand <hex>      init-theme: brand seed color (default: #4f46e5)
  -h, --help         Show this help
`;

export interface Io {
  log: (message: string) => void;
  error: (message: string) => void;
}

const consoleIo: Io = {
  log: (m) => console.log(m),
  error: (m) => console.error(m),
};

const OPTIONS = {
  out: { type: 'string' },
  theme: { type: 'string', multiple: true },
  data: { type: 'string' },
  strict: { type: 'boolean' },
  viewport: { type: 'string' },
  extends: { type: 'string' },
  brand: { type: 'string' },
  help: { type: 'boolean', short: 'h' },
} as const;

interface BuildFlags {
  out?: string | undefined;
  theme?: string[] | undefined;
  data?: string | undefined;
  strict?: boolean | undefined;
  viewport?: string | undefined;
}

/** Run the CLI. Returns the process exit code; never calls `process.exit`. */
export function run(
  argv: readonly string[],
  io: Io = consoleIo,
  cwd: string = process.cwd(),
): number {
  let parsed;
  try {
    parsed = parseArgs({
      args: [...argv],
      options: OPTIONS,
      allowPositionals: true,
      strict: true,
    });
  } catch (e) {
    io.error(`error: ${(e as Error).message}\n\n${USAGE}`);
    return 2;
  }
  const { values, positionals } = parsed;
  const [command, ...rest] = positionals;
  if (values.help || !command) {
    io.log(USAGE);
    return command || values.help ? 0 : 1;
  }

  try {
    switch (command) {
      case 'init-theme':
        return initTheme(rest[0], values.extends, values.brand, io, cwd);
      case 'build':
      case 'validate':
        return buildCommand(command, values, io, cwd);
      default:
        io.error(`error: unknown command "${command}"\n\n${USAGE}`);
        return 2;
    }
  } catch (e) {
    io.error(`error: ${(e as Error).message}`);
    return e instanceof InputError ||
      e instanceof TypeError ||
      e instanceof RangeError
      ? 1
      : 70;
  }
}

function buildCommand(
  command: 'build' | 'validate',
  values: BuildFlags,
  io: Io,
  cwd: string,
): number {
  const abs = (p: string): string => path.resolve(cwd, p);
  const viewport =
    values.viewport === undefined ? undefined : Number(values.viewport);
  if (viewport !== undefined && !(viewport > 0))
    throw new InputError(
      '--viewport',
      `expected a positive number, got ${JSON.stringify(values.viewport)}`,
    );

  const result = build({
    dataDir: values.data ? abs(values.data) : defaultDataDir(),
    extraThemes: (values.theme ?? []).map(abs),
    ...(viewport === undefined ? {} : { figma: { viewport } }),
  });
  for (const w of result.warnings) io.error(`warning: ${w}`);
  if (values.strict && result.warnings.length) {
    io.error(`error: ${result.warnings.length} warning(s) with --strict`);
    return 1;
  }
  if (command === 'validate') {
    io.log(
      `OK: ${result.themes.length} themes, ${result.palettes.length} palettes`,
    );
    return 0;
  }
  const out = values.out
    ? abs(values.out)
    : path.resolve(defaultDataDir(), '..', 'dist', 'generated');
  writeFiles(result.files, out);
  io.log(`Built ${result.themes.length} themes -> ${out}`);
  return 0;
}

function initTheme(
  name: string | undefined,
  extendsTheme: string | undefined,
  brand: string | undefined,
  io: Io,
  cwd: string,
): number {
  if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
    io.error(
      'usage: bixant-ds init-theme <name> [--extends light] [--brand #4f46e5]',
    );
    return 2;
  }
  const file = path.resolve(cwd, `${name}.json`);
  if (fs.existsSync(file)) {
    io.error(`error: ${file} already exists`);
    return 1;
  }
  const theme = {
    name,
    extends: extendsTheme ?? 'light',
    seeds: { brand: brand ?? '#4f46e5' },
    foundation: { radius: { m: 'calc({unit} * 0.375)' } },
  };
  fs.writeFileSync(file, `${JSON.stringify(theme, null, 2)}\n`);
  io.log(
    `Created ${file}\nRoles (solid, fg, border, …) are derived from the seeds by contrast.\nBuild it with: bixant-ds build --theme ${name}.json`,
  );
  return 0;
}
