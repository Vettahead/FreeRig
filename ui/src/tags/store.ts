import type { Block, Rig } from '../types';
import { deviceIdentity, normaliseTags } from './model';

// Collection tags are local, shared by a downloaded pack (all its captures) or
// stock device. Blocks also carry a portable snapshot in patch/bank exports.
const key = 'freerig-device-tags-v1';
let entries: Record<string, string[]> = Object.create(null);
try {
  const saved = JSON.parse(localStorage.getItem(key) || '{}');
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
    for (const [id, tags] of Object.entries(saved).slice(0, 10000))
      if (/^(tone|asset|stock):/.test(id)) entries[id] = normaliseTags(tags);
  }
} catch {
  /* Unavailable storage must not prevent playing. Writes report failure. */
}
export function deviceTags(block: Pick<Block, 'key' | 'assetId' | 'tone3000' | 'tags'>): string[] {
  return normaliseTags(block.tags ?? entries[deviceIdentity(block)] ?? []);
}
export function saveDeviceTags(changes: Array<{ block: Block; tags: string[] }>) {
  const next = { ...entries };
  const seen = new Set<string>();
  for (const { block, tags } of changes) {
    const id = deviceIdentity(block);
    next[id] = normaliseTags([...(seen.has(id) ? next[id] : []), ...tags]);
    seen.add(id);
  }
  localStorage.setItem(key, JSON.stringify(next));
  entries = next;
}
export function editTags(rig: Rig, id: string | null, tags: string[], propagate?: string): Rig {
  const cleaned = normaliseTags(tags);
  const changes = rig.blocks
    .filter((b) => b.id === id || (!!propagate && id === null))
    .map((block) => ({
      block,
      tags: id === null ? normaliseTags([...deviceTags(block), propagate!]) : cleaned,
    }));
  if (changes.length) saveDeviceTags(changes);
  return {
    ...rig,
    ...(id === null ? { tags: cleaned } : {}),
    blocks: rig.blocks.map((block) => {
      const change = changes.find((c) => c.block.id === block.id);
      return change ? { ...block, tags: change.tags } : block;
    }),
  };
}
