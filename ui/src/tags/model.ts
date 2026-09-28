import type { Block } from '../types';

// Tags are user metadata, never parameters. Keep spelling for display and use
// case-insensitive identity so Hendrix/hendrix cannot accumulate duplicates.
export function normaliseTags(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  const result: string[] = [];
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const tag = value.trim().replace(/\s+/g, ' ');
    if (!tag || tag.length > 32 || /[\u0000-\u001f]/.test(tag)) continue;
    if (!result.some((item) => item.toLocaleLowerCase() === tag.toLocaleLowerCase()))
      result.push(tag);
    if (result.length === 20) break;
  }
  return result;
}
export function deviceIdentity(block: Pick<Block, 'key' | 'assetId' | 'tone3000'>): string {
  if (block.tone3000?.id != null) return `tone:${block.tone3000.id}`;
  if (block.assetId) return `asset:${block.assetId}`;
  return `stock:${block.key}`;
}
export function matchesTags(text: string, tags: string[], query: string): boolean {
  return `${text} ${normaliseTags(tags).join(' ')}`
    .toLocaleLowerCase()
    .includes(query.trim().toLocaleLowerCase());
}
