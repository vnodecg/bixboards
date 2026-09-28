// Helpers for tests only (excluded from the published build).

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { defaultDataDir } from './build/index.ts';

/** Copy the built-in data to a temp directory and return its path together with a cleanup function. */
export function tempData(): {
  dir: string;
  write: (rel: string, value: unknown) => string;
  read: (rel: string) => unknown;
  cleanup: () => void;
} {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bx-ds-'));
  fs.cpSync(defaultDataDir(), dir, { recursive: true });
  return {
    dir,
    write(rel, value) {
      const file = path.join(dir, rel);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(
        file,
        typeof value === 'string' ? value : JSON.stringify(value, null, 2),
      );
      return file;
    },
    read: (rel) => JSON.parse(fs.readFileSync(path.join(dir, rel), 'utf8')),
    cleanup: () => fs.rmSync(dir, { recursive: true, force: true }),
  };
}

export function tempDir(): { dir: string; cleanup: () => void } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bx-ds-'));
  return {
    dir,
    cleanup: () => fs.rmSync(dir, { recursive: true, force: true }),
  };
}
