import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const { version } = JSON.parse(await readFile(new URL('release.json', root), 'utf8'));
if (!Number.isInteger(version) || version < 1) throw new Error('Invalid release version');
const markdown = await readFile(new URL('CHANGELOG.md', root), 'utf8');
// The human-authored changelog is the only history source. Bundle it locally so
// file:// desktop builds never depend on network access or Markdown libraries.
const entries = [...markdown.matchAll(/^## (.+)\r?\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)].map(
  ([, title, body], index) => ({
    id: `release-${index}`,
    title,
    body: body.trim(),
    version: Number(title.match(/Alpha (\d+(?:\.\d+)?)/i)?.[1]) || 0,
  }),
);
for (let n = 1; n <= version; n++) {
  if (!entries.some((e) => e.version === n && e.body.length > 30))
    throw new Error(`Missing changelog for Alpha ${n}`);
}
if (entries[0]?.version !== version || entries.some((e) => e.version > version))
  throw new Error('Latest CHANGELOG heading must match release.json');
entries.sort((a, b) => b.version - a.version);
const output = JSON.stringify({ version, entries }, null, 2) + '\n';
const target = new URL('ui/src/release-history/history.generated.json', root);
if (process.argv.includes('--check')) {
  if ((await readFile(target, 'utf8')) !== output)
    throw new Error(`${fileURLToPath(target)} is stale. Run npm run build.`);
} else await writeFile(target, output);
