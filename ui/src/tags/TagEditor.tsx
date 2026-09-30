import { useEffect, useRef, useState } from 'react';
import type { Block, Rig } from '../types';
import { commands } from '../commands';
import { normaliseTags } from './model';
import { deviceTags } from './store';

export function TagEditor({ rig, block }: { rig: Rig; block?: Block }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false),
    [value, setValue] = useState(''),
    [pending, setPending] = useState(''),
    [error, setError] = useState('');
  const tags = block ? deviceTags(block) : normaliseTags(rig.tags);
  const factoryTags =
    block && !block.assetId && !block.tone3000
      ? (window.EffectsCatalogue?.find((d) => d.key === block.key)?.factoryTags ?? [])
      : [];
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);
  function change(next: string[], propagate?: string) {
    try {
      commands().setTags(block?.id ?? null, next, propagate);
      setError('');
      return true;
    } catch {
      setError('Could not save tags. Check available storage, then try again.');
      return false;
    }
  }
  function close() {
    setPending('');
    setOpen(false);
  }
  return (
    <div className="tag-editor">
      <button onClick={() => setOpen(true)}>
        {block ? 'Device tags' : 'Patch tags'}
        {tags.length ? ` · ${tags.join(', ')}` : ' ＋'}
      </button>
      <dialog
        ref={dialog}
        className="tag-dialog"
        onCancel={close}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
      >
        <section>
          <header>
            <h2>{block ? 'Tag this device' : 'Tag this patch'}</h2>
            <button onClick={close} aria-label="Close tags">
              ×
            </button>
          </header>
          <p>
            {block
              ? 'Tags follow this device in your collection and this patch.'
              : 'Use an artist, band, song or style. Save the patch to keep its tags in your bank.'}
          </p>
          <div className="tag-chips">
            {tags.map((tag) => (
              <button
                key={tag}
                disabled={factoryTags.includes(tag)}
                onClick={() => change(tags.filter((t) => t !== tag))}
                aria-label={factoryTags.includes(tag) ? `Factory tag ${tag}` : `Remove tag ${tag}`}
              >
                {tag}
                {factoryTags.includes(tag) ? ' · factory' : ' ×'}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (pending) return;
              const cleaned = normaliseTags([value])[0];
              if (!cleaned) {
                setError('Enter a tag of 1–32 characters.');
                return;
              }
              const next = normaliseTags([...tags, cleaned]);
              if (
                tags.length === 20 &&
                next.length === tags.length &&
                !tags.some((t) => t.toLowerCase() === cleaned.toLowerCase())
              ) {
                setError('Use up to 20 tags.');
                return;
              }
              if (change(next)) {
                setValue('');
                if (!block && rig.blocks.length) setPending(cleaned);
              }
            }}
          >
            <label>
              New tag
              <input
                autoFocus
                maxLength={32}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. Hendrix"
              />
            </label>
            <button type="submit" disabled={!!pending}>
              Add tag
            </button>
          </form>
          {pending && (
            <div className="tag-propagation" role="group" aria-label="Apply tag to devices">
              <p>
                Also tag all {rig.blocks.length} devices “{pending}”?
              </p>
              <button
                onClick={() => {
                  if (change(tags, pending)) setPending('');
                }}
              >
                Tag all devices too
              </button>
              <button onClick={() => setPending('')}>Patch only</button>
            </div>
          )}
          {error && <p role="alert">{error}</p>}
          <p className="muted">
            Search these tags in Collection → Devices or Patches. Removing a patch tag does not
            remove device tags.
          </p>
          <button onClick={close}>Done</button>
        </section>
      </dialog>
    </div>
  );
}
