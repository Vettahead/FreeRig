import type { Block, Definition, Sound } from './types';
import { commands } from './commands';

// Describe actual algorithms, including deliberate colour/latency, independently
// of the cosmetic enclosure. Never imply that a skin is a circuit model.
export function EffectInfo({
  block,
  definition,
  sound,
}: {
  block: Block;
  definition: Definition;
  sound: Sound;
}) {
  return (
    <>
      {definition.description && <p className="effect-description">{definition.description}</p>}
      {definition.source?.startsWith('https://github.com/') && (
        <a className="effect-source" href={definition.source} target="_blank" rel="noreferrer">
          Algorithm notes &amp; source ↗
        </a>
      )}
      {block.key === 'fx-PhraseLooper' && (
        <section className="looper-controls" aria-label="Phrase looper controls">
          <p>
            60-second stereo loop. Record a phrase, then Play. Clear erases the loop; audio stays in
            memory and is not saved with your patch. These buttons save scene commands, not recorded
            audio.
          </p>
          <div>
            {['Clear / stop', 'Record new', 'Play', 'Overdub'].map((name, mode) => (
              <button
                key={mode}
                aria-pressed={Math.round(sound.values[0]) === mode}
                onClick={() => commands().setParameter(block.id, 0, mode)}
              >
                {name}
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
