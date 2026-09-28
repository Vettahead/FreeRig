import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const cwd = fileURLToPath(new URL('../prototype/', import.meta.url));
const files = (await readdir(cwd)).filter((name) => name.endsWith('.test.cjs')).sort();
// Historical fixtures use paths relative to prototype; preserve that contract.
const result = spawnSync(process.execPath, ['--test', ...files], { cwd, stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
