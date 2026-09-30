import type { Block, Definition, Sound } from './types';
import { commands } from './commands';

// Native parameter order is the persisted contract; the face simply renders it.
export function GraphicEqualizer({
  block,
  definition,
  sound,
}: {
  block: Block;
  definition: Definition;
  sound: Sound;
}) {
  return (
    <section
      className="graphic-equalizer"
      style={{ background: 'url(hardware/pedal-studio.png) center / 100% 100% no-repeat' }}
      aria-label="Ten Band EQ controls"
    >
      <header>
        <strong>TEN BAND EQ</strong>
        <span>OCTAVE EQUALIZER · ±12 dB</span>
      </header>
      <div className="eq-faders">
        {definition.params.map((parameter, index) => (
          <label key={index}>
            <span>{parameter[0]}</span>
            <input
              type="range"
              aria-label={parameter[0]}
              min={parameter[1]}
              max={parameter[2]}
              step={0.1}
              value={sound.values[index]}
              onChange={(event) =>
                commands().setParameter(block.id, index, Number(event.target.value))
              }
            />
            <output>{sound.values[index].toFixed(1)} dB</output>
          </label>
        ))}
      </div>
      <button aria-pressed={!sound.on} onClick={() => commands().bypass(block.id)}>
        {sound.on ? 'Bypass EQ' : 'Enable EQ'}
      </button>
      <button
        onClick={() =>
          definition.params.forEach((_, index) => commands().setParameter(block.id, index, 0))
        }
      >
        Reset flat
      </button>
    </section>
  );
}
